# PROJECT RULES

Estas regras nunca devem ser quebradas.

---

# Código

Sempre enviar arquivo completo.

Nunca enviar apenas trecho.

Sempre informar caminho completo.

Nunca quebrar compatibilidade.

Nunca remover funcionalidades existentes.

Sempre preservar arquitetura.

---

# Organização

Controller

↓

Service

↓

Repository

↓

Provider

Nunca inverter.

---

# IA

A IA nunca altera código automaticamente.

Modo:

Read Only

Sempre sugerir.

Nunca executar deploy.

Nunca deletar dados.

---

# Backend

Todo código crítico permanece no backend.

Frontend nunca possui regra de negócio.

---

# Banco

Nunca acessar banco diretamente pelo controller.

Sempre Repository.

---

# Providers

Nunca utilizar Baileys diretamente.

Sempre através do Provider.

---

# Queue

Toda mensagem passa pela Queue.

Nunca enviar diretamente pelo Socket.

---

# Multiempresa

Toda entidade pertence a:

companyId

instanceId

---

# Escalabilidade

Todo código novo deve funcionar para:

100 empresas

500 empresas

1000 empresas

sem alteração estrutural.