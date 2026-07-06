# Padrão Oficial de Desenvolvimento — MedStack

Este documento define como qualquer código deve ser escrito dentro do MedStack.

Estas regras são obrigatórias para todos os módulos.

---

# Objetivo

O objetivo não é escrever código rápido.

O objetivo é escrever código que continue organizado após milhares de arquivos.

Toda decisão deve priorizar:

- legibilidade
- manutenção
- escalabilidade
- baixo acoplamento
- reutilização

---

# Estrutura Oficial

Todo módulo deverá seguir esta estrutura.

```text
module
│
├── controllers
├── services
├── repositories
├── stores
├── events
├── sockets
├── utils
├── routes
├── constants
└── index.js