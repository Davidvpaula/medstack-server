# API Oficial — MedStack Server

## Base URL

```
http://localhost:3000
```

---

# Sistema

## Health

GET

```
/health
```

Retorna status do servidor.

---

# WhatsApp

## Status

GET

```
/whatsapp/status
```

---

## Iniciar

GET

POST

```
/whatsapp/start
```

---

## Reiniciar

GET

POST

```
/whatsapp/restart
```

---

## QR

GET

```
/whatsapp/qr
```

---

## Página QR

GET

```
/whatsapp/qr-page
```

---

## Mensagens

GET

```
/whatsapp/messages
```

---

## Enviar mensagem

POST

```
/whatsapp/send
```

Body

```json
{
    "number": "5599999999999",
    "text": "Olá"
}
```

---

# Health (Planejado)

GET

```
/whatsapp/health
```

---

# Heartbeat (Planejado)

GET

```
/whatsapp/heartbeat
```

---

# Metrics (Planejado)

GET

```
/whatsapp/metrics
```