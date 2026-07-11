import {
    getFinalOverviewReport
} from "./ai-final-overview.service.js";

import {
    formatReportItem,
    safeJsonStringify,
    safeObject,
    toArray,
    toNumber
} from "./ai-report-utils.service.js";

export async function renderFinalOverviewDashboard() {
    const report =
        await getFinalOverviewReport();

    const reportData =
        safeObject(
            report.data
        );

    const summary =
        safeObject(
            report.summary
        );

    const decisions =
        safeObject(
            report.decisions
            || reportData.decisions
        );

    const infrastructure =
        safeObject(
            report.infrastructure
            || reportData.infrastructure
        );

    const diagnosticsSummary =
        safeObject(
            infrastructure
                .diagnosticsSummary
        );

    const postgres =
        safeObject(
            infrastructure.postgres
        );

    const migrations =
        safeObject(
            infrastructure.migrations
        );

    const repositories =
        safeObject(
            infrastructure.repositories
        );

    const persistence =
        safeObject(
            infrastructure.persistence
        );

    const whatsappPersistence =
        safeObject(
            infrastructure
                .whatsappPersistence
        );

    const currentRoadmapStep =
        safeObject(
            report.currentRoadmapStep
            || reportData.currentRoadmapStep
        );

    const nextRoadmapStep =
        safeObject(
            report.nextRoadmapStep
            || reportData.nextRoadmapStep
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

<title>MedStack AI Final Overview</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family:
        Inter,
        Arial,
        sans-serif;
    background: #f3f4f6;
    padding: 30px;
    color: #111827;
}

.container {
    max-width: 1400px;
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
    justify-content: flex-end;
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
    font-size: 48px;
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

.manual {
    background: #ede9fe;
    color: #5b21b6;
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

.roadmap-step {
    background: #f9fafb;
    border-left: 4px solid #7c3aed;
    padding: 14px;
    margin-bottom: 12px;
    border-radius: 8px;
}

.metric-grid {
    display: grid;
    grid-template-columns:
        repeat(4, minmax(0, 1fr));
    gap: 14px;
}

.metric {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 16px;
    border-radius: 12px;
}

.metric-label {
    color: #6b7280;
    font-size: 13px;
    margin-bottom: 8px;
}

.metric-value {
    font-size: 24px;
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
    padding: 10px 0;
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
    padding: 16px;
    border-radius: 10px;
    overflow: auto;
    font-size: 12px;
    max-height: 700px;
}

h1,
h2 {
    margin-top: 0;
}

@media (max-width: 900px) {
    body {
        padding: 16px;
    }

    .header {
        flex-direction: column;
    }

    .header-actions {
        justify-content: flex-start;
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
            🧠 MedStack AI Final Overview
        </h1>

        <p class="small">
            Painel mestre do AI Monitor,
            consolidando saúde, arquitetura,
            PostgreSQL, segurança, performance,
            refatoração, roadmap e release.
        </p>

        <p class="small">
            Gerado em:
            ${escapeHtml(
                formatDate(
                    report.generatedAt
                )
            )}
        </p>

        <p class="small">
            Estágio atual:
            <span class="badge info">
                ${escapeHtml(
                    report.currentStage
                    || reportData.currentStage
                    || "unknown"
                )}
            </span>
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
    <h2>Final AI Score</h2>

    <div class="score">
        ${toNumber(
            report.score
        )}%
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

    <p class="small">
        Blockers:
        ${toNumber(
            summary.totalBlockers
        )}

        |

        Warnings:
        ${toNumber(
            summary.totalWarnings
        )}
    </p>
</div>

<div class="card">
    <h2>Decisão principal</h2>

    <table>
        <tr>
            <td>Próxima fase</td>
            <td>
                ${escapeHtml(
                    decisions
                        .nextRecommendedPhase
                    || "-"
                )}
            </td>
        </tr>

        <tr>
            <td>
                PostgreSQL estrutural
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .postgresStructuralCompleted
                )}
            </td>
        </tr>

        <tr>
            <td>
                Teste PostgreSQL
            </td>
            <td>
                ${renderValidationStatus({
                    completed:
                        decisions
                            .postgresMechanicalTestCompleted,

                    waiting:
                        decisions
                            .postgresMechanicalTestWaitingValidation
                })}
            </td>
        </tr>

        <tr>
            <td>
                Teste AI Monitor
            </td>
            <td>
                ${renderValidationStatus({
                    completed:
                        decisions
                            .aiMonitorMechanicalTestCompleted,

                    waiting:
                        decisions
                            .aiMonitorMechanicalTestWaitingValidation
                })}
            </td>
        </tr>

        <tr>
            <td>Motivo</td>
            <td>
                ${escapeHtml(
                    decisions.reason
                    || "-"
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Scores</h2>

    <table>
        <tr>
            <td>Executive</td>
            <td>
                ${toNumber(
                    summary.executiveScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Production</td>
            <td>
                ${toNumber(
                    summary.productionScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Security</td>
            <td>
                ${toNumber(
                    summary.securityScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Performance</td>
            <td>
                ${toNumber(
                    summary.performanceScore
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
            <td>Release</td>
            <td>
                ${toNumber(
                    summary.releaseScore
                )}%
            </td>
        </tr>

        <tr>
            <td>Roadmap Score</td>
            <td>
                ${toNumber(
                    summary.roadmapScore
                )}%
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Projeto</h2>

    <table>
        <tr>
            <td>Roadmap Progress</td>
            <td>
                ${toNumber(
                    summary.roadmapProgress
                )}%
            </td>
        </tr>

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
            <td>Scanned Lines</td>
            <td>
                ${toNumber(
                    summary.scannedLines
                )}
            </td>
        </tr>

        <tr>
            <td>Módulos críticos</td>
            <td>
                ${toNumber(
                    summary.moduleCriticalRisk
                )}
            </td>
        </tr>

        <tr>
            <td>Módulos de alto risco</td>
            <td>
                ${toNumber(
                    summary.moduleHighRisk
                )}
            </td>
        </tr>

        <tr>
            <td>
                Candidatos de refatoração
            </td>
            <td>
                ${toNumber(
                    summary
                        .refactoringCandidates
                )}
            </td>
        </tr>

        <tr>
            <td>
                Horas estimadas
            </td>
            <td>
                ${toNumber(
                    summary
                        .refactoringEstimatedHours
                )}h
            </td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Roadmap</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Concluídas",
            toNumber(
                summary.roadmapCompleted
            )
        )}

        ${renderMetric(
            "Em andamento",
            toNumber(
                summary.roadmapInProgress
            )
        )}

        ${renderMetric(
            "Pendentes",
            toNumber(
                summary.roadmapPending
            )
        )}

        ${renderMetric(
            "Bloqueadas",
            toNumber(
                summary.roadmapBlocked
            )
        )}

        ${renderMetric(
            "Validação manual",
            toNumber(
                summary
                    .roadmapManualValidation
            )
        )}

        ${renderMetric(
            "Progresso",
            `${toNumber(
                summary.roadmapProgress
            )}%`
        )}

    </div>
</div>

<div class="card">
    <h2>Etapa atual</h2>

    ${renderRoadmapStep(
        currentRoadmapStep,
        "Nenhuma etapa atual identificada."
    )}
</div>

<div class="card">
    <h2>Próxima etapa</h2>

    ${renderRoadmapStep(
        nextRoadmapStep,
        "Nenhuma próxima etapa identificada."
    )}
</div>

<div class="card full">
    <h2>
        Infraestrutura PostgreSQL
    </h2>

    <div class="metric-grid">

        ${renderMetric(
            "Conectado",
            renderBoolean(
                postgres.connected
                ?? summary.postgresConnected
            ),
            true
        )}

        ${renderMetric(
            "PostgreSQL pronto",
            renderBoolean(
                postgres.ready
                ?? summary.postgresReady
            ),
            true
        )}

        ${renderMetric(
            "Migrations prontas",
            renderBoolean(
                migrations.ready
                ?? summary.migrationsReady
            ),
            true
        )}

        ${renderMetric(
            "Migrations executadas",
            toNumber(
                migrations.executed
                ?? summary.migrationsExecuted
            )
        )}

        ${renderMetric(
            "Migrations pendentes",
            toNumber(
                migrations.pending
                ?? summary.migrationsPending
            )
        )}

        ${renderMetric(
            "Repositories prontos",
            renderBoolean(
                repositories.ready
                ?? summary.repositoriesReady
            ),
            true
        )}

        ${renderMetric(
            "Repositories",
            toNumber(
                repositories.total
                ?? summary.databaseRepositories
            )
        )}

        ${renderMetric(
            "Persistência pronta",
            renderBoolean(
                persistence.ready
                ?? summary
                    .databasePersistenceReady
            ),
            true
        )}

        ${renderMetric(
            "Diagnóstico",
            escapeHtml(
                infrastructure
                    .diagnosticsStatus
                || "-"
            )
        )}

        ${renderMetric(
            "Checks aprovados",
            toNumber(
                diagnosticsSummary.passed
                ?? summary.diagnosticsPassed
            )
        )}

        ${renderMetric(
            "Warnings",
            toNumber(
                diagnosticsSummary.warnings
                ?? summary
                    .diagnosticsWarnings
            )
        )}

        ${renderMetric(
            "Falhas",
            toNumber(
                diagnosticsSummary.failed
                ?? summary.diagnosticsFailed
            )
        )}

    </div>
</div>

<div class="card full">
    <h2>Persistência WhatsApp</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Persistência pronta",
            renderBoolean(
                whatsappPersistence.ready
                ?? summary
                    .whatsappPersistenceReady
            ),
            true
        )}

        ${renderMetric(
            "Bindings",
            toNumber(
                whatsappPersistence.bindings
                ?? summary.whatsappBindings
            )
        )}

        ${renderMetric(
            "Flushers",
            toNumber(
                whatsappPersistence.flushers
                ?? summary.whatsappFlushers
            )
        )}

        ${renderMetric(
            "Instâncias",
            toNumber(
                whatsappPersistence.instances
                ?? summary.whatsappInstances
            )
        )}

        ${renderMetric(
            "Instâncias não saudáveis",
            toNumber(
                whatsappPersistence
                    .unhealthyInstances
                ?? summary
                    .unhealthyWhatsappInstances
            )
        )}

    </div>
</div>

<div class="card full">
    <h2>Preparação das próximas fases</h2>

    <table>
        <tr>
            <td>
                Iniciar PostgreSQL
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .canStartPostgreSQL
                )}
            </td>
        </tr>

        <tr>
            <td>
                Preparar Redis/BullMQ
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .canPrepareRedisBullMQ
                )}
            </td>
        </tr>

        <tr>
            <td>
                Iniciar Redis/BullMQ
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .canStartRedisBullMQ
                )}
            </td>
        </tr>

        <tr>
            <td>
                Preparar Docker
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .canPrepareDocker
                )}
            </td>
        </tr>

        <tr>
            <td>
                Iniciar Docker
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .canStartDocker
                )}
            </td>
        </tr>

        <tr>
            <td>VPS</td>
            <td>
                ${renderBoolean(
                    decisions
                        .canStartVps
                )}
            </td>
        </tr>

        <tr>
            <td>
                Planejar Lovable
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .canPlanLovable
                )}
            </td>
        </tr>

        <tr>
            <td>
                Integrar Lovable
            </td>
            <td>
                ${renderBoolean(
                    decisions
                        .canStartLovable
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Refatoração</h2>

    <div class="metric-grid">

        ${renderMetric(
            "Total",
            toNumber(
                summary
                    .refactoringCandidates
            )
        )}

        ${renderMetric(
            "Critical",
            toNumber(
                summary
                    .refactoringCritical
            )
        )}

        ${renderMetric(
            "High",
            toNumber(
                summary.refactoringHigh
            )
        )}

        ${renderMetric(
            "Medium",
            toNumber(
                summary.refactoringMedium
            )
        )}

        ${renderMetric(
            "Low",
            toNumber(
                summary.refactoringLow
            )
        )}

        ${renderMetric(
            "Horas",
            `${toNumber(
                summary
                    .refactoringEstimatedHours
            )}h`
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
    value,
    allowHtml = false
) {
    const renderedValue =
        allowHtml
            ? String(
                value ?? "-"
            )
            : escapeHtml(
                value ?? "-"
            );

    return `
        <div class="metric">
            <div class="metric-label">
                ${escapeHtml(label)}
            </div>

            <div class="metric-value">
                ${renderedValue}
            </div>
        </div>
    `;
}

function renderRoadmapStep(
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
        <div class="roadmap-step">
            <h3>
                ${escapeHtml(
                    step.module
                )}
            </h3>

            <p>
                <span
                    class="badge ${getRoadmapStatusClass(
                        step.status
                    )}"
                >
                    ${escapeHtml(
                        formatRoadmapStatus(
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
                "Bloqueado por",
                step.blockedBy
            )}
        </div>
    `;
}

function renderInlineList(
    label,
    items
) {
    const normalizedItems =
        toArray(items);

    if (!normalizedItems.length) {
        return "";
    }

    return `
        <p class="small">
            <strong>
                ${escapeHtml(label)}:
            </strong>

            ${escapeHtml(
                normalizedItems.join(
                    " | "
                )
            )}
        </p>
    `;
}

function renderList(
    items,
    className =
        "recommendation"
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

function getStatusClass(
    status
) {
    if (
        status === "excellent"
        || status
            === "ready_to_advance"
    ) {
        return "ok";
    }

    if (
        status === "needs_cleanup"
        || status
            === "blocked_with_good_score"
    ) {
        return "warn";
    }

    return "error";
}

function getRoadmapStatusClass(
    status
) {
    if (status === "done") {
        return "ok";
    }

    if (
        status === "manual_validation"
    ) {
        return "manual";
    }

    if (
        status === "in_progress"
        || status === "pending"
    ) {
        return "warn";
    }

    return "error";
}

function formatRoadmapStatus(
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

function renderValidationStatus({
    completed,
    waiting
}) {
    if (Boolean(completed)) {
        return `
            <span class="badge ok">
                CONCLUÍDO
            </span>
        `;
    }

    if (Boolean(waiting)) {
        return `
            <span class="badge manual">
                VALIDAR
            </span>
        `;
    }

    return `
        <span class="badge error">
            PENDENTE
        </span>
    `;
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