import { getProductionReadinessReport } from "./ai-production-readiness.service.js";
import { getSecurityFinalReport } from "./ai-security-report.service.js";
import { getPerformanceFinalReport } from "./ai-performance-report.service.js";
import { getRefactoringAdvisorReport } from "./ai-refactoring-advisor.service.js";
import { getRoadmapAnalysis } from "./ai-roadmap.service.js";
import { getScannerSummary } from "./ai-code-scanner.service.js";

export function getReleaseAdvisorReport() {
    const production = getProductionReadinessReport();
    const security = getSecurityFinalReport();
    const performance = getPerformanceFinalReport();
    const refactoring = getRefactoringAdvisorReport();
    const roadmap = getRoadmapAnalysis();
    const scanner = getScannerSummary();

    const score = calculateReleaseScore({
        production,
        security,
        performance,
        refactoring,
        scanner
    });

    const decision = buildReleaseDecision({
        score,
        production,
        security,
        performance,
        refactoring,
        roadmap
    });

    return {
        type: "release_advisor_report",
        generatedAt: new Date().toISOString(),
        score,
        status: getReleaseStatus(score),
        decision,
        currentStage: getCurrentStage(roadmap),
        readiness: {
            production: {
                score: production.score,
                status: production.status,
                blockers: production.blockers.length,
                warnings: production.warnings.length
            },
            security: {
                score: security.score,
                status: security.status,
                blockers: security.blockers.length
            },
            performance: {
                score: performance.score,
                status: performance.status,
                blockers: performance.blockers.length
            },
            refactoring: {
                candidates: refactoring.summary.totalCandidates,
                critical: refactoring.summary.critical,
                high: refactoring.summary.high,
                estimatedHours: refactoring.summary.estimatedHours
            },
            scanner: {
                files: scanner.totalFiles,
                modules: scanner.totalModules,
                lines: scanner.totalLines
            }
        },
        blockers: getReleaseBlockers({
            production,
            security,
            performance,
            refactoring
        }),
        warnings: getReleaseWarnings({
            production,
            security,
            performance,
            refactoring
        }),
        nextSteps: getReleaseNextSteps(decision),
        recommendations: getReleaseRecommendations({
            score,
            decision,
            production,
            security,
            performance,
            refactoring
        })
    };
}

function calculateReleaseScore({
    production,
    security,
    performance,
    refactoring,
    scanner
}) {
    let score = 100;

    if (scanner.totalFiles === 0) {
        score -= 15;
    }

    score -= Math.max(0, 100 - production.score) * 0.25;
    score -= Math.max(0, 100 - security.score) * 0.25;
    score -= Math.max(0, 100 - performance.score) * 0.15;

    score -= refactoring.summary.critical * 10;
    score -= refactoring.summary.high * 4;
    score -= refactoring.summary.medium * 1;

    return Math.max(Math.round(score), 0);
}

function getReleaseStatus(score) {
    if (score >= 90) {
        return "ready_for_next_phase";
    }

    if (score >= 78) {
        return "almost_ready";
    }

    if (score >= 60) {
        return "needs_cleanup";
    }

    return "not_ready";
}

function buildReleaseDecision({
    score,
    production,
    security,
    performance,
    refactoring,
    roadmap
}) {
    const hasProductionBlockers = production.blockers.length > 0;
    const hasSecurityBlockers = security.blockers.some(
        (item) => !String(item).toLowerCase().includes("nenhum blocker")
    );
    const hasPerformanceBlockers = performance.blockers.some(
        (item) => !String(item).toLowerCase().includes("nenhum blocker")
    );
    const hasCriticalRefactoring = refactoring.summary.critical > 0;
    const hasHighRefactoring = refactoring.summary.high > 3;

    const canStartPostgreSQL =
        score >= 75 &&
        !hasProductionBlockers &&
        !hasCriticalRefactoring;

    const canStartRedisBullMQ =
        score >= 78 &&
        !hasProductionBlockers &&
        !hasSecurityBlockers;

    const canStartDocker =
        score >= 80 &&
        !hasProductionBlockers &&
        !hasSecurityBlockers &&
        !hasPerformanceBlockers;

    const canStartVps =
        score >= 85 &&
        !hasProductionBlockers &&
        !hasSecurityBlockers &&
        !hasPerformanceBlockers &&
        !hasCriticalRefactoring;

    const canStartLovable =
        score >= 75 &&
        !hasProductionBlockers;

    return {
        nextRecommendedPhase: getNextRecommendedPhase({
            canStartPostgreSQL,
            canStartRedisBullMQ,
            canStartDocker,
            canStartVps,
            canStartLovable,
            roadmap
        }),
        canStartPostgreSQL,
        canStartRedisBullMQ,
        canStartDocker,
        canStartVps,
        canStartLovable,
        shouldRefactorBeforeNextPhase:
            hasCriticalRefactoring || hasHighRefactoring,
        shouldFixSecurityBeforeVps:
            hasSecurityBlockers || security.score < 80,
        shouldFixPerformanceBeforeScale:
            hasPerformanceBlockers || performance.score < 75,
        reason: getDecisionReason({
            score,
            hasProductionBlockers,
            hasSecurityBlockers,
            hasPerformanceBlockers,
            hasCriticalRefactoring,
            hasHighRefactoring
        })
    };
}

function getNextRecommendedPhase({
    canStartPostgreSQL,
    canStartRedisBullMQ,
    canStartDocker,
    canStartVps,
    canStartLovable,
    roadmap
}) {
    if (!canStartPostgreSQL) {
        return "cleanup_before_database";
    }

    if (canStartPostgreSQL && !canStartRedisBullMQ) {
        return "postgresql";
    }

    if (canStartRedisBullMQ && !canStartDocker) {
        return "redis_bullmq";
    }

    if (canStartDocker && !canStartVps) {
        return "docker";
    }

    if (canStartVps && !canStartLovable) {
        return "vps";
    }

    if (canStartLovable) {
        return roadmap.nextStep?.module || "lovable_frontend";
    }

    return "manual_review";
}

function getDecisionReason({
    score,
    hasProductionBlockers,
    hasSecurityBlockers,
    hasPerformanceBlockers,
    hasCriticalRefactoring,
    hasHighRefactoring
}) {
    if (hasProductionBlockers) {
        return "Existem blockers de produção. Corrigir antes de avançar.";
    }

    if (hasSecurityBlockers) {
        return "Existem blockers de segurança. Corrigir antes de VPS pública.";
    }

    if (hasPerformanceBlockers) {
        return "Existem blockers de performance. Corrigir antes de escalar.";
    }

    if (hasCriticalRefactoring) {
        return "Existem refatorações críticas. Corrigir antes da próxima fase.";
    }

    if (hasHighRefactoring) {
        return "Existem muitas refatorações altas. Recomenda-se limpeza antes de avançar.";
    }

    if (score >= 90) {
        return "Backend saudável para avançar para a próxima fase.";
    }

    if (score >= 78) {
        return "Backend quase pronto. Avançar com cautela e monitoramento.";
    }

    return "Backend precisa de limpeza antes da próxima fase.";
}

function getCurrentStage(roadmap) {
    if (roadmap.progress >= 80) {
        return "production_preparation";
    }

    if (roadmap.progress >= 60) {
        return "infrastructure_preparation";
    }

    if (roadmap.progress >= 40) {
        return "backend_intelligence";
    }

    return "foundation";
}

function getReleaseBlockers({
    production,
    security,
    performance,
    refactoring
}) {
    const blockers = [];

    for (const item of production.blockers) {
        blockers.push(`Production: ${formatBlocker(item)}`);
    }

    for (const item of security.blockers) {
        if (!String(item).toLowerCase().includes("nenhum blocker")) {
            blockers.push(`Security: ${formatBlocker(item)}`);
        }
    }

    for (const item of performance.blockers) {
        if (!String(item).toLowerCase().includes("nenhum blocker")) {
            blockers.push(`Performance: ${formatBlocker(item)}`);
        }
    }

    if (refactoring.summary.critical > 0) {
        blockers.push("Refactoring: existem candidatos críticos de refatoração.");
    }

    if (!blockers.length) {
        blockers.push("Nenhum blocker crítico encontrado para a próxima fase.");
    }

    return blockers;
}

function getReleaseWarnings({
    production,
    security,
    performance,
    refactoring
}) {
    const warnings = [];

    if (production.warnings.length > 0) {
        warnings.push(`${production.warnings.length} warning(s) de produção.`);
    }

    if (security.score < 85) {
        warnings.push(`Score de segurança abaixo do ideal: ${security.score}%.`);
    }

    if (performance.score < 85) {
        warnings.push(`Score de performance abaixo do ideal: ${performance.score}%.`);
    }

    if (refactoring.summary.high > 0) {
        warnings.push(`${refactoring.summary.high} candidato(s) alto(s) de refatoração.`);
    }

    if (!warnings.length) {
        warnings.push("Nenhum warning relevante encontrado.");
    }

    return warnings;
}

function getReleaseNextSteps(decision) {
    if (decision.shouldRefactorBeforeNextPhase) {
        return [
            "Executar Refactoring Advisor.",
            "Corrigir candidatos critical/high.",
            "Rodar scan /src novamente.",
            "Reavaliar Release Advisor."
        ];
    }

    if (decision.shouldFixSecurityBeforeVps) {
        return [
            "Revisar AI Security Dashboard.",
            "Adicionar Helmet, CORS restrito, rate-limit, Auth/RBAC e audit logs.",
            "Reavaliar segurança antes da VPS."
        ];
    }

    if (decision.nextRecommendedPhase === "postgresql") {
        return [
            "Iniciar Fase PostgreSQL.",
            "Criar camada database.",
            "Migrar repositories em memória gradualmente.",
            "Manter contratos da API."
        ];
    }

    if (decision.nextRecommendedPhase === "redis_bullmq") {
        return [
            "Iniciar Redis.",
            "Migrar fila em memória para BullMQ.",
            "Separar worker do processo principal."
        ];
    }

    if (decision.nextRecommendedPhase === "docker") {
        return [
            "Criar Dockerfile.",
            "Criar docker-compose com API, PostgreSQL e Redis.",
            "Padronizar .env de produção."
        ];
    }

    return [
        "Seguir próxima fase recomendada.",
        "Manter AI Monitor ativo.",
        "Rodar teste mecânico geral após cada mudança estrutural."
    ];
}

function getReleaseRecommendations({
    score,
    decision,
    production,
    security,
    performance,
    refactoring
}) {
    const recommendations = [];

    if (score < 78) {
        recommendations.push("Não avançar para infraestrutura pesada antes de corrigir pontos principais.");
    }

    if (decision.canStartPostgreSQL) {
        recommendations.push("PostgreSQL pode ser iniciado mantendo contratos atuais de API.");
    }

    if (decision.canStartRedisBullMQ) {
        recommendations.push("Redis/BullMQ pode ser planejado após estabilizar persistência.");
    }

    if (decision.canStartDocker) {
        recommendations.push("Docker deve vir depois de PostgreSQL e Redis estarem definidos.");
    }

    if (decision.canStartLovable) {
        recommendations.push("Lovable pode começar como frontend consumidor da API, sem regra crítica.");
    }

    if (security.score < 85) {
        recommendations.push("Antes de VPS pública, priorizar segurança.");
    }

    if (performance.score < 85) {
        recommendations.push("Antes de escala, revisar performance estrutural.");
    }

    if (refactoring.summary.high > 0 || refactoring.summary.critical > 0) {
        recommendations.push("Executar pequenas refatorações antes de adicionar novas features grandes.");
    }

    recommendations.push("Sempre rodar scanner, security, performance, refactoring e release advisor após alterações grandes.");

    return recommendations;
}

function formatBlocker(item) {
    if (typeof item === "string") {
        return item;
    }

    return item.label || item.detail || JSON.stringify(item);
}