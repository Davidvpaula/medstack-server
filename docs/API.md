# MEDSTACK SERVER

# API

Versão:
1.0

Este documento descreve toda a arquitetura REST do MedStack Server.

---

# Objetivo

Toda comunicação entre:

Frontend

↓

Backend

↓

Banco

↓

WhatsApp

ocorre através desta API.

O Frontend Lovable nunca acessa diretamente:

Banco

Runtime

Socket

Dispatcher

Workers

Tudo ocorre via REST API.

---

# Estrutura

```txt
Frontend

↓

HTTP REST

↓

Express

↓

Controller

↓

Service

↓

Repository

↓

Provider

↓

Database / Runtime
```

---

# Padrão de resposta

Todas as respostas utilizam:

```json
{
    "success": true,
    "message": "...",
    "data": {}
}
```

Erros:

```json
{
    "success": false,
    "message": "...",
    "error": {}
}
```

---

# Organização das rotas

Cada módulo possui sua própria rota.

Exemplo:

```txt
/whatsapp
/company
/auth
/users
/inbox
/messages
/flows
/ai-monitor
```

Nunca criar rotas gigantes.

---

# AI Monitor

Rotas atuais:

```txt
GET /ai-monitor/status

GET /runtime-review

GET /queue-review

GET /log-review

GET /full-review

GET /executive-report

GET /code-inventory

GET /architecture-review

GET /dependency-graph

GET /technical-debt

GET /production-readiness

GET /api-map

GET /lovable-api-guide

GET /roadmap

GET /architecture-advisor

POST /advisor-chat

POST /advisor-prompt

POST /external-ai/advisor

GET /external-ai/status

POST /external-ai/configure

POST /continuous/snapshot

GET /continuous/history

GET /project-memory

POST /project-memory

POST /project-memory/seed

POST /project-memory/clear

GET /scanner

POST /scanner/scan-src

POST /scanner/register

POST /scanner/clear

GET /module-health

GET /security-scan

GET /security-report

GET /performance-scan

GET /performance-report

GET /refactoring-advisor

GET /release-advisor

GET /final-overview
```

---

# Futuras APIs

Company

Users

Permissions

JWT

RBAC

Billing

Dashboard

Analytics

CRM

Inbox

Contacts

Campaigns

AI

Events

Webhooks

Public API

---

# Convenções

GET

Consulta.

POST

Criar.

PUT

Atualizar.

DELETE

Remover.

PATCH

Atualização parcial.

---

# Versionamento

Futuramente:

```txt
/api/v1/

api/v2/
```

Nunca quebrar compatibilidade.

---

# Frontend

Todo consumo será realizado pelo Lovable.

Nunca mover regra crítica para React.

React apenas consome APIs.