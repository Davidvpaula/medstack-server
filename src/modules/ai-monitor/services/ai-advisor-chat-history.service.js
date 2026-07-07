const history = [];

const MAX_HISTORY_ITEMS = 100;

export function addAdvisorChatHistory(entry = {}) {
    const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        question: entry.question || "",
        answer: entry.answer || [],
        contextSummary: entry.contextSummary || {},
        mode: entry.mode || "local_rule_based",
        safety: entry.safety || {},
        createdAt: new Date().toISOString()
    };

    history.unshift(item);

    if (history.length > MAX_HISTORY_ITEMS) {
        history.length = MAX_HISTORY_ITEMS;
    }

    return item;
}

export function listAdvisorChatHistory() {
    return history;
}

export function clearAdvisorChatHistory() {
    history.length = 0;

    return {
        cleared: true
    };
}