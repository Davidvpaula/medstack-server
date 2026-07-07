import { getWhatsappRuntime } from "../../whatsapp/services/whatsapp-runtime.service.js";

import {
    listWhatsAppDispatchQueue
} from "../../whatsapp/services/whatsapp-dispatcher.service.js";

import {
    getRecentRuntimeLogs
} from "../../whatsapp/services/whatsapp-runtime-log.service.js";

import {
    generateSuggestions
} from "./ai-suggestion-engine.service.js";

export function getAiMonitorStatus() {
    return {
        module: "ai-monitor",
        status: "active",
        mode: "read_only",
        canModifyCode: false,
        canDeploy: false,
        canDeleteData: false
    };
}

export function getRuntimeReview() {
    const runtime = getWhatsappRuntime();

    const suggestions = [];

    if (!runtime.status.connected) {
        suggestions.push("WhatsApp está desconectado. Verificar QR Code, sessão ou conexão.");
    }

    if (!runtime.socket.alive) {
        suggestions.push("Socket não está ativo. Verificar lifecycle do Baileys.");
    }

    if (runtime.dispatcher.failed > 0) {
        suggestions.push("Existem jobs com falha. Verificar Dead Letter Queue.");
    }

    if (runtime.dispatcher.pending > 10) {
        suggestions.push("Fila com muitos jobs pendentes. Avaliar Redis/BullMQ ou mais workers.");
    }

    if (!runtime.monitor.active) {
        suggestions.push("Health Monitor não está ativo.");
    }

    return {
        type: "runtime_review",
        generatedAt: new Date().toISOString(),
        runtime,
        suggestions
    };
}

export function getQueueReview() {
    const queue = listWhatsAppDispatchQueue();

    const pendingCount = queue.pending.length;
    const processingCount = queue.processing.length;
    const historyCount = queue.history.length;
    const deadLetterCount = queue.deadLetter.length;

    const suggestions = [];

    if (pendingCount > 0) {
        suggestions.push("Existem mensagens aguardando processamento.");
    }

    if (processingCount > 0) {
        suggestions.push("Existe job em processamento.");
    }

    if (deadLetterCount > 0) {
        suggestions.push("Existem jobs na Dead Letter Queue. Avaliar retry manual ou erro recorrente.");
    }

    if (historyCount > 100) {
        suggestions.push("Histórico de jobs crescendo. Futuramente mover para banco/Redis.");
    }

    return {
        type: "queue_review",
        generatedAt: new Date().toISOString(),
        summary: {
            pending: pendingCount,
            processing: processingCount,
            history: historyCount,
            deadLetter: deadLetterCount
        },
        queue,
        suggestions
    };
}

export function getLogReview() {
    const logs = getRecentRuntimeLogs(50);

    const errors = logs.filter((log) => log.level === "error");
    const warnings = logs.filter((log) => log.level === "warn");

    const suggestions = [];

    if (errors.length) {
        suggestions.push("Foram encontrados logs de erro recentes. Revisar detalhes em errors.");
    }

    if (warnings.length > 5) {
        suggestions.push("Muitos avisos recentes. Pode indicar instabilidade no runtime ou na fila.");
    }

    if (!logs.length) {
        suggestions.push("Nenhum log recente encontrado.");
    }

    return {
        type: "log_review",
        generatedAt: new Date().toISOString(),
        summary: {
            total: logs.length,
            errors: errors.length,
            warnings: warnings.length
        },
        errors,
        warnings,
        logs,
        suggestions
    };
}

export function getFullHealthReview() {
    const report = {
        type: "full_health_review",
        generatedAt: new Date().toISOString(),
        status: getAiMonitorStatus(),
        runtime: getRuntimeReview(),
        queue: getQueueReview(),
        logs: getLogReview()
    };

    return {
        ...report,
        aiSuggestions: generateSuggestions(report)
    };
}