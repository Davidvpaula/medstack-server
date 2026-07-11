import {
    getPerformanceScanReport
} from "./ai-performance-scanner.service.js";

import {
    getProductionReadinessReport
} from "./ai-production-readiness.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    clampScore,
    createReport,
    normalizeReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export async function getPerformanceFinalReport() {
    const productionResult =
        await getProductionReadinessReport();

    const scan =
        normalizePerformanceScan(
            getPerformanceScanReport()
        );

    const production =
        normalizeProduction(
            productionResult
        );

    const technicalDebt =
        normalizeTechnicalDebt(
            getTechnicalDebtReport()
        );

    const score =
        calculatePerformanceScore({
            scan,
            production,
            technicalDebt
        });

    const blockers =
        getPerformanceBlockers({
            scan,
            production,
            technicalDebt
        });

    const warnings =
        getPerformanceWarnings({
            scan,
            production,
            technicalDebt
        });

    const recommendations =
        getFinalRecommendations({
            score,
            scan,
            production,
            technicalDebt
        });

    const nextSteps =
        getPerformanceNextSteps({
            blockers,
            scan,
            production,
            technicalDebt
        });

    const summary = {
        totalFindings:
            scan.summary.totalFindings,

        critical:
            scan.summary.critical,

        high:
            scan.summary.high,

        medium:
            scan.summary.medium,

        low:
            scan.summary.low,

        totalFiles:
            scan.summary.totalFiles,

        affectedFiles:
            scan.summary.affectedFiles,

        affectedFilePercentage:
            scan.summary
                .affectedFilePercentage,

        affectedModules:
            scan.summary.affectedModules,

        largeFiles:
            scan.summary.largeFiles,

        heavyModules:
            scan.summary.heavyModules,

        highImportFiles:
            scan.summary.highImportFiles,

        workerQueueRisks:
            scan.summary.workerQueueRisks,

        scannerScore:
            scan.score,

        productionScore:
            production.score,

        productionBlockers:
            production.blockers.length,

        productionWarnings:
            production.warnings.length,

        technicalDebtCritical:
            technicalDebt.summary.critical,

        technicalDebtHigh:
            technicalDebt.summary.high,

        technicalDebtMedium:
            technicalDebt.summary.medium,

        technicalDebtLow:
            technicalDebt.summary.low,

        technicalDebtTotal:
            technicalDebt.summary.total,

        technicalDebtEstimatedHours:
            technicalDebt
                .summary
                .estimatedHours
    };

    return createReport({
        type:
            "performance_final_report",

        score,

        status:
            getPerformanceStatus({
                score,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            scan,

            productionSummary: {
                score:
                    production.score,

                status:
                    production.status,

                warnings:
                    production.warnings.length,

                blockers:
                    production.blockers.length
            },

            technicalDebtSummary:
                technicalDebt.summary
        }
    });
}

function calculatePerformanceScore({
    scan,
    production,
    technicalDebt
}) {
    const scannerScore =
        scan.score;

    const productionScore =
        production.score;

    const debtScore =
        calculateTechnicalDebtScore(
            technicalDebt.summary
        );

    const weightedScore =
        scannerScore * 0.55
        + productionScore * 0.25
        + debtScore * 0.20;

    return clampScore(
        weightedScore
    );
}

function calculateTechnicalDebtScore(
    summary
) {
    let penalty = 0;

    penalty += Math.min(
        summary.critical * 8,
        24
    );

    penalty += Math.min(
        summary.high * 3,
        24
    );

    penalty += Math.min(
        summary.medium,
        10
    );

    penalty += Math.min(
        summary.low * 0.25,
        4
    );

    return clampScore(
        100 - penalty
    );
}

function getPerformanceStatus({
    score,
    blockers
}) {
    if (blockers.length > 0) {
        return "performance_risk";
    }

    if (score >= 90) {
        return "excellent";
    }

    if (score >= 75) {
        return "good";
    }

    if (score >= 55) {
        return "needs_attention";
    }

    return "performance_risk";
}

function getPerformanceBlockers({
    scan,
    production,
    technicalDebt
}) {
    const blockers = [];

    blockers.push(
        ...scan.blockers
    );

    if (
        production.blockers.length > 0
        && production.score < 55
    ) {
        blockers.push(
            "Existem blockers de produção com impacto direto na estabilidade."
        );
    }

    if (
        technicalDebt.summary.critical > 5
    ) {
        blockers.push(
            "Existe uma quantidade elevada de débitos técnicos críticos."
        );
    }

    return uniqueStrings(
        blockers
    );
}

function getPerformanceWarnings({
    scan,
    production,
    technicalDebt
}) {
    const warnings = [];

    warnings.push(
        ...scan.warnings
    );

    if (
        production.warnings.length > 0
    ) {
        warnings.push(
            `${production.warnings.length} warning(s) de produção podem impactar estabilidade ou performance.`
        );
    }

    if (
        technicalDebt.summary.critical > 0
    ) {
        warnings.push(
            `${technicalDebt.summary.critical} débito(s) técnico(s) crítico(s).`
        );
    }

    if (
        technicalDebt.summary.high > 0
    ) {
        warnings.push(
            `${technicalDebt.summary.high} débito(s) técnico(s) de alta prioridade.`
        );
    }

    return uniqueStrings(
        warnings
    );
}

function getFinalRecommendations({
    score,
    scan,
    production,
    technicalDebt
}) {
    const recommendations = [];

    if (score < 75) {
        recommendations.push(
            "Revisar os maiores riscos estruturais antes da produção externa."
        );
    }

    recommendations.push(
        ...scan.recommendations
    );

    if (
        technicalDebt.summary.critical > 0
        || technicalDebt.summary.high > 0
    ) {
        recommendations.push(
            "Priorizar débitos técnicos críticos e altos antes de ampliar a escala."
        );
    }

    if (
        production.score < 75
    ) {
        recommendations.push(
            "Corrigir os principais warnings de produção antes da VPS."
        );
    }

    recommendations.push(
        "Migrar filas críticas para Redis/BullMQ."
    );

    recommendations.push(
        "Separar workers do processo principal antes da escala."
    );

    recommendations.push(
        "Adicionar métricas reais de latência, memória e CPU na VPS."
    );

    return uniqueStrings(
        recommendations
    );
}

function getPerformanceNextSteps({
    blockers,
    scan,
    production,
    technicalDebt
}) {
    const steps = [];

    if (blockers.length > 0) {
        steps.push(
            "Corrigir os blockers de performance antes da escala."
        );
    }

    steps.push(
        ...scan.nextSteps
    );

    if (
        technicalDebt.summary.critical > 0
    ) {
        steps.push(
            "Revisar os débitos técnicos críticos."
        );
    }

    if (
        technicalDebt.summary.high > 0
    ) {
        steps.push(
            "Criar um pacote específico para os débitos de alta prioridade."
        );
    }

    if (
        production.score < 75
    ) {
        steps.push(
            "Melhorar a prontidão de produção antes da VPS pública."
        );
    }

    steps.push(
        "Executar novamente o relatório após as refatorações."
    );

    return uniqueStrings(
        steps
    );
}

function normalizePerformanceScan(
    scan
) {
    const report =
        normalizeReport(
            scan,
            {
                type:
                    "performance_scan_report"
            }
        );

    const summary =
        safeObject(
            report.summary
        );

    return {
        ...report,

        summary: {
            totalFindings:
                toNumber(
                    summary.totalFindings
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

            totalFiles:
                toNumber(
                    summary.totalFiles
                ),

            totalModules:
                toNumber(
                    summary.totalModules
                ),

            totalLines:
                toNumber(
                    summary.totalLines
                ),

            affectedFiles:
                toNumber(
                    summary.affectedFiles
                ),

            affectedModules:
                toNumber(
                    summary.affectedModules
                ),

            affectedFilePercentage:
                toNumber(
                    summary
                        .affectedFilePercentage
                ),

            criticalFilePercentage:
                toNumber(
                    summary
                        .criticalFilePercentage
                ),

            highFilePercentage:
                toNumber(
                    summary
                        .highFilePercentage
                ),

            largeFiles:
                toNumber(
                    summary.largeFiles
                ),

            heavyModules:
                toNumber(
                    summary.heavyModules
                ),

            highImportFiles:
                toNumber(
                    summary.highImportFiles
                ),

            workerQueueRisks:
                toNumber(
                    summary.workerQueueRisks
                )
        },

        scannerSummary:
            safeObject(
                scan.scannerSummary
            ),

        findings:
            toArray(
                scan.findings
            )
    };
}

function normalizeProduction(
    production
) {
    const report =
        normalizeReport(
            production,
            {
                type:
                    "production_readiness_report"
            }
        );

    return {
        ...report,

        passed:
            toArray(
                production?.passed
            ),

        checklist:
            toArray(
                production?.checklist
            )
    };
}

function normalizeTechnicalDebt(
    technicalDebt
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

            total:
                toNumber(
                    summary.total
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