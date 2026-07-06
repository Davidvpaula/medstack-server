# Decisões de Arquitetura

Este documento registra todas as decisões importantes do projeto.

---

## DA-001

Título

Backend é o produto principal.

Decisão

Toda regra crítica ficará no backend.

Motivo

Permitir qualquer frontend consumir as APIs.

Status

Ativa.

---

## DA-002

Título

Frontend sem regra de negócio.

Decisão

Frontend apenas consome APIs.

Motivo

Permitir React, Lovable, Flutter ou qualquer outro cliente.

Status

Ativa.

---

## DA-003

Título

Arquitetura em camadas.

Fluxo

Controller

↓

Service

↓

Repository

↓

Store

↓

Database

Motivo

Separação de responsabilidades.

Status

Ativa.

---

## DA-004

Título

Repository é a única camada autorizada a acessar Store.

Motivo

Permitir trocar Store por Redis ou Banco sem alterar Services.

Status

Ativa.

---

## DA-005

Título

Socket Lifecycle separado do Connection Manager.

Socket Lifecycle

Responsável pelo socket.

Connection Manager

Responsável pelo estado da conexão.

Motivo

Baixo acoplamento.

Status

Ativa.

---

## DA-006

Título

Eventos separados.

Decisão

Baileys nunca conversa diretamente com Services.

Fluxo

Baileys

↓

Events

↓

Services

↓

Repository

Motivo

Organização.

Status

Ativa.

---

## DA-007

Título

Instance Manager.

Decisão

Toda arquitetura será preparada para múltiplas instâncias.

Motivo

Preparação para SaaS.

Status

Em evolução.

---

## DA-008

Título

Desenvolvimento por pacotes.

Fluxo

Arquitetura

↓

Implementação

↓

Teste

↓

Documentação

↓

Próximo pacote

Status

Ativa.

---

## DA-009

Título

Toda alteração exige arquivo completo.

Decisão

Nunca alterar apenas trechos.

Sempre reescrever o arquivo inteiro.

Status

Ativa.

---

## DA-010

Título

Nunca assumir código.

Decisão

Sempre solicitar o arquivo antes de alterar.

Status

Ativa.
