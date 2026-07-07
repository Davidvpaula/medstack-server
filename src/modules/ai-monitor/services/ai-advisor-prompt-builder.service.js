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
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getDependencyGraph
} from "./ai-dependency-graph.service.js";

import {
    getApiMap
} from "./ai-api-map.service.js";

export function buildAdvisorPrompt(question = "") {
    const health = getFullHealthReview();
    const executive = generateExecutiveReport();
    const production = getProductionReadinessReport();
    const technicalDebt = getTechnicalDebtReport();
    const advisor = getArchitectureAdvisorReport();
    const roadmap = getRoadmapAnalysis();
    const architecture = getArchitectureReview();
    const dependencyGraph = getDependencyGraph();
    const apiMap = getApiMap();

    return {
        type: "ai_advisor_prompt",
        generatedAt: new Date().toISOString(),
        question,
        systemPrompt: buildSystemPrompt(),
        safetyRules: buildSafetyRules(),
        projectContext: buildProjectContext(),
        runtimeContext: {
            whatsappConnected: health.runtime.runtime.status.connected,
            whatsappStatus: health.runtime.runtime.status.status,
            socketAlive: health.runtime.runtime.socket.alive,
            monitorActive: health.runtime.runtime.monitor.active,
            queue: health.queue.summary,
            logs: health.logs.summary
        },
        executiveContext: {
            healthScore: executive.healthScore,
            status: executive.status,
            summary: executive.summary,
            risks: executive.risks,
            recommendations: executive.recommendations,
            nextSteps: executive.nextSteps
        },
        productionContext: {
            score: production.score,
            status: production.status,
            blockers: production.blockers,
            warnings: production.warnings,
            recommendation: production.recommendation,
            nextSteps: production.nextSteps
        },
        architectureContext: {
            summary: architecture.summary,
            moduleHealth: architecture.moduleHealth.slice(0, 10),
            largeFiles: architecture.largeFiles.slice(0, 10),
            highlyCoupledFiles: architecture.highlyCoupledFiles.slice(0, 10),
            suggestions: architecture.suggestions
        },
        dependencyContext: {
            summary: dependencyGraph.summary,
            topNodes: dependencyGraph.nodes
                .sort((a, b) => b.imports - a.imports)
                .slice(0, 10),
            suggestions: dependencyGraph.suggestions
        },
        technicalDebtContext: {
            summary: technicalDebt.summary,
            topDebts: technicalDebt.debts.slice(0, 10),
            recommendations: technicalDebt.recommendations
        },
        roadmapContext: {
            progress: roadmap.progress,
            completed: roadmap.completed,
            pending: roadmap.pending,
            nextStep: roadmap.nextStep,
            roadmap: roadmap.roadmap
        },
        apiContext: {
            summary: apiMap.summary,
            routes: apiMap.routes.slice(0, 50),
            suggestions: apiMap.suggestions
        }
    };
}

function buildSystemPrompt() {
    return [
        "Você é o AI Advisor interno do MedStack.",
        "Você atua como arquiteto de software, DevOps advisor e revisor técnico.",
        "Você deve responder com base apenas no contexto fornecido.",
        "Você nunca deve afirmar que alterou código.",
        "Você nunca deve executar comandos.",
        "Você nunca deve fazer deploy.",
        "Você nunca deve apagar dados.",
        "Você pode sugerir melhorias, riscos, próximos passos e reescrever código somente quando o usuário pedir.",
        "Quando sugerir código, entregue o arquivo completo."
    ].join("\n");
}

function buildSafetyRules() {
    return {
        canModifyCode: false,
        canDeploy: false,
        canDeleteData: false,
        canRunCommands: false,
        canAccessSecrets: false,
        canSuggest: true,
        canRewriteCodeWhenAsked: true,
        requiresHumanApproval: true
    };
}

function buildProjectContext() {
    return {
        name: "MedStack",
        type: "SaaS backend",
        currentFocus: "WhatsApp Runtime, Dispatcher, AI Monitor, Lovable frontend e preparação para produção",
        targetScale: "5 clientes no beta, depois 100 empresas com PostgreSQL, Redis, BullMQ, Docker e Workers separados",
        architectureStyle: "modular monolith evoluindo para serviços separados quando necessário"
    };
}