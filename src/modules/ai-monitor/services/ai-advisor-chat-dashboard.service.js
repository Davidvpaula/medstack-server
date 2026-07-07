import {
    listAdvisorChatHistory
} from "./ai-advisor-chat-history.service.js";

import {
    getExternalAiStatus
} from "./ai-external-adapter.service.js";

export function renderAdvisorChatDashboard() {
    const history = listAdvisorChatHistory();
    const externalAi = getExternalAiStatus();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>MedStack AI Advisor Chat</title>

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

textarea {
    width: 100%;
    min-height: 100px;
    padding: 14px;
    border-radius: 10px;
    border: 1px solid #d1d5db;
    font-size: 15px;
    resize: vertical;
}

button {
    margin-top: 12px;
    margin-right: 8px;
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

button.danger {
    background: #dc2626;
}

button.external {
    background: #7c3aed;
}

.answer {
    background: #f9fafb;
    border-left: 4px solid #2563eb;
    padding: 14px;
    margin-bottom: 10px;
    border-radius: 8px;
}

.history-item {
    background: #f9fafb;
    border-left: 4px solid #64748b;
    padding: 14px;
    margin-bottom: 12px;
    border-radius: 8px;
}

.badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: bold;
}

.info {
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
    <h1>💬 MedStack AI Advisor Chat</h1>

    <p class="small">
        Modo local, somente leitura. Não altera código, não faz deploy e não apaga dados.
    </p>

    <p>
        <span class="badge info">
            Histórico: ${history.length}
        </span>

        <span class="badge ${externalAi.enabled ? "ok" : "warn"}">
            External AI: ${externalAi.enabled ? "enabled" : "disabled"}
        </span>
    </p>
</div>

<div class="card">
    <h2>Pergunte ao backend</h2>

    <textarea id="question" placeholder="Ex: Estamos prontos para produção? Qual a próxima etapa? O que falta para 100 empresas?"></textarea>

    <br />

    <button onclick="askAdvisor()">Perguntar Local</button>
    <button class="external" onclick="askExternalAdvisor()">Testar External AI</button>
    <button class="danger" onclick="clearHistory()">Limpar histórico</button>
</div>

<div class="card">
    <h2>Resposta</h2>

    <div id="answer">
        <p class="small">Aguardando pergunta...</p>
    </div>
</div>

<div class="card">
    <h2>Perguntas rápidas</h2>

    <button onclick="quickAsk('Qual a próxima etapa do projeto?')">Próxima etapa</button>
    <button onclick="quickAsk('Estamos prontos para produção?')">Produção</button>
    <button onclick="quickAsk('O que falta para 100 empresas?')">100 empresas</button>
    <button onclick="quickAsk('Temos débito técnico?')">Débito técnico</button>
    <button onclick="quickAsk('Posso começar o Lovable?')">Lovable</button>
</div>

<div class="card">
    <h2>External AI Status</h2>
    <pre>${JSON.stringify(externalAi, null, 2)}</pre>

    <p>
        <a href="/ai-monitor/external-ai/dashboard">
            Abrir configuração External AI
        </a>
    </p>
</div>

<div class="card">
    <h2>Histórico recente</h2>

    <div id="history">
        ${renderHistory(history)}
    </div>
</div>

<div class="card">
    <h2>Dados técnicos</h2>
    <pre id="raw">-</pre>
</div>

</div>

<script>
async function askAdvisor() {
    const question = document.getElementById("question").value;

    const response = await fetch("/ai-monitor/advisor-chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question
        })
    });

    const json = await response.json();

    renderAnswer(json.data);

    setTimeout(() => {
        window.location.reload();
    }, 800);
}

async function askExternalAdvisor() {
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

    renderExternalAnswer(json.data);
}

function quickAsk(question) {
    document.getElementById("question").value = question;
    askAdvisor();
}

async function clearHistory() {
    await fetch("/ai-monitor/advisor-chat/clear", {
        method: "POST"
    });

    window.location.reload();
}

function renderAnswer(data) {
    const answerEl = document.getElementById("answer");
    const rawEl = document.getElementById("raw");

    if (!data || !data.answer) {
        answerEl.innerHTML = "<p class='small'>Sem resposta.</p>";
        rawEl.textContent = JSON.stringify(data, null, 2);
        return;
    }

    answerEl.innerHTML = data.answer
        .map((item) => "<div class='answer'>" + item + "</div>")
        .join("");

    rawEl.textContent = JSON.stringify(data, null, 2);
}

function renderExternalAnswer(data) {
    const answerEl = document.getElementById("answer");
    const rawEl = document.getElementById("raw");

    answerEl.innerHTML =
        "<div class='answer'><strong>External AI Skeleton:</strong><br />" +
        (data?.message || "Sem mensagem.") +
        "</div>";

    rawEl.textContent = JSON.stringify(data, null, 2);
}
</script>

</body>
</html>
`;
}

function renderHistory(history) {
    if (!history.length) {
        return "<p class='small'>Nenhuma conversa registrada ainda.</p>";
    }

    return history
        .slice(0, 10)
        .map((item) => `
            <div class="history-item">
                <p><strong>Pergunta:</strong> ${item.question || "-"}</p>
                <p><strong>Resposta:</strong></p>
                ${
                    Array.isArray(item.answer)
                        ? item.answer.map((answer) => `<div class="answer">${answer}</div>`).join("")
                        : `<div class="answer">${item.answer || "-"}</div>`
                }
                <p class="small">${item.createdAt}</p>
            </div>
        `)
        .join("");
}