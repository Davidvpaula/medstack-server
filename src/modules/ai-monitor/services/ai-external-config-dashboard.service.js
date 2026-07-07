import {
    getExternalAiStatus
} from "./ai-external-adapter.service.js";

export function renderExternalAiConfigDashboard() {
    const status = getExternalAiStatus();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>MedStack External AI Config</title>

<style>
body {
    font-family: Arial, sans-serif;
    background: #f3f4f6;
    padding: 30px;
    color: #111827;
}

.container {
    max-width: 1000px;
    margin: auto;
}

.header, .card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(0,0,0,.08);
    margin-bottom: 20px;
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

.info {
    background: #dbeafe;
    color: #1e40af;
}

.error {
    background: #fee2e2;
    color: #991b1b;
}

input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    font-size: 15px;
    margin-top: 6px;
    margin-bottom: 12px;
}

textarea {
    min-height: 90px;
    resize: vertical;
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

button.warn-btn {
    background: #d97706;
}

button.warn-btn:hover {
    background: #b45309;
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
    <h1>🤖 MedStack External AI Config</h1>

    <p>
        Status:
        <span class="badge ${status.enabled ? "ok" : "warn"}">
            ${status.enabled ? "enabled" : "disabled"}
        </span>
    </p>

    <p class="small">
        Skeleton seguro. Não chama provider real ainda, não altera código, não faz deploy e não apaga dados.
    </p>
</div>

<div class="card">
    <h2>Status atual</h2>

    <pre>${JSON.stringify(status, null, 2)}</pre>
</div>

<div class="card">
    <h2>Configurar Skeleton</h2>

    <label>Enabled</label>
    <select id="enabled">
        <option value="false" ${!status.enabled ? "selected" : ""}>false</option>
        <option value="true" ${status.enabled ? "selected" : ""}>true</option>
    </select>

    <label>Provider</label>
    <input id="provider" value="${status.provider || ""}" placeholder="openai | gemini | claude | llama" />

    <label>Model</label>
    <input id="model" value="${status.model || ""}" placeholder="gpt-4.1 | gemini-1.5-pro | claude-3.5" />

    <button onclick="saveConfig()">Salvar configuração</button>
    <button class="warn-btn" onclick="disableAi()">Desativar</button>
</div>

<div class="card">
    <h2>Teste de Prompt Preview</h2>

    <textarea id="question" placeholder="Ex: Estamos prontos para produção?"></textarea>

    <button onclick="testExternalAi()">Testar External AI Skeleton</button>

    <pre id="result">-</pre>
</div>

</div>

<script>
async function saveConfig() {
    const enabled = document.getElementById("enabled").value === "true";
    const provider = document.getElementById("provider").value;
    const model = document.getElementById("model").value;

    await fetch("/ai-monitor/external-ai/configure", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            enabled,
            provider,
            model
        })
    });

    window.location.reload();
}

async function disableAi() {
    await fetch("/ai-monitor/external-ai/configure", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            enabled: false
        })
    });

    window.location.reload();
}

async function testExternalAi() {
    const question = document.getElementById("question").value;

    const response = await fetch("/ai-monitor/external-ai/advisor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question
        })
    });

    const json = await response.json();

    document.getElementById("result").textContent =
        JSON.stringify(json.data, null, 2);
}
</script>

</body>
</html>
`;
}