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

export function getModuleHealthReport() {
    const files =
        normalizeFiles(
            listScannedFiles()
        );

    const scannerSummary =
        normalizeScannerSummary(
            getScannerSummary()
        );

    const modules =
        buildModuleHealth(
            files
        );

    const summary =
        buildSummary(
            modules
        );

    const score =
        calculateOverallScore(
            modules
        );

    const blockers =
        buildBlockers(
            modules
        );

    const warnings =
        buildWarnings(
            modules
        );

    const suggestions =
        generateModuleSuggestions(
            modules
        );

    const recommendations =
        buildRecommendations(
            modules
        );

    const nextSteps =
        buildNextSteps(
            modules
        );

    return createReport({
        type:
            "module_health_report",

        score,

        status:
            getModuleHealthStatus({
                score,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            scannerSummary,
            modules,
            suggestions
        }
    });
}

function buildModuleHealth(
    files
) {
    const grouped = {};

    for (const file of files) {
        const moduleName =
            file.module
            || "unknown";

        if (!grouped[moduleName]) {
            grouped[moduleName] = {
                name:
                    moduleName,

                files: [],

                totalLines:
                    0,

                totalImports:
                    0,

                totalExports:
                    0,

                types: {}
            };
        }

        const module =
            grouped[moduleName];

        module.files.push(
            file
        );

        module.totalLines +=
            file.lines;

        module.totalImports +=
            file.imports.length;

        module.totalExports +=
            file.exports.length;

        const type =
            file.type
            || "unknown";

        module.types[type] =
            (
                module.types[type]
                || 0
            ) + 1;
    }

    return Object.values(
        grouped
    )
        .map(
            buildModuleReport
        )
        .sort(
            compareModules
        );
}

function buildModuleReport(
    module
) {
    const metrics = {
        totalFiles:
            module.files.length,

        totalLines:
            module.totalLines,

        totalImports:
            module.totalImports,

        totalExports:
            module.totalExports,

        serviceFiles:
            toNumber(
                module.types.service
            ),

        controllerFiles:
            toNumber(
                module.types.controller
            ),

        routeFiles:
            toNumber(
                module.types.route
            ),

        repositoryFiles:
            toNumber(
                module.types.repository
            ),

        workerFiles:
            toNumber(
                module.types.worker
            ),

        queueFiles:
            toNumber(
                module.types.queue
            ),

        largeFiles:
            module.files.filter(
                (file) =>
                    file.lines > 250
            ).length,

        veryLargeFiles:
            module.files.filter(
                (file) =>
                    file.lines > 500
            ).length,

        highlyCoupledFiles:
            module.files.filter(
                (file) =>
                    file.imports.length > 14
            ).length
    };

    const riskPoints =
        calculateRiskPoints(
            metrics
        );

    const risk =
        mapRiskPointsToRisk(
            riskPoints
        );

    const score =
        calculateModuleScore(
            metrics
        );

    return {
        name:
            module.name,

        totalFiles:
            metrics.totalFiles,

        totalLines:
            metrics.totalLines,

        totalImports:
            metrics.totalImports,

        totalExports:
            metrics.totalExports,

        types: {
            ...module.types
        },

        largeFiles:
            metrics.largeFiles,

        veryLargeFiles:
            metrics.veryLargeFiles,

        highlyCoupledFiles:
            metrics.highlyCoupledFiles,

        largestFiles:
            getLargestFiles(
                module.files
            ),

        riskPoints,

        risk,

        score,

        reasons:
            getModuleRiskReasons({
                metrics,
                risk
            }),

        recommendations:
            getModuleRecommendations({
                metrics,
                risk
            })
    };
}

function calculateRiskPoints(
    metrics
) {
    let points = 0;

    if (
        metrics.totalLines > 5000
    ) {
        points += 4;
    } else if (
        metrics.totalLines > 2500
    ) {
        points += 3;
    } else if (
        metrics.totalLines > 1500
    ) {
        points += 2;
    } else if (
        metrics.totalLines > 800
    ) {
        points += 1;
    }

    if (
        metrics.totalImports > 200
    ) {
        points += 4;
    } else if (
        metrics.totalImports > 120
    ) {
        points += 3;
    } else if (
        metrics.totalImports > 70
    ) {
        points += 2;
    } else if (
        metrics.totalImports > 35
    ) {
        points += 1;
    }

    if (
        metrics.totalFiles > 60
    ) {
        points += 3;
    } else if (
        metrics.totalFiles > 40
    ) {
        points += 2;
    } else if (
        metrics.totalFiles > 25
    ) {
        points += 1;
    }

    if (
        metrics.serviceFiles > 30
    ) {
        points += 3;
    } else if (
        metrics.serviceFiles > 20
    ) {
        points += 2;
    } else if (
        metrics.serviceFiles > 12
    ) {
        points += 1;
    }

    if (
        metrics.veryLargeFiles > 8
    ) {
        points += 3;
    } else if (
        metrics.veryLargeFiles > 4
    ) {
        points += 2;
    } else if (
        metrics.veryLargeFiles > 0
    ) {
        points += 1;
    }

    if (
        metrics.highlyCoupledFiles > 8
    ) {
        points += 3;
    } else if (
        metrics.highlyCoupledFiles > 4
    ) {
        points += 2;
    } else if (
        metrics.highlyCoupledFiles > 0
    ) {
        points += 1;
    }

    return points;
}

function mapRiskPointsToRisk(
    points
) {
    if (points >= 11) {
        return "critical";
    }

    if (points >= 7) {
        return "high";
    }

    if (points >= 4) {
        return "medium";
    }

    if (points >= 1) {
        return "low";
    }

    return "healthy";
}

function calculateModuleScore(
    metrics
) {
    let penalty = 0;

    if (
        metrics.totalLines > 5000
    ) {
        penalty += 30;
    } else if (
        metrics.totalLines > 2500
    ) {
        penalty += 22;
    } else if (
        metrics.totalLines > 1500
    ) {
        penalty += 14;
    } else if (
        metrics.totalLines > 800
    ) {
        penalty += 7;
    }

    if (
        metrics.totalImports > 200
    ) {
        penalty += 25;
    } else if (
        metrics.totalImports > 120
    ) {
        penalty += 18;
    } else if (
        metrics.totalImports > 70
    ) {
        penalty += 11;
    } else if (
        metrics.totalImports > 35
    ) {
        penalty += 5;
    }

    if (
        metrics.totalFiles > 60
    ) {
        penalty += 18;
    } else if (
        metrics.totalFiles > 40
    ) {
        penalty += 12;
    } else if (
        metrics.totalFiles > 25
    ) {
        penalty += 6;
    }

    penalty += Math.min(
        metrics.veryLargeFiles * 3,
        15
    );

    penalty += Math.min(
        metrics.highlyCoupledFiles * 2,
        10
    );

    return clampScore(
        100 - penalty
    );
}

function getModuleRiskReasons({
    metrics,
    risk
}) {
    const reasons = [];

    if (
        metrics.totalLines > 1500
    ) {
        reasons.push(
            `Módulo possui ${metrics.totalLines} linhas.`
        );
    }

    if (
        metrics.totalImports > 70
    ) {
        reasons.push(
            `Módulo possui ${metrics.totalImports} imports.`
        );
    }

    if (
        metrics.totalFiles > 25
    ) {
        reasons.push(
            `Módulo possui ${metrics.totalFiles} arquivos.`
        );
    }

    if (
        metrics.serviceFiles > 20
    ) {
        reasons.push(
            `Módulo possui ${metrics.serviceFiles} services.`
        );
    }

    if (
        metrics.veryLargeFiles > 0
    ) {
        reasons.push(
            `${metrics.veryLargeFiles} arquivo(s) possuem mais de 500 linhas.`
        );
    }

    if (
        metrics.highlyCoupledFiles > 0
    ) {
        reasons.push(
            `${metrics.highlyCoupledFiles} arquivo(s) possuem mais de 14 imports.`
        );
    }

    if (!reasons.length) {
        reasons.push(
            risk === "healthy"
                ? "Nenhum risco estrutural relevante identificado."
                : "Risco estrutural leve identificado."
        );
    }

    return uniqueStrings(
        reasons
    );
}

function getModuleRecommendations({
    metrics,
    risk
}) {
    const recommendations = [];

    if (
        metrics.veryLargeFiles > 0
    ) {
        recommendations.push(
            "Revisar primeiro os maiores arquivos do módulo."
        );
    }

    if (
        metrics.highlyCoupledFiles > 0
    ) {
        recommendations.push(
            "Reduzir dependências diretas nos arquivos mais acoplados."
        );
    }

    if (
        metrics.serviceFiles > 20
    ) {
        recommendations.push(
            "Avaliar subdivisão interna da camada de services."
        );
    }

    if (
        risk === "critical"
        || risk === "high"
    ) {
        recommendations.push(
            "Evitar adicionar novas responsabilidades até concluir a revisão estrutural."
        );
    }

    if (!recommendations.length) {
        recommendations.push(
            "Manter o padrão atual e monitorar o crescimento."
        );
    }

    return uniqueStrings(
        recommendations
    );
}

function getLargestFiles(
    files
) {
    return [
        ...files
    ]
        .sort(
            (
                first,
                second
            ) =>
                second.lines
                - first.lines
        )
        .slice(
            0,
            5
        )
        .map(
            (file) => ({
                path:
                    file.path,

                type:
                    file.type,

                lines:
                    file.lines,

                imports:
                    file.imports.length,

                exports:
                    file.exports.length
            })
        );
}

function buildSummary(
    modules
) {
    return {
        totalModules:
            modules.length,

        criticalRisk:
            countRisk(
                modules,
                "critical"
            ),

        highRisk:
            countRisk(
                modules,
                "high"
            ),

        mediumRisk:
            countRisk(
                modules,
                "medium"
            ),

        lowRisk:
            countRisk(
                modules,
                "low"
            ),

        healthy:
            countRisk(
                modules,
                "healthy"
            ),

        totalFiles:
            modules.reduce(
                (
                    total,
                    module
                ) =>
                    total
                    + module.totalFiles,
                0
            ),

        totalLines:
            modules.reduce(
                (
                    total,
                    module
                ) =>
                    total
                    + module.totalLines,
                0
            ),

        totalImports:
            modules.reduce(
                (
                    total,
                    module
                ) =>
                    total
                    + module.totalImports,
                0
            ),

        largeFiles:
            modules.reduce(
                (
                    total,
                    module
                ) =>
                    total
                    + module.largeFiles,
                0
            ),

        veryLargeFiles:
            modules.reduce(
                (
                    total,
                    module
                ) =>
                    total
                    + module.veryLargeFiles,
                0
            ),

        highlyCoupledFiles:
            modules.reduce(
                (
                    total,
                    module
                ) =>
                    total
                    + module.highlyCoupledFiles,
                0
            )
    };
}

function calculateOverallScore(
    modules
) {
    if (!modules.length) {
        return 0;
    }

    const weightedTotal =
        modules.reduce(
            (
                total,
                module
            ) => {
                const weight =
                    Math.max(
                        module.totalLines,
                        1
                    );

                return (
                    total
                    + module.score
                        * weight
                );
            },
            0
        );

    const totalWeight =
        modules.reduce(
            (
                total,
                module
            ) =>
                total
                + Math.max(
                    module.totalLines,
                    1
                ),
            0
        );

    return clampScore(
        weightedTotal
        / totalWeight
    );
}

function getModuleHealthStatus({
    score,
    blockers
}) {
    if (blockers.length > 0) {
        return "critical_modules_found";
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

function buildWarnings(
    modules
) {
    const warnings = [];

    const high =
        modules.filter(
            (module) =>
                module.risk
                === "high"
        );

    const medium =
        modules.filter(
            (module) =>
                module.risk
                === "medium"
        );

    if (high.length > 0) {
        warnings.push(
            `${high.length} módulo(s) de alto risco estrutural.`
        );
    }

    if (medium.length > 0) {
        warnings.push(
            `${medium.length} módulo(s) precisam de acompanhamento.`
        );
    }

    return uniqueStrings(
        warnings
    );
}

function generateModuleSuggestions(
    modules
) {
    const suggestions = [];

    const critical =
        modules.filter(
            (module) =>
                module.risk
                === "critical"
        );

    const high =
        modules.filter(
            (module) =>
                module.risk
                === "high"
        );

    const medium =
        modules.filter(
            (module) =>
                module.risk
                === "medium"
        );

    if (critical.length > 0) {
        suggestions.push({
            severity:
                "critical",

            title:
                "Módulos críticos encontrados",

            description:
                `${critical.length} módulo(s) ultrapassaram os limites estruturais críticos.`,

            recommendation:
                "Revisar os maiores arquivos desses módulos antes da produção pública."
        });
    }

    if (high.length > 0) {
        suggestions.push({
            severity:
                "high",

            title:
                "Módulos de alto risco encontrados",

            description:
                `${high.length} módulo(s) estão grandes ou acoplados demais.`,

            recommendation:
                "Evitar novas responsabilidades e planejar divisão gradual."
        });
    }

    if (medium.length > 0) {
        suggestions.push({
            severity:
                "medium",

            title:
                "Módulos com atenção necessária",

            description:
                `${medium.length} módulo(s) precisam de acompanhamento.`,

            recommendation:
                "Monitorar crescimento e revisar os maiores arquivos."
        });
    }

    if (!modules.length) {
        suggestions.push({
            severity:
                "info",

            title:
                "Scanner vazio",

            description:
                "Nenhum módulo foi identificado.",

            recommendation:
                "Execute o scanner automático do diretório /src."
        });
    }

    if (
        modules.length > 0
        && !critical.length
        && !high.length
        && !medium.length
    ) {
        suggestions.push({
            severity:
                "info",

            title:
                "Módulos estruturalmente saudáveis",

            description:
                "Nenhum módulo com risco relevante foi encontrado.",

            recommendation:
                "Manter o padrão atual."
        });
    }

    return suggestions;
}

function buildRecommendations(
    modules
) {
    const recommendations = [];

    if (
        modules.some(
            (module) =>
                module.risk
                === "critical"
        )
    ) {
        recommendations.push(
            "Corrigir módulos críticos antes da VPS pública."
        );
    }

    if (
        modules.some(
            (module) =>
                module.risk
                === "high"
        )
    ) {
        recommendations.push(
            "Priorizar módulos de alto risco confirmados pelo Technical Debt e Refactoring Advisor."
        );
    }

    if (
        modules.some(
            (module) =>
                module.veryLargeFiles > 0
        )
    ) {
        recommendations.push(
            "Começar pelos arquivos com mais de 500 linhas."
        );
    }

    recommendations.push(
        "Executar o Module Health novamente após cada refatoração."
    );

    return uniqueStrings(
        recommendations
    );
}

function buildNextSteps(
    modules
) {
    const steps = [];

    const critical =
        modules.filter(
            (module) =>
                module.risk
                === "critical"
        );

    const high =
        modules.filter(
            (module) =>
                module.risk
                === "high"
        );

    if (critical.length > 0) {
        steps.push(
            `Solicitar leitura completa do maior arquivo do módulo ${critical[0].name}.`
        );
    } else if (high.length > 0) {
        steps.push(
            `Revisar os maiores arquivos do módulo ${high[0].name}.`
        );
    }

    steps.push(
        "Comparar Module Health, Architecture Review e Technical Debt."
    );

    steps.push(
        "Executar testes mecânicos após qualquer divisão de módulo."
    );

    return uniqueStrings(
        steps
    );
}

function normalizeFiles(
    files
) {
    return toArray(files)
        .map((file) => {
            const source =
                safeObject(
                    file
                );

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
        safeObject(
            summary
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

function countRisk(
    modules,
    risk
) {
    return modules.filter(
        (module) =>
            module.risk
            === risk
    ).length;
}

function compareModules(
    first,
    second
) {
    const riskDifference =
        getRiskWeight(
            first.risk
        )
        - getRiskWeight(
            second.risk
        );

    if (riskDifference !== 0) {
        return riskDifference;
    }

    return (
        second.totalLines
        - first.totalLines
    );
}

function getRiskWeight(
    risk
) {
    const weights = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
        healthy: 5
    };

    return (
        weights[risk]
        || 6
    );
}