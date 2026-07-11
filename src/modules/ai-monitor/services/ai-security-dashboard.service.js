import {
    getSecurityFinalReport
} from "./ai-security-report.service.js";

export async function renderSecurityDashboard() {
    const report =
        await Promise.resolve(
            getSecurityFinalReport()
        );

    const summary =
        safeObject(
            report.summary
        );

    const scan =
        safeObject(
            report.scan
        );

    const routes =
        safeObject(
            report.routes
        );

    const config =
        safeObject(
            report.config
        );

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="15">

<title>MedStack AI Security</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f3f4f6;
    padding: 30px;
    color: #111827;
}

.container {
    max-width: 1200px;
    margin: auto;
}

.header,
.card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    box-shadow:
        0 10px 35px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
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

.warning {
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
    border-bottom: 1px solid #e5e7eb;
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

@media (max-width: 800px) {
    body {
        padding: 16px;
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
    <h1>🛡️ MedStack AI Security</h1>

    <p class="small">
        Scanner estrutural de segurança,
        rotas sensíveis e checklist de produção.
    </p>

    <button onclick="scanSrc(event)">
        Executar scan /src
    </button>

    <button onclick="window.location.reload()">
        Atualizar painel
    </button>
</div>

<div class="grid">

<div class="card">
    <h2>Security Score</h2>

    <div class="score">
        ${toNumber(report.score)}%
    </div>

    <span class="badge ${getStatusClass(report.status)}">
        ${escapeHtml(report.status)}
    </span>
</div>

<div class="card">
    <h2>Resumo Geral</h2>

    <table>
        <tr>
            <td>Scan Findings</td>
            <td>${toNumber(summary.totalFindings)}</td>
        </tr>

        <tr>
            <td>Critical Findings</td>
            <td>${toNumber(summary.criticalFindings)}</td>
        </tr>

        <tr>
            <td>High Findings</td>
            <td>${toNumber(summary.highFindings)}</td>
        </tr>

        <tr>
            <td>Risky Routes</td>
            <td>${toNumber(summary.riskyRoutes)}</td>
        </tr>

        <tr>
            <td>Config Pending</td>
            <td>${toNumber(summary.checklistPending)}</td>
        </tr>

        <tr>
            <td>Config Partial</td>
            <td>${toNumber(summary.checklistPartial)}</td>
        </tr>
    </table>
</div>

<div class="card full">
    <h2>Blockers</h2>

    ${renderList(
        report.blockers,
        "blocker"
    )}
</div>

<div class="card full">
    <h2>Warnings</h2>

    ${renderList(
        report.warnings,
        "warning"
    )}
</div>

<div class="card full">
    <h2>Próximos passos</h2>

    ${renderList(
        report.nextSteps,
        "next-step"
    )}
</div>

<div class="card full">
    <h2>Recomendações finais</h2>

    ${renderList(
        report.recommendations,
        "recommendation"
    )}
</div>

<div class="card full">
    <h2>Achados do Scanner</h2>

    ${renderFindings(
        scan.findings
    )}
</div>

<div class="card full">
    <h2>Rotas de Risco</h2>

    ${renderRoutes(
        routes.riskyRoutes
    )}
</div>

<div class="card full">
    <h2>Checklist de Segurança</h2>

    ${renderChecklist(
        config.checklist
    )}
</div>

<div class="card full">
    <h2>Dados técnicos</h2>

    <pre>${escapeHtml(
        JSON.stringify(
            report,
            null,
            2
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

function renderFindings(items) {
    const normalizedItems =
        toArray(items);

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Nenhum achado encontrado.
            </p>
        `;
    }

    return normalizedItems
        .map((item) => {
            const finding =
                safeObject(item);

            return `
                <div class="item">
                    <strong>
                        ${escapeHtml(finding.title)}
                    </strong>

                    <p>
                        ${escapeHtml(finding.description)}
                    </p>

                    <p class="small">
                        ${escapeHtml(finding.recommendation)}
                    </p>

                    <p>
                        <span class="badge ${getSeverityClass(finding.severity)}">
                            ${escapeHtml(finding.severity)}
                        </span>
                    </p>

                    <p class="small">
                        ${escapeHtml(finding.file || "-")}
                    </p>
                </div>
            `;
        })
        .join("");
}

function renderRoutes(items) {
    const normalizedItems =
        toArray(items);

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Nenhuma rota de risco encontrada.
            </p>
        `;
    }

    return normalizedItems
        .map((item) => {
            const route =
                safeObject(item);

            return `
                <div class="item">
                    <strong>
                        ${escapeHtml(route.method)}
                        ${escapeHtml(route.path)}
                    </strong>

                    <p>
                        Módulo:
                        ${escapeHtml(route.module || "-")}
                    </p>

                    <p>
                        ${escapeHtml(route.recommendation)}
                    </p>

                    <p>
                        <span class="badge ${getSeverityClass(route.risk)}">
                            ${escapeHtml(route.risk)}
                        </span>
                    </p>

                    <p class="small">
                        ${escapeHtml(
                            toArray(
                                route.reasons
                            ).join(" | ")
                        )}
                    </p>
                </div>
            `;
        })
        .join("");
}

function renderChecklist(items) {
    const normalizedItems =
        toArray(items);

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Checklist não disponível.
            </p>
        `;
    }

    return normalizedItems
        .map((item) => {
            const checklistItem =
                safeObject(item);

            return `
                <div class="item">
                    <strong>
                        ${escapeHtml(checklistItem.label)}
                    </strong>

                    <p>
                        ${escapeHtml(checklistItem.recommendation)}
                    </p>

                    <span class="badge ${getChecklistClass(checklistItem.status)}">
                        ${escapeHtml(checklistItem.status)}
                    </span>
                </div>
            `;
        })
        .join("");
}

function renderList(
    items,
    className = "item"
) {
    const normalizedItems =
        toArray(items);

    if (!normalizedItems.length) {
        return `
            <p class="small">
                Nenhum item encontrado.
            </p>
        `;
    }

    return normalizedItems
        .map((item) => `
            <div class="${className}">
                ${escapeHtml(formatItem(item))}
            </div>
        `)
        .join("");
}

function formatItem(item) {
    if (typeof item === "string") {
        return item;
    }

    const object =
        safeObject(item);

    return (
        object.label
        || object.detail
        || object.title
        || JSON.stringify(object)
    );
}

function getSeverityClass(severity) {
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

function getChecklistClass(status) {
    if (status === "passed") {
        return "ok";
    }

    if (status === "partial") {
        return "warn";
    }

    if (status === "pending") {
        return "error";
    }

    return "info";
}

function getStatusClass(status) {
    if (status === "secure_for_beta") {
        return "ok";
    }

    if (
        status === "needs_minor_security_work"
        || status === "needs_security_work"
    ) {
        return "warn";
    }

    return "error";
}

function safeObject(value) {
    return (
        value
        && typeof value === "object"
        && !Array.isArray(value)
    )
        ? value
        : {};
}

function toArray(value) {
    return Array.isArray(value)
        ? value
        : [];
}

function toNumber(value) {
    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}