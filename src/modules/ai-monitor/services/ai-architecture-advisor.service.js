import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    getProductionReadinessReport
} from "./ai-production-readiness.service.js";

import {
    getRoadmapAnalysis
} from "./ai-roadmap.service.js";

export function getArchitectureAdvisorReport() {
    const health = getFullHealthReview();
    const architecture = getArchitectureReview();
    const technicalDebt = getTechnicalDebtReport();
    const production = getProductionReadinessReport();
    const roadmap = getRoadmapAnalysis();

    return {
        type: "architecture_advisor_report",
        generatedAt: new Date().toISOString(),
        currentStage: getCurrentStage(roadmap),
        globalAssessment: getGlobalAssessment(production),
        immediatePriorities: getImmediatePriorities({
            health,
            architecture,
            technicalDebt,
            production,
            roadmap
        }),
        canMoveForward: canMoveForward(production),
        productionOpinion: getProductionOpinion(production),
        scalingOpinion: getScalingOpinion({
            technicalDebt,
            production
        }),
        recommendedNextModule: getRecommendedNextModule(roadmap),
        warnings: getWarnings({
            health,
            architecture,
            technicalDebt,
            production
        }),
        summary: {
            productionScore: production.score,
            productionStatus: production.status,
            technicalDebts: technicalDebt.summary.total,
            highTechnicalDebts: technicalDebt.summary.high,
            criticalTechnicalDebts: technicalDebt.summary.critical,
            architectureSuggestions: architecture.suggestions.length,
            roadmapProgress: roadmap.progress
        }
    };
}

function getCurrentStage(roadmap) {
    if (roadmap.progress >= 90) {
        return "production_preparation";
    }

    if (roadmap.progress >= 60) {
        return "frontend_and_infrastructure";
    }

    if (roadmap.progress >= 40) {
        return "backend_consolidation";
    }

    return "foundation";
}

function getGlobalAssessment(production) {
    if (production.score >= 85) {
        return "O backend está saudável para beta assistido, desde que monitorado de perto.";
    }

    if (production.score >= 70) {
        return "O backend está próximo de um beta, mas ainda existem pontos de atenção.";
    }

    if (production.score >= 50) {
        return "O backend precisa de ajustes antes de uso comercial externo.";
    }

    return "O backend ainda não deve ser colocado em produção.";
}

function getImmediatePriorities({
    health,
    technicalDebt,
    production,
    roadmap
}) {
    const priorities = [];

    if (production.blockers.length) {
        priorities.push({
            priority: "critical",
            title: "Corrigir blockers de produção",
            reason: "Existem itens bloqueando a segurança operacional.",
            action: "Resolver todos os blockers antes de avançar."
        });
    }

    if (!health.runtime.runtime.status.connected) {
        priorities.push({
            priority: "high",
            title: "Estabilizar conexão WhatsApp",
            reason: "O WhatsApp é o núcleo operacional atual.",
            action: "Verificar QR, sessão, socket e AutoStart."
        });
    }

    if (technicalDebt.summary.critical > 0 || technicalDebt.summary.high > 0) {
        priorities.push({
            priority: "high",
            title: "Reduzir débito técnico alto",
            reason: "Débitos altos podem dificultar escala.",
            action: "Revisar arquivos e módulos marcados no Technical Debt."
        });
    }

    if (roadmap.nextStep) {
        priorities.push({
            priority: "medium",
            title: `Executar próxima etapa: ${roadmap.nextStep.module}`,
            reason: "Essa é a próxima etapa lógica do roadmap.",
            action: `Avançar no módulo ${roadmap.nextStep.module}.`
        });
    }

    if (!priorities.length) {
        priorities.push({
            priority: "info",
            title: "Manter evolução planejada",
            reason: "Nenhum risco imediato crítico encontrado.",
            action: "Seguir para frontend Lovable e preparação de produção."
        });
    }

    return priorities;
}

function canMoveForward(production) {
    return {
        betaAssisted: production.score >= 85 && production.blockers.length === 0,
        productionSmallScale: production.score >= 80 && production.blockers.length === 0,
        productionLargeScale: false,
        reason: production.score >= 85
            ? "Pode avançar para beta assistido."
            : "Ainda existem warnings ou blockers relevantes."
    };
}

function getProductionOpinion(production) {
    if (production.blockers.length > 0) {
        return "Não recomendo produção enquanto existirem blockers.";
    }

    if (production.score >= 85) {
        return "Recomendo beta assistido com poucos clientes e monitoramento ativo.";
    }

    if (production.score >= 70) {
        return "Recomendo finalizar Lovable, autenticação e checagens antes do beta.";
    }

    return "Ainda não recomendo produção.";
}

function getScalingOpinion({
    technicalDebt,
    production
}) {
    if (technicalDebt.summary.high > 0 || technicalDebt.summary.critical > 0) {
        return "Antes de escalar, reduza débitos técnicos altos e prepare PostgreSQL, Redis e BullMQ.";
    }

    if (production.score >= 85) {
        return "A base está saudável para pilotos, mas 100 empresas exigem PostgreSQL, Redis, BullMQ, Docker e workers separados.";
    }

    return "Ainda não é momento de pensar em 100 empresas. Consolidar beta primeiro.";
}

function getRecommendedNextModule(roadmap) {
    if (!roadmap.nextStep) {
        return {
            module: null,
            reason: "Roadmap concluído."
        };
    }

    return {
        module: roadmap.nextStep.module,
        priority: roadmap.nextStep.priority,
        reason: "Este é o próximo módulo pendente conforme prioridade estratégica."
    };
}

function getWarnings({
    health,
    architecture,
    technicalDebt,
    production
}) {
    const warnings = [];

    if (production.warnings.length > 0) {
        warnings.push(`${production.warnings.length} warning(s) de produção encontrados.`);
    }

    if (architecture.largeFiles.length > 0) {
        warnings.push(`${architecture.largeFiles.length} arquivo(s) grande(s) encontrados.`);
    }

    if (technicalDebt.summary.total > 0) {
        warnings.push(`${technicalDebt.summary.total} débito(s) técnico(s) encontrados.`);
    }

    if (health.logs.summary.errors > 0) {
        warnings.push(`${health.logs.summary.errors} erro(s) recente(s) nos logs.`);
    }

    if (!warnings.length) {
        warnings.push("Nenhum alerta estratégico relevante no momento.");
    }

    return warnings;
}