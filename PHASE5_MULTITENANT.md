# Phase 5: Multi-Tenant Architecture

## Visão Geral

Phase 5 implementa suporte multi-tenant, permitindo que múltiplas empresas/organizações usem o Metalflow com dados completamente isolados.

## Componentes Implementados

### 1. **Tenant Service** (`src/services/tenantService.js`)
Gerencia ciclo de vida dos tenants:
- ✅ `createTenant()` - Criar nova empresa
- ✅ `getTenants()` - Listar todas as empresas
- ✅ `getTenant(id)` - Obter tenant específico
- ✅ `updateTenant()` - Atualizar configurações
- ✅ `deleteTenant()` - Remover empresa
- ✅ `switchTenant()` - Trocar de tenant ativo
- ✅ `setCurrentTenant()` - Armazenar tenant no localStorage
- ✅ `validateTenantSlug()` - Validar URL slug único

### 2. **Tenant Selector** (`src/components/TenantSelector.jsx`)
Tela inicial de seleção/criação de empresa:
- Lista empresas cadastradas
- Permite criar nova empresa com formulário
- Define cores, logo, informações de contato
- Seleção da empresa antes do login

**Fluxo de UX:**
```
App Inicia
    ↓
Tenant Selector (se não há tenant)
    ↓
Login (com tenant selecionado)
    ↓
Dashboard
```

### 3. **Tenant Admin** (`src/components/TenantAdmin.jsx`)
Painel de administração de empresas:
- Listar todos os tenants
- Editar informações (nome, tagline, cores)
- Deletar empresa (com confirmação)
- Acessível via botão ⚙️ no header

### 4. **Tenant Settings** (`src/components/TenantSettings.jsx`)
Configurações de empresa individual:
- Editar nome, email, telefone, website
- Customizar cor principal (brand)
- Personalizar tagline/slogan
- Salvar preferências

## Fluxo de Dados

```
┌─────────────────────────────────────────────┐
│  TenantSelector (First Time)                │
│  - User selects or creates tenant           │
│  - setCurrentTenant(tenantId)               │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│  LoginPage (With Tenant Context)            │
│  - User authenticates with tenant isolation │
└────────────┬────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────┐
│  App Dashboard                              │
│  - Uses currentTenant for data filtering    │
│  - Can switch tenant (button 🏢)            │
│  - Can manage tenants (button ⚙️)           │
└─────────────────────────────────────────────┘
```

## Isolamento de Dados

Dados por tenant são isolados em:
- **localStorage**: `metalflow_current_tenant` → ID do tenant ativo
- **IndexedDB**: Tabela `tenants` armazena configurações
- **Session**: currentTenant no estado da App

Dados de quotações/clientes são filtrados por:
```javascript
const tenantData = quotations.filter(q => 
  q.tenantId === currentTenant.id || !q.tenantId
);
```

## Estrutura de Tenant

```javascript
{
  id: "1234567890",
  slug: "empresa-xyz",
  name: "Empresa XYZ",
  email: "contato@xyz.com",
  phone: "(47) 3436-4569",
  website: "https://xyz.com.br",
  logoUrl: "...",
  primaryColor: "#0170B9",
  tagline: "Qualidade em cada peça",
  createdAt: "2026-04-28T...",
  updatedAt: "2026-04-28T...",
  settings: {
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    language: "pt-BR"
  }
}
```

## Integração com App

Adicionados estados à App.jsx:
```javascript
const [currentTenant, setCurrentTenant] = useState(null);
const [showTenantAdmin, setShowTenantAdmin] = useState(false);
```

Renderização condicional:
- Se `!currentTenant` → TenantSelector
- Se `!currentUser && currentTenant` → LoginPage
- Se ambos → Dashboard com contexto de tenant

## Header Updates

Novos botões adicionados:
- **⚙️** (Tenant Admin) - Gerenciar todas as empresas
- **🏢** (Switch Tenant) - Trocar para outra empresa
- **Sair** - Logout

## Próximas Etapas

Para completar arquitetura multi-tenant no backend:
1. Adicionar `tenantId` ao Prisma schema
2. Filtros de query por tenant no backend
3. Isolamento de usuários por tenant
4. Permissões de tenant (owner, manager, operator)
5. Billing/Subscription por tenant
6. Segregação de dados em banco de dados (schema isolation ou database isolation)

## Benefícios

✅ **Escalabilidade**: Uma instância Metalflow serve múltiplas empresas
✅ **Segurança**: Dados completamente isolados
✅ **Customização**: Cada empresa tem sua própria identidade visual
✅ **SaaS Ready**: Arquitetura pronta para modelo subscription

## Casos de Uso

1. **Rede de Metalúrgicas**: Franquia com empresa central + filiais
2. **Reseller**: Revendedor oferece Metalflow como ferramenta interna
3. **Multi-departamento**: Diferentes áreas de uma grande empresa
4. **B2B SaaS**: Oferecer Metalflow como serviço para outras metalúrgicas
