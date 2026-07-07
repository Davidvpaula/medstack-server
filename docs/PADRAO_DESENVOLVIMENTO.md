docs/
│
├── README.md                ← Índice principal da documentação
├── PROMPT_MESTRE.md
├── AI_BOOTSTRAP.md
├── PROJECT_CONTEXT.md
├── PROJECT_STATE.md
├── PROJECT_RULES.md
├── API.md
├── ARQUITETURA.md
├── DATABASE.md
├── MODULO_WHATSAPP.md
├── MULTIEMPRESA.md
├── DEPLOY.md
├── ROADMAP.md
├── CHANGELOG.md
├── CORE_PRINCIPLES.md
├── PADRAO_DESENVOLVIMENTO.md
├── CONVENCOES.md
└── DECISOES_DE_ARQUITETURA.md

Novo Roadmap Estratégico
FASE 9 — Persistência (Banco)

Objetivo:

Transformar tudo que hoje está em memória em dados persistentes.

Etapas
Connection PostgreSQL

↓

Repository Base

↓

Migration System

↓

Company Repository

↓

WhatsApp Repository

↓

Runtime Repository

↓

Message Repository

↓

Logs Repository

Resultado:

Nada mais será perdido ao reiniciar o servidor.

FASE 10 — Cache e Filas

Objetivo:

Escalar.

Etapas
Redis

↓

BullMQ

↓

Workers Separados

↓

Retry

↓

Dead Letter

↓

Agendamentos

Resultado:

Pronto para centenas de empresas.

FASE 11 — Segurança

Objetivo:

Preparar para clientes reais.

Etapas
JWT

↓

Refresh Token

↓

RBAC

↓

Permissões

↓

Middleware Auth

↓

Middleware Company

↓

Auditoria

Resultado:

Backend pronto para múltiplos usuários.

FASE 12 — Infraestrutura

Objetivo:

Produção.

Etapas
Docker

↓

Docker Compose

↓

Volumes

↓

Healthcheck

↓

Backup

↓

Nginx

↓

SSL

↓

Deploy VPS

Resultado:

Servidor profissional.

FASE 13 — Frontend Lovable

Agora sim.

Porque o backend estará praticamente pronto.

Você construirá apenas:

Login

Dashboard

QR Code

Inbox

Mensagens

Configurações

Usuários

Empresa

Analytics

Consumindo APIs já prontas.

FASE 14 — Produção

Primeiro cliente.

Depois:

10

20

50

100 empresas.