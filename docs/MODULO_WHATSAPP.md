# MÓDULO WHATSAPP

Versão:
1.0

---

# Objetivo

O módulo WhatsApp é responsável pela comunicação entre o MedStack e o WhatsApp.

Ele é apenas um módulo do SaaS.

Nunca deve conter regras de CRM, usuários ou faturamento.

---

# Estrutura

```txt
src/modules/whatsapp/

controllers/

services/

routes/

providers/

repositories/

workers/

queues/

constants/
```

---

# Runtime

Cada empresa possui:

1 Runtime

1 Socket

1 QR

1 Queue

1 Worker

1 Dispatcher

1 Health Monitor

1 Runtime State

1 Runtime Logs

Nunca compartilhar Runtime.

---

# Providers

Hoje:

Baileys

Futuro:

Meta Cloud API

Twilio

Evolution

Outros

Sempre utilizar Provider Pattern.

---

# Worker

Responsável por:

Receber mensagens.

Enviar mensagens.

Processar fila.

Retry.

Dead Letter.

---

# Dispatcher

Toda mensagem passa pelo Dispatcher.

Nunca enviar diretamente pelo socket.

---

# Queue

Hoje:

Memória.

Futuro:

BullMQ.

Redis.

Interface pública deve permanecer igual.

---

# QR Code

Cada empresa possui um QR independente.

Nunca compartilhar sessões.

---

# Sessão

Cada empresa terá sua própria sessão autenticada.

Sessões nunca podem ser reutilizadas entre empresas.

---

# Objetivo futuro

Suportar:

100+

500+

1000+

empresas simultaneamente.

---

# IA

A IA nunca envia mensagens diretamente.

Ela apenas gera decisões.

O envio continua sendo responsabilidade do Runtime.