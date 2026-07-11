import {
    getApiMap
} from "./ai-api-map.service.js";

export function getSecurityRouteAnalysis() {
    const apiMap =
        safeObject(
            getApiMap()
        );

    const routes =
        toArray(
            apiMap.routes
        )
            .map(
                normalizeRoute
            );

    const analyzedRoutes =
        routes.map(
            (route) => {
                const risk =
                    calculateRouteRisk(
                        route
                    );

                return {
                    ...route,

                    risk,

                    reasons:
                        getRouteRiskReasons(
                            route
                        ),

                    recommendation:
                        getRouteRecommendation(
                            risk
                        )
                };
            }
        );

    const riskyRoutes =
        analyzedRoutes.filter(
            (route) =>
                route.risk
                !== "low"
        );

    const summary = {
        totalRoutes:
            routes.length,

        riskyRoutes:
            riskyRoutes.length,

        critical:
            countRisk(
                riskyRoutes,
                "critical"
            ),

        high:
            countRisk(
                riskyRoutes,
                "high"
            ),

        medium:
            countRisk(
                riskyRoutes,
                "medium"
            ),

        low:
            countRisk(
                analyzedRoutes,
                "low"
            )
    };

    return {
        type:
            "security_route_analysis",

        generatedAt:
            new Date().toISOString(),

        score:
            calculateRouteScore(
                summary
            ),

        status:
            getRouteAnalysisStatus(
                summary
            ),

        summary,

        blockers:
            buildRouteBlockers(
                riskyRoutes
            ),

        warnings:
            buildRouteWarnings(
                riskyRoutes
            ),

        recommendations:
            generateRecommendations(
                riskyRoutes
            ),

        nextSteps:
            buildRouteNextSteps(
                riskyRoutes
            ),

        riskyRoutes
    };
}

function calculateRouteRisk(route) {
    const routePath =
        normalizeText(
            route.path
        );

    const method =
        String(
            route.method || ""
        ).toUpperCase();

    const destructivePath =
        includesAny(
            routePath,
            [
                "clear",
                "delete",
                "remove",
                "destroy",
                "reset"
            ]
        );

    if (destructivePath) {
        return "critical";
    }

    const privilegedPath =
        includesAny(
            routePath,
            [
                "restart",
                "configure",
                "external-ai",
                "project-memory/clear",
                "knowledge/clear",
                "scanner/register"
            ]
        );

    if (privilegedPath) {
        return "high";
    }

    const technicalPath =
        includesAny(
            routePath,
            [
                "dashboard",
                "admin",
                "monitor",
                "diagnostic",
                "database",
                "system"
            ]
        );

    const changesState =
        [
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ].includes(method);

    if (
        technicalPath
        && changesState
    ) {
        return "high";
    }

    if (
        technicalPath
        || changesState
    ) {
        return "medium";
    }

    return "low";
}

function getRouteRiskReasons(route) {
    const reasons = [];

    const routePath =
        normalizeText(
            route.path
        );

    const method =
        String(
            route.method || ""
        ).toUpperCase();

    if (
        [
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ].includes(method)
    ) {
        reasons.push(
            "Rota altera estado ou executa uma ação."
        );
    }

    if (
        includesAny(
            routePath,
            [
                "clear",
                "delete",
                "remove",
                "destroy",
                "reset"
            ]
        )
    ) {
        reasons.push(
            "Rota pode remover ou limpar dados."
        );
    }

    if (
        routePath.includes(
            "restart"
        )
    ) {
        reasons.push(
            "Rota pode reiniciar runtime ou conexão."
        );
    }

    if (
        routePath.includes(
            "configure"
        )
    ) {
        reasons.push(
            "Rota pode alterar configurações."
        );
    }

    if (
        includesAny(
            routePath,
            [
                "dashboard",
                "monitor",
                "admin",
                "system",
                "database"
            ]
        )
    ) {
        reasons.push(
            "Rota expõe dados técnicos ou administrativos."
        );
    }

    if (!reasons.length) {
        reasons.push(
            "Nenhum risco estrutural relevante identificado."
        );
    }

    return reasons;
}

function getRouteRecommendation(risk) {
    if (risk === "critical") {
        return "Exigir autenticação, RBAC administrativo, auditoria e confirmação explícita.";
    }

    if (risk === "high") {
        return "Exigir autenticação, RBAC e audit logs antes da produção.";
    }

    if (risk === "medium") {
        return "Validar autenticação, autorização e isolamento por empresa.";
    }

    return "Manter monitoramento.";
}

function calculateRouteScore(summary) {
    const rawPenalty =
        summary.critical * 12
        + summary.high * 5
        + summary.medium;

    const penalty =
        Math.min(
            rawPenalty,
            70
        );

    return clampScore(
        100 - penalty
    );
}

function getRouteAnalysisStatus(
    summary
) {
    if (summary.critical > 0) {
        return "critical_routes_found";
    }

    if (summary.high > 0) {
        return "high_risk_routes_found";
    }

    if (summary.medium > 0) {
        return "route_review_required";
    }

    return "routes_structurally_safe";
}

function buildRouteBlockers(routes) {
    return routes
        .filter(
            (route) =>
                route.risk
                === "critical"
        )
        .map(
            (route) =>
                `${
                    route.method
                } ${
                    route.path
                }`
        );
}

function buildRouteWarnings(routes) {
    return routes
        .filter(
            (route) =>
                route.risk === "high"
                || route.risk === "medium"
        )
        .map(
            (route) =>
                `${
                    route.risk
                }: ${
                    route.method
                } ${
                    route.path
                }`
        );
}

function generateRecommendations(routes) {
    if (!routes.length) {
        return [
            "Nenhuma rota de risco relevante foi encontrada."
        ];
    }

    return [
        "Adicionar autenticação obrigatória nas rotas técnicas.",
        "Adicionar RBAC para rotas administrativas e destrutivas.",
        "Adicionar audit logs para ações sensíveis.",
        "Bloquear dashboards técnicos para usuários sem permissão administrativa."
    ];
}

function buildRouteNextSteps(routes) {
    const steps = [];

    if (
        routes.some(
            (route) =>
                route.risk
                === "critical"
        )
    ) {
        steps.push(
            "Revisar imediatamente as rotas críticas."
        );
    }

    if (
        routes.some(
            (route) =>
                route.risk
                === "high"
        )
    ) {
        steps.push(
            "Validar autenticação e RBAC das rotas de alto risco."
        );
    }

    steps.push(
        "Testar permissões das rotas com usuário não autenticado."
    );

    return uniqueStrings(
        steps
    );
}

function normalizeRoute(route) {
    const source =
        safeObject(route);

    return {
        ...source,

        method:
            String(
                source.method
                || "GET"
            ).toUpperCase(),

        path:
            String(
                source.path
                || ""
            ),

        module:
            String(
                source.module
                || "unknown"
            )
    };
}

function countRisk(
    routes,
    risk
) {
    return routes.filter(
        (route) =>
            route.risk
            === risk
    ).length;
}

function includesAny(
    value,
    terms
) {
    return terms.some(
        (term) =>
            value.includes(term)
    );
}

function normalizeText(value) {
    return String(
        value || ""
    ).toLowerCase();
}

function safeObject(value) {
    return (
        value
        && typeof value === "object"
        && !Array.isArray(value)
    )
        ? value
        : {};
}

function toArray(value) {
    return Array.isArray(value)
        ? value
        : [];
}

function uniqueStrings(items) {
    return [
        ...new Set(
            toArray(items)
                .filter(Boolean)
                .map(String)
        )
    ];
}

function clampScore(value) {
    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        Math.min(
            Math.round(number),
            100
        ),
        0
    );
}