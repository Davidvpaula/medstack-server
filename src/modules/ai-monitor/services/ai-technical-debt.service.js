import {
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getDependencyGraph
} from "./ai-dependency-graph.service.js";

export function getTechnicalDebtReport() {
    const architecture = getArchitectureReview();
    const dependencyGraph = getDependencyGraph();

    const debts = [
        ...getLargeFileDebts(architecture),
        ...getCouplingDebts(dependencyGraph),
        ...getModuleRiskDebts(architecture)
    ];

    const sortedDebts = debts.sort(
        (a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority)
    );

    return {
        type: "technical_debt_report",
        generatedAt: new Date().toISOString(),
        summary: {
            total: sortedDebts.length,
            critical: sortedDebts.filter((item) => item.priority === "critical").length,
            high: sortedDebts.filter((item) => item.priority === "high").length,
            medium: sortedDebts.filter((item) => item.priority === "medium").length,
            low: sortedDebts.filter((item) => item.priority === "low").length,
            estimatedHours: sortedDebts.reduce(
                (total, item) => total + item.estimatedHours,
                0
            )
        },
        debts: sortedDebts,
        recommendations: generateTechnicalDebtRecommendations(sortedDebts)
    };
}

function getLargeFileDebts(architecture) {
    return architecture.largeFiles.map((file) => {
        const priority = file.lines > 500
            ? "high"
            : "medium";

        return {
            id: `large-file:${file.path}`,
            type: "large_file",
            priority,
            title: "Arquivo grande",
            target: file.path,
            description: `O arquivo possui ${file.lines} linhas.`,
            impact: "Arquivos grandes são mais difíceis de manter, testar e revisar.",
            recommendation: "Avaliar divisão em serviços menores, helpers ou módulos especializados.",
            estimatedHours: file.lines > 500 ? 4 : 2,
            metadata: file
        };
    });
}

function getCouplingDebts(dependencyGraph) {
    return dependencyGraph.nodes
        .filter((node) => node.imports > 8 || node.risk === "high")
        .map((node) => {
            const priority = node.imports > 12 || node.risk === "high"
                ? "high"
                : "medium";

            return {
                id: `coupling:${node.id}`,
                type: "high_coupling",
                priority,
                title: "Arquivo com alto acoplamento",
                target: node.id,
                description: `O arquivo possui ${node.imports} imports.`,
                impact: "Muitos imports podem indicar excesso de responsabilidade ou dependência entre módulos.",
                recommendation: "Avaliar separação de responsabilidades e redução de dependências diretas.",
                estimatedHours: priority === "high" ? 5 : 3,
                metadata: node
            };
        });
}

function getModuleRiskDebts(architecture) {
    return architecture.moduleHealth
        .filter((module) => module.risk === "high" || module.risk === "medium")
        .map((module) => {
            const priority = module.risk === "high"
                ? "high"
                : "medium";

            return {
                id: `module-risk:${module.name}`,
                type: "module_risk",
                priority,
                title: "Módulo com risco arquitetural",
                target: module.name,
                description: `O módulo possui ${module.files} arquivos, ${module.lines} linhas e ${module.imports} imports.`,
                impact: "Módulos grandes ou muito conectados tendem a gerar mais bugs conforme o projeto escala.",
                recommendation: "Avaliar divisão interna do módulo e criar subcamadas mais específicas.",
                estimatedHours: priority === "high" ? 8 : 4,
                metadata: module
            };
        });
}

function generateTechnicalDebtRecommendations(debts) {
    const recommendations = [];

    if (!debts.length) {
        return [
            "Nenhum débito técnico relevante encontrado neste momento.",
            "Manter o padrão atual de módulos, services, repositories e controllers."
        ];
    }

    const highPriority = debts.filter(
        (item) => item.priority === "critical" || item.priority === "high"
    );

    if (highPriority.length) {
        recommendations.push(
            "Priorizar débitos de alta prioridade antes de escalar para muitos clientes."
        );
    }

    const largeFiles = debts.filter((item) => item.type === "large_file");

    if (largeFiles.length) {
        recommendations.push(
            "Separar arquivos grandes em services menores para facilitar manutenção."
        );
    }

    const coupling = debts.filter((item) => item.type === "high_coupling");

    if (coupling.length) {
        recommendations.push(
            "Reduzir acoplamento nos arquivos com muitos imports antes de adicionar novas funcionalidades."
        );
    }

    recommendations.push(
        "Antes de produção com muitas empresas, revisar débitos técnicos junto com PostgreSQL, Redis/BullMQ e Docker."
    );

    return recommendations;
}

function getPriorityWeight(priority) {
    const weights = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4
    };

    return weights[priority] || 5;
}