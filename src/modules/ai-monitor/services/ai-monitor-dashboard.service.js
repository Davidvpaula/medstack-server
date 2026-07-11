import {
    getFullHealthReview
} from "./ai-monitor.service.js";

import {
    generateExecutiveReport
} from "./ai-executive-report.service.js";

import {
    getArchitectureReview
} from "./ai-architecture-review.service.js";

import {
    getDependencyGraph
} from "./ai-dependency-graph.service.js";

import {
    getTechnicalDebtReport
} from "./ai-technical-debt.service.js";

import {
    getProductionReadinessReport
} from "./ai-production-readiness.service.js";

import {
    formatReportItem,
    safeJsonStringify,
    safeObject,
    toArray,
    toNumber
} from "./ai-report-utils.service.js";

export async function renderAiMonitorDashboard() {
    const [
        executiveResult,
        productionResult
    ] = await Promise.all([
        generateExecutiveReport(),
        getProductionReadinessReport()
    ]);

    const review =
        normalizeHealthReview(
            getFullHealthReview()
        );

    const executive =
        normalizeExecutiveReport(
            executiveResult
        );

    const production =
        normalizeProductionReport(
            productionResult
        );

    const architecture =
        normalizeArchitectureReport(
            getArchitectureReview()
        );

    const dependencyGraph =
        normalizeDependencyGraph(
            getDependencyGraph()
        );

    const technicalDebt =
        normalizeTechnicalDebtReport(
            getTechnicalDebtReport()
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

<title>MedStack AI Monitor</title>

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
    max-width: 1350px;
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
    justify-content: space-between;
    align-items: flex-start;
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
    margin: 12px 0;
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

.suggestion {
    background: #f9fafb;
    border-left: 4px solid #2563eb;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.risk {
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

.debt {
    background: #fff7ed;
    border-left: 4px solid #f97316;
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

.check {
    background: #f9fafb;
    border-left: 4px solid #64748b;
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
        <h1>🧠 MedStack AI Monitor</h1>

        <p>
            Status:

            <span class="badge ${getMonitorStatusClass(
                review.monitorStatus
            )}">
                ${escapeHtml(
                    review.monitorStatus
                )}
            </span>

            Mode:

            <span class="badge info">
                ${escapeHtml(
                    review.monitorMode
                )}
            </span>
        </p>

        <p class="small">
            Gerado em:
            ${escapeHtml(
                formatDate(
                    review.generatedAt
                )
            )}
        </p>

        <p class="small">
            Segurança:
            altera código:
            ${renderBoolean(
                review.canModifyCode
            )}

            deploy:
            ${renderBoolean(
                review.canDeploy
            )}

            deletar dados:
            ${renderBoolean(
                review.canDeleteData
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
    <h2>Executive Health Score</h2>

    <div class="score">
        ${toNumber(
            executive.score
        )}%
    </div>

    <p>
        Status:

        <span class="badge ${getExecutiveStatusClass(
            executive.status
        )}">
            ${escapeHtml(
                executive.status
            )}
        </span>
    </p>

    <p class="small">
        Relatório gerado em:
        ${escapeHtml(
            formatDate(
                executive.generatedAt
            )
        )}
    </p>
</div>

<div class="card">
    <h2>Production Readiness</h2>

    <div class="score">
        ${toNumber(
            production.score
        )}%
    </div>

    <p>
        Status:

        <span class="badge ${getProductionStatusClass(
            production.status
        )}">
            ${escapeHtml(
                production.status
            )}
        </span>
    </p>

    <p class="small">
        ${escapeHtml(
            production.primaryRecommendation
        )}
    </p>
</div>

<div class="card">
    <h2>Resumo Executivo</h2>

    <table>
        <tr>
            <td>WhatsApp Connected</td>
            <td>
                ${renderBoolean(
                    executive
                        .summary
                        .whatsappConnected
                )}
            </td>
        </tr>

        <tr>
            <td>Socket Alive</td>
            <td>
                ${renderBoolean(
                    executive
                        .summary
                        .socketAlive
                )}
            </td>
        </tr>

        <tr>
            <td>Queue Pending</td>
            <td>
                ${toNumber(
                    executive
                        .summary
                        .queuePending
                )}
            </td>
        </tr>

        <tr>
            <td>Dead Letter</td>
            <td>
                ${toNumber(
                    executive
                        .summary
                        .queueDeadLetter
                )}
            </td>
        </tr>

        <tr>
            <td>Log Errors</td>
            <td>
                ${toNumber(
                    executive
                        .summary
                        .logErrors
                )}
            </td>
        </tr>

        <tr>
            <td>Log Warnings</td>
            <td>
                ${toNumber(
                    executive
                        .summary
                        .logWarnings
                )}
            </td>
        </tr>

        <tr>
            <td>AI Suggestions</td>
            <td>
                ${toNumber(
                    executive
                        .summary
                        .aiSuggestions
                )}
            </td>
        </tr>

        <tr>
            <td>Knowledge Items</td>
            <td>
                ${toNumber(
                    executive
                        .summary
                        .knowledgeItems
                )}
            </td>
        </tr>

        <tr>
            <td>PostgreSQL Connected</td>
            <td>
                ${renderBoolean(
                    executive
                        .summary
                        .postgresConnected
                )}
            </td>
        </tr>

        <tr>
            <td>Persistence Ready</td>
            <td>
                ${renderBoolean(
                    executive
                        .summary
                        .persistenceReady
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Production Summary</h2>

    <table>
        <tr>
            <td>Passed</td>
            <td>
                ${production.passed.length}
            </td>
        </tr>

        <tr>
            <td>Warnings</td>
            <td>
                ${production.warnings.length}
            </td>
        </tr>

        <tr>
            <td>Blockers</td>
            <td>
                ${production.blockers.length}
            </td>
        </tr>

        <tr>
            <td>Checklist</td>
            <td>
                ${production.checklist.length}
            </td>
        </tr>

        <tr>
            <td>Next Steps</td>
            <td>
                ${production.nextSteps.length}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Runtime</h2>

    <table>
        <tr>
            <td>WhatsApp Connected</td>
            <td>
                ${renderBoolean(
                    review
                        .runtime
                        .connected
                )}
            </td>
        </tr>

        <tr>
            <td>Status</td>
            <td>
                ${escapeHtml(
                    review
                        .runtime
                        .status
                )}
            </td>
        </tr>

        <tr>
            <td>Socket Alive</td>
            <td>
                ${renderBoolean(
                    review
                        .runtime
                        .socketAlive
                )}
            </td>
        </tr>

        <tr>
            <td>Monitor Active</td>
            <td>
                ${renderBoolean(
                    review
                        .runtime
                        .monitorActive
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Queue</h2>

    <table>
        <tr>
            <td>Pending</td>
            <td>
                ${toNumber(
                    review
                        .queue
                        .pending
                )}
            </td>
        </tr>

        <tr>
            <td>Processing</td>
            <td>
                ${toNumber(
                    review
                        .queue
                        .processing
                )}
            </td>
        </tr>

        <tr>
            <td>History</td>
            <td>
                ${toNumber(
                    review
                        .queue
                        .history
                )}
            </td>
        </tr>

        <tr>
            <td>Dead Letter</td>
            <td>
                ${toNumber(
                    review
                        .queue
                        .deadLetter
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Code Inventory</h2>

    <table>
        <tr>
            <td>Total Files</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .totalFiles
                )}
            </td>
        </tr>

        <tr>
            <td>Modules</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .modules
                )}
            </td>
        </tr>

        <tr>
            <td>Controllers</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .controllers
                )}
            </td>
        </tr>

        <tr>
            <td>Services</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .services
                )}
            </td>
        </tr>

        <tr>
            <td>Routes</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .routes
                )}
            </td>
        </tr>

        <tr>
            <td>Repositories</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .repositories
                )}
            </td>
        </tr>

        <tr>
            <td>Workers</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .workers
                )}
            </td>
        </tr>

        <tr>
            <td>Queues</td>
            <td>
                ${toNumber(
                    architecture
                        .summary
                        .queues
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Dependency Graph</h2>

    <table>
        <tr>
            <td>Nodes</td>
            <td>
                ${toNumber(
                    dependencyGraph
                        .summary
                        .nodes
                )}
            </td>
        </tr>

        <tr>
            <td>Edges</td>
            <td>
                ${toNumber(
                    dependencyGraph
                        .summary
                        .edges
                )}
            </td>
        </tr>

        <tr>
            <td>External Dependencies</td>
            <td>
                ${toNumber(
                    dependencyGraph
                        .summary
                        .externalDependencies
                )}
            </td>
        </tr>

        <tr>
            <td>High Risk Files</td>
            <td>
                ${toNumber(
                    dependencyGraph
                        .summary
                        .highRiskFiles
                )}
            </td>
        </tr>

        <tr>
            <td>Medium Risk Files</td>
            <td>
                ${toNumber(
                    dependencyGraph
                        .summary
                        .mediumRiskFiles
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Architecture Risk</h2>

    <table>
        <tr>
            <td>Score</td>
            <td>
                ${toNumber(
                    architecture.score
                )}%
            </td>
        </tr>

        <tr>
            <td>Status</td>
            <td>
                ${escapeHtml(
                    architecture.status
                )}
            </td>
        </tr>

        <tr>
            <td>Large Files</td>
            <td>
                ${architecture.largeFiles.length}
            </td>
        </tr>

        <tr>
            <td>Highly Coupled</td>
            <td>
                ${architecture
                    .highlyCoupledFiles
                    .length}
            </td>
        </tr>

        <tr>
            <td>Module Warnings</td>
            <td>
                ${architecture.moduleHealth.filter(
                    (item) =>
                        item.risk !== "healthy"
                ).length}
            </td>
        </tr>

        <tr>
            <td>Suggestions</td>
            <td>
                ${architecture.suggestions.length}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Technical Debt</h2>

    <table>
        <tr>
            <td>Score</td>
            <td>
                ${toNumber(
                    technicalDebt.score
                )}%
            </td>
        </tr>

        <tr>
            <td>Total Debts</td>
            <td>
                ${toNumber(
                    technicalDebt
                        .summary
                        .total
                )}
            </td>
        </tr>

        <tr>
            <td>Critical</td>
            <td>
                ${toNumber(
                    technicalDebt
                        .summary
                        .critical
                )}
            </td>
        </tr>

        <tr>
            <td>High</td>
            <td>
                ${toNumber(
                    technicalDebt
                        .summary
                        .high
                )}
            </td>
        </tr>

        <tr>
            <td>Medium</td>
            <td>
                ${toNumber(
                    technicalDebt
                        .summary
                        .medium
                )}
            </td>
        </tr>

        <tr>
            <td>Low</td>
            <td>
                ${toNumber(
                    technicalDebt
                        .summary
                        .low
                )}
            </td>
        </tr>

        <tr>
            <td>Estimated Hours</td>
            <td>
                ${toNumber(
                    technicalDebt
                        .summary
                        .estimatedHours
                )}h
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Logs</h2>

    <table>
        <tr>
            <td>Total</td>
            <td>
                ${toNumber(
                    review.logs.total
                )}
            </td>
        </tr>

        <tr>
            <td>Errors</td>
            <td>
                ${toNumber(
                    review.logs.errors
                )}
            </td>
        </tr>

        <tr>
            <td>Warnings</td>
            <td>
                ${toNumber(
                    review.logs.warnings
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Production Blockers</h2>

    ${renderProductionItems(
        production.blockers,
        "blocker"
    )}
</div>

<div class="card full">
    <h2>Production Warnings</h2>

    ${renderProductionItems(
        production.warnings,
        "risk"
    )}
</div>

<div class="card full">
    <h2>Production Checklist</h2>

    ${renderChecklist(
        production.checklist
    )}
</div>

<div class="card full">
    <h2>Production Next Steps</h2>

    ${renderList(
        production.nextSteps,
        "next-step"
    )}
</div>

<div class="card full">
    <h2>Technical Debt Items</h2>

    ${renderTechnicalDebtItems(
        technicalDebt.debts
    )}
</div>

<div class="card full">
    <h2>Technical Debt Recommendations</h2>

    ${renderList(
        technicalDebt.recommendations,
        "recommendation"
    )}
</div>

<div class="card full">
    <h2>Dependency Suggestions</h2>

    ${renderArchitectureSuggestions(
        dependencyGraph.suggestions
    )}
</div>

<div class="card full">
    <h2>Top Dependency Nodes</h2>

    ${renderDependencyNodes(
        dependencyGraph.nodes
    )}
</div>

<div class="card full">
    <h2>Internal Dependency Edges</h2>

    ${renderDependencyEdges(
        dependencyGraph.edges
    )}
</div>

<div class="card full">
    <h2>Module Health</h2>

    ${renderModuleHealth(
        architecture.moduleHealth
    )}
</div>

<div class="card full">
    <h2>Architecture Suggestions</h2>

    ${renderArchitectureSuggestions(
        architecture.suggestions
    )}
</div>

<div class="card full">
    <h2>Large Files</h2>

    ${renderLargeFiles(
        architecture.largeFiles
    )}
</div>

<div class="card full">
    <h2>Highly Coupled Files</h2>

    ${renderCoupledFiles(
        architecture.highlyCoupledFiles
    )}
</div>

<div class="card full">
    <h2>Riscos Detectados</h2>

    ${renderList(
        executive.risks,
        "risk"
    )}
</div>

<div class="card full">
    <h2>Recomendações Executivas</h2>

    ${renderList(
        executive.recommendations,
        "recommendation"
    )}
</div>

<div class="card full">
    <h2>Próximos Passos</h2>

    ${renderList(
        executive.nextSteps,
        "next-step"
    )}
</div>

<div class="card full">
    <h2>Sugestões Técnicas do AI Monitor</h2>

    ${renderSuggestions(
        review.aiSuggestions
    )}
</div>

<div class="card full">
    <h2>Dados Técnicos</h2>

    <pre>${escapeHtml(
        safeJsonStringify(
            {
                review,
                executive,
                architecture,
                dependencyGraph,
                technicalDebt,
                production
            },
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

function normalizeHealthReview(
    review
) {
    const source =
        safeObject(
            review
        );

    const monitorStatus =
        safeObject(
            source.status
        );

    const runtimeReview =
        safeObject(
            source.runtime
        );

    const runtime =
        safeObject(
            runtimeReview.runtime
        );

    const runtimeStatus =
        safeObject(
            runtime.status
        );

    const runtimeSocket =
        safeObject(
            runtime.socket
        );

    const runtimeMonitor =
        safeObject(
            runtime.monitor
        );

    const queueReview =
        safeObject(
            source.queue
        );

    const queueSummary =
        safeObject(
            queueReview.summary
        );

    const logsReview =
        safeObject(
            source.logs
        );

    const logsSummary =
        safeObject(
            logsReview.summary
        );

    return {
        generatedAt:
            source.generatedAt
            || null,

        monitorStatus:
            monitorStatus.status
            || "unknown",

        monitorMode:
            monitorStatus.mode
            || "unknown",

        canModifyCode:
            Boolean(
                monitorStatus.canModifyCode
            ),

        canDeploy:
            Boolean(
                monitorStatus.canDeploy
            ),

        canDeleteData:
            Boolean(
                monitorStatus.canDeleteData
            ),

        runtime: {
            connected:
                Boolean(
                    runtimeStatus.connected
                ),

            status:
                runtimeStatus.status
                || runtimeStatus.state
                || "unknown",

            socketAlive:
                Boolean(
                    runtimeSocket.alive
                ),

            monitorActive:
                Boolean(
                    runtimeMonitor.active
                )
        },

        queue: {
            pending:
                toNumber(
                    queueSummary.pending
                ),

            processing:
                toNumber(
                    queueSummary.processing
                ),

            history:
                toNumber(
                    queueSummary.history
                ),

            deadLetter:
                toNumber(
                    queueSummary.deadLetter
                )
        },

        logs: {
            total:
                toNumber(
                    logsSummary.total
                ),

            errors:
                toNumber(
                    logsSummary.errors
                ),

            warnings:
                toNumber(
                    logsSummary.warnings
                )
        },

        aiSuggestions:
            toArray(
                source.aiSuggestions
            )
    };
}

function normalizeExecutiveReport(
    executive
) {
    const source =
        safeObject(
            executive
        );

    const summary =
        safeObject(
            source.summary
        );

    return {
        generatedAt:
            source.generatedAt
            || null,

        score:
            toNumber(
                source.score
                ?? source.healthScore
            ),

        status:
            source.status
            || "unknown",

        summary: {
            whatsappConnected:
                Boolean(
                    summary.whatsappConnected
                ),

            socketAlive:
                Boolean(
                    summary.socketAlive
                ),

            queuePending:
                toNumber(
                    summary.queuePending
                ),

            queueDeadLetter:
                toNumber(
                    summary.queueDeadLetter
                ),

            logErrors:
                toNumber(
                    summary.logErrors
                ),

            logWarnings:
                toNumber(
                    summary.logWarnings
                ),

            aiSuggestions:
                toNumber(
                    summary.aiSuggestions
                ),

            knowledgeItems:
                toNumber(
                    summary.knowledgeItems
                ),

            postgresConnected:
                Boolean(
                    summary.postgresConnected
                ),

            persistenceReady:
                Boolean(
                    summary.persistenceReady
                )
        },

        risks:
            toArray(
                source.risks
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

function normalizeProductionReport(
    production
) {
    const source =
        safeObject(
            production
        );

    const recommendations =
        toArray(
            source.recommendations
        );

    return {
        score:
            toNumber(
                source.score
            ),

        status:
            source.status
            || "unknown",

        passed:
            toArray(
                source.passed
            ),

        warnings:
            toArray(
                source.warnings
            ),

        blockers:
            toArray(
                source.blockers
            ),

        checklist:
            toArray(
                source.checklist
            ),

        recommendations,

        nextSteps:
            toArray(
                source.nextSteps
            ),

        primaryRecommendation:
            recommendations.length
                ? formatReportItem(
                    recommendations[0]
                )
                : (
                    source.recommendation
                    || "Nenhuma recomendação principal."
                )
    };
}

function normalizeArchitectureReport(
    architecture
) {
    const source =
        safeObject(
            architecture
        );

    return {
        score:
            toNumber(
                source.score
            ),

        status:
            source.status
            || "unknown",

        summary:
            safeObject(
                source.summary
            ),

        moduleHealth:
            toArray(
                source.moduleHealth
            ),

        largeFiles:
            toArray(
                source.largeFiles
            ),

        highlyCoupledFiles:
            toArray(
                source.highlyCoupledFiles
            ),

        suggestions:
            toArray(
                source.suggestions
            )
    };
}

function normalizeDependencyGraph(
    dependencyGraph
) {
    const source =
        safeObject(
            dependencyGraph
        );

    return {
        summary:
            safeObject(
                source.summary
            ),

        nodes:
            toArray(
                source.nodes
            ),

        edges:
            toArray(
                source.edges
            ),

        suggestions:
            toArray(
                source.suggestions
            )
    };
}

function normalizeTechnicalDebtReport(
    technicalDebt
) {
    const source =
        safeObject(
            technicalDebt
        );

    const summary =
        safeObject(
            source.summary
        );

    return {
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
                ),

            estimatedHours:
                toNumber(
                    summary.estimatedHours
                )
        },

        debts:
            toArray(
                source.debts
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

function renderProductionItems(
    items,
    className
) {
    const normalizedItems =
        toArray(
            items
        );

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Nenhum item encontrado.
            </p>
        `;
    }

    return normalizedItems
        .map((item) => {
            const source =
                safeObject(
                    item
                );

            const label =
                source.label
                || source.title
                || formatReportItem(item);

            const detail =
                source.detail
                || source.description
                || "";

            const status =
                source.status
                || source.severity
                || "info";

            return `
                <div class="${escapeHtml(
                    className
                )}">
                    <strong>
                        ${escapeHtml(
                            label
                        )}
                    </strong>

                    ${
                        detail
                            ? `
                                <p>
                                    ${escapeHtml(
                                        detail
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <span
                        class="badge ${getProductionItemClass(
                            status
                        )}"
                    >
                        ${escapeHtml(
                            status
                        )}
                    </span>
                </div>
            `;
        })
        .join("");
}

function renderChecklist(
    items
) {
    const normalizedItems =
        toArray(
            items
        );

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Checklist vazio.
            </p>
        `;
    }

    return normalizedItems
        .map((item) => {
            const source =
                safeObject(
                    item
                );

            return `
                <div class="check">
                    <strong>
                        ${escapeHtml(
                            source.label
                            || source.title
                            || "-"
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            source.detail
                            || source.description
                            || source.recommendation
                            || ""
                        )}
                    </p>

                    <span
                        class="badge ${getProductionItemClass(
                            source.status
                        )}"
                    >
                        ${escapeHtml(
                            source.status
                            || "unknown"
                        )}
                    </span>
                </div>
            `;
        })
        .join("");
}

function renderTechnicalDebtItems(
    items
) {
    const debts =
        toArray(
            items
        );

    if (!debts.length) {
        return `
            <p class="small">
                Nenhum débito técnico relevante encontrado.
            </p>
        `;
    }

    return debts
        .slice(
            0,
            30
        )
        .map((item) => {
            const debt =
                safeObject(
                    item
                );

            return `
                <div class="debt">
                    <strong>
                        ${escapeHtml(
                            debt.title
                            || "-"
                        )}
                    </strong>

                    <p>
                        <strong>
                            Arquivo/Módulo:
                        </strong>

                        ${escapeHtml(
                            debt.target
                            || "-"
                        )}
                    </p>

                    <p>
                        ${escapeHtml(
                            debt.description
                            || ""
                        )}
                    </p>

                    <p class="small">
                        <strong>Impacto:</strong>

                        ${escapeHtml(
                            debt.impact
                            || ""
                        )}
                    </p>

                    <p class="small">
                        <strong>Recomendação:</strong>

                        ${escapeHtml(
                            debt.recommendation
                            || ""
                        )}
                    </p>

                    <p>
                        <span
                            class="badge ${getPriorityClass(
                                debt.priority
                            )}"
                        >
                            ${escapeHtml(
                                debt.priority
                                || "unknown"
                            )}
                        </span>

                        <span class="badge info">
                            ${toNumber(
                                debt.estimatedHours
                            )}h estimadas
                        </span>
                    </p>
                </div>
            `;
        })
        .join("");
}

function renderSuggestions(
    items
) {
    const suggestions =
        toArray(
            items
        );

    if (!suggestions.length) {
        return `
            <p class="small">
                Nenhuma sugestão crítica no momento.
            </p>
        `;
    }

    return suggestions
        .map((item) => {
            const suggestion =
                safeObject(
                    item
                );

            return `
                <div class="suggestion">
                    <strong>
                        ${escapeHtml(
                            suggestion.title
                            || formatReportItem(
                                item
                            )
                        )}
                    </strong>

                    ${
                        suggestion.description
                            ? `
                                <p>
                                    ${escapeHtml(
                                        suggestion.description
                                    )}
                                </p>
                            `
                            : ""
                    }

                    ${
                        suggestion.recommendation
                            ? `
                                <p class="small">
                                    ${escapeHtml(
                                        suggestion.recommendation
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <span
                        class="badge ${getSeverityClass(
                            suggestion.severity
                        )}"
                    >
                        ${escapeHtml(
                            suggestion.severity
                            || "info"
                        )}
                    </span>
                </div>
            `;
        })
        .join("");
}

function renderArchitectureSuggestions(
    items
) {
    return renderSuggestions(
        items
    );
}

function renderDependencyNodes(
    items
) {
    const nodes =
        toArray(
            items
        );

    const sorted =
        [
            ...nodes
        ]
            .sort(
                (
                    first,
                    second
                ) =>
                    toNumber(
                        second.imports
                    )
                    - toNumber(
                        first.imports
                    )
            )
            .slice(
                0,
                20
            );

    if (!sorted.length) {
        return `
            <p class="small">
                Nenhum node encontrado.
            </p>
        `;
    }

    return `
        <table>
            <tr>
                <th>Arquivo</th>
                <th>Módulo</th>
                <th>Tipo</th>
                <th>Imports</th>
                <th>Risco</th>
            </tr>

            ${sorted
                .map((item) => {
                    const node =
                        safeObject(
                            item
                        );

                    return `
                        <tr>
                            <td>
                                ${escapeHtml(
                                    node.id
                                    || node.path
                                    || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    node.module
                                    || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    node.type
                                    || "-"
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    node.imports
                                )}
                            </td>

                            <td>
                                <span
                                    class="badge ${getRiskClass(
                                        node.risk
                                    )}"
                                >
                                    ${escapeHtml(
                                        node.risk
                                        || "unknown"
                                    )}
                                </span>
                            </td>
                        </tr>
                    `;
                })
                .join("")}
        </table>
    `;
}

function renderDependencyEdges(
    items
) {
    const edges =
        toArray(
            items
        )
            .slice(
                0,
                40
            );

    if (!edges.length) {
        return `
            <p class="small">
                Nenhuma dependência interna encontrada.
            </p>
        `;
    }

    return `
        <table>
            <tr>
                <th>De</th>
                <th>Para</th>
            </tr>

            ${edges
                .map((item) => {
                    const edge =
                        safeObject(
                            item
                        );

                    return `
                        <tr>
                            <td>
                                ${escapeHtml(
                                    edge.from
                                    || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    edge.to
                                    || "-"
                                )}
                            </td>
                        </tr>
                    `;
                })
                .join("")}
        </table>
    `;
}

function renderModuleHealth(
    items
) {
    const modules =
        toArray(
            items
        );

    if (!modules.length) {
        return `
            <p class="small">
                Nenhum módulo encontrado.
            </p>
        `;
    }

    return `
        <table>
            <tr>
                <th>Módulo</th>
                <th>Arquivos</th>
                <th>Linhas</th>
                <th>Imports</th>
                <th>Score</th>
                <th>Risco</th>
            </tr>

            ${modules
                .map((item) => {
                    const module =
                        safeObject(
                            item
                        );

                    return `
                        <tr>
                            <td>
                                ${escapeHtml(
                                    module.name
                                    || "-"
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    module.files
                                    ?? module.totalFiles
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    module.lines
                                    ?? module.totalLines
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    module.imports
                                    ?? module.totalImports
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    module.score
                                )}%
                            </td>

                            <td>
                                <span
                                    class="badge ${getRiskClass(
                                        module.risk
                                    )}"
                                >
                                    ${escapeHtml(
                                        module.risk
                                        || "unknown"
                                    )}
                                </span>
                            </td>
                        </tr>
                    `;
                })
                .join("")}
        </table>
    `;
}

function renderLargeFiles(
    items
) {
    const files =
        toArray(
            items
        );

    if (!files.length) {
        return `
            <p class="small">
                Nenhum arquivo grande encontrado.
            </p>
        `;
    }

    return `
        <table>
            <tr>
                <th>Arquivo</th>
                <th>Linhas</th>
                <th>Imports</th>
                <th>Exports</th>
                <th>Severidade</th>
            </tr>

            ${files
                .map((item) => {
                    const file =
                        safeObject(
                            item
                        );

                    return `
                        <tr>
                            <td>
                                ${escapeHtml(
                                    file.path
                                    || "-"
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

                            <td>
                                ${escapeHtml(
                                    file.severity
                                    || "-"
                                )}
                            </td>
                        </tr>
                    `;
                })
                .join("")}
        </table>
    `;
}

function renderCoupledFiles(
    items
) {
    const files =
        toArray(
            items
        );

    if (!files.length) {
        return `
            <p class="small">
                Nenhum arquivo altamente acoplado encontrado.
            </p>
        `;
    }

    return `
        <table>
            <tr>
                <th>Arquivo</th>
                <th>Imports</th>
                <th>Linhas</th>
                <th>Severidade</th>
            </tr>

            ${files
                .map((item) => {
                    const file =
                        safeObject(
                            item
                        );

                    return `
                        <tr>
                            <td>
                                ${escapeHtml(
                                    file.path
                                    || "-"
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    file.imports
                                )}
                            </td>

                            <td>
                                ${toNumber(
                                    file.lines
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    file.severity
                                    || "-"
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
        toArray(
            items
        );

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
                    formatReportItem(
                        item
                    )
                )}
            </div>
        `)
        .join("");
}

function renderBoolean(
    value
) {
    return Boolean(value)
        ? `
            <span class="badge ok">
                SIM
            </span>
        `
        : `
            <span class="badge error">
                NÃO
            </span>
        `;
}

function getMonitorStatusClass(
    status
) {
    if (status === "active") {
        return "ok";
    }

    if (status === "warning") {
        return "warn";
    }

    return "error";
}

function getExecutiveStatusClass(
    status
) {
    if (status === "healthy") {
        return "ok";
    }

    if (
        status === "attention"
        || status === "risk"
    ) {
        return "warn";
    }

    if (status === "critical") {
        return "error";
    }

    return "info";
}

function getProductionStatusClass(
    status
) {
    if (
        status === "ready_for_beta"
        || status === "production_ready"
    ) {
        return "ok";
    }

    if (
        status === "almost_ready"
        || status === "needs_work"
        || status === "needs_attention"
    ) {
        return "warn";
    }

    if (
        status === "not_ready"
        || status === "blocked"
    ) {
        return "error";
    }

    return "info";
}

function getProductionItemClass(
    status
) {
    if (
        status === "passed"
        || status === "ok"
    ) {
        return "ok";
    }

    if (
        status === "warning"
        || status === "partial"
        || status === "medium"
    ) {
        return "warn";
    }

    if (
        status === "blocker"
        || status === "critical"
        || status === "high"
        || status === "failed"
    ) {
        return "error";
    }

    return "info";
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

function getPriorityClass(
    priority
) {
    return getSeverityClass(
        priority
    );
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

function formatDate(
    value
) {
    if (!value) {
        return "-";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(
            value
        );
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

function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}