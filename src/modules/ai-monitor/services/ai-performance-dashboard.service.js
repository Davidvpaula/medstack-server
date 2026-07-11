import {
    getPerformanceFinalReport
} from "./ai-performance-report.service.js";

import {
    formatReportItem,
    safeObject,
    safeJsonStringify,
    toArray,
    toNumber
} from "./ai-report-utils.service.js";

export async function renderPerformanceDashboard() {
    const report =
        await getPerformanceFinalReport();

    const summary =
        safeObject(
            report.summary
        );

    const scan =
        safeObject(
            report.scan
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

<title>MedStack AI Performance</title>

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
    max-width: 1200px;
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

.item {
    background: #f9fafb;
    border-left: 4px solid #64748b;
    padding: 12px;
    margin-bottom: 10px;
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
    margin-right: 8px;
}

button:hover {
    background: #1d4ed8;
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
    <h1>
        ⚡ MedStack AI Performance
    </h1>

    <p class="small">
        Análise estrutural proporcional de arquivos,
        módulos, dependências, workers, filas e
        débito técnico.
    </p>

    <button
        type="button"
        onclick="scanSrc(event)"
    >
        Executar scan /src
    </button>

    <button
        type="button"
        onclick="window.location.reload()"
    >
        Atualizar painel
    </button>
</div>

<div class="grid">

<div class="card">
    <h2>Performance Score</h2>

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
            <td>Total Findings</td>
            <td>
                ${toNumber(
                    summary.totalFindings
                )}
            </td>
        </tr>

        <tr>
            <td>Critical</td>
            <td>
                ${toNumber(
                    summary.critical
                )}
            </td>
        </tr>

        <tr>
            <td>High</td>
            <td>
                ${toNumber(
                    summary.high
                )}
            </td>
        </tr>

        <tr>
            <td>Medium</td>
            <td>
                ${toNumber(
                    summary.medium
                )}
            </td>
        </tr>

        <tr>
            <td>Low</td>
            <td>
                ${toNumber(
                    summary.low
                )}
            </td>
        </tr>

        <tr>
            <td>Scanner Score</td>
            <td>
                ${toNumber(
                    summary.scannerScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Production Score</td>
            <td>
                ${toNumber(
                    summary.productionScore
                )}%
            </td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Cobertura estrutural</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Arquivos escaneados",
            summary.totalFiles
        )}

        ${renderMetric(
            "Arquivos afetados",
            summary.affectedFiles
        )}

        ${renderMetric(
            "Percentual afetado",
            `${toNumber(
                summary
                    .affectedFilePercentage
            )}%`
        )}

        ${renderMetric(
            "Módulos afetados",
            summary.affectedModules
        )}

        ${renderMetric(
            "Arquivos grandes",
            summary.largeFiles
        )}

        ${renderMetric(
            "Módulos pesados",
            summary.heavyModules
        )}

        ${renderMetric(
            "Imports elevados",
            summary.highImportFiles
        )}

        ${renderMetric(
            "Workers ou filas",
            summary.workerQueueRisks
        )}

    </div>
</div>

<div class="card full">
    <h2>Débito técnico</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Crítico",
            summary
                .technicalDebtCritical
        )}

        ${renderMetric(
            "Alto",
            summary
                .technicalDebtHigh
        )}

        ${renderMetric(
            "Médio",
            summary
                .technicalDebtMedium
        )}

        ${renderMetric(
            "Baixo",
            summary
                .technicalDebtLow
        )}

        ${renderMetric(
            "Total",
            summary
                .technicalDebtTotal
        )}

        ${renderMetric(
            "Horas estimadas",
            `${
                toNumber(
                    summary
                        .technicalDebtEstimatedHours
                )
            }h`
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
    <h2>Achados de Performance</h2>

    ${renderFindings(
        scan.findings
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
                ${escapeHtml(
                    toNumberOrText(
                        value
                    )
                )}
            </div>
        </div>
    `;
}

function renderFindings(items) {
    const normalizedItems =
        toArray(items);

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Nenhum achado encontrado.
            </p>
        `;
    }

    return normalizedItems
        .slice(0, 100)
        .map((item) => {
            const finding =
                safeObject(item);

            return `
                <div class="item">
                    <strong>
                        ${escapeHtml(
                            finding.title
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            finding.description
                        )}
                    </p>

                    <p class="small">
                        ${escapeHtml(
                            finding.recommendation
                        )}
                    </p>

                    <p>
                        <span
                            class="badge ${getSeverityClass(
                                finding.severity
                            )}"
                        >
                            ${escapeHtml(
                                finding.severity
                            )}
                        </span>
                    </p>

                    <p class="small">
                        ${escapeHtml(
                            finding.file
                            || finding.module
                            || "-"
                        )}
                    </p>
                </div>
            `;
        })
        .join("");
}

function renderList(
    items,
    className = "item"
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

function getSeverityClass(severity) {
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

function getStatusClass(status) {
    if (
        status === "excellent"
        || status === "good"
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

function toNumberOrText(value) {
    if (
        typeof value === "number"
    ) {
        return String(
            toNumber(value)
        );
    }

    return String(
        value ?? "-"
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