# 👥 Guia de Sistema Multi-Usuário - MetalFlow

Sistema completo de autenticação, permissões e auditoria para múltiplos usuários simultâneos.

---

## 🎯 Recursos

- ✅ **Autenticação Multi-Usuário**: Vários usuários podem estar logados simultaneamente
- ✅ **Isolamento de Dados**: Cada usuário vê apenas dados do seu tenant
- ✅ **Permissões Baseadas em Funções**: Operadores vs Administradores
- ✅ **Audit Logging**: Rastreamento completo de todas as ações
- ✅ **Gerenciamento de Sessões**: Visualizar e monitorar sessões ativas
- ✅ **Sync Respeitando Multi-Tenant**: Sincronização isolada por usuário

---

## 🔐 Autenticação

### Login/Logout Automático

A integração acontece automaticamente na `LoginPage`:

```jsx
import MultiUserService from '../services/multiUserService';

// Usuário faz login
const multiUserService = MultiUserService.getInstance();
await multiUserService.login(login, password, tenantId);

// Usuário faz logout
await multiUserService.logout();
```

### Credenciais de Teste

**Login local** (sem backend):
- Login: `admin`
- Senha: `123456`
- Função: `admin`

**Via backend** (se disponível):
- Configure no backend para adicionar mais usuários

---

## 🛡️ Permissões

### Arquitetura

Cada usuário tem um conjunto de permissões:

```javascript
{
  userId: 'user-123',
  canCreate: ['clients', 'quotations', 'materials'],
  canRead: ['clients', 'quotations', 'materials', 'reports'],
  canUpdate: ['clients', 'quotations', 'materials'],
  canDelete: [],  // Operadores não podem deletar
  isAdmin: false  // true apenas para administradores
}
```

### Verificar Permissões

#### No Hook useMultiUser

```jsx
import useMultiUser from '../hooks/useMultiUser';

function MyComponent() {
  const { hasPermission } = useMultiUser();

  return (
    <>
      {hasPermission('create', 'clients') && (
        <button>Criar Cliente</button>
      )}
    </>
  );
}
```

#### Em Componentes

```jsx
import PermissionGuard from '../components/PermissionGuard';

<PermissionGuard action="create" resource="clients">
  <div>Apenas usuários com permissão para criar clientes</div>
</PermissionGuard>
```

#### Manualmente

```jsx
const multiUserService = MultiUserService.getInstance();
const canEdit = multiUserService.hasPermission('update', 'clients');
```

### Roles e Permissões Padrão

#### Operador
- Criar: `clients`, `quotations`, `materials`
- Ler: `clients`, `quotations`, `materials`, `reports`
- Atualizar: `clients`, `quotations`, `materials`
- Deletar: ❌ Nada

#### Administrador
- Criar: `clients`, `quotations`, `materials`, `users`
- Ler: Tudo
- Atualizar: `clients`, `quotations`, `materials`, `users`
- Deletar: `clients`, `quotations`, `materials`

---

## 📋 Auditoria

### Como Funciona

Toda ação é registrada automaticamente no `AuditLogService`:

```javascript
const auditLog = AuditLogService.getInstance();

// Registro automático de login/logout
// Registro manual de dados
auditLog.log('create', 'clients', clientId, { name: 'XYZ' });
auditLog.log('update', 'quotations', quotId, { status: 'approved' });
```

### Rastrear Mudanças de Dados

No `App.jsx`, ao salvar dados:

```jsx
const multiUserService = MultiUserService.getInstance();

// Criar novo cliente
await addClient(clientData);
multiUserService.trackChange('clients', clientData, 'create');

// Atualizar cliente
await updateClient(updatedClient);
multiUserService.trackChange('clients', updatedClient, 'update');
```

### Visualizar Logs

#### Via Console

```javascript
const auditLog = AuditLogService.getInstance();

// Obter todos os logs
const allLogs = auditLog.getAllLogs();

// Logs de um usuário
const userLogs = auditLog.getUserLogs(userId);

// Logs de um recurso
const clientLogs = auditLog.getResourceLogs('clients', clientId);

// Resumo de atividade
const summary = auditLog.getActivitySummary();
```

#### Via Componente AuditLogViewer

```jsx
import AuditLogViewer from '../components/AuditLogViewer';

function AdminPanel() {
  const [showAuditLog, setShowAuditLog] = useState(false);

  return (
    <>
      <button onClick={() => setShowAuditLog(true)}>
        Ver Logs
      </button>
      <AuditLogViewer isOpen={showAuditLog} onClose={() => setShowAuditLog(false)} />
    </>
  );
}
```

---

## 👥 Gerenciamento de Sessões

### Hook useMultiUser

```jsx
import useMultiUser from '../hooks/useMultiUser';

function MyComponent() {
  const { 
    currentUser,      // Usuário logado
    currentTenant,    // Tenant atual
    sessions,         // Array de sessões ativas
    stats,           // Estatísticas (activeSessions, sessionDuration, etc)
    isAuthenticated,  // Boolean
    hasPermission,   // Função para verificar permissão
    logout           // Função para logout
  } = useMultiUser();

  return (
    <div>
      <p>Usuário: {currentUser?.name}</p>
      <p>Sessões ativas: {stats?.activeSessions}</p>
    </div>
  );
}
```

### UserSessionPanel

Componente para visualizar sessões ativas (fixado no canto inferior esquerdo):

```jsx
import UserSessionPanel from '../components/UserSessionPanel';

<UserSessionPanel />
```

### UserManagementAdmin

Painel administrativo completo para gerenciar usuários (apenas para admins):

```jsx
import UserManagementAdmin from '../components/UserManagementAdmin';

<UserManagementAdmin />
```

---

## 🔄 Sincronização com Multi-Tenant

O `SyncService` respeita automaticamente o isolamento de tenant:

```javascript
const syncService = SyncService.getInstance();

// Sincronizar apenas dados do tenant atual
await syncService.syncNow();
// Internamente, usa multiUserService.getCurrentTenant()
```

**Importante**: A sincronização é por tenant. Se dois usuários de tenants diferentes estiverem logados:
- Cada um só sincroniza seus próprios dados
- Dados não são compartilhados entre tenants
- Alterações de um não afetam o outro

---

## 📊 Fluxo Completo

### 1. Usuário Faz Login

```
LoginPage.jsx
  ↓
multiUserService.login()
  ↓
Auditoria: registra 'login'
  ↓
Sessão criada e armazenada
  ↓
Permissões carregadas
  ↓
Sync iniciada
  ↓
App renderiza com currentUser
```

### 2. Usuário Cria um Cliente

```
ClientsPage → handleClientAdded()
  ↓
Verificar permissão: hasPermission('create', 'clients')
  ↓
Salvar no IndexedDB via addClient()
  ↓
multiUserService.trackChange('clients', clientData, 'create')
  ↓
Registra em AuditLogService
  ↓
Sincroniza automaticamente na próxima oportunidade
  ↓
Backend recebe e salva (se online)
```

### 3. Usuário Faz Logout

```
AppleStyleDashboard → Botão Logout
  ↓
handleLogout()
  ↓
multiUserService.logout()
  ↓
Auditoria: registra 'logout'
  ↓
Sessão removida
  ↓
Redirect para LoginPage
```

---

## 🐛 Troubleshooting

### Usuário vê "Sem permissão"

**Causa**: Role do usuário é "operator" mas tenta criar dados

**Solução**: 
1. Criar usuário com role "admin"
2. Ou modificar permissões em `multiUserService.js` `loadUserPermissions()`

```javascript
// Em multiUserService.js
if (permissions.isAdmin) {
  permissions.canCreate = [...]; // adicionar permissões
}
```

### Logs de auditoria não aparecem

**Causa**: AuditLogService não foi inicializado ou localStorage está cheio

**Solução**:
```javascript
// Limpar logs antigos
const auditLog = AuditLogService.getInstance();
auditLog.clearOldLogs(30); // Remove logs com > 30 dias
```

### Sincronização não funciona para novo usuário

**Causa**: MultiUserService não inicializou o sync

**Solução**: Verificar se `syncService.syncNow()` foi chamado após login

```javascript
// Em multiUserService.login()
const syncService = SyncService.getInstance();
await syncService.syncNow();
```

---

## 📝 Próximos Passos

### 1. Integração com Backend Real
- [ ] Implementar endpoints de usuários no backend
- [ ] Autenticação JWT com tokens
- [ ] Sync validar identidade do usuário

### 2. Gerenciamento Avançado
- [ ] Admin dashboard para criar/editar usuários
- [ ] UI para gerenciar permissões por usuário
- [ ] Roles customizáveis

### 3. Segurança
- [ ] 2FA (autenticação de dois fatores)
- [ ] Hash de senhas com bcrypt no backend
- [ ] Rate limiting em login

### 4. Relatórios
- [ ] Relatório de atividade por usuário
- [ ] Relatório de segurança (tentativas de acesso não autorizado)
- [ ] Exportar auditoria como PDF

---

## 🔗 Arquivos Relacionados

- `src/services/multiUserService.js` - Core do sistema
- `src/services/auditLogService.js` - Rastreamento de ações
- `src/hooks/useMultiUser.js` - Hook para componentes
- `src/components/PermissionGuard.jsx` - Wrapper de permissões
- `src/components/UserSessionPanel.jsx` - Visualizar sessões
- `src/components/UserManagementAdmin.jsx` - Painel admin
- `src/components/AuditLogViewer.jsx` - Visualizar logs

---

**Sistema pronto para múltiplos usuários simultâneos! 🎉**
