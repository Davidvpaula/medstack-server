import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    getKnowledgeSummary
} from "./ai-knowledge-base.service.js";

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

export async function generateExecutiveReport() {
    const infrastructureResult =
        await getInfrastructureContext();

    const review =
        normalizeHealthReview(
            getFullHealthReview()
        );

    const knowledge =
        normalizeKnowledgeSummary(
            getKnowledgeSummary()
        );

    const infrastructure =
        normalizeInfrastructure(
            infrastructureResult
        );

    const score =
        calculateHealthScore({
            review,
            knowledge,
            infrastructure
        });

    const status =
        getStatusFromScore(score);

    const blockers =
        generateBlockers({
            review,
            knowledge,
            infrastructure
        });

    const warnings =
        generateWarnings({
            review,
            knowledge,
            infrastructure
        });

    const risks =
        generateRisks({
            review,
            knowledge,
            infrastructure
        });

    const recommendations =
        generateRecommendations({
            review,
            knowledge,
            infrastructure
        });

    const nextSteps =
        generateNextSteps(
            infrastructure
        );

    const summary = {
        whatsappConnected:
            review.whatsappConnected,

        whatsappStatus:
            review.whatsappStatus,

        socketAlive:
            review.socketAlive,

        monitorActive:
            review.monitorActive,

        queuePending:
            review.queuePending,

        queueProcessing:
            review.queueProcessing,

        queueHistory:
            review.queueHistory,

        queueDeadLetter:
            review.queueDeadLetter,

        logTotal:
            review.logTotal,

        logErrors:
            review.logErrors,

        logWarnings:
            review.logWarnings,

        aiSuggestions:
            review.aiSuggestions,

        knowledgeItems:
            knowledge.total,

        knowledgeCritical:
            knowledge.critical,

        knowledgeHigh:
            knowledge.high,

        postgresConnected:
            infrastructure
                .postgres
                .connected,

        postgresReady:
            infrastructure
                .postgres
                .ready,

        databaseLatencyMs:
            infrastructure
                .postgres
                .latencyMs,

        migrationsExecuted:
            infrastructure
                .migrations
                .executed,

        migrationsPending:
            infrastructure
                .migrations
                .pending,

        repositories:
            infrastructure
                .repositories
                .total,

        persistenceReady:
            infrastructure
                .persistence
                .ready,

        whatsappPersistenceReady:
            infrastructure
                .whatsappPersistence
                .ready,

        whatsappBindings:
            infrastructure
                .whatsappPersistence
                .bindings,

        whatsappFlushers:
            infrastructure
                .whatsappPersistence
                .flushers,

        unhealthyInstances:
            infrastructure
                .whatsappPersistence
                .unhealthyInstances,

        diagnosticsFailed:
            infrastructure
                .diagnosticsSummary
                .failed,

        diagnosticsWarnings:
            infrastructure
                .diagnosticsSummary
                .warnings
    };

    return createReport({
        type:
            "executive_report",

        score,

        status,

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            /*
             * Compatibilidade com consumidores
             * que ainda utilizam healthScore.
             */
            healthScore:
                score,

            risks,

            infrastructure: {
                diagnosticsStatus:
                    infrastructure
                        .diagnosticsStatus,

                diagnosticsSummary:
                    infrastructure
                        .diagnosticsSummary,

                postgres:
                    infrastructure
                        .postgres,

                migrations:
                    infrastructure
                        .migrations,

                repositories:
                    infrastructure
                        .repositories,

                persistence:
                    infrastructure
                        .persistence,

                whatsappPersistence:
                    infrastructure
                        .whatsappPersistence
            }
        }
    });
}

function calculateHealthScore({
    review,
    knowledge,
    infrastructure
}) {
    let score = 100;

    if (!review.whatsappConnected) {
        score -= 10;
    }

    if (!review.socketAlive) {
        score -= 15;
    }

    if (!review.monitorActive) {
        score -= 5;
    }

    if (review.queueDeadLetter > 0) {
        score -= 15;
    }

    if (review.queuePending > 10) {
        score -= 8;
    }

    if (review.logErrors > 0) {
        score -= 10;
    }

    if (review.logWarnings > 5) {
        score -= 5;
    }

    if (knowledge.critical > 0) {
        score -= 15;
    }

    if (knowledge.high > 0) {
        score -= 8;
    }

    if (!infrastructure.postgres.ready) {
        score -= 25;
    }

    if (!infrastructure.migrations.ready) {
        score -= 15;
    }

    if (!infrastructure.repositories.ready) {
        score -= 15;
    }

    if (!infrastructure.persistence.ready) {
        score -= 15;
    }

    if (
        !infrastructure
            .whatsappPersistence
            .ready
    ) {
        score -= 8;
    }

    if (
        infrastructure
            .diagnosticsSummary
            .failed > 0
    ) {
        score -=
            infrastructure
                .diagnosticsSummary
                .failed * 10;
    }

    return clampScore(score);
}

function getStatusFromScore(score) {
    if (score >= 90) {
        return "healthy";
    }

    if (score >= 75) {
        return "attention";
    }

    if (score >= 55) {
        return "risk";
    }

    return "critical";
}

function generateBlockers({
    knowledge,
    infrastructure
}) {
    const blockers = [];

    if (!infrastructure.postgres.ready) {
        blockers.push(
            "PostgreSQL não está pronto."
        );
    }

    if (!infrastructure.migrations.ready) {
        blockers.push(
            "Existem migrations pendentes ou com falha."
        );
    }

    if (!infrastructure.repositories.ready) {
        blockers.push(
            "Os repositories PostgreSQL não estão prontos."
        );
    }

    if (!infrastructure.persistence.ready) {
        blockers.push(
            "A persistência PostgreSQL dos módulos principais ainda não está pronta."
        );
    }

    if (
        infrastructure
            .diagnosticsSummary
            .failed > 0
    ) {
        blockers.push(
            `${infrastructure.diagnosticsSummary.failed} falha(s) encontrada(s) no diagnóstico da infraestrutura.`
        );
    }

    if (knowledge.critical > 0) {
        blockers.push(
            `${knowledge.critical} alerta(s) crítico(s) registrado(s) na base de conhecimento.`
        );
    }

    return uniqueStrings(blockers);
}

function generateWarnings({
    review,
    knowledge,
    infrastructure
}) {
    const warnings = [];

    if (!review.whatsappConnected) {
        warnings.push(
            "WhatsApp está desconectado."
        );
    }

    if (!review.socketAlive) {
        warnings.push(
            "Socket do WhatsApp está inativo."
        );
    }

    if (!review.monitorActive) {
        warnings.push(
            "Health Monitor do runtime não está ativo."
        );
    }

    if (review.queueDeadLetter > 0) {
        warnings.push(
            `${review.queueDeadLetter} job(s) na Dead Letter Queue.`
        );
    }

    if (review.queuePending > 10) {
        warnings.push(
            `${review.queuePending} job(s) pendente(s) na fila.`
        );
    }

    if (review.logErrors > 0) {
        warnings.push(
            `${review.logErrors} erro(s) recente(s) nos logs.`
        );
    }

    if (review.logWarnings > 5) {
        warnings.push(
            `${review.logWarnings} warning(s) recente(s) nos logs.`
        );
    }

    if (knowledge.high > 0) {
        warnings.push(
            `${knowledge.high} alerta(s) de alta prioridade na base de conhecimento.`
        );
    }

    if (
        !infrastructure
            .whatsappPersistence
            .ready
    ) {
        warnings.push(
            "A persistência do runtime WhatsApp está incompleta."
        );
    }

    if (
        infrastructure
            .whatsappPersistence
            .unhealthyInstances > 0
    ) {
        warnings.push(
            `${infrastructure.whatsappPersistence.unhealthyInstances} instância(s) WhatsApp não saudável(is).`
        );
    }

    return uniqueStrings(warnings);
}

function generateRisks({
    review,
    knowledge,
    infrastructure
}) {
    const risks = [];

    if (!review.whatsappConnected) {
        risks.push(
            "WhatsApp desconectado."
        );
    }

    if (!review.socketAlive) {
        risks.push(
            "Socket inativo."
        );
    }

    if (review.queueDeadLetter > 0) {
        risks.push(
            "Existem jobs na Dead Letter Queue."
        );
    }

    if (review.logErrors > 0) {
        risks.push(
            "Existem erros recentes nos logs."
        );
    }

    if (
        knowledge.critical > 0
        || knowledge.high > 0
    ) {
        risks.push(
            "A base de conhecimento contém alertas relevantes."
        );
    }

    if (!infrastructure.postgres.ready) {
        risks.push(
            "PostgreSQL indisponível."
        );
    }

    if (
        infrastructure
            .migrations
            .pending > 0
    ) {
        risks.push(
            `Existem ${infrastructure.migrations.pending} migration(s) pendente(s).`
        );
    }

    if (!infrastructure.persistence.ready) {
        risks.push(
            "Persistência principal incompleta."
        );
    }

    if (
        !infrastructure
            .whatsappPersistence
            .ready
    ) {
        risks.push(
            "Persistência do runtime WhatsApp incompleta."
        );
    }

    if (!risks.length) {
        risks.push(
            "Nenhum risco crítico identificado no momento."
        );
    }

    return uniqueStrings(risks);
}

function generateRecommendations({
    review,
    knowledge,
    infrastructure
}) {
    const recommendations = [];

    if (review.queueHistory > 50) {
        recommendations.push(
            "Planejar migração da fila para Redis/BullMQ."
        );
    }

    if (review.whatsappConnected) {
        recommendations.push(
            "Manter Health Monitor, AutoStart e Runtime Flusher ativos."
        );
    }

    if (knowledge.total > 100) {
        recommendations.push(
            "Migrar a base de conhecimento do AI Monitor para persistência permanente."
        );
    }

    if (infrastructure.persistence.ready) {
        recommendations.push(
            "PostgreSQL concluído. Próxima evolução recomendada: Redis e BullMQ."
        );
    } else {
        recommendations.push(
            "Concluir a persistência PostgreSQL antes de avançar."
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
        "Containerizar a API e preparar health checks do Docker."
    );

    recommendations.push(
        "Revisar autenticação JWT, RBAC, rate limit e audit logs antes da VPS."
    );

    return uniqueStrings(recommendations);
}

function generateNextSteps(
    infrastructure
) {
    const steps = [];

    if (!infrastructure.postgres.ready) {
        steps.push(
            "Corrigir conexão PostgreSQL."
        );
    }

    if (!infrastructure.migrations.ready) {
        steps.push(
            "Executar migrations pendentes."
        );
    }

    if (!infrastructure.repositories.ready) {
        steps.push(
            "Validar o registro dos repositories PostgreSQL."
        );
    }

    if (!infrastructure.persistence.ready) {
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

    if (infrastructure.persistence.ready) {
        steps.push(
            "Encerrar oficialmente a Fase 9 PostgreSQL."
        );

        steps.push(
            "Iniciar a Fase 10 Redis."
        );

        steps.push(
            "Migrar a fila em memória para BullMQ após Redis."
        );
    }

    steps.push(
        "Containerizar a API Node.js."
    );

    steps.push(
        "Revisar autenticação JWT e RBAC."
    );

    steps.push(
        "Preparar frontend Lovable após estabilizar backend e infraestrutura."
    );

    return uniqueStrings(steps);
}

function normalizeHealthReview(
    review = {}
) {
    const source =
        safeObject(review);

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
        whatsappConnected:
            Boolean(
                runtimeStatus.connected
            ),

        whatsappStatus:
            runtimeStatus.status
            || "unknown",

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

        queueProcessing:
            toNumber(
                queueSummary.processing
            ),

        queueHistory:
            toNumber(
                queueSummary.history
            ),

        queueDeadLetter:
            toNumber(
                queueSummary.deadLetter
            ),

        logTotal:
            toNumber(
                logsSummary.total
            ),

        logErrors:
            toNumber(
                logsSummary.errors
            ),

        logWarnings:
            toNumber(
                logsSummary.warnings
            ),

        aiSuggestions:
            toArray(
                source.aiSuggestions
            ).length
    };
}

function normalizeKnowledgeSummary(
    knowledge = {}
) {
    const source =
        safeObject(knowledge);

    return {
        total:
            toNumber(
                source.total
            ),

        critical:
            toNumber(
                source.critical
            ),

        high:
            toNumber(
                source.high
            ),

        medium:
            toNumber(
                source.medium
            ),

        low:
            toNumber(
                source.low
            )
    };
}

function normalizeInfrastructure(
    infrastructure = {}
) {
    const source =
        safeObject(infrastructure);

    const diagnosticsSummary =
        safeObject(
            source.diagnosticsSummary
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
        diagnosticsStatus:
            source.diagnosticsStatus
            || "unknown",

        diagnosticsSummary: {
            total:
                toNumber(
                    diagnosticsSummary.total
                ),

            passed:
                toNumber(
                    diagnosticsSummary.passed
                ),

            warnings:
                toNumber(
                    diagnosticsSummary.warnings
                ),

            failed:
                toNumber(
                    diagnosticsSummary.failed
                )
        },

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