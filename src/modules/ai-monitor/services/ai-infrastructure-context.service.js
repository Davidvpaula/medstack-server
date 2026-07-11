import {
    getSystemDiagnostics
} from "../../../services/system-diagnostics.service.js";

export async function getInfrastructureContext() {
    const diagnostics = await getSystemDiagnostics();

    const databaseCheck = findCheck(
        diagnostics,
        "database"
    );

    const migrationsCheck = findCheck(
        diagnostics,
        "migrations"
    );

    const repositoriesCheck = findCheck(
        diagnostics,
        "repositories"
    );

    const bindingsCheck = findCheck(
        diagnostics,
        "whatsapp_bindings"
    );

    const flushersCheck = findCheck(
        diagnostics,
        "whatsapp_flushers"
    );

    const whatsappInstancesCheck = findCheck(
        diagnostics,
        "whatsapp_instances"
    );

    const databaseData =
        databaseCheck?.data || {};

    const migrationsData =
        migrationsCheck?.data
        || databaseData.migrations
        || {};

    const repositoriesData =
        repositoriesCheck?.data || {};

    const bindingsData =
        bindingsCheck?.data || {};

    const flushersData =
        flushersCheck?.data || {};

    const whatsappInstancesData =
        whatsappInstancesCheck?.data || {};

    const postgresReady =
        databaseCheck?.status === "ok"
        && databaseData.connected === true;

    const migrationsReady =
        migrationsCheck?.status === "ok"
        && Number(migrationsData.pending || 0) === 0;

    const repositoriesReady =
        repositoriesCheck?.status === "ok"
        && Number(repositoriesData.total || 0) > 0;

    const persistenceReady =
        postgresReady
        && migrationsReady
        && repositoriesReady;

    const runtimePersistenceReady =
        Number(flushersData.total || 0) > 0
        && Number(bindingsData.total || 0) > 0;

    return {
        type: "ai_infrastructure_context",
        generatedAt: new Date().toISOString(),

        diagnosticsStatus:
            diagnostics.status,

        diagnosticsSummary:
            diagnostics.summary,

        postgres: {
            connected:
                Boolean(databaseData.connected),

            ready:
                postgresReady,

            latencyMs:
                databaseData.latencyMs ?? null,

            serverTime:
                databaseData.serverTime ?? null,

            lastError:
                databaseData.lastError ?? null
        },

        migrations: {
            ready:
                migrationsReady,

            total:
                Number(migrationsData.total || 0),

            executed:
                Number(migrationsData.executed || 0),

            pending:
                Number(migrationsData.pending || 0),

            executedFiles:
                migrationsData.executedFiles || [],

            pendingFiles:
                migrationsData.pendingFiles || []
        },

        repositories: {
            ready:
                repositoriesReady,

            total:
                Number(repositoriesData.total || 0),

            items:
                repositoriesData.items
                || databaseData.repositories
                || []
        },

        whatsappPersistence: {
            ready:
                runtimePersistenceReady,

            bindings:
                Number(bindingsData.total || 0),

            flushers:
                Number(flushersData.total || 0),

            instances:
                Number(whatsappInstancesData.total || 0),

            unhealthyInstances:
                Number(
                    whatsappInstancesData.unhealthy || 0
                )
        },

        persistence: {
            ready:
                persistenceReady,

            modules: [
                "company",
                "user",
                "contact",
                "conversation",
                "message",
                "whatsappInstance"
            ]
        },

        canAdvance: {
            postgres:
                persistenceReady,

            redisBullMQ:
                persistenceReady,

            docker:
                persistenceReady,

            vps:
                persistenceReady
                && diagnostics.summary.failed === 0,

            lovable:
                persistenceReady
                && diagnostics.summary.failed === 0
        },

        rawDiagnostics:
            diagnostics
    };
}

function findCheck(diagnostics, name) {
    return diagnostics.checks.find(
        (check) => check.name === name
    ) || null;
}