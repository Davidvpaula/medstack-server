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

export async function getReleaseAdvisorReport() {
    const [
        productionResult,
        performanceResult,
        refactoringResult,
        infrastructureResult
    ] = await Promise.all([
        getProductionReadinessReport(),
        getPerformanceFinalReport(),
        getRefactoringAdvisorReport(),
        getInfrastructureContext()
    ]);

    const securityResult =
        getSecurityFinalReport();

    const roadmapResult =
        getRoadmapAnalysis();

    const scannerResult =
        getScannerSummary();

    const production =
        normalizeProduction(
            productionResult
        );

    const security =
        normalizeSecurity(
            securityResult
        );

    const performance =
        normalizePerformance(
            performanceResult
        );

    const refactoring =
        normalizeRefactoring(
            refactoringResult
        );

    const roadmap =
        normalizeRoadmap(
            roadmapResult
        );

    const scanner =
        normalizeScanner(
            scannerResult
        );

    const infrastructure =
        normalizeInfrastructure(
            infrastructureResult
        );

    const score =
        calculateReleaseScore({
            production,
            security,
            performance,
            refactoring,
            scanner,
            infrastructure
        });

    const blockers =
        getReleaseBlockers({
            production,
            security,
            performance,
            refactoring,
            infrastructure
        });

    const warnings =
        getReleaseWarnings({
            production,
            security,
            performance,
            refactoring,
            infrastructure
        });

    const decision =
        buildReleaseDecision({
            score,
            blockers,
            production,
            security,
            performance,
            refactoring,
            roadmap,
            infrastructure
        });

    const nextSteps =
        getReleaseNextSteps({
            decision,
            infrastructure,
            security,
            performance,
            refactoring
        });

    const recommendations =
        getReleaseRecommendations({
            score,
            decision,
            security,
            performance,
            refactoring,
            infrastructure
        });

    const readiness = {
        production: {
            score:
                production.score,

            status:
                production.status,

            blockers:
                production.blockers.length,

            warnings:
                production.warnings.length
        },

        security: {
            score:
                security.score,

            status:
                security.status,

            blockers:
                security.blockers.length,

            warnings:
                security.warnings.length
        },

        performance: {
            score:
                performance.score,

            status:
                performance.status,

            blockers:
                performance.blockers.length,

            warnings:
                performance.warnings.length
        },

        refactoring: {
            candidates:
                refactoring
                    .summary
                    .totalCandidates,

            critical:
                refactoring
                    .summary
                    .critical,

            high:
                refactoring
                    .summary
                    .high,

            medium:
                refactoring
                    .summary
                    .medium,

            low:
                refactoring
                    .summary
                    .low,

            estimatedHours:
                refactoring
                    .summary
                    .estimatedHours
        },

        scanner: {
            files:
                scanner.totalFiles,

            modules:
                scanner.totalModules,

            lines:
                scanner.totalLines
        },

        infrastructure: {
            diagnosticsStatus:
                infrastructure
                    .diagnosticsStatus,

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

            migrationsPending:
                infrastructure
                    .migrations
                    .pending,

            repositoriesReady:
                infrastructure
                    .repositories
                    .ready,

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
                    .ready
        }
    };

    const summary = {
        productionScore:
            production.score,

        securityScore:
            security.score,

        performanceScore:
            performance.score,

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

        scannedFiles:
            scanner.totalFiles,

        scannedModules:
            scanner.totalModules,

        roadmapProgress:
            roadmap.progress,

        postgresCompleted:
            decision.postgresCompleted,

        redisBullMQReady:
            decision.canStartRedisBullMQ,

        dockerReady:
            decision.canStartDocker,

        vpsReady:
            decision.canStartVps,

        lovableReady:
            decision.canStartLovable,

        totalBlockers:
            blockers.length,

        totalWarnings:
            warnings.length
    };

    return createReport({
        type:
            "release_advisor_report",

        score,

        status:
            getReleaseStatus({
                score,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            decision,

            currentStage:
                getCurrentStage({
                    roadmap,
                    infrastructure,
                    decision
                }),

            readiness
        }
    });
}

function calculateReleaseScore({
    production,
    security,
    performance,
    refactoring,
    scanner,
    infrastructure
}) {
    const refactoringScore =
        calculateRefactoringScore(
            refactoring.summary
        );

    const infrastructureScore =
        calculateInfrastructureScore(
            infrastructure
        );

    const scannerScore =
        scanner.totalFiles > 0
            ? 100
            : 0;

    const weightedScore =
        production.score * 0.25
        + security.score * 0.20
        + performance.score * 0.20
        + refactoringScore * 0.10
        + infrastructureScore * 0.20
        + scannerScore * 0.05;

    return clampScore(
        weightedScore
    );
}

function calculateRefactoringScore(
    summary
) {
    let penalty = 0;

    penalty += Math.min(
        summary.critical * 10,
        30
    );

    penalty += Math.min(
        summary.high * 3,
        25
    );

    penalty += Math.min(
        summary.medium * 0.5,
        10
    );

    penalty += Math.min(
        summary.low * 0.1,
        5
    );

    return clampScore(
        100 - penalty
    );
}

function calculateInfrastructureScore(
    infrastructure
) {
    let score = 100;

    if (
        !infrastructure
            .postgres
            .ready
    ) {
        score -= 30;
    }

    if (
        !infrastructure
            .migrations
            .ready
    ) {
        score -= 20;
    }

    if (
        !infrastructure
            .repositories
            .ready
    ) {
        score -= 20;
    }

    if (
        !infrastructure
            .persistence
            .ready
    ) {
        score -= 20;
    }

    if (
        !infrastructure
            .whatsappPersistence
            .ready
    ) {
        score -= 5;
    }

    score -= Math.min(
        infrastructure
            .diagnosticsSummary
            .failed * 15,
        30
    );

    score -= Math.min(
        infrastructure
            .diagnosticsSummary
            .warnings * 2,
        10
    );

    return clampScore(score);
}

function getReleaseStatus({
    score,
    blockers
}) {
    if (
        blockers.length === 0
        && score >= 90
    ) {
        return "ready_for_next_phase";
    }

    if (
        blockers.length === 0
        && score >= 78
    ) {
        return "almost_ready";
    }

    if (score >= 60) {
        return "needs_cleanup";
    }

    return "not_ready";
}

function buildReleaseDecision({
    score,
    blockers,
    production,
    security,
    performance,
    refactoring,
    roadmap,
    infrastructure
}) {
    const postgresCompleted =
        infrastructure
            .postgres
            .ready
        && infrastructure
            .migrations
            .ready
        && infrastructure
            .repositories
            .ready
        && infrastructure
            .persistence
            .ready;

    const noInfrastructureFailures =
        infrastructure
            .diagnosticsSummary
            .failed === 0;

    const hasProductionBlockers =
        hasRealBlockers(
            production.blockers
        );

    const hasSecurityBlockers =
        hasRealBlockers(
            security.blockers
        );

    const hasPerformanceBlockers =
        hasRealBlockers(
            performance.blockers
        );

    const hasCriticalRefactoring =
        refactoring
            .summary
            .critical > 0;

    const hasRelevantHighRefactoring =
        refactoring
            .summary
            .high > 5;

    const canStartPostgreSQL =
        !postgresCompleted;

    const canStartRedisBullMQ =
        postgresCompleted
        && noInfrastructureFailures
        && !hasProductionBlockers;

    const canStartDocker =
        postgresCompleted
        && noInfrastructureFailures
        && canStartRedisBullMQ;

    const canStartVps =
        canStartDocker
        && !hasSecurityBlockers
        && !hasPerformanceBlockers
        && !hasCriticalRefactoring
        && security.score >= 75
        && performance.score >= 65
        && score >= 75;

    /*
     * O Lovable fica por último.
     * Pode ser planejado antes, mas não é considerado
     * liberado para integração final até a base estar
     * pronta para VPS.
     */
    const canStartLovable =
        canStartVps
        && security.score >= 75
        && production.score >= 75;

    const nextRecommendedPhase =
        getNextRecommendedPhase({
            postgresCompleted,
            canStartRedisBullMQ,
            canStartDocker,
            canStartVps,
            canStartLovable,
            roadmap
        });

    return {
        nextRecommendedPhase,

        postgresCompleted,

        canStartPostgreSQL,

        canStartRedisBullMQ,

        canStartDocker,

        canStartVps,

        canStartLovable,

        canPlanLovable:
            postgresCompleted,

        shouldRefactorBeforeNextPhase:
            hasCriticalRefactoring
            || hasRelevantHighRefactoring,

        shouldFixSecurityBeforeVps:
            hasSecurityBlockers
            || security.score < 75,

        shouldFixPerformanceBeforeScale:
            hasPerformanceBlockers
            || performance.score < 65,

        hasProductionBlockers,

        hasSecurityBlockers,

        hasPerformanceBlockers,

        hasCriticalRefactoring,

        noInfrastructureFailures,

        totalBlockers:
            blockers.length,

        reason:
            getDecisionReason({
                score,
                postgresCompleted,
                nextRecommendedPhase,
                hasProductionBlockers,
                hasSecurityBlockers,
                hasPerformanceBlockers,
                hasCriticalRefactoring,
                hasRelevantHighRefactoring,
                noInfrastructureFailures
            })
    };
}

function getNextRecommendedPhase({
    postgresCompleted,
    canStartRedisBullMQ,
    canStartDocker,
    canStartVps,
    canStartLovable,
    roadmap
}) {
    if (!postgresCompleted) {
        return "complete_postgresql";
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
        roadmap.nextStep?.module
        || "technical_cleanup"
    );
}

function getDecisionReason({
    score,
    postgresCompleted,
    nextRecommendedPhase,
    hasProductionBlockers,
    hasSecurityBlockers,
    hasPerformanceBlockers,
    hasCriticalRefactoring,
    hasRelevantHighRefactoring,
    noInfrastructureFailures
}) {
    if (!postgresCompleted) {
        return (
            "A fase PostgreSQL ainda precisa ser "
            + "concluída e validada mecanicamente."
        );
    }

    if (!noInfrastructureFailures) {
        return (
            "O diagnóstico de infraestrutura "
            + "encontrou falhas críticas."
        );
    }

    if (hasProductionBlockers) {
        return (
            "Existem blockers de produção que "
            + "precisam ser corrigidos antes da "
            + "infraestrutura pública."
        );
    }

    if (
        nextRecommendedPhase
        === "redis_bullmq"
    ) {
        return (
            "PostgreSQL está operacional. "
            + "A próxima fase recomendada é "
            + "Redis/BullMQ, seguida de Docker."
        );
    }

    if (hasSecurityBlockers) {
        return (
            "Existem blockers de segurança. "
            + "Redis e Docker podem ser preparados, "
            + "mas a VPS pública deve aguardar."
        );
    }

    if (hasPerformanceBlockers) {
        return (
            "Existem blockers de performance. "
            + "Corrigir antes da escala e da VPS."
        );
    }

    if (hasCriticalRefactoring) {
        return (
            "Existem refatorações críticas. "
            + "Corrigir antes da produção pública."
        );
    }

    if (hasRelevantHighRefactoring) {
        return (
            "Existem várias refatorações de alta "
            + "prioridade. Executar limpeza gradual."
        );
    }

    if (score >= 90) {
        return (
            "Backend saudável para avançar "
            + "para a próxima fase."
        );
    }

    if (score >= 78) {
        return (
            "Backend quase pronto. Pode avançar "
            + "com cautela e monitoramento."
        );
    }

    return (
        "A infraestrutura principal está funcional, "
        + "mas ainda existem pontos de limpeza antes "
        + "da VPS pública."
    );
}

function getCurrentStage({
    roadmap,
    infrastructure,
    decision
}) {
    if (
        decision.canStartLovable
    ) {
        return "frontend_preparation";
    }

    if (
        decision.canStartVps
    ) {
        return "vps_preparation";
    }

    if (
        decision.canStartDocker
        && !decision.canStartVps
    ) {
        return "docker_preparation";
    }

    if (
        decision.canStartRedisBullMQ
    ) {
        return "redis_bullmq_preparation";
    }

    if (
        infrastructure
            .persistence
            .ready
    ) {
        return "postgresql_validation";
    }

    if (roadmap.progress >= 60) {
        return "infrastructure_preparation";
    }

    if (roadmap.progress >= 40) {
        return "backend_intelligence";
    }

    return "foundation";
}

function getReleaseBlockers({
    production,
    security,
    performance,
    refactoring,
    infrastructure
}) {
    const blockers = [];

    for (
        const item
        of production.blockers
    ) {
        if (!isNoBlockerMessage(item)) {
            blockers.push(
                `Production: ${
                    formatReportItem(item)
                }`
            );
        }
    }

    for (
        const item
        of security.blockers
    ) {
        if (!isNoBlockerMessage(item)) {
            blockers.push(
                `Security: ${
                    formatReportItem(item)
                }`
            );
        }
    }

    for (
        const item
        of performance.blockers
    ) {
        if (!isNoBlockerMessage(item)) {
            blockers.push(
                `Performance: ${
                    formatReportItem(item)
                }`
            );
        }
    }

    if (
        refactoring
            .summary
            .critical > 0
    ) {
        blockers.push(
            "Refactoring: existem candidatos críticos."
        );
    }

    if (
        !infrastructure
            .postgres
            .ready
    ) {
        blockers.push(
            "Infrastructure: PostgreSQL não está pronto."
        );
    }

    if (
        !infrastructure
            .migrations
            .ready
    ) {
        blockers.push(
            "Infrastructure: existem migrations pendentes."
        );
    }

    if (
        !infrastructure
            .repositories
            .ready
    ) {
        blockers.push(
            "Infrastructure: repositories PostgreSQL não estão prontos."
        );
    }

    if (
        !infrastructure
            .persistence
            .ready
    ) {
        blockers.push(
            "Infrastructure: persistência real ainda não foi validada."
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
            } falha(s) crítica(s) no diagnóstico.`
        );
    }

    return uniqueStrings(
        blockers
    );
}

function getReleaseWarnings({
    production,
    security,
    performance,
    refactoring,
    infrastructure
}) {
    const warnings = [];

    if (
        production.warnings.length > 0
    ) {
        warnings.push(
            `${production.warnings.length} warning(s) de produção.`
        );
    }

    if (security.score < 85) {
        warnings.push(
            `Score de segurança abaixo do ideal: ${security.score}%.`
        );
    }

    if (performance.score < 85) {
        warnings.push(
            `Score de performance abaixo do ideal: ${performance.score}%.`
        );
    }

    if (
        refactoring
            .summary
            .critical > 0
    ) {
        warnings.push(
            `${refactoring.summary.critical} candidato(s) crítico(s) de refatoração.`
        );
    }

    if (
        refactoring
            .summary
            .high > 0
    ) {
        warnings.push(
            `${refactoring.summary.high} candidato(s) alto(s) de refatoração.`
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
            } warning(s) de infraestrutura.`
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

function getReleaseNextSteps({
    decision,
    infrastructure,
    security,
    performance,
    refactoring
}) {
    const steps = [];

    if (
        !decision.postgresCompleted
    ) {
        steps.push(
            "Concluir e validar mecanicamente a fase PostgreSQL."
        );

        if (
            !infrastructure
                .postgres
                .ready
        ) {
            steps.push(
                "Corrigir a conexão PostgreSQL."
            );
        }

        if (
            !infrastructure
                .migrations
                .ready
        ) {
            steps.push(
                "Executar migrations pendentes."
            );
        }

        if (
            !infrastructure
                .repositories
                .ready
        ) {
            steps.push(
                "Validar repositories PostgreSQL."
            );
        }

        return uniqueStrings(
            steps
        );
    }

    steps.push(
        "Executar o teste mecânico completo do PostgreSQL."
    );

    if (
        decision
            .nextRecommendedPhase
        === "redis_bullmq"
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
        decision
            .shouldFixSecurityBeforeVps
    ) {
        steps.push(
            "Corrigir os principais riscos de segurança antes da VPS."
        );
    }

    if (
        decision
            .shouldFixPerformanceBeforeScale
    ) {
        steps.push(
            "Corrigir os principais riscos de performance antes da escala."
        );
    }

    if (
        refactoring
            .summary
            .critical > 0
    ) {
        steps.push(
            "Executar as refatorações críticas antes da produção pública."
        );
    }

    if (
        security.score >= 75
        && performance.score >= 65
    ) {
        steps.push(
            "Preparar containerização da API com Docker."
        );
    }

    steps.push(
        "Executar teste mecânico geral após cada mudança estrutural."
    );

    return uniqueStrings(
        steps
    );
}

function getReleaseRecommendations({
    score,
    decision,
    security,
    performance,
    refactoring,
    infrastructure
}) {
    const recommendations = [];

    if (
        decision.postgresCompleted
    ) {
        recommendations.push(
            "PostgreSQL está estruturalmente operacional, mas deve passar pelo teste mecânico dedicado."
        );
    }

    if (
        decision.canStartRedisBullMQ
    ) {
        recommendations.push(
            "Redis e BullMQ são a próxima evolução recomendada."
        );
    }

    if (
        decision.canStartDocker
    ) {
        recommendations.push(
            "Docker pode ser preparado após a validação das filas."
        );
    }

    if (
        !decision.canStartVps
    ) {
        recommendations.push(
            "Não publicar a VPS até corrigir segurança, performance e blockers críticos."
        );
    }

    if (
        decision.canPlanLovable
        && !decision.canStartLovable
    ) {
        recommendations.push(
            "O frontend Lovable pode ser planejado, mas sua integração final deve aguardar Redis/BullMQ, Docker e preparação da VPS."
        );
    }

    if (security.score < 75) {
        recommendations.push(
            "Priorizar segurança antes da exposição pública."
        );
    }

    if (performance.score < 65) {
        recommendations.push(
            "Priorizar performance estrutural antes da escala."
        );
    }

    if (
        refactoring
            .summary
            .critical > 0
        || refactoring
            .summary
            .high > 5
    ) {
        recommendations.push(
            "Executar refatorações críticas e altas em pequenos pacotes controlados."
        );
    }

    if (
        infrastructure
            .diagnosticsSummary
            .warnings > 0
    ) {
        recommendations.push(
            "Revisar os warnings do diagnóstico de infraestrutura."
        );
    }

    if (score < 78) {
        recommendations.push(
            "Não considerar o backend pronto para produção pública ainda."
        );
    }

    recommendations.push(
        "Executar Scanner, Security, Performance, Refactoring e Release Advisor após mudanças grandes."
    );

    return uniqueStrings(
        recommendations
    );
}

function normalizeProduction(
    production
) {
    return normalizeReport(
        production,
        {
            type:
                "production_readiness_report"
        }
    );
}

function normalizeSecurity(
    security
) {
    return normalizeReport(
        security,
        {
            type:
                "security_final_report"
        }
    );
}

function normalizePerformance(
    performance
) {
    return normalizeReport(
        performance,
        {
            type:
                "performance_final_report"
        }
    );
}

function normalizeRefactoring(
    refactoring
) {
    const source =
        safeObject(
            refactoring
        );

    const summary =
        safeObject(
            source.summary
        );

    return {
        ...source,

        summary: {
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

            estimatedHours:
                toNumber(
                    summary.estimatedHours
                )
        },

        candidates:
            toArray(
                source.candidates
            ),

        recommendations:
            toArray(
                source.recommendations
            )
    };
}

function normalizeRoadmap(
    roadmap
) {
    const source =
        safeObject(
            roadmap
        );

    return {
        ...source,

        progress:
            toNumber(
                source.progress
            ),

        completed:
            toNumber(
                source.completed
            ),

        pending:
            toNumber(
                source.pending
            ),

        nextStep:
            source.nextStep
            || null,

        roadmap:
            toArray(
                source.roadmap
            )
    };
}

function normalizeScanner(
    scanner
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
            )
    };
}

function normalizeInfrastructure(
    infrastructure
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
                )
        },

        migrations: {
            ready:
                Boolean(
                    migrations.ready
                ),

            executed:
                toNumber(
                    migrations.executed
                ),

            pending:
                toNumber(
                    migrations.pending
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

function hasRealBlockers(
    blockers
) {
    return toArray(blockers)
        .some(
            (item) =>
                !isNoBlockerMessage(
                    item
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
            "nenhum blocker crítico"
        )
    );
}