import {
    getRefactoringAdvisorReport
} from "./ai-refactoring-advisor.service.js";

import {
    formatReportItem,
    safeJsonStringify,
    safeObject,
    toArray,
    toNumber
} from "./ai-report-utils.service.js";

export async function renderRefactoringDashboard() {
    const report =
        await getRefactoringAdvisorReport();

    const summary =
        safeObject(
            report.summary
        );

    const strategy =
        safeObject(
            report
                .refactoringStrategy
        );

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>
<meta
    http-equiv="refresh"
    content="15"
>

<title>MedStack AI Refactoring Advisor</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family:
        Arial,
        sans-serif;
    background: #f3f4f6;
    padding: 30px;
    color: #111827;
}

.container {
    max-width: 1250px;
    margin: auto;
}

.header,
.card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow:
        0 10px 35px
        rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
}

.header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
}

.header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.grid {
    display: grid;
    grid-template-columns:
        repeat(2, minmax(0, 1fr));
    gap: 20px;
}

.full {
    grid-column: 1 / -1;
}

.score {
    font-size: 42px;
    font-weight: bold;
    margin: 10px 0;
}

.badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: bold;
    margin-right: 5px;
    margin-bottom: 5px;
}

.ok {
    background: #dcfce7;
    color: #166534;
}

.warn {
    background: #fef3c7;
    color: #92400e;
}

.error {
    background: #fee2e2;
    color: #991b1b;
}

.info {
    background: #dbeafe;
    color: #1e40af;
}

.candidate {
    background: #f9fafb;
    border-left: 4px solid #7c3aed;
    padding: 14px;
    margin-bottom: 12px;
    border-radius: 8px;
}

.blocker {
    background: #fef2f2;
    border-left: 4px solid #dc2626;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.warning {
    background: #fff7ed;
    border-left: 4px solid #ea580c;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.action {
    background: #eff6ff;
    border-left: 4px solid #2563eb;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.recommendation {
    background: #f0fdf4;
    border-left: 4px solid #16a34a;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.metric-grid {
    display: grid;
    grid-template-columns:
        repeat(4, minmax(0, 1fr));
    gap: 12px;
}

.metric {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 14px;
    border-radius: 10px;
}

.metric-label {
    color: #6b7280;
    font-size: 12px;
    margin-bottom: 6px;
}

.metric-value {
    font-size: 22px;
    font-weight: bold;
}

button {
    padding: 12px 18px;
    border: none;
    border-radius: 10px;
    background: #2563eb;
    color: white;
    font-weight: bold;
    cursor: pointer;
}

button:hover {
    background: #1d4ed8;
}

button.secondary {
    background: #374151;
}

button.secondary:hover {
    background: #1f2937;
}

button:disabled {
    opacity: 0.6;
    cursor: wait;
}

table {
    width: 100%;
    border-collapse: collapse;
}

td,
th {
    padding: 9px 0;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    vertical-align: top;
}

td:last-child,
th:last-child {
    text-align: right;
    font-weight: bold;
}

.small {
    color: #6b7280;
    font-size: 13px;
}

pre {
    background: #111827;
    color: #e5e7eb;
    padding: 14px;
    border-radius: 8px;
    overflow: auto;
    font-size: 12px;
    max-height: 700px;
}

@media (max-width: 900px) {
    body {
        padding: 16px;
    }

    .header {
        flex-direction: column;
    }

    .grid {
        grid-template-columns: 1fr;
    }

    .full {
        grid-column: auto;
    }

    .metric-grid {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 520px) {
    .metric-grid {
        grid-template-columns: 1fr;
    }
}
</style>
</head>

<body>
<div class="container">

<div class="header">
    <div>
        <h1>
            🛠️ MedStack AI Refactoring Advisor
        </h1>

        <p class="small">
            Candidatos consolidados por arquivo,
            módulo, rota ou sistema, sem duplicação
            entre as fontes do AI Monitor.
        </p>

        <p class="small">
            Gerado em:
            ${escapeHtml(
                formatDate(
                    report.generatedAt
                )
            )}
        </p>
    </div>

    <div class="header-actions">
        <button
            type="button"
            onclick="scanSrc(event)"
        >
            Executar scan /src
        </button>

        <button
            type="button"
            class="secondary"
            onclick="window.location.reload()"
        >
            Atualizar painel
        </button>
    </div>
</div>

<div class="grid">

<div class="card">
    <h2>Refactoring Score</h2>

    <div class="score">
        ${toNumber(report.score)}%
    </div>

    <span
        class="badge ${getStatusClass(
            report.status
        )}"
    >
        ${escapeHtml(
            report.status
            || "unknown"
        )}
    </span>
</div>

<div class="card">
    <h2>Resumo</h2>

    <table>
        <tr>
            <td>Scanned Files</td>
            <td>
                ${toNumber(
                    summary.scannedFiles
                )}
            </td>
        </tr>

        <tr>
            <td>Scanned Modules</td>
            <td>
                ${toNumber(
                    summary.scannedModules
                )}
            </td>
        </tr>

        <tr>
            <td>Total Candidates</td>
            <td>
                ${toNumber(
                    summary.totalCandidates
                )}
            </td>
        </tr>

        <tr>
            <td>Estimated Hours</td>
            <td>
                ${toNumber(
                    summary.estimatedHours
                )}h
            </td>
        </tr>

        <tr>
            <td>Multi-source</td>
            <td>
                ${toNumber(
                    summary
                        .confirmedByMultipleSources
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Distribuição</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Critical",
            summary.critical
        )}

        ${renderMetric(
            "High",
            summary.high
        )}

        ${renderMetric(
            "Medium",
            summary.medium
        )}

        ${renderMetric(
            "Low",
            summary.low
        )}

        ${renderMetric(
            "Files",
            summary.files
        )}

        ${renderMetric(
            "Modules",
            summary.modules
        )}

        ${renderMetric(
            "Routes",
            summary.routes
        )}

        ${renderMetric(
            "Systems",
            summary.systems
        )}

    </div>
</div>

<div class="card full">
    <h2>Estratégia</h2>

    <div class="recommendation">
        <strong>
            ${escapeHtml(
                strategy.phase
                || "unknown"
            )}
        </strong>

        <p>
            ${escapeHtml(
                strategy.strategy
                || "Estratégia não disponível."
            )}
        </p>
    </div>
</div>

<div class="card full">
    <h2>Blockers</h2>

    ${renderList(
        report.blockers,
        "blocker"
    )}
</div>

<div class="card full">
    <h2>Warnings</h2>

    ${renderList(
        report.warnings,
        "warning"
    )}
</div>

<div class="card full">
    <h2>Ações imediatas</h2>

    ${renderList(
        report.immediateActions,
        "action"
    )}
</div>

<div class="card full">
    <h2>Próximos passos</h2>

    ${renderList(
        report.nextSteps,
        "action"
    )}
</div>

<div class="card full">
    <h2>Recomendações</h2>

    ${renderList(
        report.recommendations,
        "recommendation"
    )}
</div>

<div class="card full">
    <h2>Candidatos consolidados</h2>

    ${renderCandidates(
        report.candidates
    )}
</div>

<div class="card full">
    <h2>Dados técnicos</h2>

    <pre>${escapeHtml(
        safeJsonStringify(
            report,
            "{}"
        )
    )}</pre>
</div>

</div>
</div>

<script>
async function scanSrc(event) {
    const button =
        event?.target;

    if (button) {
        button.disabled = true;
        button.textContent =
            "Executando...";
    }

    try {
        const response =
            await fetch(
                "/ai-monitor/scanner/scan-src",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Falha ao executar scanner."
            );
        }

        window.location.reload();
    } catch (error) {
        alert(
            error?.message
            || "Erro ao executar scanner."
        );

        if (button) {
            button.disabled = false;
            button.textContent =
                "Executar scan /src";
        }
    }
}
</script>

</body>
</html>
`;
}

function renderMetric(
    label,
    value
) {
    return `
        <div class="metric">
            <div class="metric-label">
                ${escapeHtml(label)}
            </div>

            <div class="metric-value">
                ${toNumber(value)}
            </div>
        </div>
    `;
}

function renderCandidates(
    items
) {
    const candidates =
        toArray(items);

    if (!candidates.length) {
        return `
            <p class="small">
                Nenhum candidato encontrado.
            </p>
        `;
    }

    return candidates
        .slice(0, 75)
        .map((item) => {
            const candidate =
                safeObject(item);

            return `
                <div class="candidate">
                    <strong>
                        ${escapeHtml(
                            candidate.title
                        )}
                    </strong>

                    <p>
                        <strong>Alvo:</strong>
                        ${escapeHtml(
                            candidate.target
                        )}
                    </p>

                    <p>
                        <strong>Tipo:</strong>
                        ${escapeHtml(
                            candidate.targetType
                        )}
                    </p>

                    <p>
                        <strong>Impacto:</strong>
                        ${escapeHtml(
                            candidate.impact
                        )}
                    </p>

                    <p>
                        <strong>Ações:</strong>
                        ${escapeHtml(
                            toArray(
                                candidate
                                    .suggestedActions
                            ).join(" | ")
                        )}
                    </p>

                    <p class="small">
                        <strong>Motivos:</strong>
                        ${escapeHtml(
                            toArray(
                                candidate.reasons
                            ).join(" | ")
                        )}
                    </p>

                    <p>
                        <span
                            class="badge ${getPriorityClass(
                                candidate.priority
                            )}"
                        >
                            ${escapeHtml(
                                candidate.priority
                            )}
                        </span>

                        <span class="badge info">
                            ${toNumber(
                                candidate
                                    .estimatedHours
                            )}h
                        </span>

                        <span class="badge info">
                            ${toNumber(
                                candidate.confirmations
                            )} fonte(s)
                        </span>

                        <span class="badge info">
                            ${escapeHtml(
                                toArray(
                                    candidate.sources
                                ).join(", ")
                            )}
                        </span>
                    </p>
                </div>
            `;
        })
        .join("");
}

function renderList(
    items,
    className = "action"
) {
    const normalizedItems =
        toArray(items);

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Nenhum item encontrado.
            </p>
        `;
    }

    return normalizedItems
        .map((item) => `
            <div class="${escapeHtml(
                className
            )}">
                ${escapeHtml(
                    formatReportItem(item)
                )}
            </div>
        `)
        .join("");
}

function getPriorityClass(
    priority
) {
    if (
        priority === "critical"
        || priority === "high"
    ) {
        return "error";
    }

    if (
        priority === "medium"
    ) {
        return "warn";
    }

    return "info";
}

function getStatusClass(
    status
) {
    if (
        status === "healthy"
        || status
            === "controlled_cleanup"
    ) {
        return "ok";
    }

    if (
        status
        === "cleanup_required"
    ) {
        return "warn";
    }

    return "error";
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        "pt-BR",
        {
            dateStyle:
                "short",

            timeStyle:
                "medium"
        }
    );
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}