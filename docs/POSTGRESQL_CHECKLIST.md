# POSTGRESQL CHECKLIST — MEDSTACK SERVER

## Objetivo

Checklist oficial da Fase 9 PostgreSQL.

---

# Infraestrutura

- [x] Docker instalado
- [x] Docker Compose funcionando
- [x] Container PostgreSQL criado
- [x] Banco `medstack_dev` criado
- [x] Porta 5432 exposta
- [x] Volume persistente criado

---

# Node.js

- [x] Pacote `pg` instalado
- [x] Pacote `dotenv` instalado
- [x] Configuração `database.config.js`
- [x] Pool PostgreSQL
- [x] Função query
- [x] Função transaction
- [x] Teste de conexão

---

# Health

- [x] Database Health Service
- [x] GET /health/database
- [x] Database Dashboard
- [x] GET /database/dashboard

---

# Migrations

- [x] Migration Runner
- [x] Tabela `schema_migrations`
- [x] Script `db-status`
- [x] Script `db-migrate`

---

# Tabelas

- [x] companies
- [x] users
- [x] whatsapp_instances
- [x] contacts
- [x] conversations
- [x] messages

---

# Repositories

- [x] BaseRepository
- [x] BaseCompanyRepository
- [x] Repository Utils
- [x] Company Repository
- [x] User Repository
- [x] WhatsApp Instance Repository
- [x] Contact Repository
- [x] Conversation Repository
- [x] Message Repository
- [x] Repository Factory

---

# Seeds

- [x] Dev Seed
- [x] Empresa Teste
- [x] Admin MedStack
- [x] Instância main
- [x] DB Reset Dev

---

# Testes

- [x] Teste manual de conexão
- [x] Teste migrations
- [x] Teste repositories
- [x] Teste health database
- [x] Teste dashboard database

---

# Pendências

- [ ] Integrar Company Module com PostgreSQL
- [ ] Integrar User Module com PostgreSQL
- [ ] Integrar Contact Module com PostgreSQL
- [ ] Integrar Conversation Module com PostgreSQL
- [ ] Integrar Message Module com PostgreSQL
- [ ] Integrar WhatsApp Instance Module com PostgreSQL
- [ ] Criar diagnóstico interno do sistema
- [ ] Atualizar AI Monitor para enxergar PostgreSQL
- [ ] Preparar backup
- [ ] Preparar Docker Compose futuro com API + PostgreSQL

---

# Regra final

A Fase PostgreSQL só será considerada encerrada quando os módulos principais estiverem usando repositories PostgreSQL reais.