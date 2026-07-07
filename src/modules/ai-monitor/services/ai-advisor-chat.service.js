import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    generateExecutiveReport
} from "./ai-executive-report.service.js";

import {
    getProductionReadinessReport
} from "./ai-production-readiness.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    getArchitectureAdvisorReport
} from "./ai-architecture-advisor.service.js";

import {
    getRoadmapAnalysis
} from "./ai-roadmap.service.js";

import {
    addAdvisorChatHistory
} from "./ai-advisor-chat-history.service.js";

export function askAiAdvisor(question = "") {
    const normalizedQuestion = normalizeQuestion(question);

    const context = buildContext();

    const result = {
        type: "ai_advisor_chat",
        generatedAt: new Date().toISOString(),
        mode: "local_rule_based",
        question,
        answer: generateAnswer(normalizedQuestion, context),
        contextSummary: {
            productionScore: context.production.score,
            productionStatus: context.production.status,
            healthScore: context.executive.healthScore,
            roadmapProgress: context.roadmap.progress,
            technicalDebts: context.technicalDebt.summary.total,
            nextModule: context.roadmap.nextStep?.module || null
        },
        safety: {
            canModifyCode: false,
            canDeploy: false,
            canDeleteData: false,
            role: "read_only_advisor"
        }
    };

    addAdvisorChatHistory({
        question: result.question,
        answer: result.answer,
        contextSummary: result.contextSummary,
        mode: result.mode,
        safety: result.safety
    });

    return result;
}

function buildContext() {
    return {
        health: getFullHealthReview(),
        executive: generateExecutiveReport(),
        production: getProductionReadinessReport(),
        technicalDebt: getTechnicalDebtReport(),
        advisor: getArchitectureAdvisorReport(),
        roadmap: getRoadmapAnalysis()
    };
}

function generateAnswer(question, context) {
    if (!question) {
        return defaultAnswer(context);
    }

    if (includesAny(question, ["produção", "producao", "vps", "deploy"])) {
        return productionAnswer(context);
    }

    if (includesAny(question, ["próximo", "proximo", "etapa", "continuar", "roadmap"])) {
        return nextStepAnswer(context);
    }

    if (includesAny(question, ["erro", "falha", "problema", "warning", "blocker"])) {
        return problemAnswer(context);
    }

    if (includesAny(question, ["escala", "100 empresas", "cem empresas", "redis", "bullmq", "postgresql"])) {
        return scalingAnswer(context);
    }

    if (includesAny(question, ["débito", "debito", "técnico", "tecnico", "refatorar"])) {
        return technicalDebtAnswer(context);
    }

    if (includesAny(question, ["lovable", "frontend", "tela", "inbox"])) {
        return lovableAnswer(context);
    }

    return defaultAnswer(context);
}

function defaultAnswer(context) {
    return [
        `O backend está com score executivo de ${context.executive.healthScore}% e prontidão de produção em ${context.production.score}%.`,
        `Status de produção: ${context.production.status}.`,
        `Próxima etapa recomendada: ${context.roadmap.nextStep?.module || "nenhuma etapa pendente"}.`,
        context.advisor.productionOpinion,
        context.advisor.scalingOpinion
    ];
}

function productionAnswer(context) {
    return [
        `Prontidão para produção: ${context.production.score}%.`,
        `Status: ${context.production.status}.`,
        `Blockers: ${context.production.blockers.length}.`,
        `Warnings: ${context.production.warnings.length}.`,
        context.production.recommendation,
        "Minha recomendação: usar primeiro como beta assistido antes de escala grande."
    ];
}

function nextStepAnswer(context) {
    const next = context.roadmap.nextStep;

    if (!next) {
        return [
            "Roadmap concluído.",
            "Próximo foco: estabilização, produção e escala."
        ];
    }

    return [
        `Próxima etapa: ${next.module}.`,
        `Prioridade: ${next.priority}.`,
        "Essa etapa deve ser feita antes de avançar para módulos mais pesados.",
        context.advisor.recommendedNextModule.reason
    ];
}

function problemAnswer(context) {
    return [
        `Erros recentes: ${context.health.logs.summary.errors}.`,
        `Warnings recentes: ${context.health.logs.summary.warnings}.`,
        `Blockers de produção: ${context.production.blockers.length}.`,
        `Warnings de produção: ${context.production.warnings.length}.`,
        context.production.blockers.length
            ? "Existem blockers que devem ser corrigidos antes de produção."
            : "Nenhum blocker crítico foi detectado agora."
    ];
}

function scalingAnswer(context) {
    return [
        "Para escalar para 100 empresas, ainda faltam camadas de infraestrutura.",
        "Prioridades: PostgreSQL, Redis, BullMQ, Docker, Workers separados e VPS com monitoramento.",
        context.advisor.scalingOpinion,
        `Débitos técnicos atuais: ${context.technicalDebt.summary.total}.`
    ];
}

function technicalDebtAnswer(context) {
    return [
        `Débitos técnicos encontrados: ${context.technicalDebt.summary.total}.`,
        `Críticos: ${context.technicalDebt.summary.critical}.`,
        `Altos: ${context.technicalDebt.summary.high}.`,
        `Horas estimadas: ${context.technicalDebt.summary.estimatedHours}h.`,
        context.technicalDebt.recommendations[0] || "Nenhum débito técnico relevante encontrado."
    ];
}

function lovableAnswer(context) {
    return [
        "O Lovable já pode ser iniciado.",
        "Fluxo recomendado: Login → Dashboard → WhatsApp QR → Inbox → Conversa → Envio via Dispatch.",
        "O backend já possui API Map e Lovable API Guide.",
        `Próxima etapa do roadmap: ${context.roadmap.nextStep?.module || "Lovable/produção"}.`
    ];
}

function normalizeQuestion(question) {
    return String(question || "")
        .trim()
        .toLowerCase();
}

function includesAny(text, terms) {
    return terms.some((term) => text.includes(term));
}