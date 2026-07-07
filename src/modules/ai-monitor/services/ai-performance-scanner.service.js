import {
    listScannedFiles,
    getScannerSummary
} from "./ai-code-scanner.service.js";

export function getPerformanceScanReport() {
    const files = listScannedFiles();

    const findings = [
        ...findLargeFiles(files),
        ...findHeavyModules(files),
        ...findHighImportFiles(files),
        ...findWorkerQueueRisks(files)
    ];

    return {
        type: "performance_scan_report",
        generatedAt: new Date().toISOString(),
        scannerSummary: getScannerSummary(),
        summary: {
            totalFindings: findings.length,
            high: findings.filter((item) => item.severity === "high").length,
            medium: findings.filter((item) => item.severity === "medium").length,
            low: findings.filter((item) => item.severity === "low").length
        },
        findings,
        recommendations: generatePerformanceRecommendations(findings)
    };
}

function findLargeFiles(files) {
    return files
        .filter((file) => file.lines > 250)
        .map((file) => ({
            severity: file.lines > 500 ? "high" : "medium",
            type: "large_file",
            title: "Arquivo grande",
            file: file.path,
            description: `Arquivo possui ${file.lines} linhas.`,
            recommendation: "Avaliar divisão em services menores para reduzir custo de manutenção e risco de lentidão."
        }));
}

function findHeavyModules(files) {
    const grouped = {};

    for (const file of files) {
        const moduleName = file.module || "unknown";

        if (!grouped[moduleName]) {
            grouped[moduleName] = {
                module: moduleName,
                files: 0,
                lines: 0,
                imports: 0
            };
        }

        grouped[moduleName].files += 1;
        grouped[moduleName].lines += file.lines || 0;
        grouped[moduleName].imports += file.imports?.length || 0;
    }

    return Object.values(grouped)
        .filter((module) => module.lines > 1500 || module.imports > 80)
        .map((module) => ({
            severity: module.lines > 2500 || module.imports > 120 ? "high" : "medium",
            type: "heavy_module",
            title: "Módulo pesado",
            file: null,
            module: module.module,
            description: `Módulo possui ${module.files} arquivos, ${module.lines} linhas e ${module.imports} imports.`,
            recommendation: "Avaliar separação interna do módulo, cache, workers ou redução de acoplamento."
        }));
}

function findHighImportFiles(files) {
    return files
        .filter((file) => file.imports.length > 8)
        .map((file) => ({
            severity: file.imports.length > 14 ? "high" : "medium",
            type: "high_imports",
            title: "Arquivo com muitos imports",
            file: file.path,
            description: `Arquivo possui ${file.imports.length} imports.`,
            recommendation: "Muitos imports podem indicar alto acoplamento. Avaliar extração de responsabilidades."
        }));
}

function findWorkerQueueRisks(files) {
    return files
        .filter((file) => {
            const path = String(file.path || "").toLowerCase();

            return (
                path.includes("worker") ||
                path.includes("queue") ||
                path.includes("dispatch")
            );
        })
        .filter((file) => file.lines > 200 || file.imports.length > 8)
        .map((file) => ({
            severity: "medium",
            type: "worker_queue_growth",
            title: "Worker/Fila crescendo",
            file: file.path,
            description: "Arquivo de worker, queue ou dispatcher está crescendo.",
            recommendation: "Antes de escala, considerar BullMQ, Redis e workers separados."
        }));
}

function generatePerformanceRecommendations(findings) {
    if (!findings.length) {
        return [
            "Nenhum risco relevante de performance encontrado pelo scanner atual.",
            "Manter monitoramento conforme o projeto crescer."
        ];
    }

    const recommendations = [];

    if (findings.some((item) => item.type === "large_file")) {
        recommendations.push("Dividir arquivos grandes antes de adicionar novas responsabilidades.");
    }

    if (findings.some((item) => item.type === "heavy_module")) {
        recommendations.push("Monitorar módulos pesados e evitar concentração de novas features neles.");
    }

    if (findings.some((item) => item.type === "worker_queue_growth")) {
        recommendations.push("Planejar Redis/BullMQ e workers separados antes de múltiplas empresas.");
    }

    recommendations.push("Adicionar métricas reais de tempo de resposta quando entrar em VPS.");
    recommendations.push("Adicionar logs de duração em endpoints críticos.");

    return recommendations;
}