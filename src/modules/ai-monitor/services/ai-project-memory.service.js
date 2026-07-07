const memories = [];

const MAX_MEMORIES = 500;

export function addProjectMemory(data = {}) {
    const memory = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: data.type || "architecture_decision",
        title: data.title || "",
        description: data.description || "",
        reason: data.reason || "",
        impact: data.impact || "",
        alternatives: data.alternatives || [],
        relatedModules: data.relatedModules || [],
        createdAt: new Date().toISOString()
    };

    memories.unshift(memory);

    if (memories.length > MAX_MEMORIES) {
        memories.length = MAX_MEMORIES;
    }

    return memory;
}

export function listProjectMemories() {
    return memories;
}

export function getProjectMemorySummary() {
    return {
        total: memories.length,
        architectureDecisions: memories.filter(
            (item) => item.type === "architecture_decision"
        ).length,
        technicalDecisions: memories.filter(
            (item) => item.type === "technical_decision"
        ).length,
        businessDecisions: memories.filter(
            (item) => item.type === "business_decision"
        ).length,
        risks: memories.filter(
            (item) => item.type === "risk"
        ).length
    };
}

export function clearProjectMemories() {
    memories.length = 0;

    return {
        cleared: true
    };
}

export function seedInitialProjectMemories() {
    if (memories.length > 0) {
        return {
            seeded: false,
            reason: "Memórias já existem."
        };
    }

    addProjectMemory({
        type: "architecture_decision",
        title: "Lovable será apenas frontend",
        description: "O Lovable consumirá APIs do backend, sem concentrar regras críticas.",
        reason: "Evitar acoplamento e manter backend como fonte de verdade.",
        impact: "Facilita migração futura, segurança e escalabilidade.",
        alternatives: ["Colocar lógica crítica no frontend", "Usar Lovable como backend principal"],
        relatedModules: ["auth", "company", "whatsapp", "inbox", "message"]
    });

    addProjectMemory({
        type: "architecture_decision",
        title: "WhatsApp Runtime separado",
        description: "O módulo WhatsApp possui runtime, socket, health, QR, dispatcher e worker separados.",
        reason: "Permitir estabilidade, reconexão, monitoramento e futura multi-instância.",
        impact: "Base preparada para múltiplas empresas e múltiplas conexões.",
        alternatives: ["Enviar mensagens diretamente sem runtime", "Usar apenas endpoint simples de envio"],
        relatedModules: ["whatsapp"]
    });

    addProjectMemory({
        type: "technical_decision",
        title: "AI Monitor somente leitura",
        description: "A IA monitora, analisa e sugere, mas nunca altera código automaticamente.",
        reason: "Manter segurança operacional e controle humano.",
        impact: "Permite evolução assistida sem risco de mudanças automáticas.",
        alternatives: ["IA alterando arquivos automaticamente", "IA executando comandos"],
        relatedModules: ["ai-monitor"]
    });

    addProjectMemory({
        type: "technical_decision",
        title: "Fila em memória antes de Redis/BullMQ",
        description: "Durante o desenvolvimento, a fila usa memória; em produção robusta migrará para Redis/BullMQ.",
        reason: "Acelerar desenvolvimento mantendo arquitetura compatível com fila real.",
        impact: "Permite MVP rápido sem bloquear futura escalabilidade.",
        alternatives: ["Começar direto com BullMQ", "Não usar fila"],
        relatedModules: ["whatsapp", "dispatcher", "queue", "worker"]
    });

    addProjectMemory({
        type: "risk",
        title: "Produção em escala exige persistência real",
        description: "Para muitas empresas, será necessário PostgreSQL, Redis, BullMQ, Docker e workers separados.",
        reason: "Memória local não é adequada para escala, reinício e múltiplos processos.",
        impact: "Antes de 100 empresas, infraestrutura precisa evoluir.",
        alternatives: ["Manter tudo em memória", "Usar apenas arquivos JSON"],
        relatedModules: ["database", "queue", "worker", "production"]
    });

    return {
        seeded: true,
        total: memories.length
    };
}