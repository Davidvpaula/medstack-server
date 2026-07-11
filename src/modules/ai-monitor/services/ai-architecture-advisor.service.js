import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    getModuleHealthReport
} from "./ai-module-health.service.js";

import {
    getRoadmapAnalysis
} from "./ai-roadmap.service.js";

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

export function getArchitectureAdvisorReport() {
    const health =
        normalizeHealth(
            getFullHealthReview()
        );

    const architecture =
        normalizeReport(
            getArchitectureReview(),
            {
                type:
                    "architecture_review"
            }
        );

    const technicalDebt =
        normalizeTechnicalDebt(
            getTechnicalDebtReport()
        );

    const moduleHealth =
        normalizeReport(
            getModuleHealthReport(),
            {
                type:
                    "module_health_report"
            }
        );

    const roadmap =
        normalizeRoadmap(
            getRoadmapAnalysis()
        );

    const score =
        calculateAdvisorScore({
            architecture,
            technicalDebt,
            moduleHealth,
            health
        });

    const blockers =
        buildBlockers({
            architecture,
            technicalDebt,
            moduleHealth
        });

    const warnings =
        buildWarnings({
            health,
            architecture,
            technicalDebt,
            moduleHealth
        });

    const immediatePriorities =
        getImmediatePriorities({
            health,
            architecture,
            technicalDebt,
            moduleHealth,
            roadmap
        });

    const recommendations =
        buildRecommendations({
            architecture,
            technicalDebt,
            moduleHealth
        });

    const nextSteps =
        buildNextSteps({
            blockers,
            roadmap,
            architecture
        });

    const architecturalReadiness =
        buildArchitecturalReadiness({
            score,
            blockers,
            architecture,
            technicalDebt,
            moduleHealth
        });

    const summary = {
        architectureScore:
            architecture.score,

        architectureStatus:
            architecture.status,

        moduleHealthScore:
            moduleHealth.score,

        moduleHealthStatus:
            moduleHealth.status,

        technicalDebtScore:
            technicalDebt.score,

        technicalDebtStatus:
            technicalDebt.status,

        technicalDebts:
            technicalDebt
                .summary
                .total,

        highTechnicalDebts:
            technicalDebt
                .summary
                .high,

        criticalTechnicalDebts:
            technicalDebt
                .summary
                .critical,

        architectureSuggestions:
            toArray(
                architecture.suggestions
            ).length,

        criticalModules:
            toNumber(
                moduleHealth
                    .summary
                    .criticalRisk
            ),

        highRiskModules:
            toNumber(
                moduleHealth
                    .summary
                    .highRisk
            ),

        roadmapProgress:
            roadmap.progress,

        runtimeErrors:
            health.logErrors,

        runtimeWarnings:
            health.logWarnings
    };

    return createReport({
        type:
            "architecture_advisor_report",

        score,

        status:
            getAdvisorStatus({
                score,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            currentStage:
                getCurrentStage({
                    roadmap,
                    architecture,
                    moduleHealth
                }),

            globalAssessment:
                getGlobalAssessment({
                    score,
                    blockers
                }),

            immediatePriorities,

            canMoveForward:
                architecturalReadiness,

            productionOpinion:
                getProductionOpinion(
                    architecturalReadiness
                ),

            scalingOpinion:
                getScalingOpinion({
                    technicalDebt,
                    moduleHealth
                }),

            recommendedNextModule:
                getRecommendedNextModule(
                    roadmap
                )
        }
    });
}

function calculateAdvisorScore({
    architecture,
    technicalDebt,
    moduleHealth,
    health
}) {
    let score =
        architecture.score * 0.40
        + moduleHealth.score * 0.35
        + technicalDebt.score * 0.20
        + 100 * 0.05;

    score -= Math.min(
        health.logErrors * 2,
        10
    );

    return clampScore(
        score
    );
}

function getAdvisorStatus({
    score,
    blockers
}) {
    if (blockers.length > 0) {
        return "architecture_blocked";
    }

    if (score >= 90) {
        return "architecture_healthy";
    }

    if (score >= 75) {
        return "architecture_controlled";
    }

    if (score >= 55) {
        return "architecture_needs_attention";
    }

    return "architecture_high_risk";
}

function buildArchitecturalReadiness({
    score,
    blockers,
    architecture,
    technicalDebt,
    moduleHealth
}) {
    const noBlockers =
        blockers.length === 0;

    const noCriticalDebt =
        toNumber(
            technicalDebt
                .summary
                .critical
        ) === 0;

    const noCriticalModules =
        toNumber(
            moduleHealth
                .summary
                .criticalRisk
        ) === 0;

    const betaAssisted =
        score >= 75
        && noBlockers
        && noCriticalDebt
        && noCriticalModules;

    const productionSmallScale =
        score >= 85
        && noBlockers
        && architecture.score >= 80;

    const productionLargeScale =
        score >= 92
        && noBlockers
        && technicalDebt.score >= 85
        && moduleHealth.score >= 85;

    return {
        betaAssisted,

        productionSmallScale,

        productionLargeScale,

        reason:
            getReadinessReason({
                betaAssisted,
                productionSmallScale,
                productionLargeScale,
                blockers
            })
    };
}

function getReadinessReason({
    betaAssisted,
    productionSmallScale,
    productionLargeScale,
    blockers
}) {
    if (blockers.length > 0) {
        return (
            "Existem blockers arquiteturais "
            + "que precisam ser corrigidos."
        );
    }

    if (productionLargeScale) {
        return (
            "Arquitetura estruturalmente "
            + "saudável para preparação de escala."
        );
    }

    if (productionSmallScale) {
        return (
            "Arquitetura adequada para "
            + "produção de pequena escala."
        );
    }

    if (betaAssisted) {
        return (
            "Arquitetura adequada para "
            + "beta assistido com monitoramento."
        );
    }

    return (
        "Ainda existem riscos estruturais "
        + "que precisam de acompanhamento."
    );
}

function getCurrentStage({
    roadmap,
    architecture,
    moduleHealth
}) {
    if (
        architecture.score >= 90
        && moduleHealth.score >= 90
    ) {
        return "architecture_stabilized";
    }

    if (
        architecture.score >= 75
    ) {
        return "controlled_architecture_cleanup";
    }

    if (
        roadmap.progress >= 60
    ) {
        return "infrastructure_with_architecture_review";
    }

    if (
        roadmap.progress >= 40
    ) {
        return "backend_consolidation";
    }

    return "foundation";
}

function getGlobalAssessment({
    score,
    blockers
}) {
    if (blockers.length > 0) {
        return (
            "A arquitetura possui blockers que "
            + "devem ser corrigidos antes da "
            + "produção pública."
        );
    }

    if (score >= 90) {
        return (
            "A arquitetura está saudável e "
            + "bem controlada."
        );
    }

    if (score >= 75) {
        return (
            "A arquitetura está funcional, "
            + "mas ainda existem pontos de "
            + "limpeza controlada."
        );
    }

    if (score >= 55) {
        return (
            "A arquitetura precisa de ajustes "
            + "antes da escala."
        );
    }

    return (
        "A arquitetura apresenta risco elevado "
        + "e não deve ser exposta publicamente."
    );
}

function getImmediatePriorities({
    health,
    architecture,
    technicalDebt,
    moduleHealth,
    roadmap
}) {
    const priorities = [];

    if (
        architecture.blockers.length > 0
    ) {
        priorities.push({
            priority:
                "critical",

            title:
                "Corrigir blockers arquiteturais",

            reason:
                "Existem módulos ou arquivos classificados como críticos.",

            action:
                "Ler os arquivos-fonte antes de iniciar qualquer divisão."
        });
    }

    if (
        toNumber(
            technicalDebt
                .summary
                .critical
        ) > 0
    ) {
        priorities.push({
            priority:
                "critical",

            title:
                "Reduzir débito técnico crítico",

            reason:
                "Débitos críticos podem impedir evolução segura.",

            action:
                "Selecionar um único débito crítico e corrigi-lo com teste mecânico."
        });
    }

    if (
        toNumber(
            moduleHealth
                .summary
                .highRisk
        ) > 0
    ) {
        priorities.push({
            priority:
                "high",

            title:
                "Revisar módulos de alto risco",

            reason:
                "Esses módulos concentram linhas, imports ou responsabilidades.",

            action:
                "Revisar os maiores arquivos antes de adicionar novas funcionalidades."
        });
    }

    if (health.logErrors > 0) {
        priorities.push({
            priority:
                "high",

            title:
                "Revisar erros recentes",

            reason:
                "Existem erros recentes no runtime.",

            action:
                "Analisar os logs antes de alterações estruturais."
        });
    }

    if (roadmap.nextStep) {
        priorities.push({
            priority:
                "medium",

            title:
                `Próxima etapa: ${roadmap.nextStep.module}`,

            reason:
                "Essa é a próxima etapa declarada pelo roadmap atual.",

            action:
                `Validar a arquitetura antes de avançar para ${roadmap.nextStep.module}.`
        });
    }

    if (!priorities.length) {
        priorities.push({
            priority:
                "info",

            title:
                "Manter evolução planejada",

            reason:
                "Nenhum risco arquitetural imediato foi encontrado.",

            action:
                "Continuar monitorando crescimento e acoplamento."
        });
    }

    return priorities;
}

function getProductionOpinion(
    readiness
) {
    if (
        readiness
            .productionLargeScale
    ) {
        return (
            "A arquitetura está preparada para "
            + "iniciar planejamento de escala, "
            + "mas ainda depende de segurança, "
            + "infraestrutura e testes funcionais."
        );
    }

    if (
        readiness
            .productionSmallScale
    ) {
        return (
            "A arquitetura suporta produção de "
            + "pequena escala com monitoramento."
        );
    }

    if (
        readiness
            .betaAssisted
    ) {
        return (
            "A arquitetura suporta beta assistido, "
            + "desde que os outros relatórios também "
            + "estejam aprovados."
        );
    }

    return (
        "A arquitetura ainda precisa de ajustes "
        + "antes da produção."
    );
}

function getScalingOpinion({
    technicalDebt,
    moduleHealth
}) {
    const criticalDebts =
        toNumber(
            technicalDebt
                .summary
                .critical
        );

    const highDebts =
        toNumber(
            technicalDebt
                .summary
                .high
        );

    const criticalModules =
        toNumber(
            moduleHealth
                .summary
                .criticalRisk
        );

    const highModules =
        toNumber(
            moduleHealth
                .summary
                .highRisk
        );

    if (
        criticalDebts > 0
        || criticalModules > 0
    ) {
        return (
            "Antes da escala, corrigir débitos "
            + "e módulos críticos."
        );
    }

    if (
        highDebts > 0
        || highModules > 0
    ) {
        return (
            "Redis/BullMQ e Docker podem evoluir, "
            + "mas os riscos altos devem ser "
            + "reduzidos antes da VPS pública."
        );
    }

    return (
        "A arquitetura está controlada para "
        + "continuar a evolução de infraestrutura."
    );
}

function getRecommendedNextModule(
    roadmap
) {
    if (!roadmap.nextStep) {
        return {
            module:
                null,

            priority:
                null,

            reason:
                "Roadmap concluído."
        };
    }

    return {
        module:
            roadmap
                .nextStep
                .module,

        priority:
            roadmap
                .nextStep
                .priority,

        reason:
            "Próxima etapa pendente conforme o roadmap atual."
    };
}

function buildBlockers({
    architecture,
    technicalDebt,
    moduleHealth
}) {
    const blockers = [];

    blockers.push(
        ...architecture.blockers.map(
            (item) =>
                `Architecture: ${
                    formatReportItem(item)
                }`
        )
    );

    blockers.push(
        ...technicalDebt.blockers.map(
            (item) =>
                `Technical Debt: ${
                    formatReportItem(item)
                }`
        )
    );

    blockers.push(
        ...moduleHealth.blockers.map(
            (item) =>
                `Module Health: ${
                    formatReportItem(item)
                }`
        )
    );

    return uniqueStrings(
        blockers
    );
}

function buildWarnings({
    health,
    architecture,
    technicalDebt,
    moduleHealth
}) {
    const warnings = [];

    warnings.push(
        ...architecture.warnings
    );

    warnings.push(
        ...technicalDebt.warnings
    );

    warnings.push(
        ...moduleHealth.warnings
    );

    if (health.logErrors > 0) {
        warnings.push(
            `${health.logErrors} erro(s) recente(s) nos logs.`
        );
    }

    if (health.logWarnings > 0) {
        warnings.push(
            `${health.logWarnings} warning(s) recente(s) nos logs.`
        );
    }

    return uniqueStrings(
        warnings
    );
}

function buildRecommendations({
    architecture,
    technicalDebt,
    moduleHealth
}) {
    return uniqueStrings([
        ...architecture.recommendations,
        ...technicalDebt.recommendations,
        ...moduleHealth.recommendations,

        "Realizar alterações estruturais em pequenos pacotes.",

        "Executar testes mecânicos após cada refatoração."
    ]);
}

function buildNextSteps({
    blockers,
    roadmap,
    architecture
}) {
    const steps = [];

    if (blockers.length > 0) {
        steps.push(
            "Corrigir o primeiro blocker arquitetural."
        );
    }

    steps.push(
        ...architecture.nextSteps
    );

    if (roadmap.nextStep) {
        steps.push(
            `Validar arquitetura antes de iniciar ${roadmap.nextStep.module}.`
        );
    }

    return uniqueStrings(
        steps
    );
}

function normalizeHealth(
    health
) {
    const source =
        safeObject(
            health
        );

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

    const logs =
        safeObject(
            source.logs
        );

    const logSummary =
        safeObject(
            logs.summary
        );

    return {
        whatsappConnected:
            Boolean(
                runtimeStatus.connected
            ),

        logErrors:
            toNumber(
                logSummary.errors
            ),

        logWarnings:
            toNumber(
                logSummary.warnings
            )
    };
}

function normalizeTechnicalDebt(
    technicalDebt
) {
    const report =
        normalizeReport(
            technicalDebt,
            {
                type:
                    "technical_debt_report"
            }
        );

    const summary =
        safeObject(
            report.summary
        );

    return {
        ...report,

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
                technicalDebt
                    ?.debts
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