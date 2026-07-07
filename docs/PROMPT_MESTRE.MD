# MEDSTACK SERVER

## PROMPT MESTRE

Este documento é a principal base de conhecimento do projeto.

Toda IA que trabalhar neste projeto deve considerar este arquivo como prioridade máxima antes de gerar qualquer código.

Caso exista conflito entre documentos, este arquivo prevalece.

---

# Objetivo do projeto

O MedStack Server é um Backend SaaS Multiempresa voltado para comunicação empresarial.

O WhatsApp é apenas o primeiro módulo.

O objetivo final é uma plataforma completa contendo:

• WhatsApp Runtime
• CRM
• Atendimento
• IA
• Fluxos
• Inbox
• API Pública
• Multiempresa
• Dashboard Lovable
• Billing
• Integrações
• Workers
• Eventos
• Filas
• Analytics

Todo o Frontend ficará no Lovable.

Toda regra crítica permanece neste backend.

---

# Arquitetura

Backend:

Node.js

Express

ESM Modules

REST API

Estrutura Modular

Frontend:

Lovable

React

Supabase (apenas autenticação/frontend)

Servidor:

Node

Docker

Redis

BullMQ

PostgreSQL

VPS

---

# Filosofia

Sempre manter arquitetura limpa.

Nunca criar arquivos gigantes.

Cada módulo deve ser independente.

Nenhum módulo pode depender diretamente de outro.

Sempre utilizar Services.

Controllers nunca possuem regra de negócio.

Routes apenas registram endpoints.

---

# Estrutura

src/

config/

constants/

core/

database/

middleware/

modules/

routes/

utils/

---

Cada módulo possui:

controllers/

services/

routes/

workers/

providers/

constants/

middlewares/

queues/

repositories/

---

# Multiempresa

Todo dado pertence a uma Company.

Nada será global.

Todas as entidades futuras deverão possuir:

companyId

instanceId

createdAt

updatedAt

---

# Runtime

Cada empresa possui:

1 Runtime

1 Socket

1 QR

1 Dispatcher

1 Worker

1 Health Monitor

1 Runtime State

1 Runtime Logs

---

Nunca compartilhar Runtime entre empresas.

---

# IA Monitor

O projeto possui uma IA interna.

A IA nunca modifica código.

Modo:

Read Only

Ela apenas:

analisa

gera relatórios

gera dashboards

gera roadmap

gera inventário

gera arquitetura

gera recomendações

gera débito técnico

gera readiness

gera release advisor

gera documentação

---

# IA Externa

Existe suporte para integração futura com:

OpenAI

Claude

Gemini

DeepSeek

Qwen

Mistral

Llama

Sempre via Adapter.

Nunca acoplar diretamente.

---

# Banco

Hoje:

In Memory

Futuro:

PostgreSQL

Repositories deverão manter a mesma interface.

---

# Filas

Hoje:

Memory Queue

Futuro:

BullMQ

Redis

Nunca alterar interface pública.

---

# Providers

Hoje:

Baileys

Futuro:

Meta Cloud API

Twilio

Evolution API

Outros Providers

Sempre através de Provider Pattern.

---

# Frontend

Todo frontend será Lovable.

Este backend nunca renderiza telas finais.

Os dashboards existentes são apenas administrativos.

---

# Roadmap Atual

Concluído

Backend Base

WhatsApp Runtime

Worker

Dispatcher

Dashboard Runtime

AI Monitor

Scanner

Security

Performance

Release Advisor

Final Overview

Próxima etapa

PostgreSQL

Depois

Redis

BullMQ

JWT

RBAC

Docker

VPS

Lovable

Produção

---

# Convenções

Sempre utilizar:

camelCase

ES Modules

Controllers pequenos

Services reutilizáveis

Sem lógica duplicada

Sem código morto

---

# Regras para IA

Sempre responder utilizando:

Arquivo completo

Nunca enviar apenas trecho

Sempre informar caminho completo

Sempre preservar arquitetura existente

Nunca quebrar compatibilidade

Sempre preferir composição

Nunca alterar API existente sem necessidade

Sempre considerar crescimento para centenas de empresas.
