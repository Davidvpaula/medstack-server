import {
    getRoadmapAnalysis
} from "./ai-roadmap.service.js";

export function renderRoadmapDashboard() {
    const roadmap = getRoadmapAnalysis();

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="5">
<title>MedStack Roadmap</title>

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

.score {
    font-size: 42px;
    font-weight: bold;
}

.badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: bold;
}

.done {
    background: #dcfce7;
    color: #166534;
}

.pending {
    background: #fef3c7;
    color: #92400e;
}

.next {
    background: #dbeafe;
    color: #1e40af;
}

table {
    width: 100%;
    border-collapse: collapse;
}

td, th {
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
}

td:last-child, th:last-child {
    text-align: right;
}
</style>
</head>

<body>
<div class="container">

<div class="header">
    <h1>🧭 MedStack Roadmap</h1>
    <div class="score">${roadmap.progress}%</div>
    <p>Concluído: ${roadmap.completed} | Pendente: ${roadmap.pending}</p>
</div>

<div class="card">
    <h2>Próxima etapa</h2>

    ${
        roadmap.nextStep
            ? `
                <p>
                    <strong>${roadmap.nextStep.module}</strong>
                    <span class="badge next">prioridade ${roadmap.nextStep.priority}</span>
                </p>
            `
            : "<p>Todas as etapas foram concluídas.</p>"
    }
</div>

<div class="card">
    <h2>Roadmap completo</h2>

    <table>
        <tr>
            <th>ID</th>
            <th>Módulo</th>
            <th>Prioridade</th>
            <th>Status</th>
        </tr>

        ${roadmap.roadmap.map((step) => `
            <tr>
                <td>${step.id}</td>
                <td>${step.module}</td>
                <td>${step.priority}</td>
                <td>
                    <span class="badge ${step.status === "done" ? "done" : "pending"}">
                        ${step.status}
                    </span>
                </td>
            </tr>
        `).join("")}
    </table>
</div>

</div>
</body>
</html>
`;
}