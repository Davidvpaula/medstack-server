import { response } from "../../../core/response.js";

import {
    getAiMonitorStatus,
    getRuntimeReview,
    getQueueReview,
    getLogReview,
    getFullHealthReview
} from "../services/ai-monitor.service.js";

import {
    renderAiMonitorDashboard
} from "../services/ai-monitor-dashboard.service.js";

import {
    listKnowledge,
    getKnowledgeSummary,
    clearKnowledge
} from "../services/ai-knowledge-base.service.js";

import {
    generateExecutiveReport
} from "../services/ai-executive-report.service.js";

import {
    getCodeInventory
} from "../services/ai-code-inventory.service.js";

import {
    getArchitectureReview
} from "../services/ai-architecture-review.service.js";

import {
    getDependencyGraph
} from "../services/ai-dependency-graph.service.js";

import {
    getTechnicalDebtReport
} from "../services/ai-technical-debt.service.js";

import {
    getProductionReadinessReport
} from "../services/ai-production-readiness.service.js";

import {
    getApiMap
} from "../services/ai-api-map.service.js";

import {
    getLovableApiGuide
} from "../services/ai-lovable-api-guide.service.js";

import {
    getRoadmapAnalysis
} from "../services/ai-roadmap.service.js";

import {
    renderRoadmapDashboard
} from "../services/ai-roadmap-dashboard.service.js";

import {
    getArchitectureAdvisorReport
} from "../services/ai-architecture-advisor.service.js";

import {
    renderArchitectureAdvisorDashboard
} from "../services/ai-architecture-advisor-dashboard.service.js";

import {
    askAiAdvisor
} from "../services/ai-advisor-chat.service.js";

import {
    renderAdvisorChatDashboard
} from "../services/ai-advisor-chat-dashboard.service.js";

import {
    listAdvisorChatHistory,
    clearAdvisorChatHistory
} from "../services/ai-advisor-chat-history.service.js";

import {
    buildAdvisorPrompt
} from "../services/ai-advisor-prompt-builder.service.js";

import {
    getExternalAiStatus,
    askExternalAiAdvisor,
    configureExternalAi
} from "../services/ai-external-adapter.service.js";

import {
    renderExternalAiConfigDashboard
} from "../services/ai-external-config-dashboard.service.js";

import {
    generateContinuousSnapshot,
    listContinuousSnapshots
} from "../services/ai-continuous-analysis.service.js";

import {
    addProjectMemory,
    listProjectMemories,
    getProjectMemorySummary,
    clearProjectMemories,
    seedInitialProjectMemories
} from "../services/ai-project-memory.service.js";

import {
    registerProjectFile,
    listScannedFiles,
    getScannerSummary,
    clearScanner,
    scanProjectSource
} from "../services/ai-code-scanner.service.js";

import {
    renderCodeScannerDashboard
} from "../services/ai-code-scanner-dashboard.service.js";

import {
    getModuleHealthReport
} from "../services/ai-module-health.service.js";

import {
    renderModuleHealthDashboard
} from "../services/ai-module-health-dashboard.service.js";

import {
    getSecurityScanReport
} from "../services/ai-security-scanner.service.js";

import {
    getSecurityRouteAnalysis
} from "../services/ai-security-route-analyzer.service.js";

import {
    getSecurityConfigChecklist
} from "../services/ai-security-config-checklist.service.js";

import {
    getSecurityFinalReport
} from "../services/ai-security-report.service.js";

import {
    renderSecurityDashboard
} from "../services/ai-security-dashboard.service.js";

import {
    getPerformanceScanReport
} from "../services/ai-performance-scanner.service.js";

import {
    getPerformanceFinalReport
} from "../services/ai-performance-report.service.js";

import {
    renderPerformanceDashboard
} from "../services/ai-performance-dashboard.service.js";

import {
    getRefactoringAdvisorReport
} from "../services/ai-refactoring-advisor.service.js";

import {
    renderRefactoringDashboard
} from "../services/ai-refactoring-dashboard.service.js";

import {
    getReleaseAdvisorReport
} from "../services/ai-release-advisor.service.js";

import {
    renderReleaseDashboard
} from "../services/ai-release-dashboard.service.js";

import {
    getFinalOverviewReport
} from "../services/ai-final-overview.service.js";

import {
    renderFinalOverviewDashboard
} from "../services/ai-final-overview-dashboard.service.js";

export function status(req, res) {
    return response.success(res, "Status do AI Monitor carregado.", getAiMonitorStatus());
}

export function runtimeReview(req, res) {
    return response.success(res, "Análise do runtime carregada.", getRuntimeReview());
}

export function queueReview(req, res) {
    return response.success(res, "Análise da fila carregada.", getQueueReview());
}

export function logReview(req, res) {
    return response.success(res, "Análise dos logs carregada.", getLogReview());
}

export function fullReview(req, res) {
    return response.success(res, "Análise completa carregada.", getFullHealthReview());
}

export function executiveReport(req, res) {
    return response.success(res, "Relatório executivo carregado.", generateExecutiveReport());
}

export function codeInventory(req, res) {
    return response.success(res, "Inventário do código carregado.", getCodeInventory());
}

export function architectureReview(req, res) {
    return response.success(res, "Análise arquitetural carregada.", getArchitectureReview());
}

export function dependencyGraph(req, res) {
    return response.success(res, "Grafo de dependências carregado.", getDependencyGraph());
}

export function technicalDebt(req, res) {
    return response.success(res, "Relatório de débito técnico carregado.", getTechnicalDebtReport());
}

export function productionReadiness(req, res) {
    return response.success(res, "Relatório de prontidão para produção carregado.", getProductionReadinessReport());
}

export function apiMap(req, res) {
    return response.success(res, "Mapa de API carregado.", getApiMap());
}

export function lovableApiGuide(req, res) {
    return response.success(res, "Guia de API para Lovable carregado.", getLovableApiGuide());
}

export function roadmap(req, res) {
    return response.success(res, "Roadmap carregado.", getRoadmapAnalysis());
}

export function roadmapDashboard(req, res) {
    return res.send(renderRoadmapDashboard());
}

export function architectureAdvisor(req, res) {
    return response.success(
        res,
        "Relatório do Architecture Advisor carregado.",
        getArchitectureAdvisorReport()
    );
}

export function architectureAdvisorDashboard(req, res) {
    return res.send(renderArchitectureAdvisorDashboard());
}

export function advisorChat(req, res) {
    return response.success(
        res,
        "Resposta do AI Advisor carregada.",
        askAiAdvisor(req.body?.question)
    );
}

export function advisorPrompt(req, res) {
    return response.success(
        res,
        "Prompt do AI Advisor carregado.",
        buildAdvisorPrompt(req.body?.question)
    );
}

export async function externalAiAdvisor(req, res, next) {
    try {
        const result = await askExternalAiAdvisor(req.body?.question);

        return response.success(
            res,
            "Resposta da AI externa carregada.",
            result
        );
    } catch (error) {
        next(error);
    }
}

export function externalAiStatus(req, res) {
    return response.success(
        res,
        "Status da AI externa carregado.",
        getExternalAiStatus()
    );
}

export function externalAiConfigure(req, res) {
    return response.success(
        res,
        "Configuração da AI externa atualizada.",
        configureExternalAi(req.body)
    );
}

export function externalAiDashboard(req, res) {
    return res.send(renderExternalAiConfigDashboard());
}

export function advisorChatHistory(req, res) {
    return response.success(
        res,
        "Histórico do AI Advisor carregado.",
        {
            items: listAdvisorChatHistory()
        }
    );
}

export function clearAdvisorChat(req, res) {
    return response.success(
        res,
        "Histórico do AI Advisor limpo.",
        clearAdvisorChatHistory()
    );
}

export function advisorChatDashboard(req, res) {
    return res.send(renderAdvisorChatDashboard());
}

export function continuousSnapshot(req, res) {
    return response.success(
        res,
        "Snapshot contínuo criado.",
        generateContinuousSnapshot()
    );
}

export function continuousHistory(req, res) {
    return response.success(
        res,
        "Histórico contínuo carregado.",
        {
            snapshots: listContinuousSnapshots()
        }
    );
}

export function projectMemory(req, res) {
    return response.success(
        res,
        "Memória do projeto carregada.",
        {
            summary: getProjectMemorySummary(),
            items: listProjectMemories()
        }
    );
}

export function createProjectMemory(req, res) {
    return response.success(
        res,
        "Memória do projeto criada.",
        addProjectMemory(req.body)
    );
}

export function seedProjectMemory(req, res) {
    return response.success(
        res,
        "Memória inicial do projeto processada.",
        seedInitialProjectMemories()
    );
}

export function clearProjectMemory(req, res) {
    return response.success(
        res,
        "Memória do projeto limpa.",
        clearProjectMemories()
    );
}

export function scanner(req, res) {
    return response.success(
        res,
        "Scanner carregado.",
        {
            summary: getScannerSummary(),
            files: listScannedFiles()
        }
    );
}

export function scannerDashboard(req, res) {
    return res.send(renderCodeScannerDashboard());
}

export function scanSource(req, res) {
    return response.success(
        res,
        "Scanner automático executado.",
        scanProjectSource()
    );
}

export function registerScannerFile(req, res) {
    return response.success(
        res,
        "Arquivo registrado no scanner.",
        registerProjectFile(req.body)
    );
}

export function clearScannerData(req, res) {
    return response.success(
        res,
        "Scanner limpo.",
        clearScanner()
    );
}

export function moduleHealth(req, res) {
    return response.success(
        res,
        "Relatório de saúde dos módulos carregado.",
        getModuleHealthReport()
    );
}

export function moduleHealthDashboard(req, res) {
    return res.send(renderModuleHealthDashboard());
}

export function securityScan(req, res) {
    return response.success(
        res,
        "Relatório de segurança carregado.",
        getSecurityScanReport()
    );
}

export function securityRoutes(req, res) {
    return response.success(
        res,
        "Análise de rotas de segurança carregada.",
        getSecurityRouteAnalysis()
    );
}

export function securityConfig(req, res) {
    return response.success(
        res,
        "Checklist de segurança carregado.",
        getSecurityConfigChecklist()
    );
}

export function securityReport(req, res) {
    return response.success(
        res,
        "Relatório final de segurança carregado.",
        getSecurityFinalReport()
    );
}

export function securityDashboard(req, res) {
    return res.send(renderSecurityDashboard());
}

export function performanceScan(req, res) {
    return response.success(
        res,
        "Relatório de performance carregado.",
        getPerformanceScanReport()
    );
}

export function performanceReport(req, res) {
    return response.success(
        res,
        "Relatório final de performance carregado.",
        getPerformanceFinalReport()
    );
}

export function performanceDashboard(req, res) {
    return res.send(renderPerformanceDashboard());
}

export function refactoringAdvisor(req, res) {
    return response.success(
        res,
        "Relatório de Refactoring Advisor carregado.",
        getRefactoringAdvisorReport()
    );
}

export function refactoringDashboard(req, res) {
    return res.send(renderRefactoringDashboard());
}

export function releaseAdvisor(req, res) {
    return response.success(
        res,
        "Relatório do Release Advisor carregado.",
        getReleaseAdvisorReport()
    );
}

export function releaseDashboard(req, res) {
    return res.send(renderReleaseDashboard());
}

export function dashboard(req, res) {
    return res.send(renderAiMonitorDashboard());
}

export function knowledge(req, res) {
    return response.success(
        res,
        "Base de conhecimento carregada.",
        {
            summary: getKnowledgeSummary(),
            items: listKnowledge()
        }
    );
}

export function clearKnowledgeBase(req, res) {
    return response.success(
        res,
        "Base de conhecimento limpa.",
        clearKnowledge()
    );
}

export function finalOverview(req, res) {
    return response.success(
        res,
        "Final Overview carregado.",
        getFinalOverviewReport()
    );
}

export function finalOverviewDashboard(req, res) {
    return res.send(
        renderFinalOverviewDashboard()
    );
}