import {
    getRoadmapAnalysis
} from "./ai-roadmap.service.js";

import {
    formatReportItem,
    safeJsonStringify,
    safeObject,
    toArray,
    toNumber
} from "./ai-report-utils.service.js";

export function renderRoadmapDashboard() {
    const report =
        getRoadmapAnalysis();

    const summary =
        safeObject(
            report.summary
        );

    const currentStep =
        safeObject(
            report.currentStep
        );

    const nextStep =
        safeObject(
            report.nextStep
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

<title>MedStack Roadmap</title>

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
    font-size: 44px;
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

.done {
    background: #dcfce7;
    color: #166534;
}

.in-progress {
    background: #dbeafe;
    color: #1e40af;
}

.pending {
    background: #fef3c7;
    color: #92400e;
}

.blocked {
    background: #fee2e2;
    color: #991b1b;
}

.manual {
    background: #ede9fe;
    color: #5b21b6;
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

.step {
    background: #f9fafb;
    border-left: 4px solid #64748b;
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
        repeat(5, minmax(0, 1fr));
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
    padding: 10px 0;
    border-bottom:
        1px solid #e5e7eb;
    text-align: left;
    vertical-align: top;
}

td:last-child,
th:last-child {
    text-align: right;
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

@media (max-width: 950px) {
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
            🧭 MedStack Roadmap
        </h1>

        <div class="score">
            ${toNumber(
                report.progress
            )}%
        </div>

        <span
            class="badge ${getReportStatusClass(
                report.status
            )}"
        >
            ${escapeHtml(
                report.status
                || "unknown"
            )}
        </span>

        <p class="small">
            Roadmap baseado em evidências reais
            encontradas no projeto.
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

<div class="card full">
    <h2>Resumo</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Total",
            summary.total
        )}

        ${renderMetric(
            "Concluído",
            summary.completed
        )}

        ${renderMetric(
            "Em andamento",
            summary.inProgress
        )}

        ${renderMetric(
            "Pendente",
            summary.pending
        )}

        ${renderMetric(
            "Bloqueado",
            summary.blocked
        )}

        ${renderMetric(
            "Validação manual",
            summary.manualValidation
        )}

        ${renderMetric(
            "Arquivos",
            summary.scannedFiles
        )}

        ${renderMetric(
            "Módulos",
            summary.scannedModules
        )}

    </div>
</div>

<div class="card">
    <h2>Etapa atual</h2>

    ${renderHighlightedStep(
        currentStep,
        "Nenhuma etapa em andamento."
    )}
</div>

<div class="card">
    <h2>Próxima etapa</h2>

    ${renderHighlightedStep(
        nextStep,
        "Todas as etapas foram concluídas."
    )}
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
    <h2>Roadmap completo</h2>

    ${renderRoadmap(
        report.roadmap
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

function renderHighlightedStep(
    step,
    emptyMessage
) {
    if (
        !step
        || !step.module
    ) {
        return `
            <p class="small">
                ${escapeHtml(
                    emptyMessage
                )}
            </p>
        `;
    }

    return `
        <div class="step">
            <h3>
                ${escapeHtml(
                    step.module
                )}
            </h3>

            <p>
                <span
                    class="badge ${getStepStatusClass(
                        step.status
                    )}"
                >
                    ${escapeHtml(
                        formatStepStatus(
                            step.status
                        )
                    )}
                </span>

                <span class="badge info">
                    prioridade
                    ${toNumber(
                        step.priority
                    )}
                </span>
            </p>

            ${
                step.note
                    ? `
                        <p>
                            ${escapeHtml(
                                step.note
                            )}
                        </p>
                    `
                    : ""
            }

            ${renderInlineList(
                "Evidências",
                step.evidence
            )}

            ${renderInlineList(
                "Requisitos",
                step.requirements
            )}

            ${renderInlineList(
                "Bloqueado por",
                step.blockedBy
            )}
        </div>
    `;
}

function renderRoadmap(
    items
) {
    const roadmap =
        toArray(items);

    if (!roadmap.length) {
        return `
            <p class="small">
                Nenhuma etapa encontrada.
            </p>
        `;
    }

    return roadmap
        .map((item) => {
            const step =
                safeObject(item);

            return `
                <div class="step">
                    <h3>
                        ${toNumber(
                            step.id
                        )}.
                        ${escapeHtml(
                            step.module
                        )}
                    </h3>

                    <p>
                        <span
                            class="badge ${getStepStatusClass(
                                step.status
                            )}"
                        >
                            ${escapeHtml(
                                formatStepStatus(
                                    step.status
                                )
                            )}
                        </span>

                        <span class="badge info">
                            prioridade
                            ${toNumber(
                                step.priority
                            )}
                        </span>
                    </p>

                    ${
                        step.note
                            ? `
                                <p>
                                    ${escapeHtml(
                                        step.note
                                    )}
                                </p>
                            `
                            : ""
                    }

                    ${renderInlineList(
                        "Evidências",
                        step.evidence
                    )}

                    ${renderInlineList(
                        "Requisitos",
                        step.requirements
                    )}

                    ${renderInlineList(
                        "Bloqueado por",
                        step.blockedBy
                    )}
                </div>
            `;
        })
        .join("");
}

function renderInlineList(
    title,
    items
) {
    const values =
        toArray(items);

    if (!values.length) {
        return "";
    }

    return `
        <p class="small">
            <strong>
                ${escapeHtml(title)}:
            </strong>

            ${escapeHtml(
                values.join(" | ")
            )}
        </p>
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

function getStepStatusClass(
    status
) {
    if (status === "done") {
        return "done";
    }

    if (
        status === "in_progress"
    ) {
        return "in-progress";
    }

    if (
        status === "manual_validation"
    ) {
        return "manual";
    }

    if (status === "blocked") {
        return "blocked";
    }

    return "pending";
}

function getReportStatusClass(
    status
) {
    if (
        status === "roadmap_completed"
        || status === "final_stages"
    ) {
        return "ok";
    }

    if (
        status
            === "infrastructure_stage"
        || status
            === "backend_consolidation"
    ) {
        return "warn";
    }

    return "error";
}

function formatStepStatus(
    status
) {
    const labels = {
        done:
            "concluído",

        in_progress:
            "em andamento",

        pending:
            "pendente",

        blocked:
            "bloqueado",

        manual_validation:
            "validação manual"
    };

    return (
        labels[status]
        || status
        || "desconhecido"
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