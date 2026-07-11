import {
    getModuleHealthReport
} from "./ai-module-health.service.js";

import {
    formatReportItem,
    safeJsonStringify,
    safeObject,
    toArray,
    toNumber
} from "./ai-report-utils.service.js";

export function renderModuleHealthDashboard() {
    const report =
        getModuleHealthReport();

    const summary =
        safeObject(
            report.summary
        );

    const scannerSummary =
        safeObject(
            report.scannerSummary
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

<title>MedStack Module Health</title>

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

.module {
    background: #f9fafb;
    border-left: 4px solid #2563eb;
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

.suggestion {
    background: #f5f3ff;
    border-left: 4px solid #7c3aed;
    padding: 14px;
    margin-bottom: 12px;
    border-radius: 8px;
}

.recommendation {
    background: #f0fdf4;
    border-left: 4px solid #16a34a;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.next-step {
    background: #eff6ff;
    border-left: 4px solid #2563eb;
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
    border-bottom:
        1px solid #e5e7eb;
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
            🧩 MedStack Module Health
        </h1>

        <p class="small">
            Fonte oficial da classificação
            estrutural dos módulos do projeto.
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
    <h2>Module Health Score</h2>

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
    <h2>Scanner</h2>

    <table>
        <tr>
            <td>Total Files</td>
            <td>
                ${toNumber(
                    scannerSummary.totalFiles
                )}
            </td>
        </tr>

        <tr>
            <td>Total Lines</td>
            <td>
                ${toNumber(
                    scannerSummary.totalLines
                )}
            </td>
        </tr>

        <tr>
            <td>Total Modules</td>
            <td>
                ${toNumber(
                    scannerSummary.totalModules
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Resumo dos módulos</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Total",
            summary.totalModules
        )}

        ${renderMetric(
            "Critical",
            summary.criticalRisk
        )}

        ${renderMetric(
            "High",
            summary.highRisk
        )}

        ${renderMetric(
            "Medium",
            summary.mediumRisk
        )}

        ${renderMetric(
            "Low",
            summary.lowRisk
        )}

        ${renderMetric(
            "Healthy",
            summary.healthy
        )}

        ${renderMetric(
            "Arquivos > 500",
            summary.veryLargeFiles
        )}

        ${renderMetric(
            "Alto acoplamento",
            summary.highlyCoupledFiles
        )}

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
    <h2>Sugestões</h2>

    ${renderSuggestions(
        report.suggestions
    )}
</div>

<div class="card full">
    <h2>Próximos passos</h2>

    ${renderList(
        report.nextSteps,
        "next-step"
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
    <h2>Saúde por módulo</h2>

    ${renderModules(
        report.modules
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

function renderSuggestions(
    items
) {
    const suggestions =
        toArray(items);

    if (!suggestions.length) {
        return `
            <p class="small">
                Nenhuma sugestão encontrada.
            </p>
        `;
    }

    return suggestions
        .map((item) => {
            const suggestion =
                safeObject(item);

            return `
                <div class="suggestion">
                    <strong>
                        ${escapeHtml(
                            suggestion.title
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            suggestion.description
                        )}
                    </p>

                    <p class="small">
                        ${escapeHtml(
                            suggestion.recommendation
                        )}
                    </p>

                    <span
                        class="badge ${getSeverityClass(
                            suggestion.severity
                        )}"
                    >
                        ${escapeHtml(
                            suggestion.severity
                        )}
                    </span>
                </div>
            `;
        })
        .join("");
}

function renderModules(
    items
) {
    const modules =
        toArray(items);

    if (!modules.length) {
        return `
            <p class="small">
                Nenhum módulo encontrado.
            </p>
        `;
    }

    return modules
        .map((item) => {
            const module =
                safeObject(item);

            return `
                <div class="module">
                    <h3>
                        ${escapeHtml(
                            module.name
                        )}
                    </h3>

                    <p>
                        <span
                            class="badge ${getRiskClass(
                                module.risk
                            )}"
                        >
                            ${escapeHtml(
                                module.risk
                            )}
                        </span>

                        <span class="badge info">
                            score
                            ${toNumber(
                                module.score
                            )}%
                        </span>

                        <span class="badge info">
                            ${toNumber(
                                module.riskPoints
                            )}
                            ponto(s)
                        </span>
                    </p>

                    <table>
                        <tr>
                            <td>Total Files</td>
                            <td>
                                ${toNumber(
                                    module.totalFiles
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Total Lines</td>
                            <td>
                                ${toNumber(
                                    module.totalLines
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Total Imports</td>
                            <td>
                                ${toNumber(
                                    module.totalImports
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Total Exports</td>
                            <td>
                                ${toNumber(
                                    module.totalExports
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Arquivos grandes</td>
                            <td>
                                ${toNumber(
                                    module.largeFiles
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Arquivos > 500</td>
                            <td>
                                ${toNumber(
                                    module.veryLargeFiles
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Alto acoplamento</td>
                            <td>
                                ${toNumber(
                                    module
                                        .highlyCoupledFiles
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Types</td>
                            <td>
                                ${escapeHtml(
                                    formatTypes(
                                        module.types
                                    )
                                )}
                            </td>
                        </tr>
                    </table>

                    <h4>Motivos</h4>

                    ${renderList(
                        module.reasons,
                        "warning"
                    )}

                    <h4>Recomendações</h4>

                    ${renderList(
                        module.recommendations,
                        "recommendation"
                    )}

                    <h4>Maiores arquivos</h4>

                    ${renderLargestFiles(
                        module.largestFiles
                    )}
                </div>
            `;
        })
        .join("");
}

function renderLargestFiles(
    items
) {
    const files =
        toArray(items);

    if (!files.length) {
        return `
            <p class="small">
                Nenhum arquivo encontrado.
            </p>
        `;
    }

    return `
        <table>
            <tr>
                <th>Arquivo</th>
                <th>Tipo</th>
                <th>Linhas</th>
                <th>Imports</th>
                <th>Exports</th>
            </tr>

            ${files
                .map((item) => {
                    const file =
                        safeObject(item);

                    return `
                        <tr>
                            <td>
                                ${escapeHtml(
                                    file.path
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    file.type
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    file.lines
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    file.imports
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    file.exports
                                )}
                            </td>
                        </tr>
                    `;
                })
                .join("")}
        </table>
    `;
}

function renderList(
    items,
    className
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

function formatTypes(
    types
) {
    return Object.entries(
        safeObject(types)
    )
        .map(
            (
                [
                    key,
                    value
                ]
            ) =>
                `${key}: ${value}`
        )
        .join(" | ");
}

function getSeverityClass(
    severity
) {
    if (
        severity === "critical"
        || severity === "high"
    ) {
        return "error";
    }

    if (severity === "medium") {
        return "warn";
    }

    return "info";
}

function getRiskClass(
    risk
) {
    if (
        risk === "critical"
        || risk === "high"
    ) {
        return "error";
    }

    if (risk === "medium") {
        return "warn";
    }

    if (risk === "low") {
        return "info";
    }

    return "ok";
}

function getStatusClass(
    status
) {
    if (
        status === "healthy"
        || status === "controlled"
    ) {
        return "ok";
    }

    if (
        status === "needs_attention"
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