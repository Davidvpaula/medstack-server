import {
    getSecurityScanReport
} from "./ai-security-scanner.service.js";

import {
    getSecurityRouteAnalysis
} from "./ai-security-route-analyzer.service.js";

import {
    getSecurityConfigChecklist
} from "./ai-security-config-checklist.service.js";

export function getSecurityFinalReport() {
    const scan = getSecurityScanReport();
    const routes = getSecurityRouteAnalysis();
    const config = getSecurityConfigChecklist();

    const score = calculateSecurityScore(scan, routes, config);

    return {
        type: "security_final_report",
        generatedAt: new Date().toISOString(),
        score,
        status: getSecurityStatus(score),
        scan,
        routes,
        config,
        blockers: getSecurityBlockers(scan, routes, config),
        recommendations: getFinalRecommendations(score, scan, routes, config)
    };
}

function calculateSecurityScore(scan, routes, config) {
    let score = 100;

    score -= scan.summary.critical * 20;
    score -= scan.summary.high * 12;
    score -= scan.summary.medium * 6;

    score -= routes.summary.critical * 15;
    score -= routes.summary.high * 10;
    score -= routes.summary.medium * 4;

    score -= config.summary.pending * 5;
    score -= config.summary.partial * 2;

    return Math.max(score, 0);
}

function getSecurityStatus(score) {
    if (score >= 90) {
        return "secure_for_beta";
    }

    if (score >= 75) {
        return "needs_minor_security_work";
    }

    if (score >= 55) {
        return "needs_security_work";
    }

    return "not_secure_for_production";
}

function getSecurityBlockers(scan, routes, config) {
    const blockers = [];

    if (scan.summary.critical > 0) {
        blockers.push("Existem achados críticos no scanner de segurança.");
    }

    if (routes.summary.critical > 0) {
        blockers.push("Existem rotas críticas que precisam de proteção.");
    }

    if (config.summary.pending > 4) {
        blockers.push("Muitos itens essenciais de segurança ainda estão pendentes.");
    }

    if (!blockers.length) {
        blockers.push("Nenhum blocker crítico de segurança identificado pelo scanner atual.");
    }

    return blockers;
}

function getFinalRecommendations(score) {
    const recommendations = [];

    if (score < 75) {
        recommendations.push("Não expor backend publicamente antes de corrigir segurança básica.");
    }

    recommendations.push("Implementar Helmet.");
    recommendations.push("Implementar CORS restrito.");
    recommendations.push("Implementar rate limit.");
    recommendations.push("Proteger dashboards técnicos com autenticação e RBAC.");
    recommendations.push("Adicionar audit logs para clear, restart, configure, delete e dispatch.");
    recommendations.push("Antes da VPS pública, revisar secrets e variáveis de ambiente.");

    return recommendations;
}