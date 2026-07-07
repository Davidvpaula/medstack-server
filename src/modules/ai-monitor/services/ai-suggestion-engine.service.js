import {
    addKnowledge
} from "./ai-knowledge-base.service.js";

export function generateSuggestions(report) {
    const suggestions = [];

    analyzeRuntime(report, suggestions);
    analyzeQueue(report, suggestions);
    analyzeLogs(report, suggestions);

    return suggestions;
}

function analyzeRuntime(report, suggestions) {
    const runtime = report.runtime.runtime;

    if (!runtime.status.connected) {
        registerSuggestion(
            suggestions,
            "runtime",
            {
                severity: "high",
                title: "WhatsApp desconectado",
                description: "A instância não está conectada.",
                recommendation: "Verificar QR Code, sessão ou reconexão automática."
            }
        );
    }

    if (!runtime.socket.alive) {
        registerSuggestion(
            suggestions,
            "runtime",
            {
                severity: "critical",
                title: "Socket morto",
                description: "Socket não está ativo.",
                recommendation: "Reconstruir socket Baileys."
            }
        );
    }
}

function analyzeQueue(report, suggestions) {
    const queue = report.queue.summary;

    if (queue.deadLetter > 0) {
        registerSuggestion(
            suggestions,
            "queue",
            {
                severity: "high",
                title: "Dead Letter Queue",
                description: "Existem mensagens que falharam definitivamente.",
                recommendation: "Reprocessar ou investigar erro."
            }
        );
    }

    if (queue.pending > 20) {
        registerSuggestion(
            suggestions,
            "queue",
            {
                severity: "medium",
                title: "Fila crescendo",
                description: "Existem muitos jobs aguardando.",
                recommendation: "Adicionar mais Workers ou Redis."
            }
        );
    }
}

function analyzeLogs(report, suggestions) {
    const logs = report.logs.summary;

    if (logs.errors > 0) {
        registerSuggestion(
            suggestions,
            "logs",
            {
                severity: "high",
                title: "Erros recentes",
                description: "O Runtime registrou erros.",
                recommendation: "Abrir Runtime Logs."
            }
        );
    }

    if (logs.warnings > 10) {
        registerSuggestion(
            suggestions,
            "logs",
            {
                severity: "low",
                title: "Muitos avisos",
                description: "Quantidade elevada de warnings.",
                recommendation: "Revisar comportamento do sistema."
            }
        );
    }
}

function registerSuggestion(suggestions, type, suggestion) {
    suggestions.push(suggestion);

    addKnowledge({
        type,
        severity: suggestion.severity,
        title: suggestion.title,
        description: suggestion.description,
        recommendation: suggestion.recommendation
    });
}