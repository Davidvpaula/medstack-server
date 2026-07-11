import {
    listScannedFiles,
    getScannerSummary
} from "./ai-code-scanner.service.js";

export function getSecurityScanReport() {
    const files =
        normalizeFiles(
            listScannedFiles()
        );

    const findings = [
        ...findSecretRisks(files),
        ...findDangerousOperations(files),
        ...findAuthRisks(files),
        ...findPublicAdminRoutes(files)
    ];

    const summary =
        buildSummary(
            findings
        );

    const blockers =
        buildBlockers(
            findings
        );

    const warnings =
        buildWarnings(
            findings
        );

    const recommendations =
        generateSecurityRecommendations(
            findings
        );

    return {
        type:
            "security_scan_report",

        generatedAt:
            new Date().toISOString(),

        score:
            calculateScannerScore(
                summary
            ),

        status:
            getScannerStatus(
                summary
            ),

        scannerSummary:
            getScannerSummary(),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps:
            buildNextSteps(
                findings
            ),

        findings
    };
}

function findSecretRisks(files) {
    const findings = [];

    for (const file of files) {
        const normalizedPath =
            normalizeText(
                file.path
            );

        const fileName =
            normalizeText(
                file.metadata.fileName
            );

        const looksSensitive =
            normalizedPath.includes(".env")
            || fileName.includes(".env")
            || fileName.includes("secret")
            || fileName.includes("apikey")
            || fileName.includes("api-key")
            || fileName.includes("credential");

        if (!looksSensitive) {
            continue;
        }

        findings.push({
            severity:
                "high",

            type:
                "secret_exposure_risk",

            title:
                "Possível arquivo sensível",

            file:
                file.path,

            description:
                "O nome do arquivo sugere presença de credenciais, secrets ou chaves.",

            recommendation:
                "Garantir que credenciais estejam apenas em variáveis de ambiente e nunca sejam versionadas."
        });
    }

    return findings;
}

function findDangerousOperations(files) {
    const findings = [];

    for (const file of files) {
        const exportsText =
            file.exports
                .join(" ")
                .toLowerCase();

        const normalizedPath =
            normalizeText(
                file.path
            );

        const hasDestructiveExport =
            exportsText.includes("delete")
            || exportsText.includes("remove")
            || exportsText.includes("clear")
            || exportsText.includes("destroy")
            || exportsText.includes("reset");

        const hasDestructivePath =
            normalizedPath.includes("delete")
            || normalizedPath.includes("remove")
            || normalizedPath.includes("clear")
            || normalizedPath.includes("destroy")
            || normalizedPath.includes("reset");

        if (
            !hasDestructiveExport
            && !hasDestructivePath
        ) {
            continue;
        }

        findings.push({
            severity:
                file.type === "controller"
                || file.type === "route"
                    ? "high"
                    : "medium",

            type:
                "destructive_operation",

            title:
                "Operação destrutiva detectada",

            file:
                file.path,

            description:
                "O arquivo possui nome ou export relacionado a remoção, limpeza ou reinicialização de dados.",

            recommendation:
                "Garantir autenticação, RBAC, auditoria e confirmação explícita para operações destrutivas."
        });
    }

    return findings;
}

function findAuthRisks(files) {
    const findings = [];

    const modules =
        new Set(
            files
                .map(
                    (file) =>
                        file.module
                )
                .filter(Boolean)
        );

    const hasAuthModule =
        modules.has("auth");

    const hasRbacModule =
        modules.has("rbac");

    if (!hasAuthModule) {
        findings.push({
            severity:
                "high",

            type:
                "missing_auth_module",

            title:
                "Módulo Auth não encontrado",

            file:
                null,

            description:
                "O scanner não encontrou o módulo de autenticação.",

            recommendation:
                "Implementar autenticação antes da exposição pública."
        });
    }

    if (!hasRbacModule) {
        findings.push({
            severity:
                "high",

            type:
                "missing_rbac_module",

            title:
                "Módulo RBAC não encontrado",

            file:
                null,

            description:
                "O scanner não encontrou o módulo de controle de permissões.",

            recommendation:
                "Implementar permissões por empresa, usuário e função."
        });
    }

    return findings;
}

function findPublicAdminRoutes(files) {
    const findings = [];

    const routeFiles =
        files.filter(
            (file) =>
                file.type === "route"
        );

    for (const file of routeFiles) {
        const normalizedPath =
            normalizeText(
                file.path
            );

        const isTechnicalRoute =
            normalizedPath.includes("ai-monitor")
            || normalizedPath.includes("admin")
            || normalizedPath.includes("system")
            || normalizedPath.includes("database");

        if (!isTechnicalRoute) {
            continue;
        }

        findings.push({
            severity:
                "medium",

            type:
                "admin_route_review",

            title:
                "Rota técnica deve ser protegida",

            file:
                file.path,

            description:
                "O arquivo expõe rotas administrativas, técnicas ou de diagnóstico.",

            recommendation:
                "Exigir autenticação e RBAC administrativo antes da produção pública."
        });
    }

    return findings;
}

function buildSummary(findings) {
    return {
        totalFindings:
            findings.length,

        critical:
            countSeverity(
                findings,
                "critical"
            ),

        high:
            countSeverity(
                findings,
                "high"
            ),

        medium:
            countSeverity(
                findings,
                "medium"
            ),

        low:
            countSeverity(
                findings,
                "low"
            )
    };
}

function calculateScannerScore(
    summary
) {
    const rawPenalty =
        summary.critical * 25
        + summary.high * 10
        + summary.medium * 3
        + summary.low;

    const penalty =
        Math.min(
            rawPenalty,
            70
        );

    return clampScore(
        100 - penalty
    );
}

function getScannerStatus(summary) {
    if (summary.critical > 0) {
        return "critical_findings";
    }

    if (summary.high > 0) {
        return "high_risk_findings";
    }

    if (summary.medium > 0) {
        return "review_required";
    }

    return "no_relevant_findings";
}

function buildBlockers(findings) {
    return findings
        .filter(
            (finding) =>
                finding.severity
                === "critical"
        )
        .map(
            (finding) =>
                finding.title
        );
}

function buildWarnings(findings) {
    return findings
        .filter(
            (finding) =>
                finding.severity
                === "high"
                || finding.severity
                === "medium"
        )
        .map(
            (finding) =>
                `${finding.title}: ${
                    finding.file || "projeto"
                }`
        );
}

function generateSecurityRecommendations(
    findings
) {
    const recommendations = [];

    if (!findings.length) {
        return [
            "Nenhum risco estrutural relevante foi encontrado pelo scanner atual.",
            "Manter revisão manual e testes de segurança antes da produção."
        ];
    }

    if (
        findings.some(
            (item) =>
                item.type
                === "secret_exposure_risk"
        )
    ) {
        recommendations.push(
            "Revisar secrets, tokens, credenciais e variáveis de ambiente."
        );
    }

    if (
        findings.some(
            (item) =>
                item.type
                === "destructive_operation"
        )
    ) {
        recommendations.push(
            "Proteger operações destrutivas com autenticação, RBAC, confirmação e audit logs."
        );
    }

    if (
        findings.some(
            (item) =>
                item.type
                === "admin_route_review"
        )
    ) {
        recommendations.push(
            "Proteger rotas técnicas e administrativas antes da VPS pública."
        );
    }

    recommendations.push(
        "Revisar CORS, Helmet, rate limit, validação de entrada e auditoria."
    );

    return uniqueStrings(
        recommendations
    );
}

function buildNextSteps(findings) {
    const steps = [];

    if (
        findings.some(
            (item) =>
                item.severity
                === "critical"
        )
    ) {
        steps.push(
            "Corrigir todos os achados críticos."
        );
    }

    if (
        findings.some(
            (item) =>
                item.severity
                === "high"
        )
    ) {
        steps.push(
            "Revisar os achados de alta severidade."
        );
    }

    steps.push(
        "Executar novamente o scanner após as correções."
    );

    steps.push(
        "Validar manualmente autenticação e permissões das rotas técnicas."
    );

    return uniqueStrings(
        steps
    );
}

function normalizeFiles(files) {
    return toArray(files)
        .map(
            (file) => ({
                ...safeObject(file),

                path:
                    String(
                        file?.path || ""
                    ),

                module:
                    String(
                        file?.module || ""
                    ),

                type:
                    String(
                        file?.type || "unknown"
                    ),

                imports:
                    toArray(
                        file?.imports
                    ),

                exports:
                    toArray(
                        file?.exports
                    ),

                metadata:
                    safeObject(
                        file?.metadata
                    )
            })
        );
}

function countSeverity(
    findings,
    severity
) {
    return findings.filter(
        (item) =>
            item.severity
            === severity
    ).length;
}

function normalizeText(value) {
    return String(
        value || ""
    )
        .replaceAll(
            "\\",
            "/"
        )
        .toLowerCase();
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