import path from "path";

import {
    getCodeInventory
} from "./ai-code-inventory.service.js";

export function getDependencyGraph() {
    const inventory = getCodeInventory();

    const nodes = inventory.files.map((file) => {
        const internalImports = file.imports.filter(isInternalImport);
        const externalImports = file.imports.filter((item) => !isInternalImport(item));

        return {
            id: file.relativePath,
            name: file.name,
            module: getModuleFromPath(file.relativePath),
            type: getFileType(file.relativePath),
            lines: file.lines,
            imports: file.imports.length,
            internalImports,
            externalImports,
            exports: file.exports,
            risk: calculateFileRisk(file)
        };
    });

    const edges = [];

    for (const file of inventory.files) {
        for (const importPath of file.imports) {
            if (!isInternalImport(importPath)) {
                continue;
            }

            edges.push({
                from: file.relativePath,
                to: resolveInternalImport(file.relativePath, importPath, inventory.files),
                importPath
            });
        }
    }

    return {
        type: "dependency_graph",
        generatedAt: new Date().toISOString(),
        summary: {
            nodes: nodes.length,
            edges: edges.length,
            highRiskFiles: nodes.filter((node) => node.risk === "high").length,
            mediumRiskFiles: nodes.filter((node) => node.risk === "medium").length,
            externalDependencies: countUniqueExternalDependencies(nodes)
        },
        nodes,
        edges,
        suggestions: generateDependencySuggestions(nodes, edges)
    };
}

function isInternalImport(importPath) {
    return importPath.startsWith(".") || importPath.startsWith("/");
}

function getModuleFromPath(relativePath) {
    const normalized = relativePath.replaceAll("\\", "/");
    const parts = normalized.split("/");
    const moduleIndex = parts.indexOf("modules");

    if (moduleIndex === -1) {
        return "core";
    }

    return parts[moduleIndex + 1] || "unknown";
}

function getFileType(relativePath) {
    const normalized = relativePath.replaceAll("\\", "/");

    if (normalized.includes("/controllers/")) return "controller";
    if (normalized.includes("/services/")) return "service";
    if (normalized.includes("/routes/")) return "route";
    if (normalized.includes("/repositories/")) return "repository";
    if (normalized.includes("/workers/")) return "worker";
    if (normalized.includes("/queues/")) return "queue";
    if (normalized.includes("/providers/")) return "provider";

    return "other";
}

function calculateFileRisk(file) {
    let score = 0;

    if (file.lines > 350) {
        score += 3;
    } else if (file.lines > 250) {
        score += 2;
    } else if (file.lines > 150) {
        score += 1;
    }

    if (file.imports.length > 12) {
        score += 3;
    } else if (file.imports.length > 8) {
        score += 2;
    } else if (file.imports.length > 5) {
        score += 1;
    }

    if (file.exports.length > 10) {
        score += 2;
    }

    if (score >= 5) return "high";
    if (score >= 3) return "medium";
    if (score >= 1) return "low";

    return "healthy";
}

function resolveInternalImport(fromFile, importPath, allFiles) {
    const fromDirectory = path.dirname(fromFile);
    const normalizedPath = path
        .normalize(path.join(fromDirectory, importPath))
        .replaceAll("\\", "/");

    const candidates = [
        normalizedPath,
        `${normalizedPath}.js`,
        `${normalizedPath}/index.js`
    ];

    const found = allFiles.find((file) => {
        const normalizedFile = file.relativePath.replaceAll("\\", "/");

        return candidates.includes(normalizedFile);
    });

    return found?.relativePath || importPath;
}

function countUniqueExternalDependencies(nodes) {
    const deps = new Set();

    for (const node of nodes) {
        for (const externalImport of node.externalImports) {
            deps.add(externalImport);
        }
    }

    return deps.size;
}

function generateDependencySuggestions(nodes, edges) {
    const suggestions = [];

    const highRiskFiles = nodes.filter((node) => node.risk === "high");
    const mediumRiskFiles = nodes.filter((node) => node.risk === "medium");

    if (highRiskFiles.length) {
        suggestions.push({
            severity: "high",
            title: "Arquivos com alto risco estrutural",
            description: `${highRiskFiles.length} arquivo(s) possuem muitas linhas, imports ou exports.`,
            recommendation: "Avaliar divisão em services menores antes de escalar produção."
        });
    }

    if (mediumRiskFiles.length) {
        suggestions.push({
            severity: "medium",
            title: "Arquivos com risco médio",
            description: `${mediumRiskFiles.length} arquivo(s) exigem acompanhamento.`,
            recommendation: "Monitorar crescimento desses arquivos."
        });
    }

    if (edges.length > nodes.length * 2) {
        suggestions.push({
            severity: "medium",
            title: "Muitas dependências internas",
            description: "O grafo possui muitas conexões internas.",
            recommendation: "Avaliar se módulos estão bem separados."
        });
    }

    if (!suggestions.length) {
        suggestions.push({
            severity: "info",
            title: "Dependências saudáveis",
            description: "Nenhum problema relevante de dependência encontrado.",
            recommendation: "Manter padrão atual."
        });
    }

    return suggestions;
}