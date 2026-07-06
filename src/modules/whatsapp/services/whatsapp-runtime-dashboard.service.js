import { getWhatsappRuntime } from "./whatsapp-runtime.service.js";

import {
    getRecentRuntimeLogs
} from "./whatsapp-runtime-log.service.js";

export function renderWhatsappRuntimeDashboard() {
    const runtime = getWhatsappRuntime();
    const logs = getRecentRuntimeLogs(20);

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="3">
<title>MedStack Runtime</title>

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

.ok { background: #dcfce7; color: #166534; }
.warn { background: #fef3c7; color: #92400e; }
.error { background: #fee2e2; color: #991b1b; }
.info { background: #dbeafe; color: #1e40af; }

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

.small {
    color: #6b7280;
    font-size: 13px;
}

.actions a {
    display: inline-block;
    margin: 6px 8px 6px 0;
    padding: 10px 14px;
    border-radius: 10px;
    text-decoration: none;
    background: #2563eb;
    color: white;
    font-weight: bold;
    font-size: 14px;
}

.actions a.warn {
    background: #d97706;
    color: white;
}

.actions a.danger {
    background: #dc2626;
    color: white;
}

.log {
    padding: 10px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
}

.log strong {
    display: inline-block;
    width: 80px;
}

pre {
    background: #f9fafb;
    padding: 8px;
    border-radius: 8px;
    overflow: auto;
    font-size: 12px;
}
</style>
</head>

<body>
<div class="container">

<div class="header">
    <h1>🚀 MedStack WhatsApp Runtime</h1>

    <p>
        Status:
        <span class="badge ${runtime.status.connected ? "ok" : "error"}">
            ${runtime.status.status}
        </span>
    </p>

    <p class="small">
        Instância: ${runtime.instanceId} |
        Empresa: ${runtime.companyBinding.companyId ?? "-"} |
        Atualizado em: ${runtime.updatedAt ?? "-"}
    </p>

    <div class="actions">
        <a href="/whatsapp/runtime">Runtime JSON</a>
        <a href="/whatsapp/qr-page">QR Page</a>
        <a href="/whatsapp/start-runtime">Start Runtime</a>
        <a class="warn" href="/whatsapp/restart-runtime">Restart Runtime</a>
        <a href="/whatsapp/dispatch">Queue JSON</a>
    </div>
</div>

<div class="grid">

<div class="card">
    <h2>Socket</h2>
    <table>
        <tr><td>Connected</td><td>${runtime.status.connected}</td></tr>
        <tr><td>Has Socket</td><td>${runtime.socket.hasSocket}</td></tr>
        <tr><td>Socket Alive</td><td>${runtime.socket.alive}</td></tr>
        <tr><td>Has QR</td><td>${runtime.qr.hasQr}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Health Monitor</h2>
    <table>
        <tr><td>Active</td><td>${runtime.monitor.active}</td></tr>
        <tr><td>Interval</td><td>${runtime.monitor.intervalMs ?? "-"} ms</td></tr>
        <tr><td>Last Check</td><td>${runtime.monitor.lastCheckAt ?? "-"}</td></tr>
        <tr><td>Last Restart</td><td>${runtime.monitor.lastRestartAt ?? "-"}</td></tr>
        <tr><td>Last Error</td><td>${runtime.monitor.lastError ?? "-"}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Dispatcher</h2>
    <table>
        <tr><td>Pending</td><td>${runtime.dispatcher.pending}</td></tr>
        <tr><td>Processing</td><td>${runtime.dispatcher.processing}</td></tr>
        <tr><td>Completed</td><td>${runtime.dispatcher.completed}</td></tr>
        <tr><td>Failed</td><td>${runtime.dispatcher.failed}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Worker</h2>
    <table>
        <tr><td>Running</td><td>${runtime.worker.running}</td></tr>
        <tr><td>Idle</td><td>${runtime.worker.idle}</td></tr>
        <tr><td>Processed</td><td>${runtime.worker.processed}</td></tr>
        <tr><td>Failed</td><td>${runtime.worker.failed}</td></tr>
        <tr><td>Last Job</td><td>${runtime.worker.lastJobId ?? "-"}</td></tr>
        <tr><td>Last Status</td><td>${runtime.worker.lastJobStatus ?? "-"}</td></tr>
        <tr><td>Last Duration</td><td>${runtime.worker.lastDurationMs ?? "-"} ms</td></tr>
        <tr><td>Last Execution</td><td>${runtime.worker.lastExecution ?? "-"}</td></tr>
        <tr><td>Last Error</td><td>${runtime.worker.lastError ?? "-"}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Statistics</h2>
    <table>
        <tr><td>Inbound</td><td>${runtime.stats.inbound}</td></tr>
        <tr><td>Outbound</td><td>${runtime.stats.outbound}</td></tr>
        <tr><td>Delivered</td><td>${runtime.stats.delivered}</td></tr>
        <tr><td>Read</td><td>${runtime.stats.read}</td></tr>
    </table>
</div>

<div class="card">
    <h2>Providers</h2>
    <table>
        ${runtime.providers.map((provider) => `
            <tr>
                <td>${provider.name}</td>
                <td>${provider.status}</td>
            </tr>
        `).join("")}
    </table>
</div>

<div class="card full">
    <h2>Runtime Logs</h2>
    ${
        logs.length
            ? logs.map((log) => `
                <div class="log">
                    <strong>
                        <span class="badge ${getLogClass(log.level)}">
                            ${log.level}
                        </span>
                    </strong>
                    ${log.message}
                    <div class="small">${log.createdAt}</div>
                    <pre>${JSON.stringify(log.data || {}, null, 2)}</pre>
                </div>
            `).join("")
            : "<p class='small'>Nenhum log registrado ainda.</p>"
    }
</div>

</div>
</div>
</body>
</html>
`;
}

function getLogClass(level) {
    if (level === "success") return "ok";
    if (level === "warn") return "warn";
    if (level === "error") return "error";
    return "info";
}