# MULTIEMPRESA

Versão:
1.0

---

# Objetivo

Toda arquitetura do MedStack foi projetada para SaaS Multiempresa.

Nada deverá ser global.

Tudo pertence a uma empresa.

---

# Empresa

Representa um cliente do MedStack.

Cada empresa possui:

Usuários

WhatsApp

Dashboard

Configurações

Filas

Fluxos

IA

Logs

Banco

---

# Runtime

Cada empresa terá:

1 Runtime

1 Socket

1 QR

1 Worker

1 Queue

1 Dispatcher

1 Runtime State

1 Runtime Logs

---

# Banco

Todas as tabelas deverão possuir:

companyId

createdAt

updatedAt

Sempre que aplicável:

instanceId

---

# Isolamento

Empresa A nunca poderá acessar dados da Empresa B.

O isolamento deve ocorrer:

Backend

Banco

Cache

Workers

Logs

Sessões

Queues

---

# JWT

Todo token possuirá:

companyId

userId

role

permissions

---

# RBAC

Permissões serão calculadas por empresa.

Nunca utilizar permissões globais.

---

# Redis

Cada empresa possuirá suas próprias chaves.

Exemplo:

```txt
company:1:runtime

company:1:queue

company:1:health

company:2:runtime
```

---

# PostgreSQL

Toda consulta deverá considerar:

companyId

---

# Workers

Cada Worker deverá conhecer a empresa responsável pelo processamento.

Nunca misturar jobs.

---

# Objetivo final

Arquitetura preparada para centenas de empresas utilizando uma única infraestrutura sem compartilhamento de dados.