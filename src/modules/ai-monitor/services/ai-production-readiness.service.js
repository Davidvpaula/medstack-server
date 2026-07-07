import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getDependencyGraph
} from "./ai-dependency-graph.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

export function getProductionReadinessReport() {
    const health = getFullHealthReview();
    const architecture = getArchitectureReview();
    const dependencyGraph = getDependencyGraph();
    const technicalDebt = getTechnicalDebtReport();

    const checklist = buildChecklist({
        health,
        architecture,
        dependencyGraph,
        technicalDebt
    });

    const score = calculateScore(checklist);

    return {
        type: "production_readiness_report",
        generatedAt: new Date().toISOString(),
        score,
        status: getStatus(score),
        checklist,
        blockers: checklist.filter((item) => item.status === "blocker"),
        warnings: checklist.filter((item) => item.status === "warning"),
        passed: checklist.filter((item) => item.status === "passed"),
        recommendation: getRecommendation(score),
        nextSteps: getNextSteps(checklist)
    };
}

function buildChecklist({
    health,
    architecture,
    dependencyGraph,
    technicalDebt
}) {
    return [
        {
            key: "whatsapp_connected",
            label: "WhatsApp conectado",
            status: health.runtime.runtime.status.connected ? "passed" : "blocker",
            detail: health.runtime.runtime.status.connected
                ? "Runtime WhatsApp está conectado."
                : "Runtime WhatsApp não está conectado."
        },
        {
            key: "socket_alive",
            label: "Socket ativo",
            status: health.runtime.runtime.socket.alive ? "passed" : "blocker",
            detail: health.runtime.runtime.socket.alive
                ? "Socket está vivo."
                : "Socket não está ativo."
        },
        {
            key: "health_monitor",
            label: "Health Monitor ativo",
            status: health.runtime.runtime.monitor.active ? "passed" : "warning",
            detail: health.runtime.runtime.monitor.active
                ? "Health Monitor está ativo."
                : "Health Monitor não está ativo."
        },
        {
            key: "queue_dead_letter",
            label: "Dead Letter Queue zerada",
            status: health.queue.summary.deadLetter === 0 ? "passed" : "warning",
            detail: `Dead Letter atual: ${health.queue.summary.deadLetter}.`
        },
        {
            key: "queue_pending",
            label: "Fila pendente controlada",
            status: health.queue.summary.pending <= 10 ? "passed" : "warning",
            detail: `Jobs pendentes: ${health.queue.summary.pending}.`
        },
        {
            key: "runtime_errors",
            label: "Sem erros recentes",
            status: health.logs.summary.errors === 0 ? "passed" : "warning",
            detail: `Erros recentes: ${health.logs.summary.errors}.`
        },
        {
            key: "technical_debt",
            label: "Débito técnico controlado",
            status: technicalDebt.summary.high === 0 && technicalDebt.summary.critical === 0
                ? "passed"
                : "warning",
            detail: `Débitos críticos/altos: ${technicalDebt.summary.critical + technicalDebt.summary.high}.`
        },
        {
            key: "architecture_large_files",
            label: "Arquivos grandes controlados",
            status: architecture.largeFiles.length <= 3 ? "passed" : "warning",
            detail: `Arquivos grandes: ${architecture.largeFiles.length}.`
        },
        {
            key: "dependency_risk",
            label: "Dependências sob controle",
            status: dependencyGraph.summary.highRiskFiles === 0 ? "passed" : "warning",
            detail: `Arquivos de alto risco: ${dependencyGraph.summary.highRiskFiles}.`
        },
        {
            key: "database_persistence",
            label: "Persistência real em banco",
            status: "warning",
            detail: "Ainda é necessário migrar memória/JSON para PostgreSQL antes de escala maior."
        },
        {
            key: "redis_bullmq",
            label: "Fila Redis/BullMQ",
            status: "warning",
            detail: "Fila em memória funciona para MVP, mas Redis/BullMQ é recomendado para produção robusta."
        },
        {
            key: "docker",
            label: "Docker/ambiente replicável",
            status: "warning",
            detail: "Docker ainda precisa ser preparado para VPS/produção."
        }
    ];
}

function calculateScore(checklist) {
    let score = 100;

    for (const item of checklist) {
        if (item.status === "blocker") {
            score -= 25;
        }

        if (item.status === "warning") {
            score -= 6;
        }
    }

    return Math.max(score, 0);
}

function getStatus(score) {
    if (score >= 85) {
        return "ready_for_beta";
    }

    if (score >= 70) {
        return "almost_ready";
    }

    if (score >= 50) {
        return "needs_work";
    }

    return "not_ready";
}

function getRecommendation(score) {
    if (score >= 85) {
        return "Backend apto para beta assistido com poucos clientes, mantendo monitoramento próximo.";
    }

    if (score >= 70) {
        return "Backend próximo de beta, mas recomenda-se corrigir warnings principais antes de vender em escala.";
    }

    if (score >= 50) {
        return "Backend ainda precisa de ajustes antes de produção externa.";
    }

    return "Backend não recomendado para produção neste momento.";
}

function getNextSteps(checklist) {
    const steps = [];

    const blockers = checklist.filter((item) => item.status === "blocker");

    if (blockers.length) {
        steps.push("Corrigir blockers antes de qualquer produção.");
    }

    steps.push("Preparar mapa API para Lovable.");
    steps.push("Criar frontend MVP no Lovable.");
    steps.push("Preparar Docker e VPS.");
    steps.push("Planejar PostgreSQL para persistência real.");
    steps.push("Planejar Redis/BullMQ para fila profissional.");

    return steps;
}