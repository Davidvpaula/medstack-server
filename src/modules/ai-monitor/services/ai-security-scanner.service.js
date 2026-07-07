import {
    listScannedFiles,
    getScannerSummary
} from "./ai-code-scanner.service.js";

export function getSecurityScanReport() {
    const files = listScannedFiles();

    const findings = [
        ...findSecretRisks(files),
        ...findDangerousOperations(files),
        ...findAuthRisks(files),
        ...findPublicAdminRoutes(files)
    ];

    return {
        type: "security_scan_report",
        generatedAt: new Date().toISOString(),
        scannerSummary: getScannerSummary(),
        summary: {
            totalFindings: findings.length,
            critical: findings.filter((item) => item.severity === "critical").length,
            high: findings.filter((item) => item.severity === "high").length,
            medium: findings.filter((item) => item.severity === "medium").length,
            low: findings.filter((item) => item.severity === "low").length
        },
        findings,
        recommendations: generateSecurityRecommendations(findings)
    };
}

function findSecretRisks(files) {
    const findings = [];

    for (const file of files) {
        const path = String(file.path || "").toLowerCase();

        if (
            path.includes(".env") ||
            path.includes("secret") ||
            path.includes("token") ||
            path.includes("apikey") ||
            path.includes("api-key")
        ) {
            findings.push({
                severity: "high",
                type: "secret_exposure_risk",
                title: "Possível arquivo sensível",
                file: file.path,
                description: "O nome do arquivo sugere presença de secrets, tokens ou chaves.",
                recommendation: "Garantir que secrets estejam apenas em .env/variáveis de ambiente e nunca no frontend."
            });
        }
    }

    return findings;
}

function findDangerousOperations(files) {
    const findings = [];

    for (const file of files) {
        const exportsText = file.exports.join(" ").toLowerCase();
        const path = String(file.path || "").toLowerCase();

        if (
            exportsText.includes("delete") ||
            exportsText.includes("remove") ||
            exportsText.includes("clear") ||
            path.includes("delete") ||
            path.includes("remove") ||
            path.includes("clear")
        ) {
            findings.push({
                severity: "medium",
                type: "destructive_operation",
                title: "Operação destrutiva detectada",
                file: file.path,
                description: "O arquivo possui nome/export relacionado a delete, remove ou clear.",
                recommendation: "Garantir autenticação, RBAC, logs e confirmação antes de produção."
            });
        }
    }

    return findings;
}

function findAuthRisks(files) {
    const findings = [];

    const hasAuthModule = files.some((file) => file.module === "auth");
    const hasRbacModule = files.some((file) => file.module === "rbac");

    if (!hasAuthModule) {
        findings.push({
            severity: "high",
            type: "missing_auth_module",
            title: "Módulo Auth não encontrado",
            file: null,
            description: "O scanner não encontrou módulo auth.",
            recommendation: "Antes de produção, garantir autenticação JWT ou sessão segura."
        });
    }

    if (!hasRbacModule) {
        findings.push({
            severity: "medium",
            type: "missing_rbac_module",
            title: "Módulo RBAC não encontrado",
            file: null,
            description: "O scanner não encontrou módulo RBAC.",
            recommendation: "Antes de produção, garantir permissões por empresa, usuário e função."
        });
    }

    return findings;
}

function findPublicAdminRoutes(files) {
    const findings = [];

    const routeFiles = files.filter((file) => file.type === "route");

    for (const file of routeFiles) {
        const path = String(file.path || "").toLowerCase();

        if (
            path.includes("ai-monitor") ||
            path.includes("admin") ||
            path.includes("dashboard")
        ) {
            findings.push({
                severity: "medium",
                type: "admin_route_review",
                title: "Rota administrativa deve ser protegida",
                file: file.path,
                description: "Arquivo de rota parece expor recursos administrativos ou técnicos.",
                recommendation: "Adicionar autenticação e RBAC antes de produção externa."
            });
        }
    }

    return findings;
}

function generateSecurityRecommendations(findings) {
    const recommendations = [];

    if (!findings.length) {
        return [
            "Nenhum risco de segurança relevante encontrado pelo scanner atual.",
            "Manter revisão manual antes de produção."
        ];
    }

    if (findings.some((item) => item.type === "secret_exposure_risk")) {
        recommendations.push("Revisar secrets, tokens e variáveis de ambiente.");
    }

    if (findings.some((item) => item.type === "destructive_operation")) {
        recommendations.push("Proteger rotas destrutivas com autenticação, RBAC e logs.");
    }

    if (findings.some((item) => item.type === "missing_auth_module")) {
        recommendations.push("Finalizar autenticação antes de produção.");
    }

    recommendations.push("Antes da VPS, revisar CORS, Helmet, rate limit, logs e permissões.");

    return recommendations;
}