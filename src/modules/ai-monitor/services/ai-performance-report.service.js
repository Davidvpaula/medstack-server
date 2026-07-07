import {
    getPerformanceScanReport
} from "./ai-performance-scanner.service.js";

import {
    getProductionReadinessReport
} from "./ai-production-readiness.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

export function getPerformanceFinalReport() {
    const scan = getPerformanceScanReport();
    const production = getProductionReadinessReport();
    const technicalDebt = getTechnicalDebtReport();

    const score = calculatePerformanceScore(scan, production, technicalDebt);

    return {
        type: "performance_final_report",
        generatedAt: new Date().toISOString(),
        score,
        status: getPerformanceStatus(score),
        scan,
        productionSummary: {
            score: production.score,
            status: production.status,
            warnings: production.warnings.length,
            blockers: production.blockers.length
        },
        technicalDebtSummary: technicalDebt.summary,
        blockers: getPerformanceBlockers(scan, production),
        recommendations: getFinalRecommendations(score, scan)
    };
}

function calculatePerformanceScore(scan, production, technicalDebt) {
    let score = 100;

    score -= scan.summary.high * 12;
    score -= scan.summary.medium * 6;
    score -= scan.summary.low * 2;

    if (production.score < 70) {
        score -= 10;
    }

    if (technicalDebt.summary.high > 0) {
        score -= technicalDebt.summary.high * 4;
    }

    if (technicalDebt.summary.critical > 0) {
        score -= technicalDebt.summary.critical * 8;
    }

    return Math.max(score, 0);
}

function getPerformanceStatus(score) {
    if (score >= 90) {
        return "excellent";
    }

    if (score >= 75) {
        return "good";
    }

    if (score >= 55) {
        return "needs_attention";
    }

    return "performance_risk";
}

function getPerformanceBlockers(scan, production) {
    const blockers = [];

    if (scan.summary.high > 3) {
        blockers.push("Muitos achados de alta severidade relacionados à performance.");
    }

    if (production.blockers.length > 0) {
        blockers.push("Existem blockers de produção que impactam estabilidade/performance.");
    }

    if (!blockers.length) {
        blockers.push("Nenhum blocker crítico de performance identificado pelo scanner atual.");
    }

    return blockers;
}

function getFinalRecommendations(score, scan) {
    const recommendations = [];

    if (score < 75) {
        recommendations.push("Revisar arquivos e módulos pesados antes de produção externa.");
    }

    if (scan.summary.high > 0) {
        recommendations.push("Priorizar achados de alta severidade antes de escalar.");
    }

    recommendations.push("Planejar Redis/BullMQ para filas.");
    recommendations.push("Separar workers do processo principal antes de escala.");
    recommendations.push("Adicionar métricas reais de latência na VPS.");
    recommendations.push("Adicionar logs de duração por endpoint crítico.");

    return recommendations;
}