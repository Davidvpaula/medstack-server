import {
    generateExecutiveReport
} from "./ai-executive-report.service.js";

import {
    getArchitectureAdvisorReport
} from "./ai-architecture-advisor.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    getProductionReadinessReport
} from "./ai-production-readiness.service.js";

const snapshots = [];

export function generateContinuousSnapshot() {

    const executive = generateExecutiveReport();

    const advisor = getArchitectureAdvisorReport();

    const technicalDebt = getTechnicalDebtReport();

    const production = getProductionReadinessReport();

    const snapshot = {

        id: snapshots.length + 1,

        createdAt: new Date().toISOString(),

        executiveScore: executive.healthScore,

        productionScore: production.score,

        technicalDebts: technicalDebt.summary.total,

        highDebts: technicalDebt.summary.high,

        criticalDebts: technicalDebt.summary.critical,

        roadmapProgress: advisor.summary.roadmapProgress,

        architectureSuggestions:
            advisor.summary.architectureSuggestions

    };

    snapshots.unshift(snapshot);

    if (snapshots.length > 500) {
        snapshots.length = 500;
    }

    return compareWithPrevious(snapshot);
}

export function listContinuousSnapshots() {
    return snapshots;
}

function compareWithPrevious(current) {

    const previous = snapshots[1];

    if (!previous) {

        return {

            snapshot: current,

            comparison: null

        };

    }

    return {

        snapshot: current,

        comparison: {

            executiveVariation:
                current.executiveScore - previous.executiveScore,

            productionVariation:
                current.productionScore - previous.productionScore,

            technicalDebtVariation:
                current.technicalDebts - previous.technicalDebts,

            roadmapVariation:
                current.roadmapProgress - previous.roadmapProgress

        }

    };

}