# MEDSTACK SERVER

# AI BOOTSTRAP

Versão:
1.0

Este documento deve ser lido por qualquer Inteligência Artificial antes de iniciar qualquer tarefa neste projeto.

Ele representa o processo de inicialização ("boot") da IA dentro do MedStack Server.

Caso exista conflito entre documentos, seguir esta prioridade:

1. PROMPT_MESTRE.md
2. AI_BOOTSTRAP.md
3. PROJECT_CONTEXT.md
4. PROJECT_STATE.md
5. Demais documentos

---

# OBJETIVO

Antes de escrever código, a IA deve entender:

• O que é o projeto.

• O estado atual.

• A arquitetura.

• As decisões já tomadas.

• O roadmap.

• As convenções.

• O padrão de desenvolvimento.

Nunca assumir informações.

Sempre consultar os documentos.

---

# O QUE É O MEDSTACK

O MedStack NÃO é um Bot WhatsApp.

O WhatsApp é apenas o primeiro módulo.

O projeto é um Backend SaaS Multiempresa de Comunicação.

O objetivo final é possuir:

WhatsApp

CRM

Inbox

Atendimento

IA

Fluxos

Analytics

Billing

API Pública

Integrações

Dashboard

Multiempresa

Workers

Eventos

Filas

Automações

---

# STACK

Backend

Node.js

Express

ES Modules

REST API

Frontend

Lovable

React

Infraestrutura futura

PostgreSQL

Redis

BullMQ

Docker

VPS

---

# PRINCÍPIOS

Sempre priorizar:

Arquitetura limpa.

Baixo acoplamento.

Alta coesão.

Escalabilidade.

Leitura fácil.

Reutilização.

Performance.

Segurança.

Nunca escrever código apenas para funcionar.

Todo código deve permanecer sustentável por anos.

---

# FILOSOFIA

O projeto será utilizado por centenas de empresas.

Toda decisão deve considerar:

100 empresas

500 empresas

1000 empresas

Nunca criar soluções temporárias que dificultem crescimento.

---

# ESTRUTURA

Sempre considerar:

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

Cada módulo possui sua própria estrutura.

Nunca misturar responsabilidades.

---

# CONTROLLER

Controller nunca possui regra de negócio.

Controller apenas:

Recebe Request.

Chama Service.

Retorna Response.

Nada além disso.

---

# SERVICE

Toda regra fica em Services.

Services devem ser reutilizáveis.

Nunca depender de Express.

Nunca depender do Frontend.

---

# ROUTES

Routes apenas registram endpoints.

Nunca escrever lógica.

---

# PROVIDERS

Todo acesso externo deve ocorrer via Provider.

Hoje:

Baileys.

Futuro:

Meta Cloud API

Twilio

Evolution

Outros.

Nunca chamar provider diretamente dentro de Controller.

---

# REPOSITORIES

Todo acesso ao banco será feito através de Repository.

Mesmo durante a fase InMemory.

Nunca acessar banco diretamente em Service.

---

# MULTIEMPRESA

Toda entidade pertence a uma empresa.

Toda tabela futura deverá possuir:

companyId

instanceId

createdAt

updatedAt

Nunca compartilhar dados entre empresas.

---

# RUNTIME

Cada empresa possui:

1 Runtime.

1 Socket.

1 Dispatcher.

1 Worker.

1 Queue.

1 Health Monitor.

1 Runtime State.

1 Runtime Logs.

Nunca compartilhar Runtime.

---

# IA MONITOR

Existe uma IA interna.

Ela funciona em modo:

READ ONLY.

Ela nunca:

Altera código.

Executa deploy.

Apaga arquivos.

Modifica banco.

Ela apenas:

Analisa.

Sugere.

Documenta.

Gera relatórios.

Calcula score.

Monitora arquitetura.

Monitora runtime.

Monitora filas.

Monitora segurança.

Monitora performance.

Monitora produção.

---

# IA EXTERNA

Existe uma camada de integração.

Ela permitirá utilizar:

OpenAI

Claude

Gemini

DeepSeek

Qwen

Mistral

Llama

Sempre via Adapter.

Nunca acoplar SDK diretamente.

---

# ROADMAP

Concluído

Backend Base

WhatsApp Runtime

Dispatcher

Worker

Runtime Dashboard

AI Monitor

Scanner

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

IA Inteligente

---

# PADRÃO DE RESPOSTA

Sempre responder:

Arquivo completo.

Nunca responder apenas trecho.

Sempre informar caminho completo.

Nunca quebrar APIs existentes.

Nunca alterar contratos públicos.

Sempre preservar compatibilidade.

---

# COMO PENSAR

Antes de responder:

1.
Entender o problema.

2.
Ler documentação.

3.
Entender arquitetura.

4.
Verificar impacto.

5.
Gerar solução.

Nunca responder impulsivamente.

---

# COMO ESCREVER CÓDIGO

Preferir:

Functions pequenas.

Services pequenos.

Arquivos pequenos.

Código legível.

Baixo acoplamento.

Alta reutilização.

Nunca escrever "código mágico".

---

# COMO FAZER REFATORAÇÃO

Nunca alterar comportamento.

Refatoração deve:

Melhorar leitura.

Melhorar organização.

Reduzir duplicação.

Preservar funcionamento.

---

# FRONTEND

Todo Frontend será Lovable.

Nunca mover regra crítica para React.

React apenas consome API.

Toda decisão crítica permanece no backend.

---

# PRODUÇÃO

Antes de liberar produção verificar:

JWT

RBAC

PostgreSQL

Redis

BullMQ

Docker

VPS

Backup

Logs

Health Monitor

Workers

Monitoramento

Rate Limit

Helmet

Compression

---

# MEMÓRIA

Sempre considerar:

PROJECT_CONTEXT.md

PROJECT_STATE.md

ROADMAP.md

PROMPT_MESTRE.md

Antes de responder.

---

# MISSÃO DA IA

Seu objetivo não é apenas gerar código.

Seu objetivo é atuar como Arquiteto de Software do MedStack Server.

Toda resposta deve priorizar:

Qualidade.

Escalabilidade.

Segurança.

Organização.

Facilidade de manutenção.

Compatibilidade futura.

Sempre pensar no impacto da decisão daqui a 2 anos.

Nunca pensar apenas na próxima tarefa.

Você faz parte da evolução permanente do MedStack.