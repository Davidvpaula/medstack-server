export function safeObject(value) {
    return (
        value
        && typeof value === "object"
        && !Array.isArray(value)
    )
        ? value
        : {};
}

export function toArray(value) {
    return Array.isArray(value)
        ? value
        : [];
}

export function toNumber(
    value,
    fallback = 0
) {
    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}

export function toBoolean(value) {
    return Boolean(value);
}

export function toString(
    value,
    fallback = ""
) {
    if (
        value === undefined
        || value === null
    ) {
        return fallback;
    }

    return String(value);
}

export function clampScore(value) {
    return Math.max(
        Math.min(
            Math.round(
                toNumber(value)
            ),
            100
        ),
        0
    );
}

export function uniqueStrings(items) {
    return [
        ...new Set(
            toArray(items)
                .filter(Boolean)
                .map((item) =>
                    formatReportItem(item)
                )
                .filter(Boolean)
        )
    ];
}

export function formatReportItem(item) {
    if (typeof item === "string") {
        return item;
    }

    if (
        typeof item === "number"
        || typeof item === "boolean"
    ) {
        return String(item);
    }

    const object =
        safeObject(item);

    return (
        object.detail
        || object.label
        || object.title
        || object.message
        || object.description
        || safeJsonStringify(object)
    );
}

export function normalizeSummary(
    summary = {}
) {
    return {
        ...safeObject(summary)
    };
}

export function normalizeReport(
    report = {},
    defaults = {}
) {
    const source =
        safeObject(report);

    const fallback =
        safeObject(defaults);

    return {
        ...fallback,
        ...source,

        type:
            source.type
            || fallback.type
            || "unknown_report",

        generatedAt:
            source.generatedAt
            || fallback.generatedAt
            || new Date().toISOString(),

        score:
            clampScore(
                source.score
                ?? fallback.score
                ?? 0
            ),

        status:
            source.status
            || fallback.status
            || "unknown",

        summary:
            normalizeSummary(
                source.summary
                ?? fallback.summary
            ),

        blockers:
            toArray(
                source.blockers
                ?? fallback.blockers
            ),

        warnings:
            toArray(
                source.warnings
                ?? fallback.warnings
            ),

        recommendations:
            toArray(
                source.recommendations
                ?? fallback.recommendations
            ),

        nextSteps:
            toArray(
                source.nextSteps
                ?? fallback.nextSteps
            )
    };
}

export function createReport({
    type,
    generatedAt =
        new Date().toISOString(),
    score = 0,
    status = "unknown",
    summary = {},
    blockers = [],
    warnings = [],
    recommendations = [],
    nextSteps = [],
    data = {}
} = {}) {
    return {
        type:
            type || "unknown_report",

        generatedAt,

        score:
            clampScore(score),

        status,

        summary:
            normalizeSummary(summary),

        blockers:
            toArray(blockers),

        warnings:
            toArray(warnings),

        recommendations:
            toArray(recommendations),

        nextSteps:
            toArray(nextSteps),

        ...safeObject(data)
    };
}

export function countByStatus(
    items,
    status
) {
    return toArray(items)
        .filter(
            (item) =>
                safeObject(item).status
                === status
        )
        .length;
}

export function hasRealItems(items) {
    return toArray(items).length > 0;
}

export function safeJsonStringify(
    value,
    fallback = "{}"
) {
    try {
        return JSON.stringify(value);
    } catch {
        return fallback;
    }
}