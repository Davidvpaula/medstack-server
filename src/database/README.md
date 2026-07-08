# DATABASE LAYER

Esta pasta contém toda a camada de persistência do MedStack Server.

## Objetivo

Isolar o acesso ao banco de dados PostgreSQL e permitir migração gradual dos repositories em memória para repositories reais.

## Estrutura

```txt
src/database/

migrations/
repositories/
seeds/

postgres.client.js
database-health.service.js
migration-runner.js
base.repository.js
base-company.repository.js
repository-utils.js