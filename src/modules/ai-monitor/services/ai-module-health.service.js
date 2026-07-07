import {
    listScannedFiles,
    getScannerSummary
} from "./ai-code-scanner.service.js";

export function getModuleHealthReport() {
    const files = listScannedFiles();
    const scannerSummary = getScannerSummary();

    const modules = buildModuleHealth(files);

    return {
        type: "module_health_report",
        generatedAt: new Date().toISOString(),
        scannerSummary,
        summary: {
            totalModules: modules.length,
            highRisk: modules.filter((module) => module.risk === "high").length,
            mediumRisk: modules.filter((module) => module.risk === "medium").length,
            lowRisk: modules.filter((module) => module.risk === "low").length,
            healthy: modules.filter((module) => module.risk === "healthy").length
        },
        modules,
        suggestions: generateModuleSuggestions(modules)
    };
}

function buildModuleHealth(files) {
    const grouped = {};

    for (const file of files) {
        const moduleName = file.module || "unknown";

        if (!grouped[moduleName]) {
            grouped[moduleName] = {
                name: moduleName,
                files: [],
                totalLines: 0,
                totalImports: 0,
                totalExports: 0,
                types: {}
            };
        }

        grouped[moduleName].files.push(file);
        grouped[moduleName].totalLines += file.lines || 0;
        grouped[moduleName].totalImports += file.imports?.length || 0;
        grouped[moduleName].totalExports += file.exports?.length || 0;

        const type = file.type || "unknown";

        grouped[moduleName].types[type] = (grouped[moduleName].types[type] || 0) + 1;
    }

    return Object.values(grouped)
        .map((module) => ({
            name: module.name,
            totalFiles: module.files.length,
            totalLines: module.totalLines,
            totalImports: module.totalImports,
            totalExports: module.totalExports,
            types: module.types,
            largestFiles: getLargestFiles(module.files),
            risk: calculateModuleRisk(module),
            score: calculateModuleScore(module)
        }))
        .sort((a, b) => b.totalLines - a.totalLines);
}

function getLargestFiles(files) {
    return [...files]
        .sort((a, b) => b.lines - a.lines)
        .slice(0, 5)
        .map((file) => ({
            path: file.path,
            type: file.type,
            lines: file.lines,
            imports: file.imports.length,
            exports: file.exports.length
        }));
}

function calculateModuleRisk(module) {
    let riskScore = 0;

    if (module.totalLines > 2500) {
        riskScore += 3;
    } else if (module.totalLines > 1500) {
        riskScore += 2;
    } else if (module.totalLines > 800) {
        riskScore += 1;
    }

    if (module.totalImports > 120) {
        riskScore += 3;
    } else if (module.totalImports > 70) {
        riskScore += 2;
    } else if (module.totalImports > 35) {
        riskScore += 1;
    }

    if (module.files.length > 40) {
        riskScore += 2;
    } else if (module.files.length > 25) {
        riskScore += 1;
    }

    if ((module.types.service || 0) > 20) {
        riskScore += 2;
    }

    if (riskScore >= 6) return "high";
    if (riskScore >= 3) return "medium";
    if (riskScore >= 1) return "low";

    return "healthy";
}

function calculateModuleScore(module) {
    let score = 100;

    if (module.totalLines > 2500) score -= 25;
    else if (module.totalLines > 1500) score -= 15;
    else if (module.totalLines > 800) score -= 8;

    if (module.totalImports > 120) score -= 20;
    else if (module.totalImports > 70) score -= 12;
    else if (module.totalImports > 35) score -= 6;

    if (module.files.length > 40) score -= 15;
    else if (module.files.length > 25) score -= 8;

    if ((module.types.service || 0) > 20) score -= 10;

    return Math.max(score, 0);
}

function generateModuleSuggestions(modules) {
    const suggestions = [];

    const highRisk = modules.filter((module) => module.risk === "high");
    const mediumRisk = modules.filter((module) => module.risk === "medium");

    if (highRisk.length) {
        suggestions.push({
            severity: "high",
            title: "Módulos de alto risco encontrados",
            description: `${highRisk.length} módulo(s) estão grandes ou acoplados demais.`,
            recommendation: "Revisar os maiores arquivos e dividir responsabilidades antes de escalar."
        });
    }

    if (mediumRisk.length) {
        suggestions.push({
            severity: "medium",
            title: "Módulos com atenção necessária",
            description: `${mediumRisk.length} módulo(s) precisam de acompanhamento.`,
            recommendation: "Monitorar crescimento e evitar concentrar novas responsabilidades nesses módulos."
        });
    }

    if (!modules.length) {
        suggestions.push({
            severity: "info",
            title: "Scanner vazio",
            description: "Nenhum arquivo escaneado ainda.",
            recommendation: "Execute o scan automático do /src."
        });
    }

    if (modules.length && !highRisk.length && !mediumRisk.length) {
        suggestions.push({
            severity: "info",
            title: "Módulos saudáveis",
            description: "Nenhum módulo com risco relevante encontrado.",
            recommendation: "Manter padrão atual."
        });
    }

    return suggestions;
}