import {
    getApiMap
} from "./ai-api-map.service.js";

export function getSecurityRouteAnalysis() {
    const apiMap = getApiMap();

    const routes = apiMap.routes || [];

    const riskyRoutes = routes
        .map((route) => ({
            ...route,
            risk: calculateRouteRisk(route),
            reasons: getRouteRiskReasons(route),
            recommendation: getRouteRecommendation(route)
        }))
        .filter((route) => route.risk !== "low");

    return {
        type: "security_route_analysis",
        generatedAt: new Date().toISOString(),
        summary: {
            totalRoutes: routes.length,
            riskyRoutes: riskyRoutes.length,
            critical: riskyRoutes.filter((route) => route.risk === "critical").length,
            high: riskyRoutes.filter((route) => route.risk === "high").length,
            medium: riskyRoutes.filter((route) => route.risk === "medium").length
        },
        riskyRoutes,
        recommendations: generateRecommendations(riskyRoutes)
    };
}

function calculateRouteRisk(route) {
    const path = String(route.path || "").toLowerCase();
    const method = String(route.method || "").toUpperCase();

    if (
        path.includes("clear") ||
        path.includes("delete") ||
        path.includes("remove")
    ) {
        return "critical";
    }

    if (
        path.includes("restart") ||
        path.includes("configure") ||
        path.includes("external-ai") ||
        path.includes("project-memory/clear")
    ) {
        return "high";
    }

    if (
        method === "POST" ||
        method === "PUT" ||
        method === "PATCH"
    ) {
        return "medium";
    }

    if (
        path.includes("dashboard") ||
        path.includes("admin") ||
        path.includes("monitor")
    ) {
        return "medium";
    }

    return "low";
}

function getRouteRiskReasons(route) {
    const reasons = [];

    const path = String(route.path || "").toLowerCase();
    const method = String(route.method || "").toUpperCase();

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        reasons.push("Rota altera estado ou executa ação.");
    }

    if (path.includes("clear")) {
        reasons.push("Rota pode limpar dados.");
    }

    if (path.includes("delete") || path.includes("remove")) {
        reasons.push("Rota pode remover dados.");
    }

    if (path.includes("restart")) {
        reasons.push("Rota pode reiniciar runtime/conexão.");
    }

    if (path.includes("configure")) {
        reasons.push("Rota altera configuração.");
    }

    if (path.includes("dashboard") || path.includes("monitor")) {
        reasons.push("Rota expõe painel técnico.");
    }

    if (!reasons.length) {
        reasons.push("Risco baixo identificado.");
    }

    return reasons;
}

function getRouteRecommendation(route) {
    const risk = calculateRouteRisk(route);

    if (risk === "critical") {
        return "Exigir autenticação, RBAC admin, auditoria e confirmação explícita.";
    }

    if (risk === "high") {
        return "Exigir autenticação, RBAC e logs de auditoria antes de produção.";
    }

    if (risk === "medium") {
        return "Proteger com autenticação e validar permissões por empresa.";
    }

    return "Manter monitoramento.";
}

function generateRecommendations(routes) {
    const recommendations = [];

    if (!routes.length) {
        return [
            "Nenhuma rota de risco relevante encontrada."
        ];
    }

    recommendations.push("Adicionar autenticação obrigatória nas rotas técnicas.");
    recommendations.push("Adicionar RBAC para rotas de monitoramento, clear, restart e configure.");
    recommendations.push("Adicionar logs de auditoria em ações POST sensíveis.");
    recommendations.push("Bloquear dashboards técnicos em produção pública.");

    return recommendations;
}