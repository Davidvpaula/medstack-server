import {
    getDatabaseHealth
} from "../database/database-health.service.js";

import {
    getMigrationStatus
} from "../database/migration-runner.js";

import {
    listRepositories
} from "../database/repository-factory.js";

import {
    listInstanceCompanyBindings
} from "../modules/whatsapp/services/instance-company-resolver.service.js";

import {
    listWhatsappRuntimeFlushers
} from "../modules/whatsapp/services/whatsapp-runtime-flusher.service.js";

import {
    getWhatsappRuntime
} from "../modules/whatsapp/services/whatsapp-runtime.service.js";

import {
    getWhatsappPersistenceStatus
} from "../modules/whatsapp/services/whatsapp-persistence-status.service.js";

export async function getSystemDiagnostics() {
    const startedAt = Date.now();
    const checks = [];

    const database = await runCheck(
        "database",
        async () => getDatabaseHealth()
    );

    checks.push(database);

    const migrations = await runCheck(
        "migrations",
        async () => getMigrationStatus()
    );

    checks.push(migrations);

    const repositories = await runCheck(
        "repositories",
        async () => ({
            total: listRepositories().length,
            items: listRepositories()
        })
    );

    checks.push(repositories);

    const bindings = await runCheck(
        "whatsapp_bindings",
        async () => ({
            total: listInstanceCompanyBindings().length,
            items: listInstanceCompanyBindings()
        })
    );

    checks.push(bindings);

    const flushers = await runCheck(
        "whatsapp_flushers",
        async () => ({
            total: listWhatsappRuntimeFlushers().length,
            items: listWhatsappRuntimeFlushers()
        })
    );

    checks.push(flushers);

    const whatsappInstances =
        await getWhatsappInstanceDiagnostics();

    checks.push({
        name: "whatsapp_instances",
        status: whatsappInstances.status,
        healthy: whatsappInstances.healthy,
        durationMs: whatsappInstances.durationMs,
        data: whatsappInstances.data,
        error: whatsappInstances.error
    });

    const summary = buildSummary(checks);

    return {
        type: "system_diagnostics",
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        status: summary.failed > 0
            ? "degraded"
            : (
                summary.warnings > 0
                    ? "warning"
                    : "healthy"
            ),
        summary,
        checks,
        recommendations: buildRecommendations(
            checks,
            summary
        )
    };
}

async function getWhatsappInstanceDiagnostics() {
    const startedAt = Date.now();

    try {
        const bindings =
            listInstanceCompanyBindings();

        const instances = [];

        for (const binding of bindings) {
            const instanceId =
                binding.instanceId;

            if (!instanceId) {
                continue;
            }

            let runtime = null;
            let persistence = null;

            try {
                runtime =
                    getWhatsappRuntime(instanceId);
            } catch (error) {
                runtime = {
                    error: error.message
                };
            }

            try {
                persistence =
                    await getWhatsappPersistenceStatus(
                        instanceId
                    );
            } catch (error) {
                persistence = {
                    status: "error",
                    error: error.message
                };
            }

            instances.push({
                instanceId,
                companyId:
                    binding.companyId || null,
                runtime,
                persistence
            });
        }

        const unhealthyInstances =
            instances.filter((item) => {
                const runtimeConnected =
                    Boolean(
                        item.runtime
                            ?.status
                            ?.connected
                    );

                const persisted =
                    item.persistence
                        ?.persisted === true;

                return !runtimeConnected || !persisted;
            });

        return {
            status:
                unhealthyInstances.length > 0
                    ? "warning"
                    : "ok",

            healthy:
                unhealthyInstances.length === 0,

            durationMs:
                Date.now() - startedAt,

            data: {
                total: instances.length,
                unhealthy:
                    unhealthyInstances.length,
                items: instances
            },

            error: null
        };
    } catch (error) {
        return {
            status: "error",
            healthy: false,
            durationMs:
                Date.now() - startedAt,
            data: null,
            error: error.message
        };
    }
}

async function runCheck(name, callback) {
    const startedAt = Date.now();

    try {
        const data = await callback();

        const status =
            resolveCheckStatus(
                name,
                data
            );

        return {
            name,
            status,
            healthy: status === "ok",
            durationMs:
                Date.now() - startedAt,
            data,
            error: null
        };
    } catch (error) {
        return {
            name,
            status: "error",
            healthy: false,
            durationMs:
                Date.now() - startedAt,
            data: null,
            error: error.message
        };
    }
}

function resolveCheckStatus(name, data) {
    if (name === "database") {
        return data?.connected
            ? "ok"
            : "error";
    }

    if (name === "migrations") {
        return Number(data?.pending || 0) === 0
            ? "ok"
            : "warning";
    }

    if (name === "repositories") {
        return Number(data?.total || 0) > 0
            ? "ok"
            : "warning";
    }

    if (name === "whatsapp_bindings") {
        return Number(data?.total || 0) > 0
            ? "ok"
            : "warning";
    }

    if (name === "whatsapp_flushers") {
        return Number(data?.total || 0) > 0
            ? "ok"
            : "warning";
    }

    return "ok";
}

function buildSummary(checks) {
    return {
        total: checks.length,

        passed: checks.filter(
            (check) => check.status === "ok"
        ).length,

        warnings: checks.filter(
            (check) => check.status === "warning"
        ).length,

        failed: checks.filter(
            (check) => check.status === "error"
        ).length
    };
}

function buildRecommendations(
    checks,
    summary
) {
    const recommendations = [];

    const database =
        checks.find(
            (check) => check.name === "database"
        );

    if (database?.status === "error") {
        recommendations.push(
            "Verificar container PostgreSQL, DATABASE_URL e Pool de conexão."
        );
    }

    const migrations =
        checks.find(
            (check) => check.name === "migrations"
        );

    if (migrations?.status === "warning") {
        recommendations.push(
            "Existem migrations pendentes. Execute npm run db:migrate."
        );
    }

    const bindings =
        checks.find(
            (check) =>
                check.name === "whatsapp_bindings"
        );

    if (bindings?.status === "warning") {
        recommendations.push(
            "Nenhuma instância WhatsApp está vinculada a uma empresa."
        );
    }

    const flushers =
        checks.find(
            (check) =>
                check.name === "whatsapp_flushers"
        );

    if (flushers?.status === "warning") {
        recommendations.push(
            "Nenhum Runtime Flusher está ativo. Verifique o AutoStart."
        );
    }

    const whatsapp =
        checks.find(
            (check) =>
                check.name === "whatsapp_instances"
        );

    if (whatsapp?.status === "warning") {
        recommendations.push(
            "Uma ou mais instâncias WhatsApp estão desconectadas ou não persistidas."
        );
    }

    if (
        summary.failed === 0
        && summary.warnings === 0
    ) {
        recommendations.push(
            "Sistema saudável. Nenhuma ação imediata necessária."
        );
    }

    return recommendations;
}