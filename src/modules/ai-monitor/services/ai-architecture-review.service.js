import {
    getCodeInventory
} from "./ai-code-inventory.service.js";

import {
    getModuleHealthReport
} from "./ai-module-health.service.js";

import {
    clampScore,
    createReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export function getArchitectureReview() {
    const inventory =
        normalizeInventory(
            getCodeInventory()
        );

    const moduleHealthReport =
        normalizeModuleHealth(
            getModuleHealthReport()
        );

    const largeFiles =
        getLargeFiles(
            inventory.files
        );

    const highlyCoupledFiles =
        getHighlyCoupledFiles(
            inventory.files
        );

    const moduleHealth =
        moduleHealthReport
            .modules
            .map(
                mapModuleHealthForArchitecture
            );

    const summary =
        buildSummary({
            inventory,
            moduleHealthReport,
            largeFiles,
            highlyCoupledFiles
        });

    const blockers =
        buildBlockers(
            moduleHealth
        );

    const warnings =
        buildWarnings({
            moduleHealth,
            largeFiles,
            highlyCoupledFiles
        });

    const suggestions =
        generateArchitectureSuggestions({
            moduleHealth,
            largeFiles,
            highlyCoupledFiles
        });

    const recommendations =
        buildRecommendations({
            moduleHealth,
            largeFiles,
            highlyCoupledFiles
        });

    const nextSteps =
        buildNextSteps({
            moduleHealth,
            largeFiles
        });

    const score =
        calculateArchitectureScore({
            moduleHealthScore:
                moduleHealthReport.score,

            largeFiles:
                largeFiles.length,

            coupledFiles:
                highlyCoupledFiles.length,

            totalFiles:
                inventory.summary.totalFiles
        });

    return createReport({
        type:
            "architecture_review",

        score,

        status:
            getArchitectureStatus({
                score,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            moduleHealth,
            largeFiles,
            highlyCoupledFiles,
            suggestions
        }
    });
}

function mapModuleHealthForArchitecture(
    module
) {
    const source =
        safeObject(
            module
        );

    return {
        name:
            source.name
            || "unknown",

        files:
            toNumber(
                source.totalFiles
            ),

        lines:
            toNumber(
                source.totalLines
            ),

        imports:
            toNumber(
                source.totalImports
            ),

        exports:
            toNumber(
                source.totalExports
            ),

        controllers:
            toNumber(
                source.types
                    ?.controller
            ),

        services:
            toNumber(
                source.types
                    ?.service
            ),

        routes:
            toNumber(
                source.types
                    ?.route
            ),

        repositories:
            toNumber(
                source.types
                    ?.repository
            ),

        workers:
            toNumber(
                source.types
                    ?.worker
            ),

        queues:
            toNumber(
                source.types
                    ?.queue
            ),

        providers:
            toNumber(
                source.types
                    ?.provider
            ),

        largeFiles:
            toNumber(
                source.largeFiles
            ),

        veryLargeFiles:
            toNumber(
                source.veryLargeFiles
            ),

        highlyCoupledFiles:
            toNumber(
                source.highlyCoupledFiles
            ),

        riskPoints:
            toNumber(
                source.riskPoints
            ),

        risk:
            source.risk
            || "healthy",

        score:
            toNumber(
                source.score
            ),

        reasons:
            toArray(
                source.reasons
            ),

        recommendations:
            toArray(
                source.recommendations
            ),

        largestFiles:
            toArray(
                source.largestFiles
            )
    };
}

function getLargeFiles(
    files
) {
    return files
        .filter(
            (file) =>
                file.lines > 250
        )
        .map((file) => ({
            path:
                file.relativePath
                || file.path,

            module:
                file.module
                || "unknown",

            type:
                file.type
                || "unknown",

            lines:
                file.lines,

            imports:
                file.imports.length,

            exports:
                file.exports.length,

            severity:
                file.lines > 900
                    ? "critical"
                    : (
                        file.lines > 500
                            ? "high"
                            : "medium"
                    )
        }))
        .sort(
            (
                first,
                second
            ) =>
                second.lines
                - first.lines
        );
}

function getHighlyCoupledFiles(
    files
) {
    return files
        .filter(
            (file) =>
                file.imports.length > 8
        )
        .map((file) => ({
            path:
                file.relativePath
                || file.path,

            module:
                file.module
                || "unknown",

            type:
                file.type
                || "unknown",

            imports:
                file.imports.length,

            lines:
                file.lines,

            severity:
                file.imports.length > 20
                    ? "critical"
                    : (
                        file.imports.length > 14
                            ? "high"
                            : "medium"
                    )
        }))
        .sort(
            (
                first,
                second
            ) =>
                second.imports
                - first.imports
        );
}

function buildSummary({
    inventory,
    moduleHealthReport,
    largeFiles,
    highlyCoupledFiles
}) {
    const inventorySummary =
        safeObject(
            inventory.summary
        );

    const healthSummary =
        safeObject(
            moduleHealthReport.summary
        );

    return {
        totalFiles:
            toNumber(
                inventorySummary.totalFiles
            ),

        controllers:
            toNumber(
                inventorySummary.controllers
            ),

        services:
            toNumber(
                inventorySummary.services
            ),

        routes:
            toNumber(
                inventorySummary.routes
            ),

        repositories:
            toNumber(
                inventorySummary.repositories
            ),

        workers:
            toNumber(
                inventorySummary.workers
            ),

        queues:
            toNumber(
                inventorySummary.queues
            ),

        providers:
            toNumber(
                inventorySummary.providers
            ),

        modules:
            toNumber(
                inventorySummary.modules
            ),

        criticalModules:
            toNumber(
                healthSummary.criticalRisk
            ),

        highRiskModules:
            toNumber(
                healthSummary.highRisk
            ),

        mediumRiskModules:
            toNumber(
                healthSummary.mediumRisk
            ),

        lowRiskModules:
            toNumber(
                healthSummary.lowRisk
            ),

        healthyModules:
            toNumber(
                healthSummary.healthy
            ),

        largeFiles:
            largeFiles.length,

        criticalLargeFiles:
            largeFiles.filter(
                (file) =>
                    file.severity
                    === "critical"
            ).length,

        highlyCoupledFiles:
            highlyCoupledFiles.length,

        criticalCoupledFiles:
            highlyCoupledFiles.filter(
                (file) =>
                    file.severity
                    === "critical"
            ).length,

        moduleHealthScore:
            moduleHealthReport.score
    };
}

function calculateArchitectureScore({
    moduleHealthScore,
    largeFiles,
    coupledFiles,
    totalFiles
}) {
    const safeTotalFiles =
        Math.max(
            totalFiles,
            1
        );

    const largeFilePercentage =
        (
            largeFiles
            / safeTotalFiles
        ) * 100;

    const coupledFilePercentage =
        (
            coupledFiles
            / safeTotalFiles
        ) * 100;

    let penalty = 0;

    penalty += Math.min(
        largeFilePercentage * 0.25,
        12
    );

    penalty += Math.min(
        coupledFilePercentage * 0.35,
        12
    );

    const structuralScore =
        clampScore(
            100 - penalty
        );

    return clampScore(
        moduleHealthScore * 0.75
        + structuralScore * 0.25
    );
}

function getArchitectureStatus({
    score,
    blockers
}) {
    if (blockers.length > 0) {
        return "critical_architecture_risk";
    }

    if (score >= 90) {
        return "healthy";
    }

    if (score >= 75) {
        return "controlled";
    }

    if (score >= 55) {
        return "needs_attention";
    }

    return "high_architecture_risk";
}

function buildBlockers(
    modules
) {
    return modules
        .filter(
            (module) =>
                module.risk
                === "critical"
        )
        .map(
            (module) =>
                `Módulo crítico: ${module.name}`
        );
}

function buildWarnings({
    moduleHealth,
    largeFiles,
    highlyCoupledFiles
}) {
    const warnings = [];

    const highModules =
        moduleHealth.filter(
            (module) =>
                module.risk
                === "high"
        );

    if (highModules.length > 0) {
        warnings.push(
            `${highModules.length} módulo(s) de alto risco arquitetural.`
        );
    }

    if (largeFiles.length > 0) {
        warnings.push(
            `${largeFiles.length} arquivo(s) possuem mais de 250 linhas.`
        );
    }

    if (
        highlyCoupledFiles.length > 0
    ) {
        warnings.push(
            `${highlyCoupledFiles.length} arquivo(s) possuem mais de 8 imports.`
        );
    }

    return uniqueStrings(
        warnings
    );
}

function generateArchitectureSuggestions({
    moduleHealth,
    largeFiles,
    highlyCoupledFiles
}) {
    const suggestions = [];

    if (
        largeFiles.length > 0
    ) {
        suggestions.push({
            severity:
                "medium",

            title:
                "Arquivos grandes encontrados",

            description:
                `${largeFiles.length} arquivo(s) possuem mais de 250 linhas.`,

            recommendation:
                "Revisar primeiro os arquivos críticos e de alta severidade."
        });
    }

    if (
        highlyCoupledFiles.length > 0
    ) {
        suggestions.push({
            severity:
                "medium",

            title:
                "Arquivos com muitos imports",

            description:
                `${highlyCoupledFiles.length} arquivo(s) apresentam acoplamento estrutural elevado.`,

            recommendation:
                "Avaliar extração de responsabilidades e redução de dependências."
        });
    }

    const riskyModules =
        moduleHealth.filter(
            (module) =>
                module.risk
                === "critical"
                || module.risk
                    === "high"
                || module.risk
                    === "medium"
        );

    if (
        riskyModules.length > 0
    ) {
        suggestions.push({
            severity:
                riskyModules.some(
                    (module) =>
                        module.risk
                        === "critical"
                )
                    ? "critical"
                    : "high",

            title:
                "Módulos com risco arquitetural",

            description:
                `${riskyModules.length} módulo(s) precisam de atenção.`,

            recommendation:
                "Usar o Module Health como fonte oficial para priorizar a revisão."
        });
    }

    if (!suggestions.length) {
        suggestions.push({
            severity:
                "info",

            title:
                "Arquitetura saudável",

            description:
                "Nenhum risco arquitetural relevante foi encontrado.",

            recommendation:
                "Manter o padrão atual de separação por módulos."
        });
    }

    return suggestions;
}

function buildRecommendations({
    moduleHealth,
    largeFiles,
    highlyCoupledFiles
}) {
    const recommendations = [];

    if (
        moduleHealth.some(
            (module) =>
                module.risk
                === "critical"
        )
    ) {
        recommendations.push(
            "Corrigir módulos críticos antes da produção pública."
        );
    }

    if (
        moduleHealth.some(
            (module) =>
                module.risk
                === "high"
        )
    ) {
        recommendations.push(
            "Evitar novas responsabilidades nos módulos de alto risco."
        );
    }

    if (
        largeFiles.length > 0
    ) {
        recommendations.push(
            "Revisar arquivos grandes confirmados pelo Technical Debt e Refactoring Advisor."
        );
    }

    if (
        highlyCoupledFiles.length > 0
    ) {
        recommendations.push(
            "Reduzir acoplamento nos arquivos com maior quantidade de imports."
        );
    }

    recommendations.push(
        "Executar Architecture Review novamente após cada refatoração."
    );

    return uniqueStrings(
        recommendations
    );
}

function buildNextSteps({
    moduleHealth,
    largeFiles
}) {
    const steps = [];

    const firstCriticalModule =
        moduleHealth.find(
            (module) =>
                module.risk
                === "critical"
        );

    const firstHighModule =
        moduleHealth.find(
            (module) =>
                module.risk
                === "high"
        );

    if (firstCriticalModule) {
        steps.push(
            `Solicitar leitura completa do maior arquivo do módulo ${firstCriticalModule.name}.`
        );
    } else if (firstHighModule) {
        steps.push(
            `Revisar os maiores arquivos do módulo ${firstHighModule.name}.`
        );
    } else if (largeFiles.length > 0) {
        steps.push(
            `Revisar o arquivo ${largeFiles[0].path}.`
        );
    }

    steps.push(
        "Comparar resultados com Technical Debt e Refactoring Advisor."
    );

    steps.push(
        "Executar testes mecânicos após alterações estruturais."
    );

    return uniqueStrings(
        steps
    );
}

function normalizeInventory(
    inventory
) {
    const source =
        safeObject(
            inventory
        );

    return {
        ...source,

        summary:
            safeObject(
                source.summary
            ),

        modules:
            safeObject(
                source.modules
            ),

        files:
            toArray(
                source.files
            )
                .map((file) => {
                    const item =
                        safeObject(file);

                    return {
                        ...item,

                        relativePath:
                            item.relativePath
                            || item.path
                            || "",

                        module:
                            item.module
                            || "unknown",

                        type:
                            item.type
                            || "unknown",

                        lines:
                            toNumber(
                                item.lines
                            ),

                        imports:
                            toArray(
                                item.imports
                            ),

                        exports:
                            toArray(
                                item.exports
                            )
                    };
                })
    };
}

function normalizeModuleHealth(
    report
) {
    const source =
        safeObject(
            report
        );

    return {
        ...source,

        score:
            toNumber(
                source.score
            ),

        summary:
            safeObject(
                source.summary
            ),

        modules:
            toArray(
                source.modules
            )
    };
}