import {
    getScannerSummary,
    listScannedFiles
} from "./ai-code-scanner.service.js";

export function renderCodeScannerDashboard() {
    const summary = getScannerSummary();
    const files = listScannedFiles();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="5">
<title>MedStack Code Scanner</title>

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
    font-size: 36px;
    font-weight: bold;
}

.badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: bold;
    background: #dbeafe;
    color: #1e40af;
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

button.danger {
    background: #dc2626;
}

button.danger:hover {
    background: #b91c1c;
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
    <h1>🔎 MedStack Code Scanner</h1>

    <p class="small">
        Scanner automático do diretório /src. Somente leitura.
    </p>

    <button onclick="scanSrc()">Executar scan /src</button>
    <button class="danger" onclick="clearScanner()">Limpar scanner</button>
</div>

<div class="grid">

<div class="card">
    <h2>Resumo</h2>

    <table>
        <tr><td>Total Files</td><td>${summary.totalFiles}</td></tr>
        <tr><td>Total Modules</td><td>${summary.totalModules}</td></tr>
        <tr><td>Total Lines</td><td>${summary.totalLines}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Módulos</h2>

    ${renderList(summary.modules)}
</div>

<div class="card">
    <h2>Por Tipo</h2>

    ${renderObjectTable(summary.byType)}
</div>

<div class="card">
    <h2>Por Módulo</h2>

    ${renderObjectTable(summary.byModule)}
</div>

<div class="card full">
    <h2>Arquivos escaneados</h2>

    ${renderFilesTable(files)}
</div>

<div class="card full">
    <h2>Dados técnicos</h2>

    <pre>${JSON.stringify({
        summary,
        files
    }, null, 2)}</pre>
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

async function clearScanner() {
    await fetch("/ai-monitor/scanner/clear", {
        method: "POST"
    });

    window.location.reload();
}
</script>

</body>
</html>
`;
}

function renderList(items = []) {
    if (!items.length) {
        return "<p class='small'>Nenhum item encontrado.</p>";
    }

    return items
        .map((item) => `
            <p>
                <span class="badge">${item}</span>
            </p>
        `)
        .join("");
}

function renderObjectTable(object = {}) {
    const entries = Object.entries(object);

    if (!entries.length) {
        return "<p class='small'>Nenhum dado encontrado.</p>";
    }

    return `
        <table>
            ${entries.map(([key, value]) => `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                </tr>
            `).join("")}
        </table>
    `;
}

function renderFilesTable(files = []) {
    if (!files.length) {
        return "<p class='small'>Nenhum arquivo escaneado. Clique em Executar scan /src.</p>";
    }

    const sorted = [...files]
        .sort((a, b) => b.lines - a.lines);

    return `
        <table>
            <tr>
                <th>Arquivo</th>
                <th>Módulo</th>
                <th>Tipo</th>
                <th>Linhas</th>
                <th>Imports</th>
                <th>Exports</th>
            </tr>

            ${sorted.map((file) => `
                <tr>
                    <td>${file.path}</td>
                    <td>${file.module}</td>
                    <td>${file.type}</td>
                    <td>${file.lines}</td>
                    <td>${file.imports.length}</td>
                    <td>${file.exports.length}</td>
                </tr>
            `).join("")}
        </table>
    `;
}