import {
    getReleaseAdvisorReport
} from "./ai-release-advisor.service.js";

export async function renderReleaseDashboard() {
    const report =
        await getReleaseAdvisorReport();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="15">

<title>MedStack AI Release Advisor</title>

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
    <h1>🚀 MedStack AI Release Advisor</h1>

    <p class="small">
        Avalia PostgreSQL, Redis/BullMQ, Docker,
        VPS, Lovable, segurança e performance.
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
    <h2>Release Score</h2>

    <div class="score">
        ${report.score}%
    </div>

    <span class="badge ${getStatusClass(report.status)}">
        ${escapeHtml(report.status)}
    </span>
</div>

<div class="card">
    <h2>Decisão</h2>

    <table>
        <tr>
            <td>Next Phase</td>
            <td>
                ${escapeHtml(
                    report.decision
                        .nextRecommendedPhase
                )}
            </td>
        </tr>

        <tr>
            <td>Current Stage</td>
            <td>
                ${escapeHtml(
                    report.currentStage
                )}
            </td>
        </tr>

        <tr>
            <td>PostgreSQL concluído</td>
            <td>
                ${renderBoolean(
                    report.decision
                        .postgresCompleted
                )}
            </td>
        </tr>

        <tr>
            <td>Reason</td>
            <td>
                ${escapeHtml(
                    report.decision.reason
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Pode avançar?</h2>

    <table>
        <tr>
            <td>PostgreSQL</td>
            <td>
                ${renderBoolean(
                    report.decision
                        .canStartPostgreSQL
                )}
            </td>
        </tr>

        <tr>
            <td>Redis/BullMQ</td>
            <td>
                ${renderBoolean(
                    report.decision
                        .canStartRedisBullMQ
                )}
            </td>
        </tr>

        <tr>
            <td>Docker</td>
            <td>
                ${renderBoolean(
                    report.decision
                        .canStartDocker
                )}
            </td>
        </tr>

        <tr>
            <td>VPS</td>
            <td>
                ${renderBoolean(
                    report.decision
                        .canStartVps
                )}
            </td>
        </tr>

        <tr>
            <td>Lovable</td>
            <td>
                ${renderBoolean(
                    report.decision
                        .canStartLovable
                )}
            </td>
        </tr>
    </table>
</div>

<div class="card">
    <h2>Readiness</h2>

    <table>
        <tr>
            <td>Production</td>
            <td>
                ${report.readiness.production.score}%
            </td>
        </tr>

        <tr>
            <td>Security</td>
            <td>
                ${report.readiness.security.score}%
            </td>
        </tr>

        <tr>
            <td>Performance</td>
            <td>
                ${report.readiness.performance.score}%
            </td>
        </tr>

        <tr>
            <td>Refactoring Candidates</td>
            <td>
                ${report.readiness.refactoring.candidates}
            </td>
        </tr>

        <tr>
            <td>Scanned Files</td>
            <td>
                ${report.readiness.scanner.files}
            </td>
        </tr>

        <tr>
            <td>PostgreSQL Ready</td>
            <td>
                ${renderBoolean(
                    report.readiness
                        .infrastructure
                        .postgresReady
                )}
            </td>
        </tr>

        <tr>
            <td>Migrations Ready</td>
            <td>
                ${renderBoolean(
                    report.readiness
                        .infrastructure
                        .migrationsReady
                )}
            </td>
        </tr>

        <tr>
            <td>Persistence Ready</td>
            <td>
                ${renderBoolean(
                    report.readiness
                        .infrastructure
                        .persistenceReady
                )}
            </td>
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
    <h2>Recomendações</h2>

    ${renderList(
        report.recommendations,
        "recommendation"
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
    const button = event?.target;

    if (button) {
        button.disabled = true;
        button.textContent = "Executando...";
    }

    try {
        const response = await fetch(
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
        alert(error.message);

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

function renderList(
    items = [],
    className = "recommendation"
) {
    if (!items.length) {
        return `
            <p class="small">
                Nenhum item encontrado.
            </p>
        `;
    }

    return items
        .map((item) => `
            <div class="${className}">
                ${escapeHtml(
                    String(item)
                )}
            </div>
        `)
        .join("");
}

function getStatusClass(status) {
    if (
        status === "ready_for_next_phase"
    ) {
        return "ok";
    }

    if (
        status === "almost_ready"
        || status === "needs_cleanup"
    ) {
        return "warn";
    }

    return "error";
}

function renderBoolean(value) {
    return value
        ? `
            <span class="badge ok">
                SIM
            </span>
        `
        : `
            <span class="badge error">
                NÃO
            </span>
        `;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}