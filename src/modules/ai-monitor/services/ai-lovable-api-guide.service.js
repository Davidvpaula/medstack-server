import {
    getApiMap
} from "./ai-api-map.service.js";

export function getLovableApiGuide() {
    const apiMap = getApiMap();

    return {
        type: "lovable_api_guide",
        generatedAt: new Date().toISOString(),
        baseUrl: "http://localhost:3000",
        frontendGoal: "Construir frontend Lovable para login, QR, inbox, conversa e envio.",
        recommendedPages: getRecommendedPages(),
        apiGroups: getApiGroups(apiMap.routes),
        implementationFlow: getImplementationFlow(),
        securityNotes: getSecurityNotes()
    };
}

function getRecommendedPages() {
    return [
        {
            page: "/login",
            objective: "Autenticar usuário e salvar token."
        },
        {
            page: "/dashboard",
            objective: "Mostrar status geral da empresa e WhatsApp."
        },
        {
            page: "/whatsapp",
            objective: "Mostrar conexão, QR Code e runtime."
        },
        {
            page: "/inbox",
            objective: "Listar conversas da empresa."
        },
        {
            page: "/inbox/:conversationId",
            objective: "Mostrar mensagens e enviar respostas."
        },
        {
            page: "/ai-monitor",
            objective: "Mostrar saúde técnica do backend."
        }
    ];
}

function getApiGroups(routes) {
    return {
        auth: routes.filter((route) => route.module === "auth"),
        company: routes.filter((route) => route.module === "company"),
        whatsapp: routes.filter((route) => route.module === "whatsapp"),
        inbox: routes.filter((route) => route.module === "inbox"),
        message: routes.filter((route) => route.module === "message"),
        contact: routes.filter((route) => route.module === "contact"),
        conversation: routes.filter((route) => route.module === "conversation"),
        aiMonitor: routes.filter((route) => route.module === "ai-monitor")
    };
}

function getImplementationFlow() {
    return [
        "Criar tela de login.",
        "Salvar accessToken no localStorage.",
        "Buscar dados da empresa após login.",
        "Abrir /whatsapp/runtime para verificar conexão.",
        "Se disconnected ou waiting_qr, mostrar QR Code.",
        "Se connected, abrir Inbox.",
        "Listar conversas com /inbox/company/:companyId.",
        "Abrir conversa e carregar mensagens.",
        "Enviar resposta usando POST /whatsapp/dispatch.",
        "Atualizar mensagens por polling a cada 2–5 segundos."
    ];
}

function getSecurityNotes() {
    return [
        "Nunca expor secrets no Lovable.",
        "Sempre enviar Authorization Bearer token nas rotas protegidas.",
        "Rotas de restart, clear, delete e monitor devem exigir admin em produção.",
        "Antes de produção, revisar RBAC para cada endpoint sensível."
    ];
}