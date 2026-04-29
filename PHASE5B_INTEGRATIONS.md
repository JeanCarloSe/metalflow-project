# Phase 5b: External Integrations

## Visão Geral

Phase 5b adiciona integrações com serviços externos populares, permitindo sincronizar dados e automatizar workflows.

## 🔌 Integrações Implementadas

### 1. **HubSpot CRM** 🔴
Sincroniza clientes e orçamentos com HubSpot.

**Funcionalidades:**
- ✅ Conectar via API key
- ✅ Sincronizar clientes como contacts
- ✅ Criar deals a partir de orçamentos
- ✅ Mapear status de orçamento → HubSpot stage
- ✅ Atualizar deals automaticamente

**Mapeamento de Status:**
```
draft/review/sent/waiting/negotiation → HubSpot "Negotiation"
approved → HubSpot "Closedwon"
rejected → HubSpot "Closedlost"
```

**Como conectar:**
1. HubSpot → Settings → Integrations & Apps → Private Apps
2. Criar Private App com scopes: `crm.objects.contacts.read/write`, `crm.objects.deals.read/write`
3. Copiar API key
4. Colar em Metalflow → Integrações → HubSpot

### 2. **SendGrid** 📧
Envia emails usando SendGrid em vez de SMTP local.

**Funcionalidades:**
- ✅ Conectar via API key
- ✅ Enviar emails de orçamento confirmação
- ✅ Notificações de mudança de status
- ✅ Emails transacionais confiáveis
- ✅ Tracking de entrega

**Como conectar:**
1. SendGrid → Settings → API Keys
2. Criar API key com scopes: `mail.send`
3. Colar em Metalflow → Integrações → SendGrid

**Emails automáticos:**
- Orçamento enviado → Cliente recebe email
- Status aprovado → Operador recebe confirmação
- Status rejeitado → Operador notificado

### 3. **Slack** 💬
Notificações em tempo real em Slack.

**Funcionalidades:**
- ✅ Conectar via Webhook URL
- ✅ Notificar quando orçamento é criado
- ✅ Notificar mudanças de status
- ✅ Alertas de recomendações IA
- ✅ Customizable channels

**Como conectar:**
1. Slack workspace → Apps → App Manifest
2. Criar Incoming Webhook
3. Copiar Webhook URL
4. Colar em Metalflow → Integrações → Slack

**Notificações automáticas:**
- 📊 Novo orçamento criado
- ✅ Orçamento aprovado
- ❌ Orçamento rejeitado
- 🔄 Status alterado

### 4. **DocuSign** ✍️
Envie documentos para assinatura digital.

**Funcionalidades (Planejadas):**
- 🔲 Conectar conta DocuSign
- 🔲 Gerar PDF de orçamento
- 🔲 Enviar para assinatura automática
- 🔲 Rastrear status de assinatura
- 🔲 Armazenar assinatura digitalmente

### 5. **Google Drive** ☁️
Backup automático de dados.

**Funcionalidades (Planejadas):**
- 🔲 Conectar conta Google
- 🔲 Backup diário de quotations/clientes
- 🔲 Backup sob demanda
- 🔲VersionControl automático
- 🔲 Restauração de backups

## 📡 Arquitetura

```
┌─────────────────────────────────────────┐
│  Metalflow (Cliente)                    │
│  ├── HubSpot (Clientes, Deals)         │
│  ├── SendGrid (Emails)                 │
│  ├── Slack (Notificações)              │
│  ├── DocuSign (Assinaturas)            │
│  └── Google Drive (Backup)             │
└─────────────────────────────────────────┘
```

## 🔑 Armazenamento de Credenciais

Credenciais são armazenadas em `localStorage` sob a chave `metalflow_integrations`:

```javascript
{
  "hubspot": {
    "apiKey": "...",
    "enabled": true,
    "connectedAt": "2026-04-28T..."
  },
  "sendgrid": {
    "apiKey": "...",
    "enabled": true,
    "connectedAt": "2026-04-28T..."
  },
  ...
}
```

⚠️ **NOTA**: Em produção, as credenciais devem ser armazenadas no backend (encrypted) e não no localStorage.

## 📦 Componentes

### `integrationsService.js`
Service que gerencia todas as integrações:
- `getIntegrations()` - Obter credenciais armazenadas
- `setIntegration(type, config)` - Guardar integração
- `removeIntegration(type)` - Remover integração
- `connectHubSpot(apiKey)` - Validar e conectar HubSpot
- `syncClientToHubSpot(client)` - Sincronizar cliente
- `createHubSpotDeal(quotation, client)` - Criar deal
- `sendEmailViaSendGrid(to, subject, html)` - Enviar email
- `sendSlackNotification(message)` - Enviar notificação

### `IntegrationsPanel.jsx`
UI para gerenciar integrações:
- Interface para conectar serviços
- Status das integrações
- Desconectar integrações
- Instruções de setup

## 🚀 Como Usar

### 1. Abrir Painel de Integrações
```javascript
const [showIntegrations, setShowIntegrations] = useState(false);

{showIntegrations && (
  <IntegrationsPanel onClose={() => setShowIntegrations(false)} />
)}
```

### 2. Sincronizar Cliente com HubSpot
```javascript
import { syncClientToHubSpot } from './services/integrationsService';

const hubspotContactId = await syncClientToHubSpot(client);
```

### 3. Enviar Email via SendGrid
```javascript
import { sendEmailViaSendGrid } from './services/integrationsService';

await sendEmailViaSendGrid(
  'cliente@example.com',
  'Seu orçamento foi criado',
  '<h1>Orçamento</h1>...'
);
```

### 4. Notificar no Slack
```javascript
import { sendSlackQuotationUpdate } from './services/integrationsService';

await sendSlackQuotationUpdate(quotation, 'aprovado');
```

## 🔒 Segurança

**Recomendações:**
- ✅ Usar tokens/API keys em vez de senhas
- ✅ Regenerar chaves regularmente
- ✅ Não compartilhar credenciais
- 🔲 Em produção, armazenar credenciais encriptadas no backend
- 🔲 Usar OAuth2 em vez de API keys
- 🔲 Implementar rate limiting

## 📊 Roadmap

| Integração | Status | Prioridade |
|-----------|--------|-----------|
| HubSpot | ✅ Completo | Alta |
| SendGrid | ✅ Completo | Alta |
| Slack | ✅ Completo | Alta |
| DocuSign | 🔲 Planejado | Média |
| Google Drive | 🔲 Planejado | Média |
| Zapier | 🔲 Futuro | Baixa |
| Make.com | 🔲 Futuro | Baixa |

## 🧪 Testes

### HubSpot
```javascript
// Conectar
await connectHubSpot('your-api-key');

// Sincronizar cliente
const contactId = await syncClientToHubSpot({
  name: 'Cliente XYZ',
  email: 'contato@xyz.com',
  phone: '(47) 3436-4569',
  website: 'https://xyz.com.br'
});

// Criar deal
const dealId = await createHubSpotDeal(quotation, client);
```

## 📞 Support

Para integrar novos serviços:
1. Adicionar função em `integrationsService.js`
2. Adicionar Card em `IntegrationsPanel.jsx`
3. Testar com credenciais reais
4. Documentar no PHASE5B_INTEGRATIONS.md

---

Phase 5b torna Metalflow um hub central de comunicação e dados, sincronizando automaticamente com ferramentas populares.
