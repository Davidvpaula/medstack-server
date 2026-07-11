import {
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getDependencyGraph
} from "./ai-dependency-graph.service.js";

import {
    clampScore,
    createReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export function getTechnicalDebtReport() {
    const architecture =
        normalizeArchitecture(
            getArchitectureReview()
        );

    const dependencyGraph =
        normalizeDependencyGraph(
            getDependencyGraph()
        );

    const rawDebts = [
        ...getLargeFileDebts(
            architecture
        ),

        ...getCouplingDebts(
            dependencyGraph
        ),

        ...getModuleRiskDebts(
            architecture
        )
    ];

    const debts =
        mergeTechnicalDebts(
            rawDebts
        )
            .sort(
                compareDebts
            );

    const summary =
        buildSummary(
            debts
        );

    const score =
        calculateTechnicalDebtScore(
            summary
        );

    const blockers =
        buildBlockers(
            debts
        );

    const warnings =
        buildWarnings(
            summary
        );

    const recommendations =
        generateTechnicalDebtRecommendations(
            debts
        );

    const nextSteps =
        buildNextSteps(
            debts
        );

    return createReport({
        type:
            "technical_debt_report",

        score,

        status:
            getTechnicalDebtStatus({
                score,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            debts
        }
    });
}

function getLargeFileDebts(
    architecture
) {
    return architecture
        .largeFiles
        .map((file) => {
            const lines =
                toNumber(
                    file.lines
                );

            const priority =
                lines > 900
                    ? "critical"
                    : (
                        lines > 500
                            ? "high"
                            : "medium"
                    );

            return {
                id:
                    `large-file:${file.path}`,

                consolidationKey:
                    `file:${file.path}`,

                type:
                    "large_file",

                priority,

                title:
                    "Arquivo grande",

                target:
                    file.path,

                targetType:
                    "file",

                description:
                    `O arquivo possui ${lines} linhas.`,

                impact:
                    "Arquivos grandes são mais difíceis de manter, testar e revisar.",

                recommendation:
                    "Avaliar divisão em serviços menores, helpers ou componentes especializados.",

                estimatedHours:
                    getLargeFileHours(
                        lines
                    ),

                sources: [
                    "architecture_review"
                ],

                reasons: [
                    `Arquivo com ${lines} linhas.`
                ],

                suggestedActions: [
                    "Separar responsabilidades internas."
                ],

                metadata: {
                    ...file,
                    lines
                }
            };
        });
}

function getCouplingDebts(
    dependencyGraph
) {
    return dependencyGraph
        .nodes
        .filter((node) => {
            const imports =
                toNumber(
                    node.imports
                );

            return (
                imports > 8
                || node.risk === "high"
            );
        })
        .map((node) => {
            const imports =
                toNumber(
                    node.imports
                );

            const priority =
                (
                    imports > 20
                    || node.risk
                        === "critical"
                )
                    ? "critical"
                    : (
                        imports > 12
                        || node.risk
                            === "high"
                            ? "high"
                            : "medium"
                    );

            return {
                id:
                    `coupling:${node.id}`,

                consolidationKey:
                    `file:${node.id}`,

                type:
                    "high_coupling",

                priority,

                title:
                    "Arquivo com alto acoplamento",

                target:
                    node.id,

                targetType:
                    "file",

                description:
                    `O arquivo possui ${imports} imports.`,

                impact:
                    "Muitos imports podem indicar excesso de responsabilidade ou dependências diretas demais.",

                recommendation:
                    "Avaliar extração de responsabilidades e redução das dependências diretas.",

                estimatedHours:
                    priority === "critical"
                        ? 8
                        : (
                            priority === "high"
                                ? 5
                                : 3
                        ),

                sources: [
                    "dependency_graph"
                ],

                reasons: [
                    `Arquivo com ${imports} imports.`
                ],

                suggestedActions: [
                    "Reduzir dependências diretas.",
                    "Extrair responsabilidades."
                ],

                metadata: {
                    ...node,
                    imports
                }
            };
        });
}

function getModuleRiskDebts(
    architecture
) {
    return architecture
        .moduleHealth
        .filter(
            (module) =>
                module.risk === "high"
                || module.risk === "medium"
        )
        .map((module) => {
            const priority =
                module.risk === "high"
                    ? "high"
                    : "medium";

            return {
                id:
                    `module-risk:${module.name}`,

                consolidationKey:
                    `module:${module.name}`,

                type:
                    "module_risk",

                priority,

                title:
                    "Módulo com risco arquitetural",

                target:
                    module.name,

                targetType:
                    "module",

                description:
                    `O módulo possui ${toNumber(
                        module.files
                    )} arquivos, ${toNumber(
                        module.lines
                    )} linhas e ${toNumber(
                        module.imports
                    )} imports.`,

                impact:
                    "Módulos grandes ou muito conectados tendem a concentrar bugs e dificultar evolução.",

                recommendation:
                    "Avaliar divisão interna do módulo e criação de subcamadas mais específicas.",

                estimatedHours:
                    priority === "high"
                        ? 8
                        : 4,

                sources: [
                    "architecture_review"
                ],

                reasons: [
                    `Módulo classificado como ${module.risk}.`
                ],

                suggestedActions: [
                    "Dividir responsabilidades internas.",
                    "Criar subdomínios ou serviços especializados."
                ],

                metadata:
                    module
            };
        });
}

function mergeTechnicalDebts(
    debts
) {
    const grouped =
        new Map();

    for (const debt of debts) {
        const source =
            safeObject(debt);

        const key =
            source.consolidationKey
            || `${
                source.targetType
                || "unknown"
            }:${
                source.target
                || source.id
                || "unknown"
            }`;

        if (!grouped.has(key)) {
            grouped.set(
                key,
                normalizeDebt(
                    source,
                    key
                )
            );

            continue;
        }

        const current =
            grouped.get(key);

        current.priority =
            higherPriority(
                current.priority,
                source.priority
            );

        current.types =
            uniqueStrings([
                ...current.types,
                source.type
            ]);

        current.sources =
            uniqueStrings([
                ...current.sources,
                ...toArray(
                    source.sources
                )
            ]);

        current.reasons =
            uniqueStrings([
                ...current.reasons,
                source.description,
                ...toArray(
                    source.reasons
                )
            ]);

        current.suggestedActions =
            uniqueStrings([
                ...current
                    .suggestedActions,

                source.recommendation,

                ...toArray(
                    source
                        .suggestedActions
                )
            ]);

        current.estimatedHours =
            mergeEstimatedHours(
                current.estimatedHours,
                toNumber(
                    source.estimatedHours
                ),
                current.sources.length
            );

        current.metadata = {
            ...current.metadata,

            merged: [
                ...toArray(
                    current
                        .metadata
                        ?.merged
                ),

                safeObject(
                    source.metadata
                )
            ]
        };
    }

    return [
        ...grouped.values()
    ];
}

function normalizeDebt(
    debt,
    consolidationKey
) {
    const sources =
        uniqueStrings(
            debt.sources
        );

    const reasons =
        uniqueStrings([
            debt.description,
            ...toArray(
                debt.reasons
            )
        ]);

    const suggestedActions =
        uniqueStrings([
            debt.recommendation,
            ...toArray(
                debt.suggestedActions
            )
        ]);

    return {
        id:
            consolidationKey,

        consolidationKey,

        type:
            debt.type
            || "technical_debt",

        types:
            uniqueStrings([
                debt.type
            ]),

        priority:
            normalizePriority(
                debt.priority
            ),

        title:
            debt.title
            || "Débito técnico",

        target:
            debt.target
            || "unknown",

        targetType:
            debt.targetType
            || "file",

        description:
            debt.description
            || "Débito técnico identificado.",

        impact:
            debt.impact
            || "Pode aumentar o custo de manutenção.",

        recommendation:
            debt.recommendation
            || "Planejar correção gradual.",

        estimatedHours:
            Math.max(
                toNumber(
                    debt.estimatedHours
                ),
                1
            ),

        sources,

        reasons,

        suggestedActions,

        metadata: {
            primary:
                safeObject(
                    debt.metadata
                ),

            merged: []
        }
    };
}

function mergeEstimatedHours(
    current,
    incoming,
    sourceCount
) {
    const base =
        Math.max(
            toNumber(current),
            toNumber(incoming),
            1
        );

    const confirmationBonus =
        Math.min(
            Math.max(
                sourceCount - 1,
                0
            ),
            3
        );

    return base
        + confirmationBonus;
}

function buildSummary(
    debts
) {
    const byTargetType =
        countByField(
            debts,
            "targetType"
        );

    const confirmedByMultipleSources =
        debts.filter(
            (debt) =>
                debt.sources.length > 1
        ).length;

    return {
        total:
            debts.length,

        critical:
            countPriority(
                debts,
                "critical"
            ),

        high:
            countPriority(
                debts,
                "high"
            ),

        medium:
            countPriority(
                debts,
                "medium"
            ),

        low:
            countPriority(
                debts,
                "low"
            ),

        files:
            toNumber(
                byTargetType.file
            ),

        modules:
            toNumber(
                byTargetType.module
            ),

        routes:
            toNumber(
                byTargetType.route
            ),

        systems:
            toNumber(
                byTargetType.system
            ),

        confirmedByMultipleSources,

        estimatedHours:
            debts.reduce(
                (
                    total,
                    debt
                ) =>
                    total
                    + toNumber(
                        debt.estimatedHours
                    ),
                0
            )
    };
}

function calculateTechnicalDebtScore(
    summary
) {
    let penalty = 0;

    penalty += Math.min(
        summary.critical * 12,
        36
    );

    penalty += Math.min(
        summary.high * 4,
        28
    );

    penalty += Math.min(
        summary.medium,
        12
    );

    penalty += Math.min(
        summary.low * 0.25,
        4
    );

    penalty += Math.min(
        summary
            .confirmedByMultipleSources
            * 0.5,
        5
    );

    return clampScore(
        100 - penalty
    );
}

function getTechnicalDebtStatus({
    score,
    blockers
}) {
    if (blockers.length > 0) {
        return "critical_debt";
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

    return "high_debt";
}

function buildBlockers(
    debts
) {
    return debts
        .filter(
            (debt) =>
                debt.priority
                === "critical"
        )
        .map(
            (debt) =>
                `${
                    debt.targetType
                }: ${
                    debt.target
                }`
        );
}

function buildWarnings(
    summary
) {
    const warnings = [];

    if (summary.high > 0) {
        warnings.push(
            `${summary.high} débito(s) técnico(s) de alta prioridade.`
        );
    }

    if (summary.medium > 0) {
        warnings.push(
            `${summary.medium} débito(s) técnico(s) de média prioridade.`
        );
    }

    if (
        summary
            .confirmedByMultipleSources > 0
    ) {
        warnings.push(
            `${summary.confirmedByMultipleSources} débito(s) confirmado(s) por mais de uma fonte.`
        );
    }

    return uniqueStrings(
        warnings
    );
}

function generateTechnicalDebtRecommendations(
    debts
) {
    if (!debts.length) {
        return [
            "Nenhum débito técnico relevante encontrado neste momento.",
            "Manter o padrão atual de módulos, services, repositories e controllers."
        ];
    }

    const recommendations = [];

    if (
        debts.some(
            (item) =>
                item.priority
                === "critical"
        )
    ) {
        recommendations.push(
            "Corrigir os débitos críticos antes da produção pública."
        );
    }

    if (
        debts.some(
            (item) =>
                item.priority
                === "high"
        )
    ) {
        recommendations.push(
            "Executar débitos de alta prioridade em pacotes pequenos e testáveis."
        );
    }

    if (
        debts.some(
            (item) =>
                item.types.includes(
                    "large_file"
                )
        )
    ) {
        recommendations.push(
            "Dividir primeiro os arquivos grandes confirmados por múltiplas fontes."
        );
    }

    if (
        debts.some(
            (item) =>
                item.types.includes(
                    "high_coupling"
                )
        )
    ) {
        recommendations.push(
            "Reduzir acoplamento antes de adicionar novas responsabilidades aos arquivos afetados."
        );
    }

    if (
        debts.some(
            (item) =>
                item.targetType
                === "module"
        )
    ) {
        recommendations.push(
            "Evitar novas funcionalidades nos módulos já classificados como de alto risco."
        );
    }

    recommendations.push(
        "Executar Scanner, Architecture, Dependency Graph e Technical Debt após cada refatoração."
    );

    return uniqueStrings(
        recommendations
    );
}

function buildNextSteps(
    debts
) {
    const steps = [];

    const critical =
        debts.filter(
            (debt) =>
                debt.priority
                === "critical"
        );

    const high =
        debts.filter(
            (debt) =>
                debt.priority
                === "high"
        );

    if (critical.length > 0) {
        steps.push(
            "Selecionar o primeiro débito crítico e realizar uma refatoração isolada."
        );
    }

    if (high.length > 0) {
        steps.push(
            "Criar uma fila priorizada dos débitos de alta prioridade."
        );
    }

    steps.push(
        "Executar testes mecânicos após cada refatoração."
    );

    steps.push(
        "Reexecutar o Technical Debt Report e comparar a evolução."
    );

    return uniqueStrings(
        steps
    );
}

function compareDebts(
    a,
    b
) {
    const priorityDifference =
        getPriorityWeight(
            a.priority
        )
        - getPriorityWeight(
            b.priority
        );

    if (
        priorityDifference !== 0
    ) {
        return priorityDifference;
    }

    const sourceDifference =
        b.sources.length
        - a.sources.length;

    if (sourceDifference !== 0) {
        return sourceDifference;
    }

    return (
        b.estimatedHours
        - a.estimatedHours
    );
}

function getLargeFileHours(
    lines
) {
    if (lines > 900) {
        return 8;
    }

    if (lines > 500) {
        return 5;
    }

    return 3;
}

function normalizeArchitecture(
    architecture
) {
    const source =
        safeObject(
            architecture
        );

    return {
        ...source,

        largeFiles:
            toArray(
                source.largeFiles
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
    dependencyGraph
) {
    const source =
        safeObject(
            dependencyGraph
        );

    return {
        ...source,

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

function countPriority(
    debts,
    priority
) {
    return debts.filter(
        (debt) =>
            debt.priority
            === priority
    ).length;
}

function countByField(
    items,
    field
) {
    return items.reduce(
        (
            accumulator,
            item
        ) => {
            const key =
                item[field]
                || "unknown";

            accumulator[key] =
                (
                    accumulator[key]
                    || 0
                ) + 1;

            return accumulator;
        },
        {}
    );
}

function normalizePriority(
    priority
) {
    const valid = [
        "critical",
        "high",
        "medium",
        "low"
    ];

    return valid.includes(
        priority
    )
        ? priority
        : "low";
}

function higherPriority(
    first,
    second
) {
    return (
        getPriorityWeight(
            first
        )
        <= getPriorityWeight(
            second
        )
    )
        ? normalizePriority(
            first
        )
        : normalizePriority(
            second
        );
}

function getPriorityWeight(
    priority
) {
    const weights = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4
    };

    return (
        weights[priority]
        || 5
    );
}