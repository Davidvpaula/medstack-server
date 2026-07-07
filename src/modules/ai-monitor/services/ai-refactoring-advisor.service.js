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

export function getRefactoringAdvisorReport() {
    const files = listScannedFiles();
    const scannerSummary = getScannerSummary();
    const moduleHealth = getModuleHealthReport();
    const performance = getPerformanceFinalReport();
    const security = getSecurityFinalReport();
    const technicalDebt = getTechnicalDebtReport();

    const candidates = buildRefactoringCandidates({
        files,
        moduleHealth,
        performance,
        security,
        technicalDebt
    });

    return {
        type: "refactoring_advisor_report",
        generatedAt: new Date().toISOString(),
        summary: {
            scannedFiles: scannerSummary.totalFiles,
            scannedModules: scannerSummary.totalModules,
            totalCandidates: candidates.length,
            critical: candidates.filter((item) => item.priority === "critical").length,
            high: candidates.filter((item) => item.priority === "high").length,
            medium: candidates.filter((item) => item.priority === "medium").length,
            low: candidates.filter((item) => item.priority === "low").length,
            estimatedHours: candidates.reduce(
                (sum, item) => sum + item.estimatedHours,
                0
            )
        },
        candidates,
        immediateActions: getImmediateActions(candidates),
        refactoringStrategy: getRefactoringStrategy(candidates),
        recommendations: getRecommendations(candidates)
    };
}

function buildRefactoringCandidates({
    files,
    moduleHealth,
    performance,
    security,
    technicalDebt
}) {
    const candidates = [];

    candidates.push(
        ...fromLargeFiles(files),
        ...fromHighImports(files),
        ...fromModuleHealth(moduleHealth),
        ...fromPerformance(performance),
        ...fromSecurity(security),
        ...fromTechnicalDebt(technicalDebt)
    );

    return mergeCandidates(candidates)
        .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
}

function fromLargeFiles(files) {
    return files
        .filter((file) => file.lines > 250)
        .map((file) => ({
            id: `large-file:${file.path}`,
            target: file.path,
            targetType: "file",
            source: "code_scanner",
            priority: file.lines > 500 ? "high" : "medium",
            title: "Arquivo grande",
            reason: `O arquivo possui ${file.lines} linhas.`,
            impact: "Arquivos grandes aumentam risco de bugs e dificultam manutenção.",
            suggestedAction: "Dividir em services menores, helpers ou módulos especializados.",
            estimatedHours: file.lines > 500 ? 5 : 3,
            metadata: {
                lines: file.lines,
                imports: file.imports.length,
                exports: file.exports.length,
                module: file.module,
                type: file.type
            }
        }));
}

function fromHighImports(files) {
    return files
        .filter((file) => file.imports.length > 8)
        .map((file) => ({
            id: `high-imports:${file.path}`,
            target: file.path,
            targetType: "file",
            source: "code_scanner",
            priority: file.imports.length > 14 ? "high" : "medium",
            title: "Arquivo com muitos imports",
            reason: `O arquivo possui ${file.imports.length} imports.`,
            impact: "Muitos imports podem indicar acoplamento alto ou excesso de responsabilidade.",
            suggestedAction: "Reduzir dependências diretas e extrair responsabilidades.",
            estimatedHours: file.imports.length > 14 ? 5 : 3,
            metadata: {
                lines: file.lines,
                imports: file.imports.length,
                exports: file.exports.length,
                module: file.module,
                type: file.type
            }
        }));
}

function fromModuleHealth(moduleHealth) {
    return moduleHealth.modules
        .filter((module) => module.risk === "high" || module.risk === "medium")
        .map((module) => ({
            id: `module-health:${module.name}`,
            target: module.name,
            targetType: "module",
            source: "module_health",
            priority: module.risk === "high" ? "high" : "medium",
            title: "Módulo com risco arquitetural",
            reason: `Módulo possui ${module.totalFiles} arquivos, ${module.totalLines} linhas e ${module.totalImports} imports.`,
            impact: "Módulos grandes tendem a virar gargalos técnicos conforme o SaaS cresce.",
            suggestedAction: "Separar subdomínios internos, services e responsabilidades.",
            estimatedHours: module.risk === "high" ? 8 : 4,
            metadata: {
                score: module.score,
                risk: module.risk,
                totalFiles: module.totalFiles,
                totalLines: module.totalLines,
                totalImports: module.totalImports,
                types: module.types
            }
        }));
}

function fromPerformance(performance) {
    return performance.scan.findings
        .filter((finding) => finding.severity === "high" || finding.severity === "medium")
        .map((finding) => ({
            id: `performance:${finding.file || finding.module}:${finding.type}`,
            target: finding.file || finding.module || "unknown",
            targetType: finding.file ? "file" : "module",
            source: "performance",
            priority: finding.severity === "high" ? "high" : "medium",
            title: finding.title,
            reason: finding.description,
            impact: "Pode afetar manutenção, latência futura ou escalabilidade.",
            suggestedAction: finding.recommendation,
            estimatedHours: finding.severity === "high" ? 5 : 3,
            metadata: finding
        }));
}

function fromSecurity(security) {
    return [
        ...security.scan.findings.map((finding) => ({
            id: `security-scan:${finding.file || finding.type}:${finding.type}`,
            target: finding.file || finding.type,
            targetType: finding.file ? "file" : "system",
            source: "security",
            priority: mapSeverityToPriority(finding.severity),
            title: finding.title,
            reason: finding.description,
            impact: "Pode expor risco operacional ou risco de produção.",
            suggestedAction: finding.recommendation,
            estimatedHours: finding.severity === "critical" ? 6 : 3,
            metadata: finding
        })),
        ...security.routes.riskyRoutes.map((route) => ({
            id: `security-route:${route.method}:${route.path}`,
            target: `${route.method} ${route.path}`,
            targetType: "route",
            source: "security_routes",
            priority: mapSeverityToPriority(route.risk),
            title: "Rota sensível",
            reason: route.reasons.join(" | "),
            impact: "Rota sensível pode causar impacto se exposta sem autenticação/RBAC.",
            suggestedAction: route.recommendation,
            estimatedHours: route.risk === "critical" ? 4 : 2,
            metadata: route
        }))
    ];
}

function fromTechnicalDebt(technicalDebt) {
    return technicalDebt.debts
        .map((debt) => ({
            id: `technical-debt:${debt.id}`,
            target: debt.target,
            targetType: debt.type === "module_risk" ? "module" : "file",
            source: "technical_debt",
            priority: debt.priority,
            title: debt.title,
            reason: debt.description,
            impact: debt.impact,
            suggestedAction: debt.recommendation,
            estimatedHours: debt.estimatedHours,
            metadata: debt
        }));
}

function mergeCandidates(candidates) {
    const map = new Map();

    for (const candidate of candidates) {
        const key = `${candidate.targetType}:${candidate.target}`;

        if (!map.has(key)) {
            map.set(key, {
                ...candidate,
                sources: [candidate.source],
                reasons: [candidate.reason],
                suggestedActions: [candidate.suggestedAction]
            });

            continue;
        }

        const current = map.get(key);

        current.sources = [...new Set([...current.sources, candidate.source])];
        current.reasons.push(candidate.reason);
        current.suggestedActions.push(candidate.suggestedAction);
        current.priority = higherPriority(current.priority, candidate.priority);
        current.estimatedHours += candidate.estimatedHours;
    }

    return [...map.values()]
        .map((candidate) => ({
            ...candidate,
            reasons: [...new Set(candidate.reasons)],
            suggestedActions: [...new Set(candidate.suggestedActions)]
        }));
}

function getImmediateActions(candidates) {
    const criticalOrHigh = candidates.filter(
        (item) => item.priority === "critical" || item.priority === "high"
    );

    if (!criticalOrHigh.length) {
        return [
            "Nenhuma refatoração crítica imediata encontrada.",
            "Manter evolução planejada e monitorar crescimento dos módulos."
        ];
    }

    return criticalOrHigh
        .slice(0, 5)
        .map((item) => `Priorizar ${item.target}: ${item.title}.`);
}

function getRefactoringStrategy(candidates) {
    if (!candidates.length) {
        return {
            phase: "monitoring",
            strategy: "Nenhuma refatoração necessária agora. Continuar monitorando."
        };
    }

    const high = candidates.filter(
        (item) => item.priority === "critical" || item.priority === "high"
    );

    if (high.length) {
        return {
            phase: "pre_production_cleanup",
            strategy: "Antes de PostgreSQL/VPS, corrigir candidatos críticos e altos para reduzir risco de escala."
        };
    }

    return {
        phase: "controlled_growth",
        strategy: "Refatorar gradualmente durante evolução, sem bloquear a próxima fase."
    };
}

function getRecommendations(candidates) {
    const recommendations = [];

    if (!candidates.length) {
        return [
            "Nenhum candidato relevante de refatoração encontrado.",
            "Manter padrão atual de controllers, services, repositories e modules."
        ];
    }

    if (candidates.some((item) => item.targetType === "module")) {
        recommendations.push("Priorizar divisão de módulos grandes antes de adicionar novas features.");
    }

    if (candidates.some((item) => item.targetType === "route")) {
        recommendations.push("Proteger rotas sensíveis antes de expor a API em produção.");
    }

    if (candidates.some((item) => item.sources.includes("performance"))) {
        recommendations.push("Revisar arquivos que aparecem simultaneamente em performance e technical debt.");
    }

    recommendations.push("Executar refatorações pequenas e testáveis, uma por vez.");
    recommendations.push("Após cada refatoração, rodar scanner, module health, security e performance novamente.");

    return recommendations;
}

function mapSeverityToPriority(severity) {
    if (severity === "critical") return "critical";
    if (severity === "high") return "high";
    if (severity === "medium") return "medium";

    return "low";
}

function higherPriority(a, b) {
    return priorityWeight(a) <= priorityWeight(b) ? a : b;
}

function priorityWeight(priority) {
    const weights = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4
    };

    return weights[priority] || 5;
}