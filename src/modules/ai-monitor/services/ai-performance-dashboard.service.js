import {
    getPerformanceFinalReport
} from "./ai-performance-report.service.js";

export function renderPerformanceDashboard() {
    const report = getPerformanceFinalReport();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="5">
<title>MedStack AI Performance</title>

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
    <h1>⚡ MedStack AI Performance</h1>
    <p class="small">Análise de performance estrutural baseada no scanner do código.</p>
    <button onclick="scanSrc()">Executar scan /src</button>
</div>

<div class="grid">

<div class="card">
    <h2>Performance Score</h2>
    <div class="score">${report.score}%</div>
    <span class="badge ${getStatusClass(report.status)}">${report.status}</span>
</div>

<div class="card">
    <h2>Resumo</h2>
    <table>
        <tr><td>Total Findings</td><td>${report.scan.summary.totalFindings}</td></tr>
        <tr><td>High</td><td>${report.scan.summary.high}</td></tr>
        <tr><td>Medium</td><td>${report.scan.summary.medium}</td></tr>
        <tr><td>Low</td><td>${report.scan.summary.low}</td></tr>
    </table>
</div>

<div class="card full">
    <h2>Blockers</h2>
    ${renderList(report.blockers, "blocker")}
</div>

<div class="card full">
    <h2>Recomendações</h2>
    ${renderList(report.recommendations, "recommendation")}
</div>

<div class="card full">
    <h2>Achados de Performance</h2>
    ${renderFindings(report.scan.findings)}
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

function renderFindings(items = []) {
    if (!items.length) {
        return "<p class='small'>Nenhum achado encontrado.</p>";
    }

    return items.map((item) => `
        <div class="item">
            <strong>${item.title}</strong>
            <p>${item.description}</p>
            <p class="small">${item.recommendation}</p>
            <p><span class="badge ${getSeverityClass(item.severity)}">${item.severity}</span></p>
            <p class="small">${item.file || item.module || "-"}</p>
        </div>
    `).join("");
}

function renderList(items = [], className = "item") {
    if (!items.length) {
        return "<p class='small'>Nenhum item encontrado.</p>";
    }

    return items.map((item) => `
        <div class="${className}">
            ${item}
        </div>
    `).join("");
}

function getSeverityClass(severity) {
    if (severity === "high") return "error";
    if (severity === "medium") return "warn";

    return "info";
}

function getStatusClass(status) {
    if (status === "excellent") return "ok";
    if (status === "good") return "ok";
    if (status === "needs_attention") return "warn";

    return "error";
}