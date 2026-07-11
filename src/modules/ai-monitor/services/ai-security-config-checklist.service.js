import {
    listScannedFiles
} from "./ai-code-scanner.service.js";

export function getSecurityConfigChecklist() {
    const files =
        normalizeFiles(
            listScannedFiles()
        );

    const context =
        buildSecurityContext(
            files
        );

    const checklist = [
        {
            key:
                "helmet",

            label:
                "Helmet ativo",

            status:
                context.hasHelmet
                    ? "passed"
                    : "pending",

            recommendation:
                context.hasHelmet
                    ? "Helmet foi identificado nos imports do projeto."
                    : "Adicionar helmet() no Express antes da produção."
        },

        {
            key:
                "cors",

            label:
                "CORS configurado",

            status:
                context.hasCors
                    ? "partial"
                    : "pending",

            recommendation:
                context.hasCors
                    ? "CORS foi identificado. Confirmar se as origens estão restritas em produção."
                    : "Adicionar e restringir CORS ao domínio do frontend."
        },

        {
            key:
                "rate_limit",

            label:
                "Rate limit",

            status:
                context.hasRateLimit
                    ? "passed"
                    : "pending",

            recommendation:
                context.hasRateLimit
                    ? "Biblioteca de rate limit identificada."
                    : "Adicionar rate limit em login, dispatch e rotas técnicas."
        },

        {
            key:
                "auth_required",

            label:
                "Módulo de autenticação",

            status:
                context.hasAuthModule
                    ? "passed"
                    : "pending",

            recommendation:
                context.hasAuthModule
                    ? "Módulo Auth identificado pelo scanner."
                    : "Implementar autenticação para rotas privadas."
        },

        {
            key:
                "rbac",

            label:
                "Módulo RBAC",

            status:
                context.hasRbacModule
                    ? "passed"
                    : "pending",

            recommendation:
                context.hasRbacModule
                    ? "Módulo RBAC identificado pelo scanner."
                    : "Implementar permissões por empresa, usuário e função."
        },

        {
            key:
                "audit_logs",

            label:
                "Audit logs",

            status:
                context.hasAuditLogs
                    ? "partial"
                    : "unknown",

            recommendation:
                context.hasAuditLogs
                    ? "Estrutura de auditoria identificada. Confirmar cobertura das ações sensíveis."
                    : "O scanner não conseguiu confirmar audit logs. Realizar revisão manual."
        },

        {
            key:
                "env_secrets",

            label:
                "Secrets em variáveis de ambiente",

            status:
                "unknown",

            recommendation:
                "O scanner estrutural não consegue garantir que todos os secrets estejam protegidos. Revisar manualmente .env, logs e configurações."
        },

        {
            key:
                "input_validation",

            label:
                "Validação de entrada",

            status:
                context.hasInputValidation
                    ? "partial"
                    : "unknown",

            recommendation:
                context.hasInputValidation
                    ? "Biblioteca ou estrutura de validação identificada. Confirmar cobertura dos endpoints."
                    : "O scanner não confirmou validação sistemática. Revisar POST, PUT e PATCH."
        },

        {
            key:
                "production_dashboard_lock",

            label:
                "Dashboards técnicos protegidos",

            status:
                "unknown",

            recommendation:
                "O scanner não consegue confirmar a presença de middlewares em todas as rotas técnicas. Validar manualmente autenticação e RBAC."
        }
    ];

    const summary =
        buildSummary(
            checklist
        );

    return {
        type:
            "security_config_checklist",

        generatedAt:
            new Date().toISOString(),

        score:
            calculateChecklistScore(
                summary
            ),

        status:
            getChecklistStatus(
                summary
            ),

        summary,

        blockers:
            checklist
                .filter(
                    (item) =>
                        item.status
                        === "pending"
                )
                .map(
                    (item) =>
                        item.label
                ),

        warnings:
            checklist
                .filter(
                    (item) =>
                        item.status
                        === "partial"
                        || item.status
                        === "unknown"
                )
                .map(
                    (item) =>
                        `${
                            item.label
                        }: ${
                            item.status
                        }`
                ),

        recommendations:
            buildRecommendations(
                checklist
            ),

        nextSteps:
            buildNextSteps(
                checklist
            ),

        checklist,

        detected: context
    };
}

function buildSecurityContext(files) {
    const modules =
        new Set(
            files
                .map(
                    (file) =>
                        file.module
                )
                .filter(Boolean)
        );

    const imports =
        files.flatMap(
            (file) =>
                file.imports
        )
            .map(
                normalizeText
            );

    const paths =
        files
            .map(
                (file) =>
                    normalizeText(
                        file.path
                    )
            );

    return {
        hasHelmet:
            imports.some(
                (item) =>
                    item === "helmet"
                    || item.includes("/helmet")
            ),

        hasCors:
            imports.some(
                (item) =>
                    item === "cors"
                    || item.includes("/cors")
            ),

        hasRateLimit:
            imports.some(
                (item) =>
                    item.includes(
                        "express-rate-limit"
                    )
                    || item.includes(
                        "rate-limit"
                    )
            ),

        hasAuthModule:
            modules.has("auth"),

        hasRbacModule:
            modules.has("rbac"),

        hasAuditLogs:
            paths.some(
                (item) =>
                    item.includes("audit")
            )
            || imports.some(
                (item) =>
                    item.includes("audit")
            ),

        hasInputValidation:
            imports.some(
                (item) =>
                    item.includes("zod")
                    || item.includes("joi")
                    || item.includes("yup")
                    || item.includes(
                        "express-validator"
                    )
            )
            || paths.some(
                (item) =>
                    item.includes(
                        "validation"
                    )
                    || item.includes(
                        "validator"
                    )
            )
    };
}

function buildSummary(checklist) {
    return {
        total:
            checklist.length,

        passed:
            countStatus(
                checklist,
                "passed"
            ),

        partial:
            countStatus(
                checklist,
                "partial"
            ),

        pending:
            countStatus(
                checklist,
                "pending"
            ),

        unknown:
            countStatus(
                checklist,
                "unknown"
            )
    };
}

function calculateChecklistScore(
    summary
) {
    const score =
        100
        - summary.pending * 12
        - summary.partial * 5
        - summary.unknown * 2;

    return clampScore(score);
}

function getChecklistStatus(summary) {
    if (summary.pending > 3) {
        return "security_configuration_incomplete";
    }

    if (
        summary.pending > 0
        || summary.partial > 0
    ) {
        return "security_configuration_partial";
    }

    if (summary.unknown > 0) {
        return "manual_validation_required";
    }

    return "security_configuration_ready";
}

function buildRecommendations(
    checklist
) {
    return uniqueStrings(
        checklist
            .filter(
                (item) =>
                    item.status
                    !== "passed"
            )
            .map(
                (item) =>
                    item.recommendation
            )
    );
}

function buildNextSteps(checklist) {
    const steps = [];

    if (
        checklist.some(
            (item) =>
                item.status
                === "pending"
        )
    ) {
        steps.push(
            "Implementar os itens pendentes do checklist."
        );
    }

    if (
        checklist.some(
            (item) =>
                item.status
                === "partial"
        )
    ) {
        steps.push(
            "Validar completamente os itens parcialmente implementados."
        );
    }

    if (
        checklist.some(
            (item) =>
                item.status
                === "unknown"
        )
    ) {
        steps.push(
            "Executar revisão manual dos itens que o scanner não consegue comprovar."
        );
    }

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

                imports:
                    toArray(
                        file?.imports
                    )
            })
        );
}

function countStatus(
    checklist,
    status
) {
    return checklist.filter(
        (item) =>
            item.status
            === status
    ).length;
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