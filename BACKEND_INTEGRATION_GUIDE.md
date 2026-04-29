# 🔗 Backend Integration Guide

Como integrar o QuoteOS Backend com Metalflow (frontend).

---

## 📋 Checklist de Integração

- [ ] 1. Instalar dependências
- [ ] 2. Criar arquivos de API service
- [ ] 3. Integrar sync service com App.jsx
- [ ] 4. Testar login com backend
- [ ] 5. Testar sincronização
- [ ] 6. Testar mudança de status com automações
- [ ] 7. Verificar offline-first funcionando

---

## 🚀 Passo 1: Criar Arquivos de API

### Arquivos criados:
```
src/services/
├── apiBackendService.js    (✅ CRIADO)
└── syncBackendService.js   (✅ CRIADO)

src/components/
└── SyncStatusIndicator.jsx (✅ CRIADO)
```

Arquivos já existem no projeto! ✅

---

## 🔧 Passo 2: Integrar com App.jsx

Atualize `src/App.jsx` para inicializar sync ao login:

```javascript
import syncBackendService from './services/syncBackendService';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import apiBackendService from './services/apiBackendService';

function App() {
  // ... seu código existente ...

  const handleLogin = async (user) => {
    setCurrentUser(user);
    setIsFirstAccess(false);

    // 🆕 NOVO: Inicializar sync com backend
    if (apiBackendService.isAuthenticated()) {
      try {
        await syncBackendService.init();
      } catch (error) {
        console.error('Failed to initialize sync:', error);
      }
    }
  };

  const handleLogout = () => {
    // 🆕 NOVO: Parar sync ao deslogar
    syncBackendService.stopAutoSync();
    syncBackendService.reset();
    
    setCurrentUser(null);
    // ... seu logout existente ...
  };

  return (
    <div>
      {/* 🆕 NOVO: Adicionar indicador de sync */}
      {currentUser && <SyncStatusIndicator />}

      {/* ... seu código existente ... */}
    </div>
  );
}
```

---

## 🔄 Passo 3: Atualizar LoginPage

Atualize `src/components/LoginPage.jsx` para usar backend:

```javascript
import apiBackendService from '../services/apiBackendService';

const LoginPage = ({ onLogin, isFirstAccess }) => {
  // ... seu código existente ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // 🔄 NOVO: Tentar backend primeiro, fallback para local
        try {
          const result = await apiBackendService.login(login, password);
          if (result.access_token) {
            onLogin(result.user);
            return;
          }
        } catch (backendError) {
          console.warn('Backend login failed, trying local:', backendError);
          // Fallback para localStorage (local)
        }

        // Fallback: usar authService local
        const result = await loginUser(login, password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onLogin(result.user);
      } else {
        // Create new user
        // 🔄 NOVO: Tentar backend primeiro
        try {
          const backendResult = await apiBackendService.register(
            login,
            `${login}@aston.com.br`,
            name,
            password
          );
          if (backendResult.access_token) {
            onLogin(backendResult.user);
            return;
          }
        } catch (backendError) {
          console.warn('Backend register failed, trying local:', backendError);
        }

        // Fallback: usar authService local
        const userRole = isFirstAccess ? 'admin' : role;
        const result = await createUser(login, password, name, number, userRole);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const loginResult = await loginUser(login, password);
        if (loginResult.ok) onLogin(loginResult.user);
      }
    } finally {
      setLoading(false);
    }
  };

  // ... resto do componente ...
};
```

---

## 📦 Passo 4: Integrar com QuotationBuilder

Atualize `src/components/QuotationBuilder.jsx` para enviar mudanças ao backend:

```javascript
import apiBackendService from '../services/apiBackendService';
import syncBackendService from '../services/syncBackendService';

const QuotationBuilder = ({ /* props */ }) => {
  // ... seu código ...

  const handleSave = async () => {
    // ... seu código existente ...

    // 🔄 NOVO: Sincronizar com backend
    if (apiBackendService.isAuthenticated()) {
      try {
        if (editingQuotation) {
          await apiBackendService.updateQuotation(editingQuotation.id, {
            items: quotationData.items,
            totalPrice: quotationData.totalPrice,
          });
        } else {
          await apiBackendService.createQuotation({
            clientId: selectedClient.id,
            totalPrice: quotationData.totalPrice,
            items: quotationData.items,
          });
        }
      } catch (error) {
        console.warn('Backend sync failed, marked as pending:', error);
        // Marcar como pendente para sincronizar depois
        if (editingQuotation) {
          await syncBackendService.markAsPending(editingQuotation.id);
        }
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    // 🔄 NOVO: Mudar status via backend (dispara automações + email)
    if (apiBackendService.isAuthenticated() && editingQuotation) {
      try {
        const updated = await apiBackendService.changeQuotationStatus(
          editingQuotation.id,
          newStatus
        );

        // Atualizar UI localmente
        await updateQuotation({
          ...editingQuotation,
          ...updated,
        });

        // Mostrar notificação
        const statusLabel = getStatusLabel(newStatus);
        setSuccessMessage(`✅ Status alterado para ${statusLabel}`);

        // Se foi para "sent", email foi enviado para cliente
        if (newStatus === 'sent') {
          setSuccessMessage(
            `✅ Orçamento enviado! Email enviado para ${editingQuotation.client.email}`
          );
        }
      } catch (error) {
        console.error('Failed to change status:', error);
        setError(`Erro ao mudar status: ${error.message}`);
      }
    }
  };

  // ... resto do componente ...
};
```

---

## 🧪 Passo 5: Testar Integração

### 5.1 Backend Running?
```bash
cd /Users/jeancarlosseverino/Documents/quoteos-backend
npm run dev
# Deve estar rodando em http://localhost:3000/api
```

### 5.2 Variável de Ambiente
Crie `.env.local` em `metalflow-project`:
```env
REACT_APP_BACKEND_API=http://localhost:3000/api
```

### 5.3 Teste 1: Login com Backend
1. Frontend: Abrir http://localhost:5173
2. Login com `adm / adm`
3. Verificar console para: `📡 POST /auth/login`
4. Se funcionar, está conectado!

### 5.4 Teste 2: Sincronização
1. Criar novo orçamento
2. Verificar console: `🔄 Syncing with backend...`
3. Se sucesso: `✅ Sync complete`
4. Verificar backend: `http://localhost:3000` tem dados novo

### 5.5 Teste 3: Offline-First
1. DevTools → Application → Offline
2. Criar novo orçamento
3. Verificar que orçamento aparece (salvo em IndexedDB)
4. Status indicator mostra 🔴 Offline
5. Voltar online → Auto-sync sincroniza

### 5.6 Teste 4: Mudança de Status com Email
1. Criar orçamento
2. Mudar status para "sent"
3. Verificar backend logs: Email enviado
4. Verificar Mailtrap inbox: Email chegou

---

## 🔄 Arquitetura Offline-First

```
Metalflow (Frontend)              QuoteOS Backend
────────────────────              ────────────────

React Component                    NestJS API
    ↓                                   ↑
IndexedDB (cache local) ←→ apiBackendService.js
                                       ↑
                              PostgreSQL Database
                              
Fluxo:
1. User cria orçamento
2. Salva no IndexedDB localmente
3. Marca como _pendingSync
4. Se online, syncBackendService envia
5. Backend persiste no PostgreSQL
6. Frontend limpa _pendingSync flag
```

---

## ⚙️ Configuração SMTP (para emails)

Para receber emails de teste:

### Option 1: Mailtrap (Recomendado para dev)
1. Ir em https://mailtrap.io
2. Registrar (grátis)
3. Copiar credenciais SMTP
4. Colar em `quoteos-backend/.env`:
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=465
   SMTP_USER=your_user
   SMTP_PASS=your_password
   ```
5. Restart backend
6. Emails aparecem em Mailtrap inbox

### Option 2: Gmail (Para produção)
1. Gerar "App Password" em myaccount.google.com
2. Colar em `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=seu_email@gmail.com
   SMTP_PASS=sua_app_password
   EMAIL_FROM=seu_email@gmail.com
   ```

---

## 📊 Status de Integração

| Componente | Status | Notes |
|-----------|--------|-------|
| apiBackendService | ✅ | Pronto para usar |
| syncBackendService | ✅ | Offline-first |
| SyncStatusIndicator | ✅ | Visual feedback |
| LoginPage | 🔄 | Precisa atualizar para usar backend |
| App.jsx | 🔄 | Precisa integrar sync |
| QuotationBuilder | 🔄 | Precisa enviar mudanças ao backend |

---

## 🆘 Troubleshooting

### "Cannot find apiBackendService"
- Verificar se arquivo existe: `src/services/apiBackendService.js`
- Verificar import: `import apiBackendService from '../services/apiBackendService'`

### "Backend returned 401"
- Token expirado → faça login novamente
- Backend não rodando → `npm run dev` no backend

### "Sync keeps failing"
- Verificar .env.local tem `REACT_APP_BACKEND_API`
- Verificar CORS está ativado no backend (está!)
- Verificar Network tab no DevTools

### "Email não chega"
- Verificar credenciais SMTP em `.env`
- Verificar Mailtrap inbox (spam?)
- Verificar logs do backend

---

## 📝 Próximos Passos

1. ✅ Criar arquivos de API (FEITO)
2. ⏳ Integrar com App.jsx (PRÓXIMO)
3. ⏳ Atualizar LoginPage
4. ⏳ Testar sincronização
5. ⏳ Testar offline-first
6. ⏳ Testar mudança de status + email

---

**Status:** 🟡 Em progresso  
**Próximo:** Integrar com App.jsx
