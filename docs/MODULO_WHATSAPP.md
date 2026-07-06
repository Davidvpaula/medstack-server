# Módulo WhatsApp

## Objetivo

Controlar comunicação WhatsApp.

---

## Estrutura

Routes

↓

Controller

↓

Services

↓

Repositories

↓

Store

---

## Comunicação com Baileys

Baileys

↓

Socket

↓

Events

↓

Services

↓

Repositories

↓

Store

---

## Services

connection.service

message.service

qr.service

session.service

connection-manager.service

socket-lifecycle.service

instance-manager.service

health.service (futuro)

heartbeat.service (futuro)

metrics.service (futuro)

---

## Repository

whatsapp.repository.js

Responsável por acesso aos dados.

---

## Store

whatsapp.store.js

Estado temporário.

---

## Events

connection-update.event.js

messages-upsert.event.js

---

## Socket

whatsapp.socket.js

Responsável apenas pela integração Baileys.

---

## Próximos componentes

Health Monitor

Heartbeat

Metrics

Session Manager

Reconnect Inteligente

Workers

Redis

BullMQ
