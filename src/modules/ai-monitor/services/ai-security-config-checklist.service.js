export function getSecurityConfigChecklist() {
    const checklist = [
        {
            key: "helmet",
            label: "Helmet ativo",
            status: "pending",
            recommendation: "Adicionar helmet() no app Express antes de produção."
        },
        {
            key: "cors",
            label: "CORS restrito",
            status: "pending",
            recommendation: "Restringir CORS ao domínio do frontend Lovable/VPS."
        },
        {
            key: "rate_limit",
            label: "Rate limit",
            status: "pending",
            recommendation: "Adicionar rate-limit em login, QR, dispatch e rotas técnicas."
        },
        {
            key: "auth_required",
            label: "Autenticação obrigatória",
            status: "partial",
            recommendation: "Garantir middleware auth em rotas privadas."
        },
        {
            key: "rbac",
            label: "RBAC",
            status: "partial",
            recommendation: "Separar permissões: owner, admin, atendente, técnico."
        },
        {
            key: "audit_logs",
            label: "Audit logs",
            status: "pending",
            recommendation: "Registrar usuário, rota, IP, payload seguro e timestamp em ações sensíveis."
        },
        {
            key: "env_secrets",
            label: "Secrets em .env",
            status: "partial",
            recommendation: "Nenhum secret deve aparecer no frontend ou em logs."
        },
        {
            key: "input_validation",
            label: "Validação de entrada",
            status: "partial",
            recommendation: "Adicionar validação em POST/PUT/PATCH com Zod ou validação manual."
        },
        {
            key: "production_dashboard_lock",
            label: "Dashboards técnicos protegidos",
            status: "pending",
            recommendation: "Bloquear AI Monitor, runtime e dashboards técnicos sem usuário admin."
        }
    ];

    return {
        type: "security_config_checklist",
        generatedAt: new Date().toISOString(),
        summary: {
            total: checklist.length,
            passed: checklist.filter((item) => item.status === "passed").length,
            partial: checklist.filter((item) => item.status === "partial").length,
            pending: checklist.filter((item) => item.status === "pending").length
        },
        checklist,
        recommendations: [
            "Antes da VPS, proteger todas as rotas técnicas.",
            "Antes do frontend público, restringir CORS.",
            "Antes de vender, ativar autenticação, RBAC e audit logs."
        ]
    };
}