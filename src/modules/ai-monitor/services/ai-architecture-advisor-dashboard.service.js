import {
    getArchitectureAdvisorReport
} from "./ai-architecture-advisor.service.js";

export function renderArchitectureAdvisorDashboard() {
    const advisor = getArchitectureAdvisorReport();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="5">
<title>MedStack Architecture Advisor</title>

<style>
body {
    font-family: Arial, sans-serif;
    background: #f3f4f6;
    padding: 30px;
    color: #111827;
}

.container {
    max-width: 1100px;
    margin: auto;
}

.header, .card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(0,0,0,.08);
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

.priority {
    background: #eff6ff;
    border-left: 4px solid #2563eb;
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

table {
    width: 100%;
    border-collapse: collapse;
}

td {
    padding: 9px 0;
    border-bottom: 1px solid #e5e7eb;
}

td:last-child {
    text-align: right;
    font-weight: bold;
}
</style>
</head>

<body>
<div class="container">

<div class="header">
    <h1>🧠 MedStack Architecture Advisor</h1>

    <p>
        Stage:
        <span class="badge info">${advisor.currentStage}</span>
    </p>

    <p>${advisor.globalAssessment}</p>
</div>

<div class="grid">

<div class="card">
    <h2>Resumo</h2>
    <table>
        <tr><td>Production Score</td><td>${advisor.summary.productionScore}%</td></tr>
        <tr><td>Production Status</td><td>${advisor.summary.productionStatus}</td></tr>
        <tr><td>Roadmap Progress</td><td>${advisor.summary.roadmapProgress}%</td></tr>
        <tr><td>Technical Debts</td><td>${advisor.summary.technicalDebts}</td></tr>
        <tr><td>High Debts</td><td>${advisor.summary.highTechnicalDebts}</td></tr>
        <tr><td>Critical Debts</td><td>${advisor.summary.criticalTechnicalDebts}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Próximo Módulo</h2>

    <p>
        <strong>${advisor.recommendedNextModule.module || "-"}</strong>
    </p>

    <p>
        Prioridade:
        <span class="badge info">${advisor.recommendedNextModule.priority || "-"}</span>
    </p>

    <p>${advisor.recommendedNextModule.reason}</p>
</div>

<div class="card full">
    <h2>Opinião de Produção</h2>
    <div class="opinion">
        ${advisor.productionOpinion}
    </div>
</div>

<div class="card full">
    <h2>Opinião de Escala</h2>
    <div class="opinion">
        ${advisor.scalingOpinion}
    </div>
</div>

<div class="card full">
    <h2>Pode Avançar?</h2>

    <table>
        <tr><td>Beta Assistido</td><td>${advisor.canMoveForward.betaAssisted}</td></tr>
        <tr><td>Produção Pequena Escala</td><td>${advisor.canMoveForward.productionSmallScale}</td></tr>
        <tr><td>Produção Grande Escala</td><td>${advisor.canMoveForward.productionLargeScale}</td></tr>
        <tr><td>Motivo</td><td>${advisor.canMoveForward.reason}</td></tr>
    </table>
</div>

<div class="card full">
    <h2>Prioridades Imediatas</h2>
    ${renderPriorities(advisor.immediatePriorities)}
</div>

<div class="card full">
    <h2>Warnings Estratégicos</h2>
    ${renderWarnings(advisor.warnings)}
</div>

</div>
</div>
</body>
</html>
`;
}

function renderPriorities(items) {
    if (!items.length) {
        return "<p>Nenhuma prioridade encontrada.</p>";
    }

    return items.map((item) => `
        <div class="priority">
            <strong>${item.title}</strong>
            <p>${item.reason}</p>
            <p><strong>Ação:</strong> ${item.action}</p>
            <span class="badge ${getPriorityClass(item.priority)}">${item.priority}</span>
        </div>
    `).join("");
}

function renderWarnings(items) {
    if (!items.length) {
        return "<p>Nenhum warning encontrado.</p>";
    }

    return items.map((item) => `
        <div class="warning">
            ${item}
        </div>
    `).join("");
}

function getPriorityClass(priority) {
    if (priority === "critical") return "error";
    if (priority === "high") return "error";
    if (priority === "medium") return "warn";
    return "info";
}