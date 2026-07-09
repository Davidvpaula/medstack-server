# CHANGELOG

## 2026 — Fase 9 PostgreSQL

### Adicionado

- Docker local para PostgreSQL.
- Container `medstack-postgres`.
- Banco `medstack_dev`.
- Pool PostgreSQL com `pg`.
- Configuração `database.config.js`.
- Client `postgres.client.js`.
- Health service do banco.
- Endpoint `GET /health/database`.
- Database Dashboard.
- Endpoint `GET /database/dashboard`.
- Migration Runner.
- Tabela `schema_migrations`.
- Migrations:
  - `001_create_companies.sql`
  - `002_create_users.sql`
  - `003_create_whatsapp_instances.sql`
  - `004_create_contacts.sql`
  - `005_create_conversations.sql`
  - `006_create_messages.sql`
- BaseRepository.
- BaseCompanyRepository.
- Repository Utils.
- PostgreSQL repositories:
  - Company
  - User
  - WhatsApp Instance
  - Contact
  - Conversation
  - Message
- Seed de desenvolvimento.
- Reset local de banco.
- Scripts NPM:
  - `db:status`
  - `db:migrate`
  - `db:seed`
  - `db:reset`
  - `test:postgres`

### Decisões

- Não usar adapter genérico de persistência neste momento.
- Adotar PostgreSQL Repository direto para módulos novos.
- Usar Adapter apenas futuramente onde ainda existir estado real em memória.
- Manter Runtime WhatsApp funcionando sem quebra durante a migração.