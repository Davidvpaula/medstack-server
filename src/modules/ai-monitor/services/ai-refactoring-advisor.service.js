import {
    listScannedFiles,
    getScannerSummary
} from "./ai-code-scanner.service.js";

import {
    getModuleHealthReport
} from "./ai-module-health.service.js";

import {
    getPerformanceFinalReport
} from "./ai-performance-report.service.js";

import {
    getSecurityFinalReport
} from "./ai-security-report.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    clampScore,
    createReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export async function getRefactoringAdvisorReport() {
    const performanceResult =
        await getPerformanceFinalReport();

    const files =
        normalizeFiles(
            listScannedFiles()
        );

    const scannerSummary =
        normalizeScannerSummary(
            getScannerSummary()
        );

    const moduleHealth =
        normalizeModuleHealth(
            getModuleHealthReport()
        );

    const performance =
        normalizePerformance(
            performanceResult
        );

    const security =
        normalizeSecurity(
            getSecurityFinalReport()
        );

    const technicalDebt =
        normalizeTechnicalDebt(
            getTechnicalDebtReport()
        );

    const rawCandidates = [
        ...fromLargeFiles(
            files
        ),

        ...fromHighImports(
            files
        ),

        ...fromModuleHealth(
            moduleHealth
        ),

        ...fromPerformance(
            performance
        ),

        ...fromSecurity(
            security
        ),

        ...fromTechnicalDebt(
            technicalDebt
        )
    ];

    const candidates =
        mergeCandidates(
            rawCandidates
        )
            .sort(
                compareCandidates
            );

    const summary =
        buildSummary({
            candidates,
            scannerSummary
        });

    const blockers =
        buildBlockers(
            candidates
        );

    const warnings =
        buildWarnings(
            summary
        );

    const recommendations =
        getRecommendations(
            candidates
        );

    const nextSteps =
        getNextSteps(
            candidates
        );

    const strategy =
        getRefactoringStrategy(
            candidates
        );

    const score =
        calculateRefactoringScore(
            summary
        );

    return createReport({
        type:
            "refactoring_advisor_report",

        score,

        status:
            getRefactoringStatus({
                score,
                blockers
            }),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            candidates,

            immediateActions:
                getImmediateActions(
                    candidates
                ),

            refactoringStrategy:
                strategy
        }
    });
}

function fromLargeFiles(
    files
) {
    return files
        .filter(
            (file) =>
                file.lines > 250
        )
        .map((file) => {
            const priority =
                file.lines > 900
                    ? "critical"
                    : (
                        file.lines > 500
                            ? "high"
                            : "medium"
                    );

            return {
                candidateKey:
                    `file:${file.path}`,

                target:
                    file.path,

                targetType:
                    "file",

                source:
                    "code_scanner",

                type:
                    "large_file",

                priority,

                title:
                    "Arquivo com múltiplas responsabilidades",

                reason:
                    `O arquivo possui ${file.lines} linhas.`,

                impact:
                    "Arquivos grandes aumentam risco de bugs e dificultam manutenção.",

                suggestedAction:
                    "Dividir em serviços menores, helpers ou componentes especializados.",

                estimatedHours:
                    priority === "critical"
                        ? 8
                        : (
                            priority === "high"
                                ? 5
                                : 3
                        ),

                metadata: {
                    lines:
                        file.lines,

                    imports:
                        file.imports.length,

                    exports:
                        file.exports.length,

                    module:
                        file.module,

                    fileType:
                        file.type
                }
            };
        });
}

function fromHighImports(
    files
) {
    return files
        .filter(
            (file) =>
                file.imports.length > 8
        )
        .map((file) => {
            const priority =
                file.imports.length > 20
                    ? "critical"
                    : (
                        file.imports.length > 14
                            ? "high"
                            : "medium"
                    );

            return {
                candidateKey:
                    `file:${file.path}`,

                target:
                    file.path,

                targetType:
                    "file",

                source:
                    "code_scanner",

                type:
                    "high_imports",

                priority,

                title:
                    "Arquivo com acoplamento elevado",

                reason:
                    `O arquivo possui ${file.imports.length} imports.`,

                impact:
                    "Muitos imports podem indicar acoplamento alto ou excesso de responsabilidade.",

                suggestedAction:
                    "Reduzir dependências diretas e extrair responsabilidades.",

                estimatedHours:
                    priority === "critical"
                        ? 8
                        : (
                            priority === "high"
                                ? 5
                                : 3
                        ),

                metadata: {
                    lines:
                        file.lines,

                    imports:
                        file.imports.length,

                    exports:
                        file.exports.length,

                    module:
                        file.module,

                    fileType:
                        file.type
                }
            };
        });
}

function fromModuleHealth(
    moduleHealth
) {
    return moduleHealth
        .modules
        .filter(
            (module) =>
                module.risk === "high"
                || module.risk === "medium"
        )
        .map((module) => ({
            candidateKey:
                `module:${module.name}`,

            target:
                module.name
                || "unknown",

            targetType:
                "module",

            source:
                "module_health",

            type:
                "module_risk",

            priority:
                module.risk === "high"
                    ? "high"
                    : "medium",

            title:
                "Módulo com crescimento estrutural",

            reason:
                `Módulo possui ${toNumber(
                    module.totalFiles
                )} arquivos, ${toNumber(
                    module.totalLines
                )} linhas e ${toNumber(
                    module.totalImports
                )} imports.`,

            impact:
                "Módulos grandes tendem a concentrar regras e virar gargalos técnicos.",

            suggestedAction:
                "Separar subdomínios internos, serviços e responsabilidades.",

            estimatedHours:
                module.risk === "high"
                    ? 8
                    : 4,

            metadata:
                module
        }));
}

function fromPerformance(
    performance
) {
    return performance
        .scan
        .findings
        .filter(
            (finding) =>
                finding.severity
                !== "low"
        )
        .map((finding) => {
            const target =
                finding.file
                || finding.module
                || "performance-system";

            const targetType =
                finding.file
                    ? "file"
                    : (
                        finding.module
                            ? "module"
                            : "system"
                    );

            return {
                candidateKey:
                    `${targetType}:${target}`,

                target,

                targetType,

                source:
                    "performance",

                type:
                    finding.type
                    || "performance_risk",

                priority:
                    mapSeverityToPriority(
                        finding.severity
                    ),

                title:
                    finding.title
                    || "Achado de performance",

                reason:
                    finding.description
                    || "Achado sem descrição.",

                impact:
                    "Pode afetar manutenção, estabilidade futura ou escalabilidade.",

                suggestedAction:
                    finding.recommendation
                    || "Revisar o achado de performance.",

                estimatedHours:
                    estimateHoursFromPriority(
                        mapSeverityToPriority(
                            finding.severity
                        )
                    ),

                metadata:
                    finding
            };
        });
}

function fromSecurity(
    security
) {
    const scanCandidates =
        security
            .scan
            .findings
            .map((finding) => {
                const target =
                    finding.file
                    || finding.type
                    || "security-system";

                const targetType =
                    finding.file
                        ? "file"
                        : "system";

                const priority =
                    mapSeverityToPriority(
                        finding.severity
                    );

                return {
                    candidateKey:
                        `${targetType}:${target}`,

                    target,

                    targetType,

                    source:
                        "security",

                    type:
                        finding.type
                        || "security_risk",

                    priority,

                    title:
                        finding.title
                        || "Achado de segurança",

                    reason:
                        finding.description
                        || "Achado sem descrição.",

                    impact:
                        "Pode expor risco operacional ou de produção.",

                    suggestedAction:
                        finding.recommendation
                        || "Revisar configuração de segurança.",

                    estimatedHours:
                        estimateHoursFromPriority(
                            priority
                        ),

                    metadata:
                        finding
                };
            });

    const routeCandidates =
        security
            .routes
            .riskyRoutes
            .map((route) => {
                const target =
                    `${
                        route.method
                        || "UNKNOWN"
                    } ${
                        route.path
                        || "unknown"
                    }`;

                const priority =
                    mapSeverityToPriority(
                        route.risk
                    );

                return {
                    candidateKey:
                        `route:${target}`,

                    target,

                    targetType:
                        "route",

                    source:
                        "security_routes",

                    type:
                        "sensitive_route",

                    priority,

                    title:
                        "Rota sensível",

                    reason:
                        toArray(
                            route.reasons
                        ).join(" | ")
                        || "Rota marcada como sensível.",

                    impact:
                        "Rota sensível pode causar impacto se exposta sem autenticação ou RBAC.",

                    suggestedAction:
                        route.recommendation
                        || "Adicionar autenticação, autorização e validação.",

                    estimatedHours:
                        estimateHoursFromPriority(
                            priority
                        ),

                    metadata:
                        route
                };
            });

    return [
        ...scanCandidates,
        ...routeCandidates
    ];
}

function fromTechnicalDebt(
    technicalDebt
) {
    return technicalDebt
        .debts
        .map((debt) => ({
            candidateKey:
                debt.consolidationKey
                || `${
                    debt.targetType
                    || "file"
                }:${
                    debt.target
                    || "unknown"
                }`,

            target:
                debt.target
                || "unknown",

            targetType:
                debt.targetType
                || "file",

            source:
                "technical_debt",

            type:
                debt.type
                || "technical_debt",

            priority:
                normalizePriority(
                    debt.priority
                ),

            title:
                debt.title
                || "Débito técnico",

            reason:
                debt.description
                || "Débito sem descrição.",

            impact:
                debt.impact
                || "Pode aumentar o custo de manutenção.",

            suggestedAction:
                debt.recommendation
                || "Planejar correção gradual.",

            estimatedHours:
                Math.max(
                    toNumber(
                        debt.estimatedHours
                    ),
                    1
                ),

            metadata:
                debt
        }));
}

function mergeCandidates(
    candidates
) {
    const grouped =
        new Map();

    for (const candidate of candidates) {
        const source =
            safeObject(
                candidate
            );

        if (!source.target) {
            continue;
        }

        const key =
            source.candidateKey
            || `${
                source.targetType
                || "unknown"
            }:${
                source.target
            }`;

        if (!grouped.has(key)) {
            grouped.set(
                key,
                normalizeCandidate(
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

        current.sources =
            uniqueStrings([
                ...current.sources,
                source.source
            ]);

        current.types =
            uniqueStrings([
                ...current.types,
                source.type
            ]);

        current.reasons =
            uniqueStrings([
                ...current.reasons,
                source.reason
            ]);

        current.suggestedActions =
            uniqueStrings([
                ...current
                    .suggestedActions,

                source.suggestedAction
            ]);

        current.estimatedHours =
            mergeEstimatedHours(
                current.estimatedHours,
                toNumber(
                    source.estimatedHours
                ),
                current.sources.length
            );

        current.confirmations =
            current.sources.length;

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

function normalizeCandidate(
    candidate,
    key
) {
    const priority =
        normalizePriority(
            candidate.priority
        );

    return {
        id:
            key,

        target:
            candidate.target,

        targetType:
            candidate.targetType
            || "file",

        priority,

        title:
            candidate.title
            || "Candidato de refatoração",

        impact:
            candidate.impact
            || "Pode melhorar manutenção e escalabilidade.",

        estimatedHours:
            Math.max(
                toNumber(
                    candidate.estimatedHours
                ),
                1
            ),

        confirmations:
            1,

        sources:
            uniqueStrings([
                candidate.source
            ]),

        types:
            uniqueStrings([
                candidate.type
            ]),

        reasons:
            uniqueStrings([
                candidate.reason
            ]),

        suggestedActions:
            uniqueStrings([
                candidate
                    .suggestedAction
            ]),

        metadata: {
            primary:
                safeObject(
                    candidate.metadata
                ),

            merged: []
        }
    };
}

function buildSummary({
    candidates,
    scannerSummary
}) {
    const files =
        candidates.filter(
            (candidate) =>
                candidate.targetType
                === "file"
        ).length;

    const modules =
        candidates.filter(
            (candidate) =>
                candidate.targetType
                === "module"
        ).length;

    const routes =
        candidates.filter(
            (candidate) =>
                candidate.targetType
                === "route"
        ).length;

    const systems =
        candidates.filter(
            (candidate) =>
                candidate.targetType
                === "system"
        ).length;

    return {
        scannedFiles:
            scannerSummary.totalFiles,

        scannedModules:
            scannerSummary.totalModules,

        totalCandidates:
            candidates.length,

        critical:
            countPriority(
                candidates,
                "critical"
            ),

        high:
            countPriority(
                candidates,
                "high"
            ),

        medium:
            countPriority(
                candidates,
                "medium"
            ),

        low:
            countPriority(
                candidates,
                "low"
            ),

        files,

        modules,

        routes,

        systems,

        confirmedByMultipleSources:
            candidates.filter(
                (candidate) =>
                    candidate.confirmations > 1
            ).length,

        estimatedHours:
            candidates.reduce(
                (
                    sum,
                    candidate
                ) =>
                    sum
                    + toNumber(
                        candidate
                            .estimatedHours
                    ),
                0
            )
    };
}

function calculateRefactoringScore(
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

function getRefactoringStatus({
    score,
    blockers
}) {
    if (blockers.length > 0) {
        return "critical_cleanup_required";
    }

    if (score >= 90) {
        return "healthy";
    }

    if (score >= 75) {
        return "controlled_cleanup";
    }

    if (score >= 55) {
        return "cleanup_required";
    }

    return "high_refactoring_risk";
}

function buildBlockers(
    candidates
) {
    return candidates
        .filter(
            (candidate) =>
                candidate.priority
                === "critical"
        )
        .map(
            (candidate) =>
                `${
                    candidate.targetType
                }: ${
                    candidate.target
                }`
        );
}

function buildWarnings(
    summary
) {
    const warnings = [];

    if (summary.high > 0) {
        warnings.push(
            `${summary.high} candidato(s) de alta prioridade.`
        );
    }

    if (
        summary
            .confirmedByMultipleSources > 0
    ) {
        warnings.push(
            `${summary.confirmedByMultipleSources} candidato(s) confirmado(s) por múltiplas análises.`
        );
    }

    if (summary.modules > 0) {
        warnings.push(
            `${summary.modules} módulo(s) precisam de revisão estrutural.`
        );
    }

    return uniqueStrings(
        warnings
    );
}

function getImmediateActions(
    candidates
) {
    const prioritized =
        candidates.filter(
            (item) =>
                item.priority
                === "critical"
                || item.priority
                    === "high"
        );

    if (!prioritized.length) {
        return [
            "Nenhuma refatoração crítica imediata encontrada.",
            "Manter evolução planejada e monitorar o crescimento dos módulos."
        ];
    }

    return prioritized
        .slice(0, 5)
        .map(
            (item) =>
                `Priorizar ${
                    item.target
                }: ${
                    item.title
                }.`
        );
}

function getRefactoringStrategy(
    candidates
) {
    if (!candidates.length) {
        return {
            phase:
                "monitoring",

            strategy:
                "Nenhuma refatoração relevante necessária agora. Continuar monitorando."
        };
    }

    const critical =
        candidates.filter(
            (item) =>
                item.priority
                === "critical"
        );

    if (critical.length > 0) {
        return {
            phase:
                "critical_cleanup",

            strategy:
                "Corrigir os candidatos críticos antes da produção pública, um por vez, com teste mecânico após cada alteração."
        };
    }

    const high =
        candidates.filter(
            (item) =>
                item.priority
                === "high"
        );

    if (high.length > 0) {
        return {
            phase:
                "controlled_cleanup",

            strategy:
                "Executar refatorações de alta prioridade em pequenos pacotes, sem bloquear a validação PostgreSQL e a preparação de Redis/BullMQ."
        };
    }

    return {
        phase:
            "controlled_growth",

        strategy:
            "Refatorar gradualmente durante a evolução, sem interromper o roadmap principal."
    };
}

function getRecommendations(
    candidates
) {
    if (!candidates.length) {
        return [
            "Nenhum candidato relevante de refatoração encontrado.",
            "Manter o padrão atual de controllers, services, repositories e modules."
        ];
    }

    const recommendations = [];

    if (
        candidates.some(
            (item) =>
                item.targetType
                === "module"
        )
    ) {
        recommendations.push(
            "Priorizar a divisão gradual dos módulos confirmados por múltiplas fontes."
        );
    }

    if (
        candidates.some(
            (item) =>
                item.targetType
                === "route"
        )
    ) {
        recommendations.push(
            "Proteger as rotas sensíveis antes da exposição pública."
        );
    }

    if (
        candidates.some(
            (item) =>
                item.sources.length > 1
        )
    ) {
        recommendations.push(
            "Começar pelos candidatos confirmados simultaneamente por Scanner, Performance, Security ou Technical Debt."
        );
    }

    recommendations.push(
        "Executar refatorações pequenas e testáveis, uma por vez."
    );

    recommendations.push(
        "Após cada refatoração, executar Scanner, Module Health, Security, Performance e Refactoring novamente."
    );

    return uniqueStrings(
        recommendations
    );
}

function getNextSteps(
    candidates
) {
    const steps = [];

    if (
        candidates.some(
            (candidate) =>
                candidate.priority
                === "critical"
        )
    ) {
        steps.push(
            "Selecionar o primeiro candidato crítico e solicitar a leitura completa do arquivo-fonte."
        );
    }

    if (
        candidates.some(
            (candidate) =>
                candidate.priority
                === "high"
        )
    ) {
        steps.push(
            "Criar uma fila de refatorações de alta prioridade."
        );
    }

    steps.push(
        "Nunca refatorar um arquivo sem ler seu conteúdo completo e seus consumidores."
    );

    steps.push(
        "Executar testes mecânicos após cada pacote."
    );

    return uniqueStrings(
        steps
    );
}

function compareCandidates(
    a,
    b
) {
    const priorityDifference =
        priorityWeight(
            a.priority
        )
        - priorityWeight(
            b.priority
        );

    if (
        priorityDifference !== 0
    ) {
        return priorityDifference;
    }

    const confirmationDifference =
        b.confirmations
        - a.confirmations;

    if (
        confirmationDifference !== 0
    ) {
        return confirmationDifference;
    }

    return (
        b.estimatedHours
        - a.estimatedHours
    );
}

function mergeEstimatedHours(
    current,
    incoming,
    confirmationCount
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
                confirmationCount - 1,
                0
            ),
            3
        );

    return base
        + confirmationBonus;
}

function estimateHoursFromPriority(
    priority
) {
    if (priority === "critical") {
        return 6;
    }

    if (priority === "high") {
        return 4;
    }

    if (priority === "medium") {
        return 2;
    }

    return 1;
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
                    source.path
                    || "unknown",

                module:
                    source.module
                    || "unknown",

                type:
                    source.type
                    || "unknown",

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
            )
    };
}

function normalizeModuleHealth(
    moduleHealth
) {
    const source =
        safeObject(
            moduleHealth
        );

    return {
        ...source,

        modules:
            toArray(
                source.modules
            )
    };
}

function normalizePerformance(
    performance
) {
    const source =
        safeObject(
            performance
        );

    const scan =
        safeObject(
            source.scan
        );

    return {
        ...source,

        score:
            toNumber(
                source.score
            ),

        scan: {
            ...scan,

            findings:
                toArray(
                    scan.findings
                )
        },

        blockers:
            toArray(
                source.blockers
            ),

        warnings:
            toArray(
                source.warnings
            )
    };
}

function normalizeSecurity(
    security
) {
    const source =
        safeObject(
            security
        );

    const scan =
        safeObject(
            source.scan
        );

    const routes =
        safeObject(
            source.routes
        );

    return {
        ...source,

        scan: {
            ...scan,

            findings:
                toArray(
                    scan.findings
                )
        },

        routes: {
            ...routes,

            riskyRoutes:
                toArray(
                    routes.riskyRoutes
                )
        }
    };
}

function normalizeTechnicalDebt(
    technicalDebt
) {
    const source =
        safeObject(
            technicalDebt
        );

    return {
        ...source,

        debts:
            toArray(
                source.debts
            )
    };
}

function mapSeverityToPriority(
    severity
) {
    if (severity === "critical") {
        return "critical";
    }

    if (severity === "high") {
        return "high";
    }

    if (severity === "medium") {
        return "medium";
    }

    return "low";
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
        priorityWeight(
            first
        )
        <= priorityWeight(
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

function priorityWeight(
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

function countPriority(
    candidates,
    priority
) {
    return candidates.filter(
        (candidate) =>
            candidate.priority
            === priority
    ).length;
}