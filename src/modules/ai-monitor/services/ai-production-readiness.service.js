import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getDependencyGraph
} from "./ai-dependency-graph.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    getInfrastructureContext
} from "./ai-infrastructure-context.service.js";

import {
    clampScore,
    createReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export async function getProductionReadinessReport() {
    const infrastructureResult =
        await getInfrastructureContext();

    const health =
        normalizeHealthReview(
            getFullHealthReview()
        );

    const architecture =
        normalizeArchitectureReview(
            getArchitectureReview()
        );

    const dependencyGraph =
        normalizeDependencyGraph(
            getDependencyGraph()
        );

    const technicalDebt =
        normalizeTechnicalDebt(
            getTechnicalDebtReport()
        );

    const infrastructure =
        normalizeInfrastructure(
            infrastructureResult
        );

    const checklist =
        buildChecklist({
            health,
            architecture,
            dependencyGraph,
            technicalDebt,
            infrastructure
        });

    const score =
        calculateScore(
            checklist
        );

    const status =
        getStatus(score);

    const blockers =
        checklist.filter(
            (item) =>
                item.status === "blocker"
        );

    const warnings =
        checklist.filter(
            (item) =>
                item.status === "warning"
        );

    const passed =
        checklist.filter(
            (item) =>
                item.status === "passed"
        );

    const recommendation =
        getRecommendation(score);

    const recommendations =
        getRecommendations({
            score,
            checklist,
            infrastructure
        });

    const nextSteps =
        getNextSteps(
            checklist,
            infrastructure
        );

    const summary = {
        totalChecks:
            checklist.length,

        passed:
            passed.length,

        warnings:
            warnings.length,

        blockers:
            blockers.length,

        whatsappConnected:
            health.runtimeConnected,

        socketAlive:
            health.socketAlive,

        healthMonitorActive:
            health.monitorActive,

        queuePending:
            health.queuePending,

        queueDeadLetter:
            health.queueDeadLetter,

        recentErrors:
            health.logErrors,

        largeFiles:
            architecture.largeFiles.length,

        highRiskDependencies:
            dependencyGraph
                .summary
                .highRiskFiles,

        technicalDebtCritical:
            technicalDebt
                .summary
                .critical,

        technicalDebtHigh:
            technicalDebt
                .summary
                .high,

        postgresReady:
            infrastructure
                .postgres
                .ready,

        migrationsReady:
            infrastructure
                .migrations
                .ready,

        repositoriesReady:
            infrastructure
                .repositories
                .ready,

        persistenceReady:
            infrastructure
                .persistence
                .ready,

        whatsappPersistenceReady:
            infrastructure
                .whatsappPersistence
                .ready
    };

    return createReport({
        type:
            "production_readiness_report",

        score,

        status,

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            infrastructure: {
                postgres:
                    infrastructure.postgres,

                migrations:
                    infrastructure.migrations,

                repositories:
                    infrastructure.repositories,

                persistence:
                    infrastructure.persistence,

                whatsappPersistence:
                    infrastructure
                        .whatsappPersistence
            },

            checklist,

            passed,

            recommendation
        }
    });
}

function buildChecklist({
    health,
    architecture,
    dependencyGraph,
    technicalDebt,
    infrastructure
}) {
    return [
        {
            key:
                "whatsapp_connected",

            label:
                "WhatsApp conectado",

            status:
                health.runtimeConnected
                    ? "passed"
                    : "warning",

            detail:
                health.runtimeConnected
                    ? "Runtime WhatsApp está conectado."
                    : "Runtime WhatsApp não está conectado."
        },

        {
            key:
                "socket_alive",

            label:
                "Socket ativo",

            status:
                health.socketAlive
                    ? "passed"
                    : "warning",

            detail:
                health.socketAlive
                    ? "Socket está vivo."
                    : "Socket não está ativo."
        },

        {
            key:
                "health_monitor",

            label:
                "Health Monitor ativo",

            status:
                health.monitorActive
                    ? "passed"
                    : "warning",

            detail:
                health.monitorActive
                    ? "Health Monitor está ativo."
                    : "Health Monitor não está ativo."
        },

        {
            key:
                "queue_dead_letter",

            label:
                "Dead Letter Queue zerada",

            status:
                health.queueDeadLetter === 0
                    ? "passed"
                    : "warning",

            detail:
                `Dead Letter atual: ${health.queueDeadLetter}.`
        },

        {
            key:
                "queue_pending",

            label:
                "Fila pendente controlada",

            status:
                health.queuePending <= 10
                    ? "passed"
                    : "warning",

            detail:
                `Jobs pendentes: ${health.queuePending}.`
        },

        {
            key:
                "runtime_errors",

            label:
                "Sem erros recentes",

            status:
                health.logErrors === 0
                    ? "passed"
                    : "warning",

            detail:
                `Erros recentes: ${health.logErrors}.`
        },

        {
            key:
                "technical_debt",

            label:
                "Débito técnico controlado",

            status:
                (
                    technicalDebt
                        .summary
                        .high === 0
                    && technicalDebt
                        .summary
                        .critical === 0
                )
                    ? "passed"
                    : "warning",

            detail:
                `Débitos críticos/altos: ${
                    technicalDebt
                        .summary
                        .critical
                    + technicalDebt
                        .summary
                        .high
                }.`
        },

        {
            key:
                "architecture_large_files",

            label:
                "Arquivos grandes controlados",

            status:
                architecture
                    .largeFiles
                    .length <= 3
                    ? "passed"
                    : "warning",

            detail:
                `Arquivos grandes: ${
                    architecture
                        .largeFiles
                        .length
                }.`
        },

        {
            key:
                "dependency_risk",

            label:
                "Dependências sob controle",

            status:
                dependencyGraph
                    .summary
                    .highRiskFiles === 0
                    ? "passed"
                    : "warning",

            detail:
                `Arquivos de alto risco: ${
                    dependencyGraph
                        .summary
                        .highRiskFiles
                }.`
        },

        {
            key:
                "database_connection",

            label:
                "PostgreSQL conectado",

            status:
                infrastructure
                    .postgres
                    .ready
                    ? "passed"
                    : "blocker",

            detail:
                infrastructure
                    .postgres
                    .ready
                    ? `PostgreSQL conectado com latência de ${
                        infrastructure
                            .postgres
                            .latencyMs
                        ?? "-"
                    } ms.`
                    : `PostgreSQL indisponível. ${
                        infrastructure
                            .postgres
                            .lastError
                        || ""
                    }`
        },

        {
            key:
                "database_migrations",

            label:
                "Migrations atualizadas",

            status:
                infrastructure
                    .migrations
                    .ready
                    ? "passed"
                    : "blocker",

            detail:
                infrastructure
                    .migrations
                    .ready
                    ? `${
                        infrastructure
                            .migrations
                            .executed
                    } migrations executadas e nenhuma pendente.`
                    : `${
                        infrastructure
                            .migrations
                            .pending
                    } migration(s) pendente(s).`
        },

        {
            key:
                "database_repositories",

            label:
                "Repositories PostgreSQL ativos",

            status:
                infrastructure
                    .repositories
                    .ready
                    ? "passed"
                    : "blocker",

            detail:
                `${
                    infrastructure
                        .repositories
                        .total
                } repository(ies) PostgreSQL registrado(s).`
        },

        {
            key:
                "database_persistence",

            label:
                "Persistência real em banco",

            status:
                infrastructure
                    .persistence
                    .ready
                    ? "passed"
                    : "blocker",

            detail:
                infrastructure
                    .persistence
                    .ready
                    ? "Módulos principais estão persistindo dados no PostgreSQL."
                    : "A persistência PostgreSQL ainda não está pronta."
        },

        {
            key:
                "whatsapp_runtime_persistence",

            label:
                "Runtime WhatsApp persistido",

            status:
                infrastructure
                    .whatsappPersistence
                    .ready
                    ? "passed"
                    : "warning",

            detail:
                infrastructure
                    .whatsappPersistence
                    .ready
                    ? `${
                        infrastructure
                            .whatsappPersistence
                            .bindings
                    } binding(s) e ${
                        infrastructure
                            .whatsappPersistence
                            .flushers
                    } flusher(s) ativos.`
                    : "Runtime WhatsApp ainda não possui bindings e flushers ativos."
        },

        {
            key:
                "redis_bullmq",

            label:
                "Fila Redis/BullMQ",

            status:
                "warning",

            detail:
                "Fila em memória funciona no ambiente atual, mas Redis/BullMQ ainda é necessário para escala e produção robusta."
        },

        {
            key:
                "docker",

            label:
                "Docker/ambiente replicável",

            status:
                infrastructure
                    .postgres
                    .ready
                    ? "passed"
                    : "warning",

            detail:
                infrastructure
                    .postgres
                    .ready
                    ? "PostgreSQL local já utiliza Docker. Ainda falta containerizar a API."
                    : "Docker ainda precisa ser preparado."
        }
    ];
}

function calculateScore(checklist) {
    let score = 100;

    for (
        const item
        of toArray(checklist)
    ) {
        if (
            item.status === "blocker"
        ) {
            score -= 20;
        }

        if (
            item.status === "warning"
        ) {
            score -= 5;
        }
    }

    return clampScore(score);
}

function getStatus(score) {
    if (score >= 90) {
        return "ready_for_beta";
    }

    if (score >= 75) {
        return "almost_ready";
    }

    if (score >= 55) {
        return "needs_work";
    }

    return "not_ready";
}

function getRecommendation(score) {
    if (score >= 90) {
        return (
            "Backend apto para beta assistido, "
            + "mantendo monitoramento e avançando "
            + "para Redis/BullMQ."
        );
    }

    if (score >= 75) {
        return (
            "Backend próximo de beta. "
            + "Concluir fila profissional, segurança "
            + "e containerização da API."
        );
    }

    if (score >= 55) {
        return (
            "Backend ainda precisa de ajustes "
            + "antes de produção externa."
        );
    }

    return (
        "Backend não recomendado "
        + "para produção neste momento."
    );
}

function getRecommendations({
    score,
    checklist,
    infrastructure
}) {
    const recommendations = [
        getRecommendation(score)
    ];

    const blockers =
        toArray(checklist)
            .filter(
                (item) =>
                    item.status === "blocker"
            );

    const warnings =
        toArray(checklist)
            .filter(
                (item) =>
                    item.status === "warning"
            );

    if (blockers.length > 0) {
        recommendations.push(
            "Resolver todos os blockers antes da exposição pública."
        );
    }

    if (warnings.length > 0) {
        recommendations.push(
            "Revisar os warnings antes do beta assistido."
        );
    }

    if (
        infrastructure
            .persistence
            .ready
    ) {
        recommendations.push(
            "A persistência PostgreSQL está pronta; preparar Redis e BullMQ."
        );
    }

    if (
        !infrastructure
            .whatsappPersistence
            .ready
    ) {
        recommendations.push(
            "Validar bindings e Runtime Flushers do WhatsApp."
        );
    }

    recommendations.push(
        "Containerizar a API Node.js antes da VPS."
    );

    recommendations.push(
        "Revisar autenticação JWT, RBAC, rate limit e audit logs."
    );

    return uniqueStrings(
        recommendations
    );
}

function getNextSteps(
    checklist,
    infrastructure
) {
    const steps = [];

    const blockers =
        toArray(checklist)
            .filter(
                (item) =>
                    item.status === "blocker"
            );

    if (blockers.length > 0) {
        steps.push(
            "Corrigir blockers antes de qualquer produção."
        );
    }

    if (
        !infrastructure
            .postgres
            .ready
    ) {
        steps.push(
            "Restaurar conexão com PostgreSQL."
        );
    }

    if (
        !infrastructure
            .migrations
            .ready
    ) {
        steps.push(
            "Executar npm run db:migrate."
        );
    }

    if (
        !infrastructure
            .repositories
            .ready
    ) {
        steps.push(
            "Validar o registro dos repositories PostgreSQL."
        );
    }

    if (
        !infrastructure
            .persistence
            .ready
    ) {
        steps.push(
            "Concluir a persistência PostgreSQL dos módulos principais."
        );
    }

    if (
        !infrastructure
            .whatsappPersistence
            .ready
    ) {
        steps.push(
            "Verificar bindings e Runtime Flushers do WhatsApp."
        );
    }

    if (
        infrastructure
            .persistence
            .ready
    ) {
        steps.push(
            "Encerrar oficialmente a Fase PostgreSQL."
        );

        steps.push(
            "Iniciar Redis."
        );

        steps.push(
            "Migrar a fila em memória para BullMQ."
        );
    }

    steps.push(
        "Containerizar a API Node.js."
    );

    steps.push(
        "Revisar JWT e RBAC antes da VPS pública."
    );

    steps.push(
        "Preparar frontend Lovable após estabilizar infraestrutura e segurança."
    );

    return uniqueStrings(steps);
}

function normalizeHealthReview(
    health = {}
) {
    const source =
        safeObject(health);

    const runtimeReview =
        safeObject(
            source.runtime
        );

    const runtime =
        safeObject(
            runtimeReview.runtime
        );

    const runtimeStatus =
        safeObject(
            runtime.status
        );

    const socket =
        safeObject(
            runtime.socket
        );

    const monitor =
        safeObject(
            runtime.monitor
        );

    const queue =
        safeObject(
            source.queue
        );

    const queueSummary =
        safeObject(
            queue.summary
        );

    const logs =
        safeObject(
            source.logs
        );

    const logsSummary =
        safeObject(
            logs.summary
        );

    return {
        runtimeConnected:
            Boolean(
                runtimeStatus.connected
            ),

        socketAlive:
            Boolean(
                socket.alive
            ),

        monitorActive:
            Boolean(
                monitor.active
            ),

        queuePending:
            toNumber(
                queueSummary.pending
            ),

        queueDeadLetter:
            toNumber(
                queueSummary.deadLetter
            ),

        queueHistory:
            toNumber(
                queueSummary.history
            ),

        logErrors:
            toNumber(
                logsSummary.errors
            ),

        logWarnings:
            toNumber(
                logsSummary.warnings
            )
    };
}

function normalizeArchitectureReview(
    architecture = {}
) {
    const source =
        safeObject(architecture);

    return {
        ...source,

        summary:
            safeObject(
                source.summary
            ),

        largeFiles:
            toArray(
                source.largeFiles
            ),

        highlyCoupledFiles:
            toArray(
                source.highlyCoupledFiles
            ),

        moduleHealth:
            toArray(
                source.moduleHealth
            ),

        suggestions:
            toArray(
                source.suggestions
            )
    };
}

function normalizeDependencyGraph(
    dependencyGraph = {}
) {
    const source =
        safeObject(
            dependencyGraph
        );

    const summary =
        safeObject(
            source.summary
        );

    return {
        ...source,

        summary: {
            nodes:
                toNumber(
                    summary.nodes
                ),

            edges:
                toNumber(
                    summary.edges
                ),

            highRiskFiles:
                toNumber(
                    summary.highRiskFiles
                ),

            mediumRiskFiles:
                toNumber(
                    summary.mediumRiskFiles
                ),

            externalDependencies:
                toNumber(
                    summary.externalDependencies
                )
        },

        nodes:
            toArray(
                source.nodes
            ),

        edges:
            toArray(
                source.edges
            ),

        suggestions:
            toArray(
                source.suggestions
            )
    };
}

function normalizeTechnicalDebt(
    technicalDebt = {}
) {
    const source =
        safeObject(
            technicalDebt
        );

    const summary =
        safeObject(
            source.summary
        );

    return {
        ...source,

        summary: {
            total:
                toNumber(
                    summary.total
                ),

            critical:
                toNumber(
                    summary.critical
                ),

            high:
                toNumber(
                    summary.high
                ),

            medium:
                toNumber(
                    summary.medium
                ),

            low:
                toNumber(
                    summary.low
                ),

            estimatedHours:
                toNumber(
                    summary.estimatedHours
                )
        },

        debts:
            toArray(
                source.debts
            ),

        recommendations:
            toArray(
                source.recommendations
            )
    };
}

function normalizeInfrastructure(
    infrastructure = {}
) {
    const source =
        safeObject(
            infrastructure
        );

    const postgres =
        safeObject(
            source.postgres
        );

    const migrations =
        safeObject(
            source.migrations
        );

    const repositories =
        safeObject(
            source.repositories
        );

    const persistence =
        safeObject(
            source.persistence
        );

    const whatsappPersistence =
        safeObject(
            source.whatsappPersistence
        );

    return {
        ...source,

        postgres: {
            connected:
                Boolean(
                    postgres.connected
                ),

            ready:
                Boolean(
                    postgres.ready
                ),

            latencyMs:
                postgres.latencyMs
                ?? null,

            serverTime:
                postgres.serverTime
                ?? null,

            lastError:
                postgres.lastError
                ?? null
        },

        migrations: {
            ready:
                Boolean(
                    migrations.ready
                ),

            total:
                toNumber(
                    migrations.total
                ),

            executed:
                toNumber(
                    migrations.executed
                ),

            pending:
                toNumber(
                    migrations.pending
                ),

            executedFiles:
                toArray(
                    migrations.executedFiles
                ),

            pendingFiles:
                toArray(
                    migrations.pendingFiles
                )
        },

        repositories: {
            ready:
                Boolean(
                    repositories.ready
                ),

            total:
                toNumber(
                    repositories.total
                ),

            items:
                toArray(
                    repositories.items
                )
        },

        persistence: {
            ready:
                Boolean(
                    persistence.ready
                ),

            modules:
                toArray(
                    persistence.modules
                )
        },

        whatsappPersistence: {
            ready:
                Boolean(
                    whatsappPersistence.ready
                ),

            bindings:
                toNumber(
                    whatsappPersistence.bindings
                ),

            flushers:
                toNumber(
                    whatsappPersistence.flushers
                ),

            instances:
                toNumber(
                    whatsappPersistence.instances
                ),

            unhealthyInstances:
                toNumber(
                    whatsappPersistence
                        .unhealthyInstances
                )
        }
    };
}