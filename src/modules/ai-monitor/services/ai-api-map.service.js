import fs from "fs";
import path from "path";

const SRC_PATH = path.resolve("src");

export function getApiMap() {
    const routeFiles = scanRouteFiles(SRC_PATH);

    const routes = routeFiles.flatMap((file) => extractRoutesFromFile(file));

    return {
        type: "api_map",
        generatedAt: new Date().toISOString(),
        summary: {
            routeFiles: routeFiles.length,
            totalRoutes: routes.length,
            get: routes.filter((route) => route.method === "GET").length,
            post: routes.filter((route) => route.method === "POST").length,
            put: routes.filter((route) => route.method === "PUT").length,
            patch: routes.filter((route) => route.method === "PATCH").length,
            delete: routes.filter((route) => route.method === "DELETE").length
        },
        routeFiles,
        routes,
        suggestions: generateApiSuggestions(routes)
    };
}

function scanRouteFiles(directory) {
    const result = [];

    if (!fs.existsSync(directory)) {
        return result;
    }

    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (shouldIgnore(fullPath)) {
            continue;
        }

        if (entry.isDirectory()) {
            result.push(...scanRouteFiles(fullPath));
            continue;
        }

        if (!entry.name.endsWith(".js")) {
            continue;
        }

        const normalized = fullPath.replaceAll("\\", "/");

        if (!normalized.includes("/routes/") && !normalized.endsWith("/src/routes/index.js")) {
            continue;
        }

        result.push({
            name: entry.name,
            path: fullPath,
            relativePath: path.relative(process.cwd(), fullPath),
            module: getModuleName(fullPath),
            content: fs.readFileSync(fullPath, "utf-8")
        });
    }

    return result;
}

function extractRoutesFromFile(file) {
    const routes = [];

    const regex = /router\.(get|post|put|patch|delete)\(\s*["'`](.*?)["'`]\s*,\s*([a-zA-Z0-9_]+)/g;

    let match;

    while ((match = regex.exec(file.content)) !== null) {
        routes.push({
            method: match[1].toUpperCase(),
            path: match[2],
            handler: match[3],
            module: file.module,
            file: file.relativePath
        });
    }

    return routes;
}

function getModuleName(filePath) {
    const normalized = filePath.replaceAll("\\", "/");
    const parts = normalized.split("/");
    const moduleIndex = parts.indexOf("modules");

    if (moduleIndex === -1) {
        return "root";
    }

    return parts[moduleIndex + 1] || "unknown";
}

function shouldIgnore(filePath) {
    return (
        filePath.includes("node_modules")
        || filePath.includes("sessions")
        || filePath.includes("logs")
        || filePath.includes("backups")
        || filePath.includes("uploads")
    );
}

function generateApiSuggestions(routes) {
    const suggestions = [];

    if (!routes.length) {
        suggestions.push({
            severity: "warning",
            title: "Nenhuma rota encontrada",
            description: "O scanner não encontrou rotas Express.",
            recommendation: "Verificar padrão dos arquivos de rota."
        });

        return suggestions;
    }

    const postRoutes = routes.filter((route) => route.method === "POST");
    const getRoutes = routes.filter((route) => route.method === "GET");

    if (postRoutes.length > getRoutes.length * 2) {
        suggestions.push({
            severity: "info",
            title: "Muitas rotas POST",
            description: "Existem muitas rotas de escrita em relação às rotas de leitura.",
            recommendation: "Validar autenticação, autorização e logs nas rotas POST."
        });
    }

    const publicRiskRoutes = routes.filter((route) =>
        route.path.includes("clear")
        || route.path.includes("restart")
        || route.path.includes("delete")
    );

    if (publicRiskRoutes.length) {
        suggestions.push({
            severity: "medium",
            title: "Rotas sensíveis encontradas",
            description: `${publicRiskRoutes.length} rota(s) sensíveis foram encontradas.`,
            recommendation: "Garantir autenticação e RBAC antes da produção."
        });
    }

    suggestions.push({
        severity: "info",
        title: "Mapa de API pronto para Lovable",
        description: "As rotas podem ser usadas para montar o frontend.",
        recommendation: "Gerar documentação simples para Login, Runtime, Inbox, Messages e Dispatch."
    });

    return suggestions;
}