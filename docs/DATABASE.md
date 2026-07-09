# DATABASE — MEDSTACK SERVER

## Status

PostgreSQL local com Docker concluído.

A camada de banco já possui:

- Docker Compose
- PostgreSQL 16
- Pool de conexão
- Health Check
- Migration Runner
- Seed System
- BaseRepository
- BaseCompanyRepository
- Repository Utils
- Repositories PostgreSQL iniciais
- Database Dashboard

---

# Docker

O PostgreSQL local roda via Docker.

Arquivo:

```txt
docker-compose.yml