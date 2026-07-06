# Arquitetura — MedStack Server

## 1. Visão Geral

O MedStack Server é o backend principal de uma plataforma SaaS de comunicação, automação, atendimento, CRM e inteligência artificial.

O objetivo do projeto não é apenas conectar um WhatsApp.

O objetivo é construir um framework de comunicação escalável, modular e preparado para múltiplas empresas, múltiplos usuários, múltiplas instâncias e múltiplos canais.

O backend é o produto principal.

O frontend pode ser substituído sem afetar a lógica central.

Frontends possíveis:

- Lovable
- React
- Next.js
- Flutter
- Aplicativo mobile
- Painel interno
- API pública de terceiros

---

## 2. Princípio Central

Toda regra crítica fica no backend.

O frontend nunca deve conter regra crítica de negócio.

Exemplos de regras que pertencem ao backend:

- WhatsApp
- Sessões
- IA
- CRM
- Fluxos
- Pagamentos
- Assinaturas
- Limites
- Usuários
- Permissões
- Webhooks
- Logs
- Métricas
- API pública

---

## 3. Arquitetura em Camadas

A arquitetura padrão do MedStack segue este fluxo:

```txt
Controller
    ↓
Service
    ↓
Repository
    ↓
Store
    ↓
Database