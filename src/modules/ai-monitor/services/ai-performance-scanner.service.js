import {
    listScannedFiles,
    getScannerSummary
} from "./ai-code-scanner.service.js";

import {
    clampScore,
    createReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export function getPerformanceScanReport() {
    const files =
        normalizeFiles(
            listScannedFiles()
        );

    const scannerSummary =
        normalizeScannerSummary(
            getScannerSummary()
        );

    const findings = [
        ...findLargeFiles(files),
        ...findHeavyModules(files),
        ...findHighImportFiles(files),
        ...findWorkerQueueRisks(files)
    ];

    const summary =
        buildSummary({
            findings,
            files,
            scannerSummary
        });

    const score =
        calculateScannerScore(
            summary
        );

    const blockers =
        buildBlockers(
            findings
        );

    const warnings =
        buildWarnings({
            findings,
            summary
        });

    const recommendations =
        generatePerformanceRecommendations(
            findings
        );

    const nextSteps =
        buildNextSteps({
            findings,
            summary
        });

    return createReport({
        type:
            "performance_scan_report",

        score,

        status:
            getScannerStatus({
                score,
                summary,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            scannerSummary,
            findings
        }
    });
}

function findLargeFiles(files) {
    return files
        .filter(
            (file) =>
                file.lines > 250
        )
        .map((file) => {
            const severity =
                file.lines > 800
                    ? "critical"
                    : (
                        file.lines > 500
                            ? "high"
                            : "medium"
                    );

            return {
                severity,

                type:
                    "large_file",

                title:
                    "Arquivo grande",

                file:
                    file.path,

                module:
                    file.module,

                metrics: {
                    lines:
                        file.lines,

                    imports:
                        file.imports.length,

                    exports:
                        file.exports.length
                },

                description:
                    `Arquivo possui ${file.lines} linhas.`,

                recommendation:
                    "Avaliar divisão em serviços menores, helpers ou componentes especializados."
            };
        });
}

function findHeavyModules(files) {
    const grouped = {};

    for (const file of files) {
        const moduleName =
            file.module
            || "unknown";

        if (!grouped[moduleName]) {
            grouped[moduleName] = {
                module:
                    moduleName,

                files:
                    0,

                lines:
                    0,

                imports:
                    0,

                largeFiles:
                    0
            };
        }

        grouped[moduleName].files += 1;

        grouped[moduleName].lines +=
            file.lines;

        grouped[moduleName].imports +=
            file.imports.length;

        if (file.lines > 250) {
            grouped[moduleName]
                .largeFiles += 1;
        }
    }

    return Object.values(grouped)
        .filter(
            (module) =>
                module.lines > 1500
                || module.imports > 80
                || module.largeFiles > 5
        )
        .map((module) => {
            const severity =
                (
                    module.lines > 5000
                    || module.imports > 200
                    || module.largeFiles > 15
                )
                    ? "critical"
                    : (
                        module.lines > 2500
                        || module.imports > 120
                        || module.largeFiles > 8
                            ? "high"
                            : "medium"
                    );

            return {
                severity,

                type:
                    "heavy_module",

                title:
                    "Módulo pesado",

                file:
                    null,

                module:
                    module.module,

                metrics: {
                    files:
                        module.files,

                    lines:
                        module.lines,

                    imports:
                        module.imports,

                    largeFiles:
                        module.largeFiles
                },

                description:
                    `Módulo possui ${module.files} arquivos, ${module.lines} linhas, ${module.imports} imports e ${module.largeFiles} arquivos grandes.`,

                recommendation:
                    "Avaliar separação interna do módulo e impedir concentração de novas responsabilidades."
            };
        });
}

function findHighImportFiles(files) {
    return files
        .filter(
            (file) =>
                file.imports.length > 8
        )
        .map((file) => {
            const severity =
                file.imports.length > 20
                    ? "high"
                    : (
                        file.imports.length > 14
                            ? "medium"
                            : "low"
                    );

            return {
                severity,

                type:
                    "high_imports",

                title:
                    "Arquivo com muitos imports",

                file:
                    file.path,

                module:
                    file.module,

                metrics: {
                    imports:
                        file.imports.length,

                    lines:
                        file.lines
                },

                description:
                    `Arquivo possui ${file.imports.length} imports.`,

                recommendation:
                    "Avaliar extração de responsabilidades e redução de dependências diretas."
            };
        });
}

function findWorkerQueueRisks(files) {
    return files
        .filter((file) => {
            const filePath =
                normalizeText(
                    file.path
                );

            return (
                filePath.includes(
                    "worker"
                )
                || filePath.includes(
                    "queue"
                )
                || filePath.includes(
                    "dispatch"
                )
            );
        })
        .filter(
            (file) =>
                file.lines > 200
                || file.imports.length > 8
        )
        .map((file) => {
            const severity =
                (
                    file.lines > 500
                    || file.imports.length > 14
                )
                    ? "high"
                    : "medium";

            return {
                severity,

                type:
                    "worker_queue_growth",

                title:
                    "Worker ou fila crescendo",

                file:
                    file.path,

                module:
                    file.module,

                metrics: {
                    lines:
                        file.lines,

                    imports:
                        file.imports.length
                },

                description:
                    "Arquivo relacionado a worker, fila ou dispatcher apresenta crescimento estrutural.",

                recommendation:
                    "Antes da escala, migrar filas críticas para Redis/BullMQ e separar workers do processo principal."
            };
        });
}

function buildSummary({
    findings,
    files,
    scannerSummary
}) {
    const totalFiles =
        scannerSummary.totalFiles
        || files.length;

    const affectedFiles =
        new Set(
            findings
                .map(
                    (finding) =>
                        finding.file
                )
                .filter(Boolean)
        ).size;

    const affectedModules =
        new Set(
            findings
                .map(
                    (finding) =>
                        finding.module
                )
                .filter(Boolean)
        ).size;

    const critical =
        countSeverity(
            findings,
            "critical"
        );

    const high =
        countSeverity(
            findings,
            "high"
        );

    const medium =
        countSeverity(
            findings,
            "medium"
        );

    const low =
        countSeverity(
            findings,
            "low"
        );

    return {
        totalFindings:
            findings.length,

        critical,

        high,

        medium,

        low,

        totalFiles,

        totalModules:
            scannerSummary.totalModules,

        totalLines:
            scannerSummary.totalLines,

        affectedFiles,

        affectedModules,

        affectedFilePercentage:
            calculatePercentage(
                affectedFiles,
                totalFiles
            ),

        criticalFilePercentage:
            calculatePercentage(
                countUniqueFilesBySeverity(
                    findings,
                    "critical"
                ),
                totalFiles
            ),

        highFilePercentage:
            calculatePercentage(
                countUniqueFilesBySeverity(
                    findings,
                    "high"
                ),
                totalFiles
            ),

        largeFiles:
            countType(
                findings,
                "large_file"
            ),

        heavyModules:
            countType(
                findings,
                "heavy_module"
            ),

        highImportFiles:
            countType(
                findings,
                "high_imports"
            ),

        workerQueueRisks:
            countType(
                findings,
                "worker_queue_growth"
            )
    };
}

function calculateScannerScore(
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
        12
    );

    penalty += Math.min(
        summary.low * 0.25,
        4
    );

    penalty += getAffectedFilesPenalty(
        summary.affectedFilePercentage
    );

    penalty += Math.min(
        summary.heavyModules * 3,
        12
    );

    penalty += Math.min(
        summary.workerQueueRisks * 2,
        8
    );

    return clampScore(
        100 - penalty
    );
}

function getAffectedFilesPenalty(
    percentage
) {
    if (percentage >= 60) {
        return 16;
    }

    if (percentage >= 40) {
        return 12;
    }

    if (percentage >= 25) {
        return 8;
    }

    if (percentage >= 10) {
        return 4;
    }

    return 0;
}

function getScannerStatus({
    score,
    summary,
    blockers
}) {
    if (
        blockers.length > 0
        || summary.critical > 2
    ) {
        return "structural_performance_risk";
    }

    if (score >= 90) {
        return "structurally_healthy";
    }

    if (score >= 75) {
        return "minor_structural_attention";
    }

    if (score >= 55) {
        return "structural_review_required";
    }

    return "structural_performance_risk";
}

function buildBlockers(findings) {
    const criticalModules =
        findings
            .filter(
                (finding) =>
                    finding.severity
                    === "critical"
                    && finding.type
                    === "heavy_module"
            )
            .map(
                (finding) =>
                    `Módulo crítico: ${
                        finding.module
                        || "unknown"
                    }`
            );

    const criticalWorkers =
        findings
            .filter(
                (finding) =>
                    finding.severity
                    === "critical"
                    && finding.type
                    === "worker_queue_growth"
            )
            .map(
                (finding) =>
                    `Worker ou fila crítica: ${
                        finding.file
                        || "unknown"
                    }`
            );

    return uniqueStrings([
        ...criticalModules,
        ...criticalWorkers
    ]);
}

function buildWarnings({
    findings,
    summary
}) {
    const warnings = [];

    if (summary.critical > 0) {
        warnings.push(
            `${summary.critical} achado(s) crítico(s) de performance estrutural.`
        );
    }

    if (summary.high > 0) {
        warnings.push(
            `${summary.high} achado(s) de alta severidade.`
        );
    }

    if (
        summary.affectedFilePercentage
        >= 25
    ) {
        warnings.push(
            `${summary.affectedFilePercentage}% dos arquivos escaneados possuem algum achado estrutural.`
        );
    }

    if (summary.heavyModules > 0) {
        warnings.push(
            `${summary.heavyModules} módulo(s) pesado(s) identificado(s).`
        );
    }

    if (
        summary.workerQueueRisks > 0
    ) {
        warnings.push(
            `${summary.workerQueueRisks} arquivo(s) de worker, fila ou dispatcher precisam de acompanhamento.`
        );
    }

    const criticalFiles =
        findings
            .filter(
                (finding) =>
                    finding.severity
                    === "critical"
                    && finding.file
            )
            .slice(0, 5)
            .map(
                (finding) =>
                    `Arquivo crítico: ${finding.file}`
            );

    warnings.push(
        ...criticalFiles
    );

    return uniqueStrings(
        warnings
    );
}

function generatePerformanceRecommendations(
    findings
) {
    if (!findings.length) {
        return [
            "Nenhum risco estrutural relevante de performance foi encontrado.",
            "Manter monitoramento conforme o projeto crescer."
        ];
    }

    const recommendations = [];

    if (
        findings.some(
            (item) =>
                item.type
                === "large_file"
        )
    ) {
        recommendations.push(
            "Dividir primeiro os arquivos críticos ou de alta severidade."
        );
    }

    if (
        findings.some(
            (item) =>
                item.type
                === "heavy_module"
        )
    ) {
        recommendations.push(
            "Evitar novas responsabilidades nos módulos já classificados como pesados."
        );
    }

    if (
        findings.some(
            (item) =>
                item.type
                === "high_imports"
        )
    ) {
        recommendations.push(
            "Reduzir acoplamento nos arquivos com maior quantidade de imports."
        );
    }

    if (
        findings.some(
            (item) =>
                item.type
                === "worker_queue_growth"
        )
    ) {
        recommendations.push(
            "Planejar Redis/BullMQ e workers separados antes da escala."
        );
    }

    recommendations.push(
        "Adicionar métricas reais de latência e uso de recursos quando entrar em VPS."
    );

    recommendations.push(
        "Adicionar logs de duração em endpoints e workers críticos."
    );

    return uniqueStrings(
        recommendations
    );
}

function buildNextSteps({
    findings,
    summary
}) {
    const steps = [];

    if (summary.critical > 0) {
        steps.push(
            "Revisar primeiro os achados críticos."
        );
    }

    if (summary.high > 0) {
        steps.push(
            "Priorizar os achados de alta severidade com maior impacto."
        );
    }

    if (
        findings.some(
            (item) =>
                item.type
                === "worker_queue_growth"
        )
    ) {
        steps.push(
            "Validar quais filas devem ser migradas para BullMQ."
        );
    }

    steps.push(
        "Executar novamente o scanner após cada pacote de refatoração."
    );

    steps.push(
        "Comparar a quantidade de arquivos afetados entre os scans."
    );

    return uniqueStrings(
        steps
    );
}

function normalizeFiles(files) {
    return toArray(files)
        .map((file) => {
            const source =
                safeObject(file);

            return {
                ...source,

                path:
                    String(
                        source.path
                        || ""
                    ),

                module:
                    String(
                        source.module
                        || "unknown"
                    ),

                type:
                    String(
                        source.type
                        || "unknown"
                    ),

                lines:
                    toNumber(
                        source.lines
                    ),

                imports:
                    toArray(
                        source.imports
                    ),

                exports:
                    toArray(
                        source.exports
                    )
            };
        });
}

function normalizeScannerSummary(
    summary
) {
    const source =
        safeObject(summary);

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

function countSeverity(
    findings,
    severity
) {
    return findings.filter(
        (finding) =>
            finding.severity
            === severity
    ).length;
}

function countType(
    findings,
    type
) {
    return findings.filter(
        (finding) =>
            finding.type
            === type
    ).length;
}

function countUniqueFilesBySeverity(
    findings,
    severity
) {
    return new Set(
        findings
            .filter(
                (finding) =>
                    finding.severity
                    === severity
            )
            .map(
                (finding) =>
                    finding.file
            )
            .filter(Boolean)
    ).size;
}

function calculatePercentage(
    value,
    total
) {
    if (total <= 0) {
        return 0;
    }

    return Math.round(
        (
            value
            / total
        ) * 100
    );
}

function normalizeText(value) {
    return String(
        value || ""
    )
        .replaceAll(
            "\\",
            "/"
        )
        .toLowerCase();
}