import { getFullHealthReview } from "./ai-monitor.service.js";
import { generateExecutiveReport } from "./ai-executive-report.service.js";
import { getProductionReadinessReport } from "./ai-production-readiness.service.js";
import { getSecurityFinalReport } from "./ai-security-report.service.js";
import { getPerformanceFinalReport } from "./ai-performance-report.service.js";
import { getRefactoringAdvisorReport } from "./ai-refactoring-advisor.service.js";
import { getReleaseAdvisorReport } from "./ai-release-advisor.service.js";
import { getModuleHealthReport } from "./ai-module-health.service.js";
import { getRoadmapAnalysis } from "./ai-roadmap.service.js";
import { getScannerSummary } from "./ai-code-scanner.service.js";

export function getFinalOverviewReport() {
    const health = getFullHealthReview();
    const executive = generateExecutiveReport();
    const production = getProductionReadinessReport();
    const security = getSecurityFinalReport();
    const performance = getPerformanceFinalReport();
    const refactoring = getRefactoringAdvisorReport();
    const release = getReleaseAdvisorReport();
    const moduleHealth = getModuleHealthReport();
    const roadmap = getRoadmapAnalysis();
    const scanner = getScannerSummary();

    const score = calculateFinalScore({
        executive,
        production,
        security,
        performance,
        release
    });

    return {
        type: "final_overview_report",
        generatedAt: new Date().toISOString(),
        score,
        status: getFinalStatus(score),
        summary: {
            executiveScore: executive.healthScore,
            productionScore: production.score,
            securityScore: security.score,
            performanceScore: performance.score,
            releaseScore: release.score,
            roadmapProgress: roadmap.progress,
            scannedFiles: scanner.totalFiles,
            scannedModules: scanner.totalModules,
            moduleHighRisk: moduleHealth.summary.highRisk,
            moduleMediumRisk: moduleHealth.summary.mediumRisk,
            refactoringCandidates: refactoring.summary.totalCandidates,
            refactoringHigh: refactoring.summary.high,
            refactoringCritical: refactoring.summary.critical
        },
        decisions: {
            nextRecommendedPhase: release.decision.nextRecommendedPhase,
            canStartPostgreSQL: release.decision.canStartPostgreSQL,
            canStartRedisBullMQ: release.decision.canStartRedisBullMQ,
            canStartDocker: release.decision.canStartDocker,
            canStartVps: release.decision.canStartVps,
            canStartLovable: release.decision.canStartLovable,
            reason: release.decision.reason
        },
        blockers: collectBlockers({
            production,
            security,
            performance,
            release
        }),
        warnings: collectWarnings({
            production,
            security,
            performance,
            refactoring,
            moduleHealth,
            release
        }),
        nextSteps: buildNextSteps(release),
        recommendations: buildRecommendations({
            score,
            release,
            security,
            performance,
            refactoring
        }),
        raw: {
            health,
            executive,
            production,
            security,
            performance,
            refactoring,
            release,
            moduleHealth,
            roadmap,
            scanner
        }
    };
}

function calculateFinalScore({
    executive,
    production,
    security,
    performance,
    release
}) {
    const score =
        executive.healthScore * 0.2 +
        production.score * 0.25 +
        security.score * 0.2 +
        performance.score * 0.15 +
        release.score * 0.2;

    return Math.round(score);
}

function getFinalStatus(score) {
    if (score >= 90) return "excellent";
    if (score >= 80) return "ready_to_advance";
    if (score >= 65) return "needs_cleanup";
    return "not_ready";
}

function collectBlockers({
    production,
    security,
    performance,
    release
}) {
    return [
        ...production.blockers.map((item) => `Production: ${formatItem(item)}`),
        ...security.blockers.map((item) => `Security: ${formatItem(item)}`),
        ...performance.blockers.map((item) => `Performance: ${formatItem(item)}`),
        ...release.blockers.map((item) => `Release: ${formatItem(item)}`)
    ];
}

function collectWarnings({
    production,
    security,
    performance,
    refactoring,
    moduleHealth,
    release
}) {
    const warnings = [];

    if (production.warnings.length) {
        warnings.push(`${production.warnings.length} warning(s) de produção.`);
    }

    if (security.score < 85) {
        warnings.push(`Segurança abaixo do ideal: ${security.score}%.`);
    }

    if (performance.score < 85) {
        warnings.push(`Performance abaixo do ideal: ${performance.score}%.`);
    }

    if (refactoring.summary.high > 0) {
        warnings.push(`${refactoring.summary.high} refatoração(ões) de alta prioridade.`);
    }

    if (moduleHealth.summary.highRisk > 0) {
        warnings.push(`${moduleHealth.summary.highRisk} módulo(s) de alto risco.`);
    }

    if (release.warnings.length) {
        warnings.push(...release.warnings);
    }

    if (!warnings.length) {
        warnings.push("Nenhum warning relevante encontrado.");
    }

    return [...new Set(warnings)];
}

function buildNextSteps(release) {
    return release.nextSteps || [
        "Rodar scanner.",
        "Reavaliar release advisor.",
        "Seguir próxima fase recomendada."
    ];
}

function buildRecommendations({
    score,
    release,
    security,
    performance,
    refactoring
}) {
    const recommendations = [];

    if (score >= 80) {
        recommendations.push("A IA Monitor está suficientemente madura para acompanhar a próxima fase.");
    } else {
        recommendations.push("Corrigir pontos principais antes de avançar para infraestrutura pesada.");
    }

    recommendations.push(`Próxima fase recomendada: ${release.decision.nextRecommendedPhase}.`);

    if (security.score < 85) {
        recommendations.push("Priorizar segurança antes de VPS pública.");
    }

    if (performance.score < 85) {
        recommendations.push("Revisar performance antes de escala.");
    }

    if (refactoring.summary.high > 0 || refactoring.summary.critical > 0) {
        recommendations.push("Executar refatorações pequenas antes de novas features grandes.");
    }

    recommendations.push("Depois deste painel, executar teste mecânico geral da IA Monitor.");

    return recommendations;
}

function formatItem(item) {
    if (typeof item === "string") return item;

    return item.label || item.detail || item.title || JSON.stringify(item);
}