# ARQUITETURA — MEDSTACK SERVER

## Visão Geral

O MedStack Server é um backend SaaS multiempresa construído em Node.js + Express.

O WhatsApp é apenas o primeiro módulo do sistema.

A arquitetura foi desenhada para evoluir para:

- PostgreSQL
- Redis
- BullMQ
- Workers separados
- Docker
- VPS
- Frontend Lovable
- IA externa
- múltiplas empresas
- múltiplas instâncias WhatsApp

---

# Estrutura principal

```txt
medstack-server/

server.js

src/
  app.js

  config/
  constants/
  core/
  database/
  middleware/
  modules/
  routes/
  utils/

docs/
  API.md
  ARQUITETURA.md
  CHANGELOG.md
  CONVENCOES.md
  CORE_PRINCIPLES.md
  DATABASE.md
  DECISOES_DE_ARQUITETURA.md
  DEPLOY.md
  MODULO_WHATSAPP.md
  MULTIEMPRESA.md
  PADRAO_DESENVOLVIMENTO.md
  PROMPT_MESTRE.md
  ROADMAP.md
  AI_BOOTSTRAP.md
  PROJECT_CONTEXT.md
  PROJECT_STATE.md
  PROJECT_RULES.md
```

---

# Fluxo principal

```txt
server.js
  ↓
src/app.js
  ↓
src/routes/index.js
  ↓
src/modules/*/routes
  ↓
controllers
  ↓
services
  ↓
repositories / providers / queues / workers
```

---

# src/app.js

Responsável por montar o Express.

Atualmente contém:

```txt
express
cors
json parser
rotas principais
errorHandler
```

Futuramente deverá conter:

```txt
helmet
compression
rate limit
request id
logger HTTP
trust proxy
CORS restrito
```

---

# src/routes

Responsável por centralizar as rotas principais do backend.

Exemplo esperado:

```txt
src/routes/index.js
```

Esse arquivo conecta os módulos principais ao Express.

---

# src/core

Contém recursos centrais do backend.

Exemplos:

```txt
src/core/response.js
src/core/errors/
src/core/logger.js
```

Responsabilidades:

- resposta padrão
- erros
- error handler
- logs
- helpers globais

---

# src/config

Contém configurações do sistema.

Exemplos:

```txt
src/config/env.js
```

Responsabilidades:

- variáveis de ambiente
- configuração de porta
- configuração futura de banco
- configuração futura de Redis
- configuração futura de JWT

---

# src/constants

Contém constantes globais.

Exemplos:

```txt
WHATSAPP_DEFAULT_INSTANCE_ID
```

Responsabilidades:

- valores fixos
- enums globais
- chaves padrão

---

# src/database

Hoje ainda é uma camada inicial.

Futuro:

```txt
PostgreSQL
migrations
connection
database client
repositories reais
```

Regra:

Controller nunca acessa banco diretamente.

Service também não deve depender diretamente do banco.

Acesso deve passar por Repository.

---

# src/middleware

Contém middlewares globais ou reutilizáveis.

Futuro:

```txt
auth middleware
rbac middleware
rate limit middleware
request logger
tenant resolver
```

---

# src/modules

Contém todos os módulos do SaaS.

Cada módulo deve ser independente.

Estrutura ideal de módulo:

```txt
src/modules/nome-do-modulo/

controllers/
services/
routes/
repositories/
providers/
queues/
workers/
constants/
middlewares/
entities/
```

Nem todo módulo precisa ter todas as pastas.

---

# Módulo WhatsApp

Caminho:

```txt
src/modules/whatsapp/
```

Responsável por:

- runtime
- conexão
- QR Code
- socket
- envio
- recebimento
- fila
- worker
- dispatcher
- health monitor
- logs
- providers
- integração com empresa

Principais subpastas:

```txt
src/modules/whatsapp/controllers/
src/modules/whatsapp/routes/
src/modules/whatsapp/services/
src/modules/whatsapp/providers/
src/modules/whatsapp/queues/
src/modules/whatsapp/repositories/
```

---

# Módulo AI Monitor

Caminho:

```txt
src/modules/ai-monitor/
```

Responsável por observar o backend.

Ele é somente leitura.

Ele nunca altera código.

Principais recursos:

```txt
runtime review
queue review
log review
executive report
architecture review
dependency graph
technical debt
production readiness
api map
lovable api guide
roadmap
advisor chat
external AI adapter
project memory
continuous analysis
code scanner
module health
security scanner
performance scanner
refactoring advisor
release advisor
final overview
```

Principais subpastas:

```txt
src/modules/ai-monitor/controllers/
src/modules/ai-monitor/routes/
src/modules/ai-monitor/services/
```

---

# Padrão Controller

Controllers devem:

```txt
receber req
chamar service
retornar response
tratar next(error)
```

Controllers não devem conter regra de negócio.

---

# Padrão Service

Services contêm regra de negócio.

Services podem chamar:

```txt
repositories
providers
queues
workers
outros services
```

Services não devem depender do Express.

---

# Padrão Repository

Repositories isolam persistência.

Hoje muitos dados ainda estão em memória.

Futuro:

```txt
PostgreSQL
```

A interface deve ser preservada para evitar quebrar o frontend.

---

# Padrão Provider

Providers isolam integrações externas.

Exemplo:

```txt
Baileys
Meta Cloud API
Twilio
Evolution API
```

O código nunca deve depender diretamente de um provider específico.

---

# Padrão Queue

Hoje:

```txt
fila em memória
```

Futuro:

```txt
BullMQ + Redis
```

A interface pública da fila deve ser preservada.

---

# Multiempresa

Toda entidade futura deverá possuir:

```txt
companyId
instanceId
createdAt
updatedAt
```

Nenhum dado pode ser compartilhado entre empresas.

Cada empresa deverá possuir sua própria instância WhatsApp.

---

# Runtime por empresa

Cada empresa deverá possuir:

```txt
1 runtime
1 socket
1 QR
1 dispatcher
1 worker
1 health monitor
1 queue
1 runtime state
1 runtime logs
```

Nunca compartilhar conexão WhatsApp entre empresas.

---

# Frontend

O frontend será Lovable.

O Lovable deverá consumir apenas APIs REST.

Nenhuma regra crítica deve ficar no frontend.

---

# Infraestrutura futura

Ordem recomendada:

```txt
PostgreSQL
Redis
BullMQ
JWT
RBAC
Docker
VPS
Lovable Frontend
Produção
Refinamento IA Monitor
```

---

# Regra máxima

Sempre preservar compatibilidade.

Sempre enviar arquivo completo.

Sempre informar caminho completo.

Nunca quebrar API pública sem necessidade.