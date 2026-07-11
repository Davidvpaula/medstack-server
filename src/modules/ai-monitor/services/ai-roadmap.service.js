import fs from "fs";
import path from "path";

import {
    getScannerSummary,
    listScannedFiles
} from "./ai-code-scanner.service.js";

import {
    clampScore,
    createReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

const PROJECT_ROOT =
    process.cwd();

const PACKAGE_JSON_PATH =
    path.resolve(
        PROJECT_ROOT,
        "package.json"
    );

export function getRoadmapAnalysis() {
    const scannerSummary =
        normalizeScannerSummary(
            getScannerSummary()
        );

    const files =
        normalizeFiles(
            listScannedFiles()
        );

    const projectContext =
        buildProjectContext({
            files,
            scannerSummary
        });

    const roadmap =
        buildRoadmap(
            projectContext
        );

    const summary =
        buildSummary(
            roadmap
        );

    const progress =
        calculateProgress(
            roadmap
        );

    const blockers =
        buildBlockers(
            roadmap
        );

    const warnings =
        buildWarnings(
            roadmap
        );

    const recommendations =
        buildRecommendations({
            roadmap,
            projectContext
        });

    const nextSteps =
        buildNextSteps(
            roadmap
        );

    const currentStep =
        getCurrentStep(
            roadmap
        );

    const nextStep =
        getNextStep(
            roadmap
        );

    const score =
        calculateRoadmapScore({
            progress,
            blockers,
            roadmap
        });

    return createReport({
        type:
            "roadmap_analysis",

        score,

        status:
            getRoadmapStatus({
                progress,
                blockers,
                nextStep
            }),

        summary: {
            ...summary,

            progress,

            scannedFiles:
                scannerSummary.totalFiles,

            scannedModules:
                scannerSummary.totalModules
        },

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            progress,

            completed:
                summary.completed,

            inProgress:
                summary.inProgress,

            pending:
                summary.pending,

            blocked:
                summary.blocked,

            manualValidation:
                summary.manualValidation,

            currentStep,

            nextStep,

            roadmap,

            projectContext
        }
    });
}

function buildRoadmap(
    context
) {
    const backendBaseDone =
        context.scanner.totalFiles > 0
        && context.hasCoreStructure;

    const whatsappDone =
        context.hasWhatsappModule;

    const companyDone =
        context.hasCompanyModule;

    const authDone =
        context.hasAuthModule;

    const rbacDone =
        context.hasRbacModule;

    const postgresImplemented =
        context.hasDatabaseStructure
        && context.hasRepositories
        && context.hasMigrations;

    const aiMonitorImplemented =
        context.hasAiMonitorModule
        && context.hasScanner
        && context.hasFinalOverview;

    const aiMonitorMechanicalTest =
        context.hasAiMonitorTestScript
        || context.hasAiMonitorTestFile;

    const postgresMechanicalTest =
        context.hasDatabaseTestScript
        || context.hasDatabaseTestFile;

    const redisImplemented =
        context.hasRedisDependency
        || context.hasRedisFiles;

    const bullMqImplemented =
        context.hasBullMqDependency
        || context.hasBullMqFiles;

    const separatedWorkers =
        context.workerFiles > 0
        && (
            bullMqImplemented
            || context.hasWorkerProcessScript
        );

    const dockerImplemented =
        context.hasDockerfile
        || context.hasDockerCompose;

    const vpsPrepared =
        context.hasDeployDocumentation
        && dockerImplemented;

    const lovableImplemented =
        context.hasFrontendDirectory
        || context.hasLovableReference;

    const betaPrepared =
        vpsPrepared
        && lovableImplemented
        && authDone
        && rbacDone;

    return [
        createStep({
            id: 1,

            key:
                "backend_base",

            module:
                "Backend Base",

            priority:
                1,

            status:
                backendBaseDone
                    ? "done"
                    : "in_progress",

            evidence: [
                `${context.scanner.totalFiles} arquivo(s) escaneado(s).`,
                `${context.scanner.totalModules} módulo(s) identificado(s).`
            ],

            requirements: [
                "Estrutura principal do backend.",
                "Controllers, services, routes e módulos."
            ]
        }),

        createStep({
            id: 2,

            key:
                "whatsapp_runtime",

            module:
                "WhatsApp Runtime",

            priority:
                1,

            status:
                whatsappDone
                    ? "done"
                    : "pending",

            evidence:
                context.hasWhatsappModule
                    ? [
                        "Módulo WhatsApp identificado."
                    ]
                    : [],

            requirements: [
                "Módulo WhatsApp.",
                "Runtime, socket e lifecycle."
            ]
        }),

        createStep({
            id: 3,

            key:
                "company_multiempresa",

            module:
                "Company / Multiempresa",

            priority:
                1,

            status:
                companyDone
                    ? "done"
                    : "pending",

            evidence:
                context.hasCompanyModule
                    ? [
                        "Módulo Company identificado."
                    ]
                    : [],

            requirements: [
                "Company.",
                "Isolamento por empresa."
            ]
        }),

        createStep({
            id: 4,

            key:
                "postgresql",

            module:
                "PostgreSQL",

            priority:
                1,

            status:
                postgresImplemented
                    ? "in_progress"
                    : "pending",

            evidence: [
                context.hasDatabaseStructure
                    ? "Estrutura de database identificada."
                    : null,

                context.hasMigrations
                    ? "Migrations identificadas."
                    : null,

                context.hasRepositories
                    ? "Repositories identificados."
                    : null
            ],

            requirements: [
                "Conexão PostgreSQL.",
                "Migrations.",
                "Repositories.",
                "Persistência real das entidades."
            ],

            note:
                postgresImplemented
                    ? (
                        "Implementação estrutural encontrada. "
                        + "A conclusão depende do teste mecânico PostgreSQL."
                    )
                    : (
                        "A estrutura PostgreSQL ainda não foi comprovada completamente."
                    )
        }),

        createStep({
            id: 5,

            key:
                "ai_monitor",

            module:
                "AI Monitor",

            priority:
                1,

            status:
                aiMonitorImplemented
                    ? "in_progress"
                    : "pending",

            evidence: [
                context.hasAiMonitorModule
                    ? "Módulo AI Monitor identificado."
                    : null,

                context.hasScanner
                    ? "Code Scanner identificado."
                    : null,

                context.hasFinalOverview
                    ? "Final Overview identificado."
                    : null
            ],

            requirements: [
                "Serviços padronizados.",
                "Dashboards funcionais.",
                "Final Overview estável."
            ],

            note:
                aiMonitorImplemented
                    ? (
                        "Implementação encontrada. "
                        + "A conclusão depende do teste mecânico geral."
                    )
                    : null
        }),

        createStep({
            id: 6,

            key:
                "ai_monitor_mechanical_test",

            module:
                "Teste Mecânico AI Monitor",

            priority:
                1,

            status:
                aiMonitorMechanicalTest
                    ? "manual_validation"
                    : (
                        aiMonitorImplemented
                            ? "in_progress"
                            : "blocked"
                    ),

            evidence: [
                context.hasAiMonitorTestScript
                    ? "Script de teste do AI Monitor identificado."
                    : null,

                context.hasAiMonitorTestFile
                    ? "Arquivo de teste do AI Monitor identificado."
                    : null
            ],

            requirements: [
                "Testar todos os endpoints JSON.",
                "Testar todos os dashboards HTML.",
                "Executar Scanner POST.",
                "Confirmar ausência de exceptions."
            ],

            blockedBy:
                aiMonitorImplemented
                    ? []
                    : [
                        "AI Monitor"
                    ]
        }),

        createStep({
            id: 7,

            key:
                "postgresql_mechanical_test",

            module:
                "Teste Mecânico PostgreSQL",

            priority:
                1,

            status:
                postgresMechanicalTest
                    ? "manual_validation"
                    : (
                        postgresImplemented
                            ? "in_progress"
                            : "blocked"
                    ),

            evidence: [
                context.hasDatabaseTestScript
                    ? "Script de teste PostgreSQL identificado."
                    : null,

                context.hasDatabaseTestFile
                    ? "Arquivo de teste PostgreSQL identificado."
                    : null
            ],

            requirements: [
                "CRUD real.",
                "Persistência após reinício.",
                "Isolamento multiempresa.",
                "Transações e rollback.",
                "Migrations em banco vazio e atualizado."
            ],

            blockedBy:
                postgresImplemented
                    ? []
                    : [
                        "PostgreSQL"
                    ]
        }),

        createStep({
            id: 8,

            key:
                "authentication",

            module:
                "Authentication",

            priority:
                2,

            status:
                authDone
                    ? "done"
                    : "pending",

            evidence:
                context.hasAuthModule
                    ? [
                        "Módulo Auth identificado."
                    ]
                    : [],

            requirements: [
                "Autenticação de usuários.",
                "Proteção das rotas privadas."
            ]
        }),

        createStep({
            id: 9,

            key:
                "rbac",

            module:
                "RBAC",

            priority:
                2,

            status:
                rbacDone
                    ? "done"
                    : "pending",

            evidence:
                context.hasRbacModule
                    ? [
                        "Módulo RBAC identificado."
                    ]
                    : [],

            requirements: [
                "Permissões por empresa.",
                "Permissões por usuário e função."
            ]
        }),

        createStep({
            id: 10,

            key:
                "redis",

            module:
                "Redis",

            priority:
                2,

            status:
                redisImplemented
                    ? "in_progress"
                    : (
                        postgresMechanicalTest
                            ? "pending"
                            : "blocked"
                    ),

            evidence: [
                context.hasRedisDependency
                    ? "Dependência Redis identificada."
                    : null,

                context.hasRedisFiles
                    ? "Arquivos Redis identificados."
                    : null
            ],

            requirements: [
                "Cliente Redis.",
                "Health check.",
                "Reconexão.",
                "Configuração por ambiente."
            ],

            blockedBy:
                postgresMechanicalTest
                    ? []
                    : [
                        "Teste Mecânico PostgreSQL"
                    ]
        }),

        createStep({
            id: 11,

            key:
                "bullmq",

            module:
                "BullMQ",

            priority:
                2,

            status:
                bullMqImplemented
                    ? "in_progress"
                    : (
                        redisImplemented
                            ? "pending"
                            : "blocked"
                    ),

            evidence: [
                context.hasBullMqDependency
                    ? "Dependência BullMQ identificada."
                    : null,

                context.hasBullMqFiles
                    ? "Arquivos BullMQ identificados."
                    : null
            ],

            requirements: [
                "Queues.",
                "Workers.",
                "Retries.",
                "Dead Letter Queue."
            ],

            blockedBy:
                redisImplemented
                    ? []
                    : [
                        "Redis"
                    ]
        }),

        createStep({
            id: 12,

            key:
                "separated_workers",

            module:
                "Workers Separados",

            priority:
                2,

            status:
                separatedWorkers
                    ? "in_progress"
                    : (
                        bullMqImplemented
                            ? "pending"
                            : "blocked"
                    ),

            evidence: [
                context.workerFiles > 0
                    ? `${context.workerFiles} worker(s) identificado(s).`
                    : null,

                context.hasWorkerProcessScript
                    ? "Script de worker separado identificado."
                    : null
            ],

            requirements: [
                "Workers fora do processo HTTP.",
                "Lifecycle independente.",
                "Health check dos workers."
            ],

            blockedBy:
                bullMqImplemented
                    ? []
                    : [
                        "BullMQ"
                    ]
        }),

        createStep({
            id: 13,

            key:
                "docker",

            module:
                "Docker",

            priority:
                3,

            status:
                dockerImplemented
                    ? "in_progress"
                    : (
                        bullMqImplemented
                            ? "pending"
                            : "blocked"
                    ),

            evidence: [
                context.hasDockerfile
                    ? "Dockerfile identificado."
                    : null,

                context.hasDockerCompose
                    ? "Docker Compose identificado."
                    : null
            ],

            requirements: [
                "Container da API.",
                "Container PostgreSQL.",
                "Container Redis.",
                "Health checks."
            ],

            blockedBy:
                bullMqImplemented
                    ? []
                    : [
                        "BullMQ"
                    ]
        }),

        createStep({
            id: 14,

            key:
                "vps",

            module:
                "VPS",

            priority:
                3,

            status:
                vpsPrepared
                    ? "manual_validation"
                    : (
                        dockerImplemented
                            ? "pending"
                            : "blocked"
                    ),

            evidence:
                context.hasDeployDocumentation
                    ? [
                        "Documentação de deploy identificada."
                    ]
                    : [],

            requirements: [
                "Docker validado.",
                "Secrets de produção.",
                "HTTPS.",
                "Backup.",
                "Observabilidade."
            ],

            blockedBy:
                dockerImplemented
                    ? []
                    : [
                        "Docker"
                    ]
        }),

        createStep({
            id: 15,

            key:
                "lovable",

            module:
                "Frontend Lovable",

            priority:
                4,

            status:
                lovableImplemented
                    ? "in_progress"
                    : (
                        vpsPrepared
                            ? "pending"
                            : "blocked"
                    ),

            evidence: [
                context.hasFrontendDirectory
                    ? "Diretório frontend identificado."
                    : null,

                context.hasLovableReference
                    ? "Referência ao Lovable identificada."
                    : null
            ],

            requirements: [
                "API estável.",
                "Autenticação.",
                "RBAC.",
                "VPS preparada."
            ],

            blockedBy:
                vpsPrepared
                    ? []
                    : [
                        "VPS"
                    ]
        }),

        createStep({
            id: 16,

            key:
                "beta_assisted",

            module:
                "Beta Assistido",

            priority:
                4,

            status:
                betaPrepared
                    ? "manual_validation"
                    : "blocked",

            evidence: [],

            requirements: [
                "Frontend funcional.",
                "Backend em VPS.",
                "Autenticação e RBAC.",
                "Monitoramento ativo."
            ],

            blockedBy:
                betaPrepared
                    ? []
                    : [
                        "Frontend Lovable",
                        "VPS",
                        "Authentication",
                        "RBAC"
                    ]
        }),

        createStep({
            id: 17,

            key:
                "commercial_scale",

            module:
                "Escala Comercial",

            priority:
                5,

            status:
                "blocked",

            evidence: [],

            requirements: [
                "Beta validado.",
                "Métricas reais.",
                "Backups.",
                "SLA e suporte.",
                "Billing."
            ],

            blockedBy: [
                "Beta Assistido"
            ]
        })
    ];
}

function createStep({
    id,
    key,
    module,
    priority,
    status,
    evidence = [],
    requirements = [],
    blockedBy = [],
    note = null
}) {
    return {
        id,

        key,

        module,

        priority,

        status:
            normalizeStepStatus(
                status
            ),

        evidence:
            uniqueStrings(
                evidence
            ),

        requirements:
            uniqueStrings(
                requirements
            ),

        blockedBy:
            uniqueStrings(
                blockedBy
            ),

        note
    };
}

function buildProjectContext({
    files,
    scannerSummary
}) {
    const modules =
        new Set(
            files
                .map(
                    (file) =>
                        file.module
                )
                .filter(Boolean)
        );

    const normalizedPaths =
        files.map(
            (file) =>
                normalizePath(
                    file.path
                )
        );

    const packageJson =
        readPackageJson();

    const dependencies = {
        ...safeObject(
            packageJson.dependencies
        ),

        ...safeObject(
            packageJson.devDependencies
        )
    };

    const scripts =
        safeObject(
            packageJson.scripts
        );

    const scriptEntries =
        Object.entries(
            scripts
        );

    return {
        scanner:
            scannerSummary,

        hasCoreStructure:
            files.some(
                (file) =>
                    [
                        "controller",
                        "service",
                        "route"
                    ].includes(
                        file.type
                    )
            ),

        hasWhatsappModule:
            modules.has(
                "whatsapp"
            ),

        hasCompanyModule:
            modules.has(
                "company"
            ),

        hasAuthModule:
            modules.has(
                "auth"
            ),

        hasRbacModule:
            modules.has(
                "rbac"
            ),

        hasAiMonitorModule:
            modules.has(
                "ai-monitor"
            ),

        hasDatabaseStructure:
            normalizedPaths.some(
                (filePath) =>
                    filePath.includes(
                        "/database/"
                    )
            )
            || modules.has(
                "database"
            ),

        hasRepositories:
            files.some(
                (file) =>
                    file.type
                    === "repository"
            ),

        hasMigrations:
            normalizedPaths.some(
                (filePath) =>
                    filePath.includes(
                        "migration"
                    )
            ),

        hasScanner:
            normalizedPaths.some(
                (filePath) =>
                    filePath.includes(
                        "ai-code-scanner.service.js"
                    )
            ),

        hasFinalOverview:
            normalizedPaths.some(
                (filePath) =>
                    filePath.includes(
                        "ai-final-overview.service.js"
                    )
            ),

        hasAiMonitorTestFile:
            normalizedPaths.some(
                (filePath) =>
                    (
                        filePath.includes(
                            "ai-monitor"
                        )
                        && isTestPath(
                            filePath
                        )
                    )
            ),

        hasDatabaseTestFile:
            normalizedPaths.some(
                (filePath) =>
                    (
                        (
                            filePath.includes(
                                "database"
                            )
                            || filePath.includes(
                                "postgres"
                            )
                        )
                        && isTestPath(
                            filePath
                        )
                    )
            ),

        hasAiMonitorTestScript:
            scriptEntries.some(
                (
                    [
                        name,
                        value
                    ]
                ) => {
                    const text =
                        `${
                            name
                        } ${
                            value
                        }`
                            .toLowerCase();

                    return (
                        text.includes(
                            "ai-monitor"
                        )
                        && text.includes(
                            "test"
                        )
                    );
                }
            ),

        hasDatabaseTestScript:
            scriptEntries.some(
                (
                    [
                        name,
                        value
                    ]
                ) => {
                    const text =
                        `${
                            name
                        } ${
                            value
                        }`
                            .toLowerCase();

                    return (
                        (
                            text.includes(
                                "database"
                            )
                            || text.includes(
                                "postgres"
                            )
                            || text.includes(
                                "db:"
                            )
                        )
                        && (
                            text.includes(
                                "test"
                            )
                            || text.includes(
                                "diagnostic"
                            )
                        )
                    );
                }
            ),

        hasRedisDependency:
            Boolean(
                dependencies.redis
                || dependencies.ioredis
                || dependencies["@redis/client"]
            ),

        hasBullMqDependency:
            Boolean(
                dependencies.bullmq
            ),

        hasRedisFiles:
            normalizedPaths.some(
                (filePath) =>
                    filePath.includes(
                        "redis"
                    )
            ),

        hasBullMqFiles:
            normalizedPaths.some(
                (filePath) =>
                    filePath.includes(
                        "bullmq"
                    )
            ),

        workerFiles:
            files.filter(
                (file) =>
                    file.type
                    === "worker"
            ).length,

        hasWorkerProcessScript:
            scriptEntries.some(
                (
                    [
                        name,
                        value
                    ]
                ) => {
                    const text =
                        `${
                            name
                        } ${
                            value
                        }`
                            .toLowerCase();

                    return (
                        text.includes(
                            "worker"
                        )
                        && (
                            text.includes(
                                "start"
                            )
                            || text.includes(
                                "node"
                            )
                        )
                    );
                }
            ),

        hasDockerfile:
            existsAny([
                "Dockerfile",
                "dockerfile",
                "Dockerfile.production"
            ]),

        hasDockerCompose:
            existsAny([
                "docker-compose.yml",
                "docker-compose.yaml",
                "compose.yml",
                "compose.yaml"
            ]),

        hasDeployDocumentation:
            existsAny([
                "docs/DEPLOY.md",
                "DEPLOY.md"
            ]),

        hasFrontendDirectory:
            existsAny([
                "frontend",
                "web",
                "client"
            ]),

        hasLovableReference:
            normalizedPaths.some(
                (filePath) =>
                    filePath.includes(
                        "lovable"
                    )
            )
            || JSON.stringify(
                packageJson
            )
                .toLowerCase()
                .includes(
                    "lovable"
                )
    };
}

function buildSummary(
    roadmap
) {
    return {
        total:
            roadmap.length,

        completed:
            countStepStatus(
                roadmap,
                "done"
            ),

        inProgress:
            countStepStatus(
                roadmap,
                "in_progress"
            ),

        pending:
            countStepStatus(
                roadmap,
                "pending"
            ),

        blocked:
            countStepStatus(
                roadmap,
                "blocked"
            ),

        manualValidation:
            countStepStatus(
                roadmap,
                "manual_validation"
            )
    };
}

function calculateProgress(
    roadmap
) {
    if (!roadmap.length) {
        return 0;
    }

    const totalWeight =
        roadmap.reduce(
            (
                total,
                step
            ) =>
                total
                + getPriorityWeight(
                    step.priority
                ),
            0
        );

    const earnedWeight =
        roadmap.reduce(
            (
                total,
                step
            ) => {
                const weight =
                    getPriorityWeight(
                        step.priority
                    );

                return (
                    total
                    + weight
                        * getStatusProgress(
                            step.status
                        )
                );
            },
            0
        );

    if (totalWeight <= 0) {
        return 0;
    }

    return clampScore(
        (
            earnedWeight
            / totalWeight
        ) * 100
    );
}

function calculateRoadmapScore({
    progress,
    blockers,
    roadmap
}) {
    let score =
        progress;

    const criticalBlocked =
        roadmap.filter(
            (step) =>
                step.status
                    === "blocked"
                && step.priority <= 2
        ).length;

    score -= Math.min(
        blockers.length * 2,
        10
    );

    score -= Math.min(
        criticalBlocked * 3,
        15
    );

    return clampScore(
        score
    );
}

function getRoadmapStatus({
    progress,
    blockers,
    nextStep
}) {
    if (!nextStep) {
        return "roadmap_completed";
    }

    if (
        blockers.length > 0
        && progress < 50
    ) {
        return "roadmap_blocked";
    }

    if (progress >= 85) {
        return "final_stages";
    }

    if (progress >= 60) {
        return "infrastructure_stage";
    }

    if (progress >= 35) {
        return "backend_consolidation";
    }

    return "foundation_stage";
}

function getCurrentStep(
    roadmap
) {
    return roadmap.find(
        (step) =>
            step.status
                === "in_progress"
            || step.status
                === "manual_validation"
    )
        || null;
}

function getNextStep(
    roadmap
) {
    return roadmap.find(
        (step) =>
            step.status
                !== "done"
    )
        || null;
}

function buildBlockers(
    roadmap
) {
    return roadmap
        .filter(
            (step) =>
                step.status
                === "blocked"
                && step.priority <= 2
        )
        .map(
            (step) =>
                `${step.module}: depende de ${
                    step.blockedBy.join(
                        ", "
                    )
                    || "etapas anteriores"
                }.`
        );
}

function buildWarnings(
    roadmap
) {
    const warnings = [];

    const inProgress =
        roadmap.filter(
            (step) =>
                step.status
                === "in_progress"
        );

    const manualValidation =
        roadmap.filter(
            (step) =>
                step.status
                === "manual_validation"
        );

    if (inProgress.length > 0) {
        warnings.push(
            `${inProgress.length} etapa(s) estão em andamento.`
        );
    }

    if (
        manualValidation.length > 0
    ) {
        warnings.push(
            `${manualValidation.length} etapa(s) dependem de validação manual.`
        );
    }

    return uniqueStrings(
        warnings
    );
}

function buildRecommendations({
    roadmap,
    projectContext
}) {
    const recommendations = [];

    if (
        !projectContext
            .hasAiMonitorTestScript
    ) {
        recommendations.push(
            "Criar um script de teste mecânico completo do AI Monitor."
        );
    }

    if (
        !projectContext
            .hasDatabaseTestScript
    ) {
        recommendations.push(
            "Criar um script de teste mecânico PostgreSQL."
        );
    }

    if (
        projectContext
            .hasDatabaseStructure
        && !projectContext
            .hasRedisDependency
    ) {
        recommendations.push(
            "Após validar PostgreSQL, iniciar Redis."
        );
    }

    if (
        projectContext
            .hasRedisDependency
        && !projectContext
            .hasBullMqDependency
    ) {
        recommendations.push(
            "Após validar Redis, iniciar BullMQ."
        );
    }

    if (
        projectContext
            .hasBullMqDependency
        && !projectContext
            .hasDockerfile
    ) {
        recommendations.push(
            "Após BullMQ, containerizar a aplicação."
        );
    }

    const nextStep =
        getNextStep(
            roadmap
        );

    if (nextStep) {
        recommendations.push(
            `Concentrar o próximo pacote em: ${nextStep.module}.`
        );
    }

    return uniqueStrings(
        recommendations
    );
}

function buildNextSteps(
    roadmap
) {
    const steps = [];

    const currentStep =
        getCurrentStep(
            roadmap
        );

    const nextStep =
        getNextStep(
            roadmap
        );

    if (currentStep) {
        steps.push(
            `Concluir ou validar: ${currentStep.module}.`
        );
    }

    if (
        nextStep
        && (
            !currentStep
            || nextStep.id
                !== currentStep.id
        )
    ) {
        steps.push(
            `Próxima etapa: ${nextStep.module}.`
        );
    }

    steps.push(
        "Reexecutar o Roadmap após cada pacote estrutural."
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

function readPackageJson() {
    try {
        if (
            !fs.existsSync(
                PACKAGE_JSON_PATH
            )
        ) {
            return {};
        }

        const content =
            fs.readFileSync(
                PACKAGE_JSON_PATH,
                "utf-8"
            );

        return safeObject(
            JSON.parse(
                content
            )
        );
    } catch {
        return {};
    }
}

function existsAny(
    relativePaths
) {
    return relativePaths.some(
        (relativePath) =>
            fs.existsSync(
                path.resolve(
                    PROJECT_ROOT,
                    relativePath
                )
            )
    );
}

function isTestPath(
    filePath
) {
    return (
        filePath.includes(
            "/test/"
        )
        || filePath.includes(
            "/tests/"
        )
        || filePath.includes(
            "/__tests__/"
        )
        || filePath.includes(
            ".test."
        )
        || filePath.includes(
            ".spec."
        )
    );
}

function normalizePath(
    value
) {
    return String(
        value || ""
    )
        .replaceAll(
            "\\",
            "/"
        )
        .toLowerCase();
}

function normalizeStepStatus(
    status
) {
    const validStatuses = [
        "done",
        "in_progress",
        "pending",
        "blocked",
        "manual_validation"
    ];

    return validStatuses.includes(
        status
    )
        ? status
        : "pending";
}

function getStatusProgress(
    status
) {
    const values = {
        done:
            1,

        manual_validation:
            0.85,

        in_progress:
            0.60,

        pending:
            0,

        blocked:
            0
    };

    return values[status] ?? 0;
}

function getPriorityWeight(
    priority
) {
    const normalized =
        Math.max(
            toNumber(
                priority,
                5
            ),
            1
        );

    return Math.max(
        6 - normalized,
        1
    );
}

function countStepStatus(
    roadmap,
    status
) {
    return roadmap.filter(
        (step) =>
            step.status
            === status
    ).length;
}