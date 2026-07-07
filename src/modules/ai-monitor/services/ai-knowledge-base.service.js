const knowledge = [];

const MAX_KNOWLEDGE_ITEMS = 1000;

export function addKnowledge(entry = {}) {
    const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: entry.type || "general",
        severity: entry.severity || "info",
        title: entry.title || "",
        description: entry.description || "",
        recommendation: entry.recommendation || "",
        metadata: entry.metadata || {},
        createdAt: new Date().toISOString()
    };

    knowledge.unshift(item);

    if (knowledge.length > MAX_KNOWLEDGE_ITEMS) {
        knowledge.length = MAX_KNOWLEDGE_ITEMS;
    }

    return item;
}

export function listKnowledge() {
    return knowledge;
}

export function getKnowledgeSummary() {
    return {
        total: knowledge.length,
        critical: knowledge.filter((item) => item.severity === "critical").length,
        high: knowledge.filter((item) => item.severity === "high").length,
        medium: knowledge.filter((item) => item.severity === "medium").length,
        low: knowledge.filter((item) => item.severity === "low").length,
        info: knowledge.filter((item) => item.severity === "info").length
    };
}

export function clearKnowledge() {
    knowledge.length = 0;

    return {
        cleared: true
    };
}