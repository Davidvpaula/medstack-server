import {
    getArchitectureAdvisorReport
} from "./ai-architecture-advisor.service.js";

import {
    formatReportItem,
    safeJsonStringify,
    safeObject,
    toArray,
    toNumber
} from "./ai-report-utils.service.js";

export function renderArchitectureAdvisorDashboard() {
    const advisor =
        getArchitectureAdvisorReport();

    const summary =
        safeObject(
            advisor.summary
        );

    const readiness =
        safeObject(
            advisor.canMoveForward
        );

    const nextModule =
        safeObject(
            advisor.recommendedNextModule
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

<title>MedStack Architecture Advisor</title>

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

.priority {
    background: #eff6ff;
    border-left: 4px solid #2563eb;
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

.opinion {
    background: #f0fdf4;
    border-left: 4px solid #16a34a;
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

button {
    padding: 12px 18px;
    border: none;
    border-radius: 10px;
    background: #2563eb;
    color: white;
    font-weight: bold;
    cursor: pointer;
}

button.secondary {
    background: #374151;
}

button:hover {
    opacity: 0.9;
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

@media (max-width: 850px) {
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
}
</style>
</head>

<body>
<div class="container">

<div class="header">
    <div>
        <h1>
            🧠 MedStack Architecture Advisor
        </h1>

        <p>
            Stage:
            <span class="badge info">
                ${escapeHtml(
                    advisor.currentStage
                    || "unknown"
                )}
            </span>
        </p>

        <p>
            ${escapeHtml(
                advisor.globalAssessment
                || "-"
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
    <h2>Architecture Advisor Score</h2>

    <div class="score">
        ${toNumber(advisor.score)}%
    </div>

    <span
        class="badge ${getStatusClass(
            advisor.status
        )}"
    >
        ${escapeHtml(
            advisor.status
            || "unknown"
        )}
    </span>
</div>

<div class="card">
    <h2>Resumo</h2>

    <table>
        <tr>
            <td>Architecture Score</td>
            <td>
                ${toNumber(
                    summary.architectureScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Module Health</td>
            <td>
                ${toNumber(
                    summary.moduleHealthScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Technical Debt</td>
            <td>
                ${toNumber(
                    summary.technicalDebtScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Total Debts</td>
            <td>
                ${toNumber(
                    summary.technicalDebts
                )}
            </td>
        </tr>

        <tr>
            <td>Critical Debts</td>
            <td>
                ${toNumber(
                    summary
                        .criticalTechnicalDebts
                )}
            </td>
        </tr>

        <tr>
            <td>High Debts</td>
            <td>
                ${toNumber(
                    summary
                        .highTechnicalDebts
                )}
            </td>
        </tr>

        <tr>
            <td>Critical Modules</td>
            <td>
                ${toNumber(
                    summary.criticalModules
                )}
            </td>
        </tr>

        <tr>
            <td>High Risk Modules</td>
            <td>
                ${toNumber(
                    summary.highRiskModules
                )}
            </td>
        </tr>

        <tr>
            <td>Roadmap Progress</td>
            <td>
                ${toNumber(
                    summary.roadmapProgress
                )}%
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Próximo módulo</h2>

    <p>
        <strong>
            ${escapeHtml(
                nextModule.module
                || "-"
            )}
        </strong>
    </p>

    <p>
        Prioridade:
        <span class="badge info">
            ${escapeHtml(
                nextModule.priority
                || "-"
            )}
        </span>
    </p>

    <p>
        ${escapeHtml(
            nextModule.reason
            || "-"
        )}
    </p>
</div>

<div class="card">
    <h2>Pode avançar?</h2>

    <table>
        <tr>
            <td>Beta assistido</td>
            <td>
                ${renderBoolean(
                    readiness.betaAssisted
                )}
            </td>
        </tr>

        <tr>
            <td>Produção pequena escala</td>
            <td>
                ${renderBoolean(
                    readiness
                        .productionSmallScale
                )}
            </td>
        </tr>

        <tr>
            <td>Preparação de escala</td>
            <td>
                ${renderBoolean(
                    readiness
                        .productionLargeScale
                )}
            </td>
        </tr>

        <tr>
            <td>Motivo</td>
            <td>
                ${escapeHtml(
                    readiness.reason
                    || "-"
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Opinião de produção</h2>

    <div class="opinion">
        ${escapeHtml(
            advisor.productionOpinion
            || "-"
        )}
    </div>
</div>

<div class="card full">
    <h2>Opinião de escala</h2>

    <div class="opinion">
        ${escapeHtml(
            advisor.scalingOpinion
            || "-"
        )}
    </div>
</div>

<div class="card full">
    <h2>Blockers</h2>

    ${renderList(
        advisor.blockers,
        "blocker"
    )}
</div>

<div class="card full">
    <h2>Prioridades imediatas</h2>

    ${renderPriorities(
        advisor.immediatePriorities
    )}
</div>

<div class="card full">
    <h2>Warnings estratégicos</h2>

    ${renderList(
        advisor.warnings,
        "warning"
    )}
</div>

<div class="card full">
    <h2>Próximos passos</h2>

    ${renderList(
        advisor.nextSteps,
        "next-step"
    )}
</div>

<div class="card full">
    <h2>Recomendações</h2>

    ${renderList(
        advisor.recommendations,
        "recommendation"
    )}
</div>

<div class="card full">
    <h2>Dados técnicos</h2>

    <pre>${escapeHtml(
        safeJsonStringify(
            advisor,
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

function renderPriorities(
    items
) {
    const priorities =
        toArray(items);

    if (!priorities.length) {
        return `
            <p class="small">
                Nenhuma prioridade encontrada.
            </p>
        `;
    }

    return priorities
        .map((item) => {
            const priority =
                safeObject(item);

            return `
                <div class="priority">
                    <strong>
                        ${escapeHtml(
                            priority.title
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            priority.reason
                        )}
                    </p>

                    <p>
                        <strong>Ação:</strong>
                        ${escapeHtml(
                            priority.action
                        )}
                    </p>

                    <span
                        class="badge ${getPriorityClass(
                            priority.priority
                        )}"
                    >
                        ${escapeHtml(
                            priority.priority
                        )}
                    </span>
                </div>
            `;
        })
        .join("");
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
        status
        === "architecture_healthy"
        || status
            === "architecture_controlled"
    ) {
        return "ok";
    }

    if (
        status
        === "architecture_needs_attention"
    ) {
        return "warn";
    }

    return "error";
}

function renderBoolean(value) {
    if (Boolean(value)) {
        return `
            <span class="badge ok">
                SIM
            </span>
        `;
    }

    return `
        <span class="badge error">
            NÃO
        </span>
    `;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}