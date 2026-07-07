import {
    getRefactoringAdvisorReport
} from "./ai-refactoring-advisor.service.js";

export function renderRefactoringDashboard() {
    const report = getRefactoringAdvisorReport();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="5">
<title>MedStack AI Refactoring Advisor</title>

<style>
body {
    font-family: Arial, sans-serif;
    background: #f3f4f6;
    padding: 30px;
    color: #111827;
}

.container {
    max-width: 1200px;
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

.candidate {
    background: #f9fafb;
    border-left: 4px solid #7c3aed;
    padding: 14px;
    margin-bottom: 12px;
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
}

.small {
    color: #6b7280;
    font-size: 13px;
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
    <h1>🛠️ MedStack AI Refactoring Advisor</h1>
    <p class="small">Sugestões de refatoração baseadas em scanner, módulo, segurança, performance e débito técnico.</p>
    <button onclick="scanSrc()">Executar scan /src</button>
</div>

<div class="grid">

<div class="card">
    <h2>Resumo</h2>
    <table>
        <tr><td>Scanned Files</td><td>${report.summary.scannedFiles}</td></tr>
        <tr><td>Scanned Modules</td><td>${report.summary.scannedModules}</td></tr>
        <tr><td>Total Candidates</td><td>${report.summary.totalCandidates}</td></tr>
        <tr><td>Estimated Hours</td><td>${report.summary.estimatedHours}h</td></tr>
    </table>
</div>

<div class="card">
    <h2>Prioridades</h2>
    <table>
        <tr><td>Critical</td><td>${report.summary.critical}</td></tr>
        <tr><td>High</td><td>${report.summary.high}</td></tr>
        <tr><td>Medium</td><td>${report.summary.medium}</td></tr>
        <tr><td>Low</td><td>${report.summary.low}</td></tr>
    </table>
</div>

<div class="card full">
    <h2>Estratégia</h2>
    <div class="recommendation">
        <strong>${report.refactoringStrategy.phase}</strong>
        <p>${report.refactoringStrategy.strategy}</p>
    </div>
</div>

<div class="card full">
    <h2>Ações Imediatas</h2>
    ${renderList(report.immediateActions, "action")}
</div>

<div class="card full">
    <h2>Recomendações</h2>
    ${renderList(report.recommendations, "recommendation")}
</div>

<div class="card full">
    <h2>Candidatos de Refatoração</h2>
    ${renderCandidates(report.candidates)}
</div>

<div class="card full">
    <h2>Dados técnicos</h2>
    <pre>${JSON.stringify(report, null, 2)}</pre>
</div>

</div>
</div>

<script>
async function scanSrc() {
    await fetch("/ai-monitor/scanner/scan-src", {
        method: "POST"
    });

    window.location.reload();
}
</script>

</body>
</html>
`;
}

function renderCandidates(items = []) {
    if (!items.length) {
        return "<p class='small'>Nenhum candidato encontrado.</p>";
    }

    return items
        .slice(0, 50)
        .map((item) => `
            <div class="candidate">
                <strong>${item.title}</strong>
                <p><strong>Alvo:</strong> ${item.target}</p>
                <p><strong>Tipo:</strong> ${item.targetType}</p>
                <p><strong>Impacto:</strong> ${item.impact}</p>
                <p><strong>Ação sugerida:</strong> ${item.suggestedActions.join(" | ")}</p>
                <p class="small"><strong>Motivos:</strong> ${item.reasons.join(" | ")}</p>
                <p>
                    <span class="badge ${getPriorityClass(item.priority)}">
                        ${item.priority}
                    </span>
                    <span class="badge info">
                        ${item.estimatedHours}h
                    </span>
                    <span class="badge info">
                        ${item.sources.join(", ")}
                    </span>
                </p>
            </div>
        `)
        .join("");
}

function renderList(items = [], className = "action") {
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

function getPriorityClass(priority) {
    if (priority === "critical") return "error";
    if (priority === "high") return "error";
    if (priority === "medium") return "warn";

    return "info";
}