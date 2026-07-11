import {
    getSecurityScanReport
} from "./ai-security-scanner.service.js";

import {
    getSecurityRouteAnalysis
} from "./ai-security-route-analyzer.service.js";

import {
    getSecurityConfigChecklist
} from "./ai-security-config-checklist.service.js";

import {
    clampScore,
    createReport,
    safeObject,
    toArray,
    toNumber,
    uniqueStrings
} from "./ai-report-utils.service.js";

export function getSecurityFinalReport() {
    const scan =
        normalizeScan(
            getSecurityScanReport()
        );

    const routes =
        normalizeRoutes(
            getSecurityRouteAnalysis()
        );

    const config =
        normalizeConfig(
            getSecurityConfigChecklist()
        );

    const score =
        calculateSecurityScore({
            scan,
            routes,
            config
        });

    const blockers =
        getSecurityBlockers({
            scan,
            routes,
            config
        });

    const warnings =
        getSecurityWarnings({
            scan,
            routes,
            config
        });

    const recommendations =
        getSecurityRecommendations({
            score,
            scan,
            routes,
            config
        });

    const nextSteps =
        getSecurityNextSteps({
            blockers,
            config
        });

    const summary = {
        totalFindings:
            scan.summary.totalFindings,

        criticalFindings:
            scan.summary.critical,

        highFindings:
            scan.summary.high,

        mediumFindings:
            scan.summary.medium,

        lowFindings:
            scan.summary.low,

        totalRoutes:
            routes.summary.totalRoutes,

        riskyRoutes:
            routes.summary.riskyRoutes,

        criticalRoutes:
            routes.summary.critical,

        highRoutes:
            routes.summary.high,

        mediumRoutes:
            routes.summary.medium,

        checklistTotal:
            config.summary.total,

        checklistPassed:
            config.summary.passed,

        checklistPartial:
            config.summary.partial,

        checklistPending:
            config.summary.pending,

        checklistUnknown:
            config.summary.unknown,

        scannerScore:
            scan.score,

        routesScore:
            routes.score,

        configScore:
            config.score
    };

    return createReport({
        type:
            "security_final_report",

        score,

        status:
            getSecurityStatus(
                score,
                blockers
            ),

        summary,

        blockers,

        warnings,

        recommendations,

        nextSteps,

        data: {
            scan,
            routes,
            config
        }
    });
}

function calculateSecurityScore({
    scan,
    routes,
    config
}) {
    const weightedScore =
        scan.score * 0.35
        + routes.score * 0.35
        + config.score * 0.30;

    return clampScore(
        weightedScore
    );
}

function getSecurityStatus(
    score,
    blockers
) {
    if (blockers.length > 0) {
        return "not_secure_for_production";
    }

    if (score >= 90) {
        return "secure_for_beta";
    }

    if (score >= 75) {
        return "needs_minor_security_work";
    }

    if (score >= 55) {
        return "needs_security_work";
    }

    return "not_secure_for_production";
}

function getSecurityBlockers({
    scan,
    routes,
    config
}) {
    const blockers = [];

    blockers.push(
        ...scan.blockers
    );

    blockers.push(
        ...routes.blockers.map(
            (item) =>
                `Route: ${item}`
        )
    );

    if (
        config.summary.pending > 4
    ) {
        blockers.push(
            "Muitos controles fundamentais de segurança ainda estão pendentes."
        );
    }

    return uniqueStrings(
        blockers
    );
}

function getSecurityWarnings({
    scan,
    routes,
    config
}) {
    const warnings = [];

    warnings.push(
        ...scan.warnings
    );

    warnings.push(
        ...routes.warnings
    );

    warnings.push(
        ...config.warnings
    );

    return uniqueStrings(
        warnings
    );
}

function getSecurityRecommendations({
    score,
    scan,
    routes,
    config
}) {
    const recommendations = [];

    if (score < 75) {
        recommendations.push(
            "Não expor o backend publicamente antes de corrigir os principais controles de segurança."
        );
    }

    recommendations.push(
        ...scan.recommendations,
        ...routes.recommendations,
        ...config.recommendations
    );

    recommendations.push(
        "Executar testes manuais de autenticação, autorização e isolamento entre empresas."
    );

    return uniqueStrings(
        recommendations
    );
}

function getSecurityNextSteps({
    blockers,
    config
}) {
    const steps = [];

    if (blockers.length > 0) {
        steps.push(
            "Corrigir os blockers antes da VPS pública."
        );
    }

    steps.push(
        ...config.nextSteps
    );

    steps.push(
        "Executar novamente Security Scanner e Route Analyzer."
    );

    return uniqueStrings(
        steps
    );
}

function normalizeScan(scan) {
    const source =
        safeObject(scan);

    const summary =
        safeObject(
            source.summary
        );

    return {
        ...source,

        score:
            toNumber(
                source.score
            ),

        status:
            source.status
            || "unknown",

        summary: {
            totalFindings:
                toNumber(
                    summary.totalFindings
                ),

            critical:
                toNumber(
                    summary.critical
                ),

            high:
                toNumber(
                    summary.high
                ),

            medium:
                toNumber(
                    summary.medium
                ),

            low:
                toNumber(
                    summary.low
                )
        },

        findings:
            toArray(
                source.findings
            ),

        blockers:
            toArray(
                source.blockers
            ),

        warnings:
            toArray(
                source.warnings
            ),

        recommendations:
            toArray(
                source.recommendations
            ),

        nextSteps:
            toArray(
                source.nextSteps
            )
    };
}

function normalizeRoutes(routes) {
    const source =
        safeObject(routes);

    const summary =
        safeObject(
            source.summary
        );

    return {
        ...source,

        score:
            toNumber(
                source.score
            ),

        status:
            source.status
            || "unknown",

        summary: {
            totalRoutes:
                toNumber(
                    summary.totalRoutes
                ),

            riskyRoutes:
                toNumber(
                    summary.riskyRoutes
                ),

            critical:
                toNumber(
                    summary.critical
                ),

            high:
                toNumber(
                    summary.high
                ),

            medium:
                toNumber(
                    summary.medium
                ),

            low:
                toNumber(
                    summary.low
                )
        },

        riskyRoutes:
            toArray(
                source.riskyRoutes
            ),

        blockers:
            toArray(
                source.blockers
            ),

        warnings:
            toArray(
                source.warnings
            ),

        recommendations:
            toArray(
                source.recommendations
            ),

        nextSteps:
            toArray(
                source.nextSteps
            )
    };
}

function normalizeConfig(config) {
    const source =
        safeObject(config);

    const summary =
        safeObject(
            source.summary
        );

    return {
        ...source,

        score:
            toNumber(
                source.score
            ),

        status:
            source.status
            || "unknown",

        summary: {
            total:
                toNumber(
                    summary.total
                ),

            passed:
                toNumber(
                    summary.passed
                ),

            partial:
                toNumber(
                    summary.partial
                ),

            pending:
                toNumber(
                    summary.pending
                ),

            unknown:
                toNumber(
                    summary.unknown
                )
        },

        checklist:
            toArray(
                source.checklist
            ),

        blockers:
            toArray(
                source.blockers
            ),

        warnings:
            toArray(
                source.warnings
            ),

        recommendations:
            toArray(
                source.recommendations
            ),

        nextSteps:
            toArray(
                source.nextSteps
            )
    };
}