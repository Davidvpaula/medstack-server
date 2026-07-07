import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    getKnowledgeSummary
} from "./ai-knowledge-base.service.js";

export function generateExecutiveReport() {
    const review = getFullHealthReview();
    const knowledge = getKnowledgeSummary();

    const score = calculateHealthScore(review, knowledge);

    return {
        type: "executive_report",
        generatedAt: new Date().toISOString(),
        healthScore: score,
        status: getStatusFromScore(score),
        summary: {
            whatsappConnected: review.runtime.runtime.status.connected,
            socketAlive: review.runtime.runtime.socket.alive,
            queuePending: review.queue.summary.pending,
            queueDeadLetter: review.queue.summary.deadLetter,
            logErrors: review.logs.summary.errors,
            logWarnings: review.logs.summary.warnings,
            aiSuggestions: review.aiSuggestions.length,
            knowledgeItems: knowledge.total
        },
        risks: generateRisks(review, knowledge),
        recommendations: generateRecommendations(review, knowledge),
        nextSteps: generateNextSteps(review, knowledge)
    };
}

function calculateHealthScore(review, knowledge) {
    let score = 100;

    if (!review.runtime.runtime.status.connected) {
        score -= 25;
    }

    if (!review.runtime.runtime.socket.alive) {
        score -= 30;
    }

    if (review.queue.summary.deadLetter > 0) {
        score -= 20;
    }

    if (review.queue.summary.pending > 10) {
        score -= 10;
    }

    if (review.logs.summary.errors > 0) {
        score -= 15;
    }

    if (review.logs.summary.warnings > 5) {
        score -= 5;
    }

    if (knowledge.critical > 0) {
        score -= 20;
    }

    if (knowledge.high > 0) {
        score -= 10;
    }

    return Math.max(score, 0);
}

function getStatusFromScore(score) {
    if (score >= 90) {
        return "healthy";
    }

    if (score >= 70) {
        return "attention";
    }

    if (score >= 50) {
        return "risk";
    }

    return "critical";
}

function generateRisks(review, knowledge) {
    const risks = [];

    if (!review.runtime.runtime.status.connected) {
        risks.push("WhatsApp desconectado.");
    }

    if (!review.runtime.runtime.socket.alive) {
        risks.push("Socket inativo.");
    }

    if (review.queue.summary.deadLetter > 0) {
        risks.push("Existem jobs na Dead Letter Queue.");
    }

    if (review.logs.summary.errors > 0) {
        risks.push("Existem erros recentes nos logs.");
    }

    if (knowledge.critical > 0 || knowledge.high > 0) {
        risks.push("A base de conhecimento contém alertas relevantes.");
    }

    if (!risks.length) {
        risks.push("Nenhum risco crítico identificado no momento.");
    }

    return risks;
}

function generateRecommendations(review, knowledge) {
    const recommendations = [];

    if (review.queue.summary.history > 50) {
        recommendations.push("Planejar migração da fila para Redis/BullMQ.");
    }

    if (review.runtime.runtime.status.connected) {
        recommendations.push("Manter Health Monitor e AutoStart ativos.");
    }

    if (knowledge.total > 100) {
        recommendations.push("Persistir a base de conhecimento em banco real.");
    }

    recommendations.push("Próxima evolução recomendada: PostgreSQL, Redis/BullMQ e Docker.");

    return recommendations;
}

function generateNextSteps() {
    return [
        "Finalizar dashboard operacional com botões POST.",
        "Criar mapa de APIs para o frontend Lovable.",
        "Preparar persistência real com PostgreSQL.",
        "Preparar fila real com Redis/BullMQ.",
        "Separar Worker em processo próprio.",
        "Preparar Docker e VPS de produção."
    ];
}