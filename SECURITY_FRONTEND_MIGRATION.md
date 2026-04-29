# 🔄 Migração Frontend para Backend Seguro

**Data:** 2026-04-28  
**Para:** `/src/` React Components  
**Status:** 📋 READY TO IMPLEMENT

---

## ⚠️ MUDANÇAS CRÍTICAS

### 1. **Remover localStorage tokens**

❌ **Antes:**
```javascript
// src/services/apiBackendService.js
localStorage.setItem('quoteos_token', token);
```

✅ **Depois:**
```javascript
// Token vem em HttpOnly cookie
// Frontend NUNCA toca nele
// Backend gerencia automaticamente
```

---

### 2. **Remover API keys de localStorage**

❌ **Antes:**
```javascript
// src/services/integrationsService.js
export function setIntegration(type, config) {
  integrations[type] = { ...config };
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
  // ❌ SendGrid API key visível!
}
```

✅ **Depois:**
```javascript
// Frontend chamareEndpoint seguro do backend
async function connectSendGridIntegration(apiKey) {
  const response = await backendApi.post('/integrations/connect', {
    type: 'sendgrid',
    apiKey  // ← Enviado criptografado via HTTPS
  });
  
  // Backend criptografa e armazena no BD
  // Frontend apenas armazena { connected: true }
  localStorage.setItem('integrations_status', JSON.stringify({
    sendgrid: { connected: true, connectedAt: response.connectedAt }
    // ❌ SEM API KEY aqui!
  }));
}
```

---

### 3. **Adicionar tenantId em logins**

❌ **Antes:**
```javascript
// LoginPage.jsx
const result = await loginUser(login, password);
```

✅ **Depois:**
```javascript
// LoginPage.jsx
const tenantId = localStorage.getItem('tenantId') || 'aston-metalurgica';

const result = await loginUser(login, password, tenantId);

// src/services/authService.js
export const loginUser = async (login, password, tenantId) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include', // ← Importante!
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password, tenantId })
  });
  
  // ✅ Token vem em HttpOnly cookie (invisível pro JS)
  // ❌ NÃO tente: localStorage.setItem('token', data.token)
  
  const data = await response.json();
  return {
    ok: response.ok,
    user: data.user // ← Sem token
  };
};
```

---

### 4. **Atualizar apiBackendService**

**Arquivo:** `src/services/apiBackendService.js`

```javascript
class BackendAPIService {
  constructor() {
    this.token = null; // ❌ Não armazena mais
    this.baseURL = process.env.REACT_APP_BACKEND_API || 'http://localhost:3000/api';
  }

  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      credentials: 'include', // ← CRÍTICO: envia HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, options);

      if (response.status === 401) {
        // Token expirou
        this.handleUnauthorized();
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${error.message}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private handleUnauthorized() {
    // Token expirou, fazer logout
    localStorage.removeItem('tenantId');
    window.location.href = '/login';
  }
}
```

---

### 5. **Enviar Orçamento com PDF** ✨

**Novo:** `src/components/QuotationActions.jsx`

```javascript
import React from 'react';
import { backendApi } from '../services/apiBackendService';
import { Toast } from './Toast';

export function QuotationActions({ quotation }) {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState(quotation.client?.email || '');

  const handleSendEmail = async () => {
    if (!email) {
      Toast.error('Informe um email válido');
      return;
    }

    setLoading(true);
    try {
      const tenantId = localStorage.getItem('tenantId');
      
      const response = await backendApi.post(
        `/quotations/${tenantId}/${quotation.id}/send-email`,
        { recipientEmail: email }
      );

      Toast.success(
        `✅ Orçamento enviado com PDF para ${email}`
      );
      
    } catch (error) {
      Toast.error(`❌ Erro ao enviar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="actions">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email do cliente"
      />
      <button
        onClick={handleSendEmail}
        disabled={loading}
      >
        {loading ? '📤 Enviando...' : '📨 Enviar com PDF'}
      </button>
    </div>
  );
}
```

---

### 6. **Painel de Integrações Seguro**

**Arquivo:** `src/components/IntegrationsPanel.jsx`

```javascript
export function IntegrationsPanel() {
  const [sendgridKey, setSendgridKey] = React.useState('');
  const [connecting, setConnecting] = React.useState(false);

  const handleConnectSendGrid = async () => {
    if (!sendgridKey) {
      Toast.error('Informe a API key do SendGrid');
      return;
    }

    setConnecting(true);
    try {
      const tenantId = localStorage.getItem('tenantId');
      
      // Backend cuida da criptografia
      const response = await backendApi.post(
        '/integrations/connect-sendgrid',
        { 
          tenantId,
          apiKey: sendgridKey // ← Enviado por HTTPS apenas
        }
      );

      if (response.success) {
        Toast.success('✅ SendGrid conectado com sucesso!');
        setSendgridKey(''); // Limpar input
        
        // Armazenar apenas status, não a chave!
        localStorage.setItem('sendgrid_connected', 'true');
      }
    } catch (error) {
      Toast.error(`❌ Erro: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="integrations">
      <h3>🔌 Integrações</h3>
      
      <div className="integration-item">
        <h4>SendGrid</h4>
        <input
          type="password" // ← Importante: tipo password!
          value={sendgridKey}
          onChange={(e) => setSendgridKey(e.target.value)}
          placeholder="Paste API key..."
        />
        <button
          onClick={handleConnectSendGrid}
          disabled={connecting}
        >
          {connecting ? 'Conectando...' : 'Conectar'}
        </button>
      </div>
    </div>
  );
}
```

---

## 📋 CHECKLIST DE MIGRAÇÃO

### Phase 1 - Auth (1-2 dias)

- [ ] Atualizar `LoginPage.jsx` para enviar tenantId
- [ ] Atualizar `authService.js` para usar `credentials: 'include'`
- [ ] Remover `localStorage.setItem('quoteos_token', ...)`
- [ ] Testar login com HttpOnly cookie
- [ ] Implementar logout (`POST /auth/logout`)

### Phase 2 - API Integration (1 dia)

- [ ] Atualizar `apiBackendService.js` com `credentials: 'include'`
- [ ] Adicionar tratamento de 401 (redirect login)
- [ ] Testar todas as rotas com new TenantGuard
- [ ] Verificar `tenantId` está correto em requests

### Phase 3 - Integrações (2 dias)

- [ ] Remover `localStorage.getItem(INTEGRATIONS_KEY)`
- [ ] Criar endpoint `/integrations/connect-sendgrid`
- [ ] Atualizar UI para não mostrar API keys
- [ ] Testar SendGrid com PDFs anexados

### Phase 4 - Email com PDF (1-2 dias)

- [ ] Criar `QuotationActions.jsx`
- [ ] Implementar `send-email` endpoint
- [ ] Testar geração de PDF no servidor
- [ ] Validar email recebe anexo PDF

### Phase 5 - Testing (1 dia)

- [ ] Teste: Um user não vê dados de outro tenant
- [ ] Teste: API keys não vazam em localStorage
- [ ] Teste: Rate limiting funciona (5 logins/15min)
- [ ] Teste: PDF gerado com dados corretos
- [ ] Teste: Auditoria registra todas as ações

---

## 🧪 TESTE DE SEGURANÇA

**Verificar que tokens não vazam:**
```javascript
// Chrome DevTools > Application > Cookies
// Deve haver: auth_token (HttpOnly, Secure)

// localStorage NÃO deve ter: quoteos_token
console.log(localStorage);
// ❌ NÃO deve conter quoteos_token
// ❌ NÃO deve conter integrations com apiKey
```

---

## 📱 EXEMPLO COMPLETO: FluxoLogin

**Frontend:**
```javascript
// 1. User clica login
const handleLogin = async (login, password) => {
  const tenantId = localStorage.getItem('tenantId');
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include', // ← Permite HttpOnly cookies
    body: JSON.stringify({ login, password, tenantId })
  });
  
  const { user } = await response.json();
  
  // 2. Frontend recebe usuário (sem token)
  localStorage.setItem('user', JSON.stringify(user));
  
  // 3. Token já está em cookie HttpOnly
  // Próximas requisições automaticamente o usam
  
  // 4. Redirecionar
  navigate('/dashboard');
};
```

**Backend:**
```typescript
// 1. Recebe login + password + tenantId
@Post('login')
async login(@Body() dto: LoginDto, @Res() res: Response) {
  const user = await this.authService.login(dto);
  
  // 2. Gera JWT com tenantId dentro
  // 3. SET COOKIE HttpOnly
  res.cookie('auth_token', user.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  
  // 4. Retorna usuário (SEM token)
  res.json({ user: { ...user, no_token_here: true } });
}
```

---

## ⚠️ BREAKING CHANGES

| Arquivo | Mudança | Impacto |
|---------|---------|--------|
| `authService.js` | Remove token de localStorage | Alto |
| `apiBackendService.js` | Adiciona `credentials: 'include'` | Alto |
| `integrationsService.js` | Remove API keys de localStorage | Alto |
| `LoginPage.jsx` | Requer tenantId | Médio |
| Todas as calls | Adiciona tenantId | Médio |

---

## 🚀 DEPLOYMENT

1. **Mergiar backend** com security fixes
2. **Executar prisma migrate** em produção
3. **Deployar frontend** com mudanças
4. **Monitorar logs** por erros 401/403
5. **Validar** integrations funcionam

---

**Pronto para começar?** 🎯
