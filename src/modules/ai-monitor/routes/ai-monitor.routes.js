import { Router } from "express";

import {
    status,
    runtimeReview,
    queueReview,
    logReview,
    fullReview,
    executiveReport,
    codeInventory,
    architectureReview,
    dependencyGraph,
    technicalDebt,
    productionReadiness,
    apiMap,
    lovableApiGuide,
    roadmap,
    roadmapDashboard,
    architectureAdvisor,
    architectureAdvisorDashboard,
    advisorChat,
    advisorPrompt,
    externalAiAdvisor,
    externalAiStatus,
    externalAiConfigure,
    externalAiDashboard,
    advisorChatHistory,
    clearAdvisorChat,
    advisorChatDashboard,
    continuousSnapshot,
    continuousHistory,
    projectMemory,
    createProjectMemory,
    seedProjectMemory,
    clearProjectMemory,
    scanner,
    scannerDashboard,
    scanSource,
    registerScannerFile,
    clearScannerData,
    moduleHealth,
    moduleHealthDashboard,
    securityScan,
    securityRoutes,
    securityConfig,
    securityReport,
    securityDashboard,
    performanceScan,
    performanceReport,
    performanceDashboard,
    refactoringAdvisor,
    refactoringDashboard,
    releaseAdvisor,
    releaseDashboard,
    finalOverview,
    finalOverviewDashboard,
    dashboard,
    knowledge,
    clearKnowledgeBase
} from "../controllers/ai-monitor.controller.js";

const router = Router();

router.get("/status", status);
router.get("/runtime-review", runtimeReview);
router.get("/queue-review", queueReview);
router.get("/log-review", logReview);
router.get("/full-review", fullReview);
router.get("/executive-report", executiveReport);
router.get("/code-inventory", codeInventory);
router.get("/architecture-review", architectureReview);
router.get("/dependency-graph", dependencyGraph);
router.get("/technical-debt", technicalDebt);
router.get("/production-readiness", productionReadiness);
router.get("/api-map", apiMap);
router.get("/lovable-api-guide", lovableApiGuide);

router.get("/roadmap", roadmap);
router.get("/roadmap-dashboard", roadmapDashboard);

router.get("/architecture-advisor", architectureAdvisor);
router.get("/architecture-advisor-dashboard", architectureAdvisorDashboard);

router.post("/advisor-chat", advisorChat);
router.post("/advisor-prompt", advisorPrompt);
router.get("/advisor-chat/history", advisorChatHistory);
router.post("/advisor-chat/clear", clearAdvisorChat);
router.get("/advisor-chat-dashboard", advisorChatDashboard);

router.post("/external-ai/advisor", externalAiAdvisor);
router.get("/external-ai/status", externalAiStatus);
router.post("/external-ai/configure", externalAiConfigure);
router.get("/external-ai/dashboard", externalAiDashboard);

router.post("/continuous/snapshot", continuousSnapshot);
router.get("/continuous/history", continuousHistory);

router.get("/project-memory", projectMemory);
router.post("/project-memory", createProjectMemory);
router.post("/project-memory/seed", seedProjectMemory);
router.post("/project-memory/clear", clearProjectMemory);

router.get("/scanner", scanner);
router.get("/scanner-dashboard", scannerDashboard);
router.post("/scanner/scan-src", scanSource);
router.post("/scanner/register", registerScannerFile);
router.post("/scanner/clear", clearScannerData);

router.get("/module-health", moduleHealth);
router.get("/module-health-dashboard", moduleHealthDashboard);

router.get("/security-scan", securityScan);
router.get("/security-routes", securityRoutes);
router.get("/security-config", securityConfig);
router.get("/security-report", securityReport);
router.get("/security-dashboard", securityDashboard);

router.get("/performance-scan", performanceScan);
router.get("/performance-report", performanceReport);
router.get("/performance-dashboard", performanceDashboard);

router.get("/refactoring-advisor", refactoringAdvisor);
router.get("/refactoring-dashboard", refactoringDashboard);

router.get("/release-advisor", releaseAdvisor);
router.get("/release-dashboard", releaseDashboard);

router.get("/final-overview", finalOverview);
router.get("/final-overview-dashboard", finalOverviewDashboard);

router.get("/dashboard", dashboard);

router.get("/knowledge", knowledge);
router.post("/knowledge/clear", clearKnowledgeBase);

export default router;