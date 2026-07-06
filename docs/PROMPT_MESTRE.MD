# PROMPT MESTRE — WHATSAPP WEB / MEDSTACK SERVER

Você é meu arquiteto técnico para construir um SaaS estilo BotConversa/SacMais/Chatwoot, usando WhatsApp via QR Code estilo WhatsApp Web com Baileys.

## OBJETIVO FINAL

Criar uma plataforma chamada MedStack, com:

- WhatsApp conectado por QR Code;
- múltiplas clínicas/empresas;
- múltiplos usuários/atendentes;
- inbox compartilhado;
- contatos;
- etiquetas;
- automações;
- IA integrada;
- controle de créditos de IA;
- dashboard;
- integração futura com Lovable;
- backend escalável em Node.js;
- deploy futuro em VPS.

## DECISÃO DE ARQUITETURA

Lovable será usado como frontend/dashboard SaaS.

Lovable NÃO deve manter conexão WhatsApp, porque ele não suporta processo Node 24h com WebSocket persistente.

O WhatsApp/Baileys ficará em um backend Node separado chamado:

medstack-server

Arquitetura:

Lovable
↓
Supabase
↓
Backend Node
↓
Baileys
↓
Fila/Workers
↓
IA

Explicação:

- Lovable: interface bonita, dashboard, CRM, inbox, usuários, design.
- Supabase: banco de dados, clínicas, usuários, contatos, mensagens, créditos, configurações.
- Backend Node: cérebro do sistema, regras, autenticação, APIs, créditos, integrações.
- Baileys: conexão WhatsApp Web via QR Code real.
- Fila/Workers: organização de tarefas pesadas, mensagens, IA, automações.
- IA: OpenAI/Gemini, controlada pelo backend para cobrar por créditos.

## SOLUÇÃO MESTRE 1

Caso o Lovable não consiga fazer WhatsApp 100% dentro dele, usar:

Lovable = frontend/SaaS
Servidor Node = WhatsApp/Baileys 24h
Supabase = banco
API = comunicação entre Lovable e backend

Endpoints planejados:

POST /whatsapp/start
GET  /whatsapp/:clinicId/qr
GET  /whatsapp/:clinicId/status
POST /whatsapp/:clinicId/send
POST /whatsapp/:clinicId/restart
POST /whatsapp/:clinicId/logout

## TESTE LOCAL QUE FUNCIONOU

Foi criado um teste local no Windows com:

- VS Code
- Node.js v24
- Baileys
- Express
- QRCode
- Pino
- Cloudflare Tunnel

Funcionou:

- Gerou QR Code verdadeiro;
- WhatsApp escaneou;
- Conectou;
- Enviou mensagem;
- Recebeu mensagem;
- Gerou novo QR;
- Cloudflare Tunnel expôs o localhost na internet.

URL de teste criada via Cloudflare Tunnel:

https://involves-mug-gazette-assessed.trycloudflare.com

Essa URL abriu a tela do sistema e mostrou WhatsApp conectado.

## CAMINHO DE DESENVOLVIMENTO

Desenvolver primeiro tudo no VS Code local.

Fluxo:

1. Criar backend local.
2. Testar no localhost.
3. Expor com Cloudflare Tunnel.
4. Fazer Lovable consumir essa API.
5. Depois subir em VPS.
6. Futuramente usar Docker.

## DECISÃO SOBRE SERVIDOR

Para teste:

PC local + Cloudflare Tunnel.

Para produção:

VPS na nuvem.

Preferência futura:

- DigitalOcean se quiser painel simples.
- Hetzner/Contabo se quiser melhor custo-benefício.

Motivo:

O Baileys precisa ficar ligado 24h. Local serve para desenvolvimento, mas produção deve ser VPS para evitar queda, reinício, internet instável ou manutenção manual.

## DOCKER

Docker será usado futuramente, mas não agora.

Explicação simples:

Docker é uma “caixa” que empacota Node, dependências e configurações. Isso permite subir o sistema em qualquer VPS de forma rápida.

Ordem correta:

1. Node
2. API
3. Baileys
4. Supabase
5. IA
6. Docker
7. VPS
8. Lovable

## ESTRUTURA ATUAL DO PROJETO

Projeto criado:

medstack-server

Estrutura planejada e/ou criada:

medstack-server/

├── backups/
├── docs/
│   ├── ARQUITETURA.md
│   ├── API.md
│   └── ROADMAP.md
│
├── logs/
├── scripts/
├── sessions/
├── tests/
├── uploads/
│
├── src/
│   ├── config/
│   ├── constants/
│   ├── core/
│   ├── database/
│   ├── middleware/
│   ├── modules/
│   │   └── whatsapp/
│   │       ├── controllers/
│   │       │   └── whatsapp.controller.js
│   │       ├── routes/
│   │       │   └── whatsapp.routes.js
│   │       ├── services/
│   │       │   ├── connection.service.js
│   │       │   ├── message.service.js
│   │       │   ├── session.service.js
│   │       │   └── qr.service.js
│   │       ├── sockets/
│   │       │   └── whatsapp.socket.js
│   │       ├── repositories/
│   │       │   └── whatsapp.repository.js
│   │       ├── stores/
│   │       │   └── whatsapp.store.js
│   │       ├── utils/
│   │       │   └── phone.util.js
│   │       └── index.js
│   │
│   ├── routes/
│   │   └── index.js
│   ├── services/
│   └── utils/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js

## REGRAS DE ORGANIZAÇÃO

1. sessions/ fica fora do src porque não é código.
2. uploads/ fica fora do src porque não é código.
3. logs/ fica fora do src porque não é código.
4. src/ guarda apenas programação.
5. Cada módulo terá controller, routes, service, repository, store e utils quando necessário.
6. O arquivo server.js deve ser simples e apenas iniciar o app.
7. Não colocar lógica grande no server.js.
8. Não ignorar package-lock.json.
9. package-lock.json deve ficar salvo no projeto.
10. .env deve ser ignorado.
11. .env.example deve ser salvo.

.gitignore correto:

node_modules/
.env
sessions/
uploads/
logs/
backups/

NÃO colocar package-lock.json no .gitignore.

## FILOSOFIA DO PROJETO

Não construir como teste simples.

Construir desde o início como plataforma SaaS profissional.

Objetivo de longo prazo:

- público geral;
- clínicas e médicos avulsos;
- sistema da esposa;
- integração com sites médicos;
- possível produto white-label;
- backend central para vários frontends.

Regra:

Lovable é o rosto.
Node é o motor.
Supabase é o banco.
Baileys é o WhatsApp.
IA fica controlada pelo backend.

## PRÓXIMA ETAPA

Estamos no início da Etapa 1.

Próximo passo prático:

1. Criar os códigos dentro da nova estrutura profissional.
2. Começar pelo server.js.
3. Criar src/app.js.
4. Criar src/routes/index.js.
5. Criar o módulo WhatsApp dividido:
   - controller
   - routes
   - services
   - socket
   - store
   - repository
   - utils
6. Reimplementar a lógica que já funcionou no teste local.
7. Testar:
   GET /status
   GET /whatsapp/status
   GET /whatsapp/qr
   POST /whatsapp/send
   POST /whatsapp/restart
8. Depois conectar novamente ao Cloudflare Tunnel.
9. Só depois pensar em Lovable.

## IMPORTANTE

Sempre que continuar o projeto, respeite esta ordem:

1. Não pular para Lovable ainda.
2. Primeiro consolidar backend Node.
3. Testar localmente.
4. Testar com Cloudflare Tunnel.
5. Depois plugar Lovable.
6. Depois Supabase.
7. Depois IA.
8. Depois VPS.
9. Depois Docker.

## PEDIDO AO ASSISTENTE

A partir deste prompt, continue o projeto de onde paramos.

Quero explicações simples, passo a passo, como para iniciante.

Sempre diga:

- qual arquivo criar;
- onde colocar;
- qual código colar;
- qual comando rodar;
- como testar;
- o que significa o resultado.

Não avance várias etapas de uma vez.
Conduza o projeto com segurança.

até agora 

A — CORE BACKEND
1. Express ✅
2. Logger ✅
3. Response padrão ✅
4. Error Handler ✅
5. AppError ✅
6. Rotas centrais ✅
Status: quase completo

B — WHATSAPP FRAMEWORK
1. Baileys ✅
2. QR Code ✅
3. Sessão ✅
4. Socket Lifecycle ✅
5. Connection Manager ✅
6. Repository ✅
7. Store por instância ✅
8. WhatsappInstance Entity ✅
9. Health ✅
10. Multi-instance base ✅
Status: estrutura madura

C — OBSERVABILIDADE
1. /whatsapp/health ✅
2. Node Provider ✅
3. Socket Provider ✅
4. Repository Provider ✅
5. Heartbeat ⬜
6. Metrics ⬜
7. Auto Recovery ⬜
Status: iniciado

D — COMPANY
1. Estrutura de pastas ✅
2. Entity Company ✅
3. Config de planos ✅
4. Config de limites ✅
5. Company Manager ✅
6. Store ✅
7. Repository ✅
8. Service ✅
9. Controller ✅
10. Routes ✅
11. CRUD básico ✅
12. Runtime/Statistics/Health ⬜
Status: base criada

E — USER
1. Entity User ⬜
2. User Manager ⬜
3. Store ⬜
4. Repository ⬜
5. Service ⬜
6. Controller ⬜
7. Rotas ⬜
Status: próximo módulo

F — AUTH / RBAC
1. Login ⬜
2. JWT ⬜
3. Middleware auth ⬜
4. Roles ⬜
5. Permissions ⬜
6. Company isolation ⬜
Status: não iniciado

G — CONTACT / CONVERSATION
1. Contact ⬜
2. Conversation ⬜
3. Message real ⬜
4. Inbox ⬜
5. Histórico ⬜
Status: não iniciado

H — FLOW / AUTOMAÇÃO
1. Nodes ⬜
2. Engine ⬜
3. Executor ⬜
4. Delay ⬜
5. Condições ⬜
6. Webhook ⬜
7. IA node ⬜
Status: não iniciado

I — IA
1. OpenAI ⬜
2. Gemini ⬜
3. Claude ⬜
4. Prompt por empresa ⬜
5. Memória ⬜
6. Custos/créditos ⬜
Status: não iniciado

J — BILLING
1. Planos ⬜
2. Assinaturas ⬜
3. Limites ⬜
4. Stripe/Asaas/Mercado Pago ⬜
5. Webhooks de pagamento ⬜
Status: não iniciado

K — INFRA PRODUÇÃO
1. Docker ⬜
2. Redis ⬜
3. BullMQ ⬜
4. Workers ⬜
5. Nginx ⬜
6. SSL ⬜
7. Deploy VPS ⬜
Status: planejado


{"noiseKey":{"private":{"type":"Buffer","data":"mEUnemTyHFVHdo2i1OJWvB0m83fjz1V5egQWv1QRulo="},"public":{"type":"Buffer","data":"EFccN76MZB3snkgiBU0g5XK7LTqoIUrZK30jOEmIs2c="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"yJ7U3dVuTQElCc6ZLft7aNsmFr+sznom3JfeA4Z3fms="},"public":{"type":"Buffer","data":"K3YaL97AvbzmcZV3oxyJdK50bltgJTpUOdxnWxAsFQk="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"WLj8ChJHoAyKPH200NTk3pUyM92s5i6UdCRkkx5e9Hg="},"public":{"type":"Buffer","data":"4kSq+BRbWvKk3ji1fvGxZDGpEB0Tt4BxyzkeqnCSVh4="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"mEI6d4ximXtSV/v7AqO/qXEHy7VrsNj2oBrKxRyptFQ="},"public":{"type":"Buffer","data":"+9Gvw9eSbjbIourTYrWOZUAwARQeX3pRSr6PES/1URY="}},"signature":{"type":"Buffer","data":"sZBaslEhAVJJcsZiXx4K9EM9YHhKHN030blrKKatKV177vX91V2O95xv6X1EiBcHIsmW0haLr9A8TFTty+LBhA=="},"keyId":1},"registrationId":242,"advSecretKey":"UAGzBqQyh+cDarPsT3mk8Ejshoii/ve4WkuZeJC9Wac=","processedHistoryMessages":[],"nextPreKeyId":1,"firstUnuploadedPreKeyId":1,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":false,"account":{"details":"CKDCsrMFEOCrqdIGGDIgACgA","accountSignatureKey":"PdZIbRfPMhiiDvXgVGY/HWO/J2CoZYs7ShTWpBNIoh0=","accountSignature":"jFMsVCJ11Hm5K26ahXO/LzOsExe/xKg1nLYIS5IDDHp/Rp0MCr8isiM0pUboRWeK9rB22MpQ9gLV7SAXXzgFCg==","deviceSignature":"50NQcSYmwxx8X8dkRiFktk2mGrUl7qcDZmj+coNwlU+DAz7ot2P7RqNP4qp3QfojzZdcvoZtHzzNc9bfQDdzhg=="},"me":{"id":"5511985045280:81@s.whatsapp.net"},"signalIdentities":[{"identifier":{"name":"5511985045280:81@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BT3WSG0XzzIYog714FRmPx1jvydgqGWLO0oU1qQTSKId"}}],"platform":"android"}