import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    generateExecutiveReport
} from "./ai-executive-report.service.js";

import {
    getProductionReadinessReport
} from "./ai-production-readiness.service.js";

import {
    getSecurityFinalReport
} from "./ai-security-report.service.js";

import {
    getPerformanceFinalReport
} from "./ai-performance-report.service.js";

import {
    getRefactoringAdvisorReport
} from "./ai-refactoring-advisor.service.js";

import {
    getReleaseAdvisorReport
} from "./ai-release-advisor.service.js";

import {
    getModuleHealthReport
} from "./ai-module-health.service.js";

import {
    getRoadmapAnalysis
} from "./ai-roadmap.service.js";

import {
    getScannerSummary
} from "./ai-code-scanner.service.js";

import {
    getInfrastructureContext
} from "./ai-infrastructure-context.service.js";

import {
    clampScore,
    createReport,
    formatReportItem,
    normalizeReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export async function getFinalOverviewReport() {
    const [
        executiveResult,
        productionResult,
        infrastructureResult,
        performanceResult,
        refactoringResult,
        releaseResult
    ] = await Promise.all([
        generateExecutiveReport(),
        getProductionReadinessReport(),
        getInfrastructureContext(),
        getPerformanceFinalReport(),
        getRefactoringAdvisorReport(),
        getReleaseAdvisorReport()
    ]);

    const health =
        normalizeHealthReview(
            getFullHealthReview()
        );

    const executive =
        normalizeExecutiveReport(
            executiveResult
        );

    const production =
        normalizeReport(
            productionResult,
            {
                type:
                    "production_readiness_report"
            }
        );

    const infrastructure =
        normalizeInfrastructureContext(
            infrastructureResult
        );

    const performance =
        normalizePerformanceReport(
            performanceResult
        );

    const refactoring =
        normalizeRefactoringReport(
            refactoringResult
        );

    const security =
        normalizeSecurityReport(
            getSecurityFinalReport()
        );

    const release =
        normalizeReleaseReport(
            releaseResult
        );

    const moduleHealth =
        normalizeModuleHealthReport(
            getModuleHealthReport()
        );

    const roadmap =
        normalizeRoadmapReport(
            getRoadmapAnalysis()
        );

    const scanner =
        normalizeScannerSummary(
            getScannerSummary()
        );

    const blockers =
        collectBlockers({
            production,
            security,
            performance,
            release,
            moduleHealth,
            infrastructure
        });

    const score =
        calculateFinalScore({
            executive,
            production,
            security,
            performance,
            release,
            moduleHealth
        });

    const status =
        getFinalStatus({
            score,
            blockers
        });

    const decisions =
        buildDecisions({
            release,
            infrastructure,
            roadmap,
            blockers
        });

    const warnings =
        collectWarnings({
            production,
            security,
            performance,
            refactoring,
            moduleHealth,
            release,
            roadmap,
            infrastructure
        });

    const nextSteps =
        buildNextSteps({
            release,
            roadmap,
            infrastructure,
            decisions
        });

    const recommendations =
        buildRecommendations({
            score,
            decisions,
            release,
            security,
            performance,
            refactoring,
            moduleHealth,
            roadmap,
            infrastructure
        });

    const summary = {
        executiveScore:
            executive.score,

        productionScore:
            production.score,

        securityScore:
            security.score,

        performanceScore:
            performance.score,

        releaseScore:
            release.score,

        moduleHealthScore:
            moduleHealth.score,

        roadmapScore:
            roadmap.score,

        roadmapProgress:
            roadmap.progress,

        roadmapCompleted:
            roadmap.summary.completed,

        roadmapInProgress:
            roadmap.summary.inProgress,

        roadmapPending:
            roadmap.summary.pending,

        roadmapBlocked:
            roadmap.summary.blocked,

        roadmapManualValidation:
            roadmap.summary.manualValidation,

        scannedFiles:
            scanner.totalFiles,

        scannedModules:
            scanner.totalModules,

        scannedLines:
            scanner.totalLines,

        moduleCriticalRisk:
            moduleHealth
                .summary
                .criticalRisk,

        moduleHighRisk:
            moduleHealth
                .summary
                .highRisk,

        moduleMediumRisk:
            moduleHealth
                .summary
                .mediumRisk,

        moduleLowRisk:
            moduleHealth
                .summary
                .lowRisk,

        healthyModules:
            moduleHealth
                .summary
                .healthy,

        refactoringCandidates:
            refactoring
                .summary
                .totalCandidates,

        refactoringCritical:
            refactoring
                .summary
                .critical,

        refactoringHigh:
            refactoring
                .summary
                .high,

        refactoringMedium:
            refactoring
                .summary
                .medium,

        refactoringLow:
            refactoring
                .summary
                .low,

        refactoringEstimatedHours:
            refactoring
                .summary
                .estimatedHours,

        postgresConnected:
            infrastructure
                .postgres
                .connected,

        postgresReady:
            infrastructure
                .postgres
                .ready,

        migrationsReady:
            infrastructure
                .migrations
                .ready,

        migrationsExecuted:
            infrastructure
                .migrations
                .executed,

        migrationsPending:
            infrastructure
                .migrations
                .pending,

        repositoriesReady:
            infrastructure
                .repositories
                .ready,

        databaseRepositories:
            infrastructure
                .repositories
                .total,

        databasePersistenceReady:
            infrastructure
                .persistence
                .ready,

        postgresStructuralCompleted:
            decisions
                .postgresStructuralCompleted,

        postgresMechanicalTestCompleted:
            decisions
                .postgresMechanicalTestCompleted,

        aiMonitorMechanicalTestCompleted:
            decisions
                .aiMonitorMechanicalTestCompleted,

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

        whatsappInstances:
            infrastructure
                .whatsappPersistence
                .instances,

        unhealthyWhatsappInstances:
            infrastructure
                .whatsappPersistence
                .unhealthyInstances,

        diagnosticsPassed:
            infrastructure
                .diagnosticsSummary
                .passed,

        diagnosticsWarnings:
            infrastructure
                .diagnosticsSummary
                .warnings,

        diagnosticsFailed:
            infrastructure
                .diagnosticsSummary
                .failed,

        totalBlockers:
            blockers.length,

        totalWarnings:
            warnings.length
    };

    return createReport({
        type:
            "final_overview_report",

        score,

        status,

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
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
            },

            decisions,

            currentStage:
                release.currentStage,

            currentRoadmapStep:
                roadmap.currentStep,

            nextRoadmapStep:
                roadmap.nextStep,

            raw: {
                health,
                executive,
                production,
                security,
                performance,
                refactoring,
                release,
                moduleHealth,
                roadmap,
                scanner,
                infrastructure
            }
        }
    });
}

function calculateFinalScore({
    executive,
    production,
    security,
    performance,
    release,
    moduleHealth
}) {
    const score =
        executive.score * 0.20
        + production.score * 0.25
        + security.score * 0.15
        + performance.score * 0.10
        + release.score * 0.20
        + moduleHealth.score * 0.10;

    return clampScore(
        score
    );
}

function getFinalStatus({
    score,
    blockers
}) {
    if (
        blockers.length > 0
        && score < 80
    ) {
        return "not_ready";
    }

    if (blockers.length > 0) {
        return "blocked_with_good_score";
    }

    if (score >= 90) {
        return "excellent";
    }

    if (score >= 80) {
        return "ready_to_advance";
    }

    if (score >= 65) {
        return "needs_cleanup";
    }

    return "not_ready";
}

function buildDecisions({
    release,
    infrastructure,
    roadmap,
    blockers
}) {
    const releaseDecision =
        safeObject(
            release.decision
        );

    const postgresStructuralCompleted =
        infrastructure.postgres.ready
        && infrastructure.migrations.ready
        && infrastructure.repositories.ready
        && infrastructure.persistence.ready;

    const postgresMechanicalStep =
        findRoadmapStep(
            roadmap.roadmap,
            "postgresql_mechanical_test"
        );

    const aiMonitorMechanicalStep =
        findRoadmapStep(
            roadmap.roadmap,
            "ai_monitor_mechanical_test"
        );

    const postgresMechanicalTestCompleted =
        postgresMechanicalStep
            ?.status === "done";

    const postgresMechanicalTestWaitingValidation =
        postgresMechanicalStep
            ?.status === "manual_validation";

    const aiMonitorMechanicalTestCompleted =
        aiMonitorMechanicalStep
            ?.status === "done";

    const aiMonitorMechanicalTestWaitingValidation =
        aiMonitorMechanicalStep
            ?.status === "manual_validation";

    const noCriticalInfrastructureFailures =
        infrastructure
            .diagnosticsSummary
            .failed === 0;

    const canPrepareRedisBullMQ =
        postgresStructuralCompleted
        && noCriticalInfrastructureFailures;

    const canStartRedisBullMQ =
        canPrepareRedisBullMQ
        && postgresMechanicalTestCompleted
        && Boolean(
            releaseDecision
                .canStartRedisBullMQ
        );

    const canPrepareDocker =
        postgresStructuralCompleted
        && noCriticalInfrastructureFailures;

    const canStartDocker =
        canStartRedisBullMQ
        && Boolean(
            releaseDecision
                .canStartDocker
        );

    const canStartVps =
        canStartDocker
        && blockers.length === 0
        && Boolean(
            releaseDecision
                .canStartVps
        );

    const canPlanLovable =
        postgresStructuralCompleted;

    const canStartLovable =
        canStartVps
        && Boolean(
            releaseDecision
                .canStartLovable
        );

    const nextRecommendedPhase =
        resolveNextRecommendedPhase({
            postgresStructuralCompleted,
            postgresMechanicalTestCompleted,
            aiMonitorMechanicalTestCompleted,
            canStartRedisBullMQ,
            canStartDocker,
            canStartVps,
            canStartLovable,
            releaseDecision,
            roadmap
        });

    return {
        nextRecommendedPhase,

        canStartPostgreSQL:
            !postgresStructuralCompleted,

        postgresCompleted:
            postgresStructuralCompleted,

        postgresStructuralCompleted,

        postgresMechanicalTestCompleted,

        postgresMechanicalTestWaitingValidation,

        aiMonitorMechanicalTestCompleted,

        aiMonitorMechanicalTestWaitingValidation,

        canPrepareRedisBullMQ,

        canStartRedisBullMQ,

        canPrepareDocker,

        canStartDocker,

        canStartVps,

        canPlanLovable,

        canStartLovable,

        releaseAllowsRedisBullMQ:
            Boolean(
                releaseDecision
                    .canStartRedisBullMQ
            ),

        releaseAllowsDocker:
            Boolean(
                releaseDecision
                    .canStartDocker
            ),

        releaseAllowsVps:
            Boolean(
                releaseDecision
                    .canStartVps
            ),

        releaseAllowsLovable:
            Boolean(
                releaseDecision
                    .canStartLovable
            ),

        reason:
            buildDecisionReason({
                postgresStructuralCompleted,
                postgresMechanicalTestCompleted,
                postgresMechanicalTestWaitingValidation,
                aiMonitorMechanicalTestCompleted,
                aiMonitorMechanicalTestWaitingValidation,
                noCriticalInfrastructureFailures,
                blockers,
                nextRecommendedPhase,
                releaseDecision
            })
    };
}

function resolveNextRecommendedPhase({
    postgresStructuralCompleted,
    postgresMechanicalTestCompleted,
    aiMonitorMechanicalTestCompleted,
    canStartRedisBullMQ,
    canStartDocker,
    canStartVps,
    canStartLovable,
    releaseDecision,
    roadmap
}) {
    if (!aiMonitorMechanicalTestCompleted) {
        return "ai_monitor_mechanical_test";
    }

    if (!postgresStructuralCompleted) {
        return "complete_postgresql";
    }

    if (!postgresMechanicalTestCompleted) {
        return "postgresql_mechanical_test";
    }

    if (canStartRedisBullMQ) {
        return "redis_bullmq";
    }

    if (canStartDocker) {
        return "docker";
    }

    if (canStartVps) {
        return "vps";
    }

    if (canStartLovable) {
        return "lovable_frontend";
    }

    return (
        roadmap.nextStep?.key
        || releaseDecision
            .nextRecommendedPhase
        || "technical_review"
    );
}

function buildDecisionReason({
    postgresStructuralCompleted,
    postgresMechanicalTestCompleted,
    postgresMechanicalTestWaitingValidation,
    aiMonitorMechanicalTestCompleted,
    aiMonitorMechanicalTestWaitingValidation,
    noCriticalInfrastructureFailures,
    blockers,
    nextRecommendedPhase,
    releaseDecision
}) {
    if (!aiMonitorMechanicalTestCompleted) {
        if (
            aiMonitorMechanicalTestWaitingValidation
        ) {
            return (
                "O teste mecânico do AI Monitor "
                + "foi identificado, mas ainda depende "
                + "de validação manual."
            );
        }

        return (
            "O AI Monitor ainda precisa passar "
            + "pelo teste mecânico geral."
        );
    }

    if (!postgresStructuralCompleted) {
        return (
            "PostgreSQL ainda não está estruturalmente "
            + "concluído em conexão, migrations, "
            + "repositories e persistência."
        );
    }

    if (!postgresMechanicalTestCompleted) {
        if (
            postgresMechanicalTestWaitingValidation
        ) {
            return (
                "PostgreSQL está estruturalmente pronto, "
                + "mas o teste mecânico ainda depende "
                + "de validação manual."
            );
        }

        return (
            "PostgreSQL está estruturalmente pronto, "
            + "mas ainda precisa passar pelo teste "
            + "mecânico completo."
        );
    }

    if (!noCriticalInfrastructureFailures) {
        return (
            "Existem falhas críticas no diagnóstico "
            + "da infraestrutura."
        );
    }

    if (blockers.length > 0) {
        return (
            "Existem blockers técnicos que devem "
            + "ser corrigidos antes da próxima "
            + "fase pública."
        );
    }

    if (
        nextRecommendedPhase
        === "redis_bullmq"
    ) {
        return (
            "AI Monitor e PostgreSQL foram validados. "
            + "A próxima fase recomendada é Redis/BullMQ."
        );
    }

    return (
        releaseDecision.reason
        || "A próxima etapa depende da validação dos relatórios técnicos."
    );
}

function collectBlockers({
    production,
    security,
    performance,
    release,
    moduleHealth,
    infrastructure
}) {
    const blockers = [];

    blockers.push(
        ...prefixItems(
            production.blockers,
            "Production",
            true
        )
    );

    blockers.push(
        ...prefixItems(
            security.blockers,
            "Security",
            true
        )
    );

    blockers.push(
        ...prefixItems(
            performance.blockers,
            "Performance",
            true
        )
    );

    blockers.push(
        ...prefixItems(
            release.blockers,
            "Release",
            true
        )
    );

    blockers.push(
        ...prefixItems(
            moduleHealth.blockers,
            "Module Health",
            true
        )
    );

    if (!infrastructure.postgres.ready) {
        blockers.push(
            "Infrastructure: PostgreSQL não está conectado ou saudável."
        );
    }

    if (!infrastructure.migrations.ready) {
        blockers.push(
            "Infrastructure: existem migrations pendentes."
        );
    }

    if (!infrastructure.repositories.ready) {
        blockers.push(
            "Infrastructure: repositories PostgreSQL não estão prontos."
        );
    }

    if (!infrastructure.persistence.ready) {
        blockers.push(
            "Infrastructure: persistência principal ainda não está pronta."
        );
    }

    if (
        infrastructure
            .diagnosticsSummary
            .failed > 0
    ) {
        blockers.push(
            `Infrastructure: ${
                infrastructure
                    .diagnosticsSummary
                    .failed
            } falha(s) no diagnóstico.`
        );
    }

    return uniqueStrings(
        blockers
    );
}

function collectWarnings({
    production,
    security,
    performance,
    refactoring,
    moduleHealth,
    release,
    roadmap,
    infrastructure
}) {
    const warnings = [];

    warnings.push(
        ...prefixItems(
            production.warnings,
            "Production"
        )
    );

    warnings.push(
        ...prefixItems(
            security.warnings,
            "Security"
        )
    );

    warnings.push(
        ...prefixItems(
            performance.warnings,
            "Performance"
        )
    );

    warnings.push(
        ...prefixItems(
            release.warnings,
            "Release",
            true
        )
    );

    warnings.push(
        ...prefixItems(
            moduleHealth.warnings,
            "Module Health"
        )
    );

    warnings.push(
        ...prefixItems(
            roadmap.warnings,
            "Roadmap"
        )
    );

    if (security.score < 85) {
        warnings.push(
            `Segurança abaixo do ideal: ${security.score}%.`
        );
    }

    if (performance.score < 85) {
        warnings.push(
            `Performance abaixo do ideal: ${performance.score}%.`
        );
    }

    if (
        refactoring
            .summary
            .critical > 0
    ) {
        warnings.push(
            `${
                refactoring
                    .summary
                    .critical
            } refatoração(ões) crítica(s).`
        );
    }

    if (
        refactoring
            .summary
            .high > 0
    ) {
        warnings.push(
            `${
                refactoring
                    .summary
                    .high
            } refatoração(ões) de alta prioridade.`
        );
    }

    if (
        moduleHealth
            .summary
            .criticalRisk > 0
    ) {
        warnings.push(
            `${
                moduleHealth
                    .summary
                    .criticalRisk
            } módulo(s) crítico(s).`
        );
    }

    if (
        moduleHealth
            .summary
            .highRisk > 0
    ) {
        warnings.push(
            `${
                moduleHealth
                    .summary
                    .highRisk
            } módulo(s) de alto risco.`
        );
    }

    if (
        infrastructure
            .diagnosticsSummary
            .warnings > 0
    ) {
        warnings.push(
            `${
                infrastructure
                    .diagnosticsSummary
                    .warnings
            } warning(s) no diagnóstico da infraestrutura.`
        );
    }

    if (
        infrastructure
            .whatsappPersistence
            .unhealthyInstances > 0
    ) {
        warnings.push(
            `${
                infrastructure
                    .whatsappPersistence
                    .unhealthyInstances
            } instância(s) WhatsApp não saudável(is).`
        );
    }

    if (!warnings.length) {
        warnings.push(
            "Nenhum warning relevante encontrado."
        );
    }

    return uniqueStrings(
        warnings
    );
}

function buildNextSteps({
    release,
    roadmap,
    infrastructure,
    decisions
}) {
    const steps = [];

    if (
        !decisions
            .aiMonitorMechanicalTestCompleted
    ) {
        steps.push(
            "Executar o teste mecânico geral do AI Monitor."
        );
    }

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
            "Validar os repositories PostgreSQL."
        );
    }

    if (!infrastructure.persistence.ready) {
        steps.push(
            "Concluir a persistência PostgreSQL dos módulos principais."
        );
    }

    if (
        decisions
            .postgresStructuralCompleted
        && !decisions
            .postgresMechanicalTestCompleted
    ) {
        steps.push(
            "Executar o teste mecânico completo do PostgreSQL."
        );
    }

    if (
        decisions
            .canStartRedisBullMQ
    ) {
        steps.push(
            "Iniciar Redis."
        );

        steps.push(
            "Migrar a fila em memória para BullMQ."
        );

        steps.push(
            "Separar workers do processo principal."
        );
    }

    if (
        !decisions
            .canStartRedisBullMQ
    ) {
        steps.push(
            ...release.nextSteps
        );
    }

    steps.push(
        ...roadmap.nextSteps
    );

    return uniqueStrings(
        steps
    );
}

function buildRecommendations({
    score,
    decisions,
    release,
    security,
    performance,
    refactoring,
    moduleHealth,
    roadmap,
    infrastructure
}) {
    const recommendations = [];

    if (
        decisions
            .postgresStructuralCompleted
    ) {
        recommendations.push(
            "PostgreSQL está estruturalmente operacional."
        );
    } else {
        recommendations.push(
            "Concluir PostgreSQL antes de Redis/BullMQ."
        );
    }

    if (
        decisions
            .postgresStructuralCompleted
        && !decisions
            .postgresMechanicalTestCompleted
    ) {
        recommendations.push(
            "Não encerrar oficialmente PostgreSQL antes do teste mecânico dedicado."
        );
    }

    if (
        decisions
            .canPrepareRedisBullMQ
        && !decisions
            .canStartRedisBullMQ
    ) {
        recommendations.push(
            "Redis/BullMQ podem ser planejados, mas a implementação deve aguardar a validação mecânica do PostgreSQL."
        );
    }

    if (
        decisions
            .canStartRedisBullMQ
    ) {
        recommendations.push(
            "A próxima fase técnica recomendada é Redis/BullMQ."
        );
    }

    if (score >= 80) {
        recommendations.push(
            "O AI Monitor possui maturidade estrutural para acompanhar a próxima fase."
        );
    } else {
        recommendations.push(
            "Corrigir os principais blockers antes da infraestrutura pública."
        );
    }

    if (security.score < 85) {
        recommendations.push(
            "Priorizar segurança antes da VPS pública."
        );
    }

    if (performance.score < 85) {
        recommendations.push(
            "Revisar performance estrutural antes da escala."
        );
    }

    if (
        moduleHealth
            .summary
            .criticalRisk > 0
    ) {
        recommendations.push(
            "Corrigir módulos críticos antes da produção pública."
        );
    }

    if (
        refactoring
            .summary
            .critical > 0
        || refactoring
            .summary
            .high > 0
    ) {
        recommendations.push(
            "Executar refatorações pequenas, isoladas e comprovadas por testes."
        );
    }

    if (
        infrastructure
            .diagnosticsSummary
            .warnings > 0
    ) {
        recommendations.push(
            "Revisar warnings do diagnóstico de infraestrutura."
        );
    }

    recommendations.push(
        ...roadmap.recommendations
    );

    const releaseDecision =
        safeObject(
            release.decision
        );

    recommendations.push(
        `Release Advisor atual recomenda: ${
            releaseDecision
                .nextRecommendedPhase
            || "revisão manual"
        }.`
    );

    return uniqueStrings(
        recommendations
    );
}

function normalizeHealthReview(
    health = {}
) {
    const source =
        safeObject(
            health
        );

    return {
        type:
            source.type
            || "full_health_review",

        generatedAt:
            source.generatedAt
            || null,

        status:
            safeObject(
                source.status
            ),

        runtime:
            safeObject(
                source.runtime
            ),

        queue:
            safeObject(
                source.queue
            ),

        logs:
            safeObject(
                source.logs
            ),

        aiSuggestions:
            toArray(
                source.aiSuggestions
            )
    };
}

function normalizeExecutiveReport(
    executive = {}
) {
    const source =
        safeObject(
            executive
        );

    const legacyHealthScore =
        toNumber(
            source.healthScore
        );

    const normalizedScore =
        source.score !== undefined
            ? toNumber(
                source.score
            )
            : legacyHealthScore;

    const report =
        normalizeReport(
            {
                ...source,
                score:
                    normalizedScore
            },
            {
                type:
                    "executive_report",
                score:
                    legacyHealthScore
            }
        );

    return {
        ...report,

        score:
            normalizedScore,

        healthScore:
            normalizedScore,

        risks:
            toArray(
                source.risks
            ),

        infrastructure:
            safeObject(
                source.infrastructure
            )
    };
}

function normalizeSecurityReport(
    security = {}
) {
    const source =
        safeObject(
            security
        );

    const report =
        normalizeReport(
            source,
            {
                type:
                    "security_final_report"
            }
        );

    const scan =
        safeObject(
            source.scan
        );

    const routes =
        safeObject(
            source.routes
        );

    const config =
        safeObject(
            source.config
        );

    return {
        ...report,

        scan: {
            ...scan,

            summary:
                safeObject(
                    scan.summary
                ),

            findings:
                toArray(
                    scan.findings
                ),

            recommendations:
                toArray(
                    scan.recommendations
                )
        },

        routes: {
            ...routes,

            summary:
                safeObject(
                    routes.summary
                ),

            riskyRoutes:
                toArray(
                    routes.riskyRoutes
                ),

            recommendations:
                toArray(
                    routes.recommendations
                )
        },

        config: {
            ...config,

            summary:
                safeObject(
                    config.summary
                ),

            checklist:
                toArray(
                    config.checklist
                ),

            recommendations:
                toArray(
                    config.recommendations
                )
        }
    };
}

function normalizePerformanceReport(
    performance = {}
) {
    const source =
        safeObject(
            performance
        );

    const report =
        normalizeReport(
            source,
            {
                type:
                    "performance_final_report"
            }
        );

    const scan =
        safeObject(
            source.scan
        );

    return {
        ...report,

        scan: {
            ...scan,

            summary:
                safeObject(
                    scan.summary
                ),

            findings:
                toArray(
                    scan.findings
                ),

            blockers:
                toArray(
                    scan.blockers
                ),

            warnings:
                toArray(
                    scan.warnings
                ),

            recommendations:
                toArray(
                    scan.recommendations
                ),

            nextSteps:
                toArray(
                    scan.nextSteps
                )
        },

        productionSummary:
            safeObject(
                source.productionSummary
            ),

        technicalDebtSummary:
            safeObject(
                source.technicalDebtSummary
            )
    };
}

function normalizeRefactoringReport(
    refactoring = {}
) {
    const source =
        safeObject(
            refactoring
        );

    const report =
        normalizeReport(
            source,
            {
                type:
                    "refactoring_advisor_report"
            }
        );

    const summary =
        safeObject(
            report.summary
        );

    const strategy =
        safeObject(
            source.refactoringStrategy
        );

    return {
        ...report,

        summary: {
            scannedFiles:
                toNumber(
                    summary.scannedFiles
                ),

            scannedModules:
                toNumber(
                    summary.scannedModules
                ),

            totalCandidates:
                toNumber(
                    summary.totalCandidates
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

            files:
                toNumber(
                    summary.files
                ),

            modules:
                toNumber(
                    summary.modules
                ),

            routes:
                toNumber(
                    summary.routes
                ),

            systems:
                toNumber(
                    summary.systems
                ),

            confirmedByMultipleSources:
                toNumber(
                    summary
                        .confirmedByMultipleSources
                ),

            estimatedHours:
                toNumber(
                    summary.estimatedHours
                )
        },

        candidates:
            toArray(
                source.candidates
            ),

        immediateActions:
            toArray(
                source.immediateActions
            ),

        refactoringStrategy: {
            phase:
                strategy.phase
                || "unknown",

            strategy:
                strategy.strategy
                || "Estratégia não disponível."
        }
    };
}

function normalizeReleaseReport(
    release = {}
) {
    const source =
        safeObject(
            release
        );

    const report =
        normalizeReport(
            source,
            {
                type:
                    "release_advisor_report"
            }
        );

    const decision =
        safeObject(
            source.decision
        );

    return {
        ...report,

        currentStage:
            source.currentStage
            || "unknown",

        readiness:
            safeObject(
                source.readiness
            ),

        decision: {
            nextRecommendedPhase:
                decision
                    .nextRecommendedPhase
                || "review_required",

            postgresCompleted:
                Boolean(
                    decision
                        .postgresCompleted
                ),

            canStartPostgreSQL:
                Boolean(
                    decision
                        .canStartPostgreSQL
                ),

            canStartRedisBullMQ:
                Boolean(
                    decision
                        .canStartRedisBullMQ
                ),

            canStartDocker:
                Boolean(
                    decision
                        .canStartDocker
                ),

            canStartVps:
                Boolean(
                    decision
                        .canStartVps
                ),

            canPlanLovable:
                Boolean(
                    decision
                        .canPlanLovable
                ),

            canStartLovable:
                Boolean(
                    decision
                        .canStartLovable
                ),

            shouldRefactorBeforeNextPhase:
                Boolean(
                    decision
                        .shouldRefactorBeforeNextPhase
                ),

            shouldFixSecurityBeforeVps:
                Boolean(
                    decision
                        .shouldFixSecurityBeforeVps
                ),

            shouldFixPerformanceBeforeScale:
                Boolean(
                    decision
                        .shouldFixPerformanceBeforeScale
                ),

            reason:
                decision.reason
                || "Decisão ainda não disponível."
        }
    };
}

function normalizeModuleHealthReport(
    moduleHealth = {}
) {
    const source =
        safeObject(
            moduleHealth
        );

    const report =
        normalizeReport(
            source,
            {
                type:
                    "module_health_report"
            }
        );

    const summary =
        safeObject(
            report.summary
        );

    return {
        ...report,

        summary: {
            totalModules:
                toNumber(
                    summary.totalModules
                ),

            criticalRisk:
                toNumber(
                    summary.criticalRisk
                ),

            highRisk:
                toNumber(
                    summary.highRisk
                ),

            mediumRisk:
                toNumber(
                    summary.mediumRisk
                ),

            lowRisk:
                toNumber(
                    summary.lowRisk
                ),

            healthy:
                toNumber(
                    summary.healthy
                ),

            totalFiles:
                toNumber(
                    summary.totalFiles
                ),

            totalLines:
                toNumber(
                    summary.totalLines
                ),

            totalImports:
                toNumber(
                    summary.totalImports
                ),

            largeFiles:
                toNumber(
                    summary.largeFiles
                ),

            veryLargeFiles:
                toNumber(
                    summary.veryLargeFiles
                ),

            highlyCoupledFiles:
                toNumber(
                    summary.highlyCoupledFiles
                )
        },

        scannerSummary:
            safeObject(
                source.scannerSummary
            ),

        modules:
            toArray(
                source.modules
            ),

        suggestions:
            toArray(
                source.suggestions
            )
    };
}

function normalizeRoadmapReport(
    roadmap = {}
) {
    const source =
        safeObject(
            roadmap
        );

    const report =
        normalizeReport(
            source,
            {
                type:
                    "roadmap_analysis"
            }
        );

    const summary =
        safeObject(
            report.summary
        );

    return {
        ...report,

        progress:
            toNumber(
                source.progress
                ?? summary.progress
            ),

        completed:
            toNumber(
                source.completed
                ?? summary.completed
            ),

        inProgress:
            toNumber(
                source.inProgress
                ?? summary.inProgress
            ),

        pending:
            toNumber(
                source.pending
                ?? summary.pending
            ),

        blocked:
            toNumber(
                source.blocked
                ?? summary.blocked
            ),

        manualValidation:
            toNumber(
                source.manualValidation
                ?? summary.manualValidation
            ),

        summary: {
            total:
                toNumber(
                    summary.total
                ),

            completed:
                toNumber(
                    summary.completed
                ),

            inProgress:
                toNumber(
                    summary.inProgress
                ),

            pending:
                toNumber(
                    summary.pending
                ),

            blocked:
                toNumber(
                    summary.blocked
                ),

            manualValidation:
                toNumber(
                    summary.manualValidation
                ),

            progress:
                toNumber(
                    summary.progress
                    ?? source.progress
                ),

            scannedFiles:
                toNumber(
                    summary.scannedFiles
                ),

            scannedModules:
                toNumber(
                    summary.scannedModules
                )
        },

        currentStep:
            source.currentStep
            || null,

        nextStep:
            source.nextStep
            || null,

        roadmap:
            toArray(
                source.roadmap
            ),

        projectContext:
            safeObject(
                source.projectContext
            )
    };
}

function normalizeScannerSummary(
    scanner = {}
) {
    const source =
        safeObject(
            scanner
        );

    return {
        totalFiles:
            toNumber(
                source.totalFiles
            ),

        totalModules:
            toNumber(
                source.totalModules
            ),

        totalLines:
            toNumber(
                source.totalLines
            ),

        modules:
            toArray(
                source.modules
            ),

        byType:
            safeObject(
                source.byType
            ),

        byModule:
            safeObject(
                source.byModule
            )
    };
}

function normalizeInfrastructureContext(
    infrastructure = {}
) {
    const source =
        safeObject(
            infrastructure
        );

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

function findRoadmapStep(
    roadmap,
    key
) {
    return toArray(
        roadmap
    ).find(
        (step) =>
            safeObject(step).key
            === key
    ) || null;
}

function prefixItems(
    items,
    prefix,
    ignoreNoBlockerMessages = false
) {
    return toArray(items)
        .filter((item) => {
            if (
                !ignoreNoBlockerMessages
            ) {
                return true;
            }

            return !isNoBlockerMessage(
                item
            );
        })
        .map(
            (item) =>
                `${prefix}: ${
                    formatReportItem(item)
                }`
        )
        .filter(
            (item) =>
                !isEmptyPrefixedItem(
                    item,
                    prefix
                )
        );
}

function isNoBlockerMessage(
    item
) {
    const value =
        formatReportItem(item)
            .toLowerCase();

    return (
        value.includes(
            "nenhum blocker"
        )
        || value.includes(
            "nenhum bloqueio"
        )
        || value.includes(
            "sem blocker"
        )
        || value.includes(
            "no blocker"
        )
    );
}

function isEmptyPrefixedItem(
    item,
    prefix
) {
    const normalized =
        String(item || "")
            .trim();

    return (
        normalized === `${prefix}:`
        || normalized === `${prefix}: {}`
        || normalized === `${prefix}: []`
    );
}