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

export function renderAiMonitorDashboard() {
    const review = getFullHealthReview();
    const executive = generateExecutiveReport();
    const architecture = getArchitectureReview();
    const dependencyGraph = getDependencyGraph();
    const technicalDebt = getTechnicalDebtReport();
    const production = getProductionReadinessReport();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="5">
<title>MedStack AI Monitor</title>

<style>
body {
    font-family: Arial, sans-serif;
    background: #f3f4f6;
    padding: 30px;
    color: #111827;
}

.container {
    max-width: 1250px;
    margin: auto;
}

.header, .card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(0,0,0,.08);
}

.header {
    margin-bottom: 20px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
}

.full {
    grid-column: 1 / -1;
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

.score {
    font-size: 42px;
    font-weight: bold;
    margin: 12px 0;
}

table {
    width: 100%;
    border-collapse: collapse;
}

td, th {
    padding: 9px 0;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
}

td:last-child, th:last-child {
    text-align: right;
    font-weight: bold;
}

.small {
    color: #6b7280;
    font-size: 13px;
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

pre {
    background: #f9fafb;
    padding: 12px;
    border-radius: 8px;
    overflow: auto;
    font-size: 12px;
}
</style>
</head>

<body>
<div class="container">

<div class="header">
    <h1>🧠 MedStack AI Monitor</h1>

    <p>
        Status:
        <span class="badge ok">${review.status.status}</span>

        Mode:
        <span class="badge info">${review.status.mode}</span>
    </p>

    <p class="small">Gerado em: ${review.generatedAt}</p>

    <p class="small">
        Segurança:
        altera código: ${review.status.canModifyCode} |
        deploy: ${review.status.canDeploy} |
        deletar dados: ${review.status.canDeleteData}
    </p>
</div>

<div class="grid">

<div class="card">
    <h2>Executive Health Score</h2>

    <div class="score">${executive.healthScore}%</div>

    <p>
        Status:
        <span class="badge ${getStatusClass(executive.status)}">
            ${executive.status}
        </span>
    </p>

    <p class="small">Relatório gerado em: ${executive.generatedAt}</p>
</div>

<div class="card">
    <h2>Production Readiness</h2>

    <div class="score">${production.score}%</div>

    <p>
        Status:
        <span class="badge ${getProductionStatusClass(production.status)}">
            ${production.status}
        </span>
    </p>

    <p class="small">
        ${production.recommendation}
    </p>
</div>

<div class="card">
    <h2>Resumo Executivo</h2>

    <table>
        <tr><td>WhatsApp Connected</td><td>${executive.summary.whatsappConnected}</td></tr>
        <tr><td>Socket Alive</td><td>${executive.summary.socketAlive}</td></tr>
        <tr><td>Queue Pending</td><td>${executive.summary.queuePending}</td></tr>
        <tr><td>Dead Letter</td><td>${executive.summary.queueDeadLetter}</td></tr>
        <tr><td>Log Errors</td><td>${executive.summary.logErrors}</td></tr>
        <tr><td>AI Suggestions</td><td>${executive.summary.aiSuggestions}</td></tr>
        <tr><td>Knowledge Items</td><td>${executive.summary.knowledgeItems}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Production Summary</h2>

    <table>
        <tr><td>Passed</td><td>${production.passed.length}</td></tr>
        <tr><td>Warnings</td><td>${production.warnings.length}</td></tr>
        <tr><td>Blockers</td><td>${production.blockers.length}</td></tr>
        <tr><td>Checklist</td><td>${production.checklist.length}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Runtime</h2>
    <table>
        <tr><td>WhatsApp Connected</td><td>${review.runtime.runtime.status.connected}</td></tr>
        <tr><td>Status</td><td>${review.runtime.runtime.status.status}</td></tr>
        <tr><td>Socket Alive</td><td>${review.runtime.runtime.socket.alive}</td></tr>
        <tr><td>Monitor Active</td><td>${review.runtime.runtime.monitor.active}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Queue</h2>
    <table>
        <tr><td>Pending</td><td>${review.queue.summary.pending}</td></tr>
        <tr><td>Processing</td><td>${review.queue.summary.processing}</td></tr>
        <tr><td>History</td><td>${review.queue.summary.history}</td></tr>
        <tr><td>Dead Letter</td><td>${review.queue.summary.deadLetter}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Code Inventory</h2>
    <table>
        <tr><td>Total Files</td><td>${architecture.summary.totalFiles}</td></tr>
        <tr><td>Modules</td><td>${architecture.summary.modules}</td></tr>
        <tr><td>Controllers</td><td>${architecture.summary.controllers}</td></tr>
        <tr><td>Services</td><td>${architecture.summary.services}</td></tr>
        <tr><td>Routes</td><td>${architecture.summary.routes}</td></tr>
        <tr><td>Repositories</td><td>${architecture.summary.repositories}</td></tr>
        <tr><td>Workers</td><td>${architecture.summary.workers}</td></tr>
        <tr><td>Queues</td><td>${architecture.summary.queues}</td></tr>
        <tr><td>Providers</td><td>${architecture.summary.providers}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Dependency Graph</h2>
    <table>
        <tr><td>Nodes</td><td>${dependencyGraph.summary.nodes}</td></tr>
        <tr><td>Edges</td><td>${dependencyGraph.summary.edges}</td></tr>
        <tr><td>External Dependencies</td><td>${dependencyGraph.summary.externalDependencies}</td></tr>
        <tr><td>High Risk Files</td><td>${dependencyGraph.summary.highRiskFiles}</td></tr>
        <tr><td>Medium Risk Files</td><td>${dependencyGraph.summary.mediumRiskFiles}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Architecture Risk</h2>
    <table>
        <tr><td>Large Files</td><td>${architecture.largeFiles.length}</td></tr>
        <tr><td>Highly Coupled</td><td>${architecture.highlyCoupledFiles.length}</td></tr>
        <tr><td>Module Warnings</td><td>${architecture.moduleHealth.filter((item) => item.risk !== "healthy").length}</td></tr>
        <tr><td>Suggestions</td><td>${architecture.suggestions.length}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Technical Debt</h2>
    <table>
        <tr><td>Total Debts</td><td>${technicalDebt.summary.total}</td></tr>
        <tr><td>Critical</td><td>${technicalDebt.summary.critical}</td></tr>
        <tr><td>High</td><td>${technicalDebt.summary.high}</td></tr>
        <tr><td>Medium</td><td>${technicalDebt.summary.medium}</td></tr>
        <tr><td>Low</td><td>${technicalDebt.summary.low}</td></tr>
        <tr><td>Estimated Hours</td><td>${technicalDebt.summary.estimatedHours}h</td></tr>
    </table>
</div>

<div class="card">
    <h2>Logs</h2>
    <table>
        <tr><td>Total</td><td>${review.logs.summary.total}</td></tr>
        <tr><td>Errors</td><td>${review.logs.summary.errors}</td></tr>
        <tr><td>Warnings</td><td>${review.logs.summary.warnings}</td></tr>
    </table>
</div>

<div class="card full">
    <h2>Production Blockers</h2>
    ${renderProductionItems(production.blockers, "blocker")}
</div>

<div class="card full">
    <h2>Production Warnings</h2>
    ${renderProductionItems(production.warnings, "risk")}
</div>

<div class="card full">
    <h2>Production Checklist</h2>
    ${renderChecklist(production.checklist)}
</div>

<div class="card full">
    <h2>Production Next Steps</h2>
    ${renderList(production.nextSteps, "next-step")}
</div>

<div class="card full">
    <h2>Technical Debt Items</h2>
    ${renderTechnicalDebtItems(technicalDebt.debts)}
</div>

<div class="card full">
    <h2>Technical Debt Recommendations</h2>
    ${renderList(technicalDebt.recommendations, "recommendation")}
</div>

<div class="card full">
    <h2>Dependency Suggestions</h2>
    ${renderArchitectureSuggestions(dependencyGraph.suggestions)}
</div>

<div class="card full">
    <h2>Top Dependency Nodes</h2>
    ${renderDependencyNodes(dependencyGraph.nodes)}
</div>

<div class="card full">
    <h2>Internal Dependency Edges</h2>
    ${renderDependencyEdges(dependencyGraph.edges)}
</div>

<div class="card full">
    <h2>Module Health</h2>
    <table>
        <tr>
            <th>Módulo</th>
            <th>Arquivos</th>
            <th>Linhas</th>
            <th>Imports</th>
            <th>Risco</th>
        </tr>

        ${architecture.moduleHealth.map((module) => `
            <tr>
                <td>${module.name}</td>
                <td>${module.files}</td>
                <td>${module.lines}</td>
                <td>${module.imports}</td>
                <td>
                    <span class="badge ${getRiskClass(module.risk)}">
                        ${module.risk}
                    </span>
                </td>
            </tr>
        `).join("")}
    </table>
</div>

<div class="card full">
    <h2>Architecture Suggestions</h2>
    ${renderArchitectureSuggestions(architecture.suggestions)}
</div>

<div class="card full">
    <h2>Large Files</h2>
    ${renderLargeFiles(architecture.largeFiles)}
</div>

<div class="card full">
    <h2>Highly Coupled Files</h2>
    ${renderCoupledFiles(architecture.highlyCoupledFiles)}
</div>

<div class="card full">
    <h2>Riscos Detectados</h2>
    ${renderList(executive.risks, "risk")}
</div>

<div class="card full">
    <h2>Recomendações Executivas</h2>
    ${renderList(executive.recommendations, "recommendation")}
</div>

<div class="card full">
    <h2>Próximos Passos</h2>
    ${renderList(executive.nextSteps, "next-step")}
</div>

<div class="card full">
    <h2>Sugestões Técnicas do AI Monitor</h2>
    ${renderSuggestions(review.aiSuggestions || [])}
</div>

<div class="card full">
    <h2>Dados Técnicos</h2>
    <pre>${JSON.stringify({
        review,
        executive,
        architecture,
        dependencyGraph,
        technicalDebt,
        production
    }, null, 2)}</pre>
</div>

</div>
</div>
</body>
</html>
`;
}

function renderProductionItems(items, className) {
    if (!items.length) {
        return "<p class='small'>Nenhum item encontrado.</p>";
    }

    return items
        .map((item) => `
            <div class="${className}">
                <strong>${item.label}</strong>
                <p>${item.detail}</p>
                <span class="badge ${getProductionItemClass(item.status)}">
                    ${item.status}
                </span>
            </div>
        `)
        .join("");
}

function renderChecklist(items) {
    if (!items.length) {
        return "<p class='small'>Checklist vazio.</p>";
    }

    return items
        .map((item) => `
            <div class="check">
                <strong>${item.label}</strong>
                <p>${item.detail}</p>
                <span class="badge ${getProductionItemClass(item.status)}">
                    ${item.status}
                </span>
            </div>
        `)
        .join("");
}

function renderTechnicalDebtItems(items) {
    if (!items.length) {
        return "<p class='small'>Nenhum débito técnico relevante encontrado.</p>";
    }

    return items
        .slice(0, 30)
        .map((item) => `
            <div class="debt">
                <strong>${item.title}</strong>
                <p><strong>Arquivo/Módulo:</strong> ${item.target}</p>
                <p>${item.description}</p>
                <p class="small"><strong>Impacto:</strong> ${item.impact}</p>
                <p class="small"><strong>Recomendação:</strong> ${item.recommendation}</p>
                <p>
                    <span class="badge ${getPriorityClass(item.priority)}">
                        ${item.priority}
                    </span>
                    <span class="badge info">
                        ${item.estimatedHours}h estimadas
                    </span>
                </p>
            </div>
        `)
        .join("");
}

function renderSuggestions(suggestions) {
    if (!suggestions.length) {
        return "<p class='small'>Nenhuma sugestão crítica no momento.</p>";
    }

    return suggestions
        .map((suggestion) => `
            <div class="suggestion">
                <strong>${suggestion.title}</strong>
                <p>${suggestion.description}</p>
                <p class="small">${suggestion.recommendation}</p>
                <span class="badge ${getSeverityClass(suggestion.severity)}">
                    ${suggestion.severity}
                </span>
            </div>
        `)
        .join("");
}

function renderArchitectureSuggestions(suggestions) {
    if (!suggestions.length) {
        return "<p class='small'>Nenhuma sugestão encontrada.</p>";
    }

    return suggestions
        .map((suggestion) => `
            <div class="suggestion">
                <strong>${suggestion.title}</strong>
                <p>${suggestion.description}</p>
                <p class="small">${suggestion.recommendation}</p>
                <span class="badge ${getSeverityClass(suggestion.severity)}">
                    ${suggestion.severity}
                </span>
            </div>
        `)
        .join("");
}

function renderDependencyNodes(nodes) {
    const sorted = [...nodes]
        .sort((a, b) => b.imports - a.imports)
        .slice(0, 20);

    if (!sorted.length) {
        return "<p class='small'>Nenhum node encontrado.</p>";
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
            ${sorted.map((node) => `
                <tr>
                    <td>${node.id}</td>
                    <td>${node.module}</td>
                    <td>${node.type}</td>
                    <td>${node.imports}</td>
                    <td>
                        <span class="badge ${getRiskClass(node.risk)}">
                            ${node.risk}
                        </span>
                    </td>
                </tr>
            `).join("")}
        </table>
    `;
}

function renderDependencyEdges(edges) {
    const limited = edges.slice(0, 40);

    if (!limited.length) {
        return "<p class='small'>Nenhuma dependência interna encontrada.</p>";
    }

    return `
        <table>
            <tr>
                <th>De</th>
                <th>Para</th>
            </tr>
            ${limited.map((edge) => `
                <tr>
                    <td>${edge.from}</td>
                    <td>${edge.to}</td>
                </tr>
            `).join("")}
        </table>
    `;
}

function renderLargeFiles(files) {
    if (!files.length) {
        return "<p class='small'>Nenhum arquivo grande encontrado.</p>";
    }

    return `
        <table>
            <tr>
                <th>Arquivo</th>
                <th>Linhas</th>
                <th>Imports</th>
                <th>Exports</th>
            </tr>
            ${files.map((file) => `
                <tr>
                    <td>${file.path}</td>
                    <td>${file.lines}</td>
                    <td>${file.imports}</td>
                    <td>${file.exports}</td>
                </tr>
            `).join("")}
        </table>
    `;
}

function renderCoupledFiles(files) {
    if (!files.length) {
        return "<p class='small'>Nenhum arquivo altamente acoplado encontrado.</p>";
    }

    return `
        <table>
            <tr>
                <th>Arquivo</th>
                <th>Imports</th>
                <th>Linhas</th>
            </tr>
            ${files.map((file) => `
                <tr>
                    <td>${file.path}</td>
                    <td>${file.imports}</td>
                    <td>${file.lines}</td>
                </tr>
            `).join("")}
        </table>
    `;
}

function renderList(items, className) {
    if (!items.length) {
        return "<p class='small'>Nenhum item encontrado.</p>";
    }

    return items
        .map((item) => `
            <div class="${className}">
                ${item}
            </div>
        `)
        .join("");
}

function getSeverityClass(severity) {
    if (severity === "critical") return "error";
    if (severity === "high") return "error";
    if (severity === "medium") return "warn";
    if (severity === "low") return "info";
    return "info";
}

function getPriorityClass(priority) {
    if (priority === "critical") return "error";
    if (priority === "high") return "error";
    if (priority === "medium") return "warn";
    if (priority === "low") return "info";
    return "info";
}

function getStatusClass(status) {
    if (status === "healthy") return "ok";
    if (status === "attention") return "warn";
    if (status === "risk") return "warn";
    if (status === "critical") return "error";
    return "info";
}

function getProductionStatusClass(status) {
    if (status === "ready_for_beta") return "ok";
    if (status === "almost_ready") return "warn";
    if (status === "needs_work") return "warn";
    if (status === "not_ready") return "error";
    return "info";
}

function getProductionItemClass(status) {
    if (status === "passed") return "ok";
    if (status === "warning") return "warn";
    if (status === "blocker") return "error";
    return "info";
}

function getRiskClass(risk) {
    if (risk === "high") return "error";
    if (risk === "medium") return "warn";
    if (risk === "low") return "info";
    return "ok";
}