import {
    getCodeInventory
} from "./ai-code-inventory.service.js";

export function getArchitectureReview() {
    const inventory = getCodeInventory();

    return {
        type: "architecture_review",
        generatedAt: new Date().toISOString(),
        summary: inventory.summary,
        moduleHealth: getModuleHealth(inventory),
        largeFiles: getLargeFiles(inventory),
        highlyCoupledFiles: getHighlyCoupledFiles(inventory),
        suggestions: generateArchitectureSuggestions(inventory)
    };
}

function getModuleHealth(inventory) {
    return Object.values(inventory.modules)
        .map((module) => {
            const totalLines = module.files.reduce(
                (sum, file) => sum + file.lines,
                0
            );

            const totalImports = module.files.reduce(
                (sum, file) => sum + file.imports.length,
                0
            );

            return {
                name: module.name,
                files: module.files.length,
                lines: totalLines,
                imports: totalImports,
                controllers: module.controllers,
                services: module.services,
                routes: module.routes,
                repositories: module.repositories,
                workers: module.workers,
                queues: module.queues,
                providers: module.providers,
                risk: calculateModuleRisk(totalLines, totalImports, module.files.length)
            };
        })
        .sort((a, b) => b.lines - a.lines);
}

function getLargeFiles(inventory) {
    return inventory.files
        .filter((file) => file.lines > 250)
        .map((file) => ({
            path: file.relativePath,
            lines: file.lines,
            imports: file.imports.length,
            exports: file.exports.length
        }))
        .sort((a, b) => b.lines - a.lines);
}

function getHighlyCoupledFiles(inventory) {
    return inventory.files
        .filter((file) => file.imports.length > 8)
        .map((file) => ({
            path: file.relativePath,
            imports: file.imports.length,
            lines: file.lines
        }))
        .sort((a, b) => b.imports - a.imports);
}

function calculateModuleRisk(lines, imports, files) {
    let score = 0;

    if (lines > 1500) {
        score += 3;
    } else if (lines > 800) {
        score += 2;
    } else if (lines > 400) {
        score += 1;
    }

    if (imports > 80) {
        score += 3;
    } else if (imports > 40) {
        score += 2;
    } else if (imports > 20) {
        score += 1;
    }

    if (files > 30) {
        score += 2;
    }

    if (score >= 5) {
        return "high";
    }

    if (score >= 3) {
        return "medium";
    }

    if (score >= 1) {
        return "low";
    }

    return "healthy";
}

function generateArchitectureSuggestions(inventory) {
    const suggestions = [];

    const largeFiles = getLargeFiles(inventory);
    const coupledFiles = getHighlyCoupledFiles(inventory);
    const moduleHealth = getModuleHealth(inventory);

    if (largeFiles.length) {
        suggestions.push({
            severity: "medium",
            title: "Arquivos grandes encontrados",
            description: `${largeFiles.length} arquivo(s) possuem mais de 250 linhas.`,
            recommendation: "Avaliar divisão em services menores ou helpers."
        });
    }

    if (coupledFiles.length) {
        suggestions.push({
            severity: "medium",
            title: "Arquivos com muitos imports",
            description: `${coupledFiles.length} arquivo(s) possuem alto acoplamento.`,
            recommendation: "Avaliar separação de responsabilidades."
        });
    }

    const riskyModules = moduleHealth.filter(
        (module) => module.risk === "high" || module.risk === "medium"
    );

    if (riskyModules.length) {
        suggestions.push({
            severity: "high",
            title: "Módulos com risco arquitetural",
            description: `${riskyModules.length} módulo(s) precisam de atenção.`,
            recommendation: "Priorizar revisão dos módulos maiores antes de produção."
        });
    }

    if (!suggestions.length) {
        suggestions.push({
            severity: "info",
            title: "Arquitetura saudável",
            description: "Nenhum risco arquitetural relevante encontrado.",
            recommendation: "Manter padrão atual de separação por módulos."
        });
    }

    return suggestions;
}