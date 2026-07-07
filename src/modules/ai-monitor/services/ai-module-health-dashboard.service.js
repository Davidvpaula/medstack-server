import {
    getModuleHealthReport
} from "./ai-module-health.service.js";

export function renderModuleHealthDashboard() {
    const report = getModuleHealthReport();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="5">
<title>MedStack Module Health</title>

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

.module {
    background: #f9fafb;
    border-left: 4px solid #2563eb;
    padding: 14px;
    margin-bottom: 12px;
    border-radius: 8px;
}

.suggestion {
    background: #f9fafb;
    border-left: 4px solid #7c3aed;
    padding: 14px;
    margin-bottom: 12px;
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
    <h1>🧩 MedStack Module Health</h1>

    <p class="small">
        Análise inteligente dos módulos baseada no scanner automático do /src.
    </p>

    <button onclick="scanSrc()">Executar scan /src</button>
</div>

<div class="grid">

<div class="card">
    <h2>Resumo dos módulos</h2>

    <table>
        <tr><td>Total Modules</td><td>${report.summary.totalModules}</td></tr>
        <tr><td>High Risk</td><td>${report.summary.highRisk}</td></tr>
        <tr><td>Medium Risk</td><td>${report.summary.mediumRisk}</td></tr>
        <tr><td>Low Risk</td><td>${report.summary.lowRisk}</td></tr>
        <tr><td>Healthy</td><td>${report.summary.healthy}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Scanner Summary</h2>

    <table>
        <tr><td>Total Files</td><td>${report.scannerSummary.totalFiles}</td></tr>
        <tr><td>Total Lines</td><td>${report.scannerSummary.totalLines}</td></tr>
        <tr><td>Total Modules</td><td>${report.scannerSummary.totalModules}</td></tr>
    </table>
</div>

<div class="card full">
    <h2>Sugestões</h2>
    ${renderSuggestions(report.suggestions)}
</div>

<div class="card full">
    <h2>Saúde por módulo</h2>
    ${renderModules(report.modules)}
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

function renderSuggestions(suggestions = []) {
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

function renderModules(modules = []) {
    if (!modules.length) {
        return "<p class='small'>Nenhum módulo encontrado. Execute o scan /src primeiro.</p>";
    }

    return modules
        .map((module) => `
            <div class="module">
                <h3>${module.name}</h3>

                <p>
                    <span class="badge ${getRiskClass(module.risk)}">
                        ${module.risk}
                    </span>

                    <span class="badge info">
                        score ${module.score}%
                    </span>
                </p>

                <table>
                    <tr><td>Total Files</td><td>${module.totalFiles}</td></tr>
                    <tr><td>Total Lines</td><td>${module.totalLines}</td></tr>
                    <tr><td>Total Imports</td><td>${module.totalImports}</td></tr>
                    <tr><td>Total Exports</td><td>${module.totalExports}</td></tr>
                    <tr><td>Types</td><td>${formatTypes(module.types)}</td></tr>
                </table>

                <h4>Maiores arquivos</h4>

                ${renderLargestFiles(module.largestFiles)}
            </div>
        `)
        .join("");
}

function renderLargestFiles(files = []) {
    if (!files.length) {
        return "<p class='small'>Nenhum arquivo encontrado.</p>";
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

            ${files.map((file) => `
                <tr>
                    <td>${file.path}</td>
                    <td>${file.type}</td>
                    <td>${file.lines}</td>
                    <td>${file.imports}</td>
                    <td>${file.exports}</td>
                </tr>
            `).join("")}
        </table>
    `;
}

function formatTypes(types = {}) {
    return Object.entries(types)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" | ");
}

function getSeverityClass(severity) {
    if (severity === "high") return "error";
    if (severity === "medium") return "warn";
    if (severity === "low") return "info";

    return "info";
}

function getRiskClass(risk) {
    if (risk === "high") return "error";
    if (risk === "medium") return "warn";
    if (risk === "low") return "info";

    return "ok";
}