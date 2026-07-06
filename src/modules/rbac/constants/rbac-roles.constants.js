export const ROLES = {
    OWNER: "owner",

    ADMIN: "admin",

    MANAGER: "manager",

    SUPERVISOR: "supervisor",

    OPERATOR: "operator",

    FINANCE: "finance",

    VIEWER: "viewer",

    API_USER: "api_user",

    AI_AGENT: "ai_agent"
};

export const ROLE_LABELS = {
    [ROLES.OWNER]: "Proprietário",
    [ROLES.ADMIN]: "Administrador",
    [ROLES.MANAGER]: "Gerente",
    [ROLES.SUPERVISOR]: "Supervisor",
    [ROLES.OPERATOR]: "Operador",
    [ROLES.FINANCE]: "Financeiro",
    [ROLES.VIEWER]: "Visualizador",
    [ROLES.API_USER]: "Usuário de API",
    [ROLES.AI_AGENT]: "Agente de IA"
};

export const ROLE_HIERARCHY = {
    [ROLES.OWNER]: 100,
    [ROLES.ADMIN]: 90,
    [ROLES.MANAGER]: 70,
    [ROLES.SUPERVISOR]: 60,
    [ROLES.OPERATOR]: 50,
    [ROLES.FINANCE]: 45,
    [ROLES.AI_AGENT]: 30,
    [ROLES.API_USER]: 25,
    [ROLES.VIEWER]: 10
};