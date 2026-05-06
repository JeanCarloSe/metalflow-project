# 🚀 MetalFlow Backend

Backend robusto offline-first para MetalFlow com sincronização automática.

## 🎯 Características

- ✅ **Offline-First** - App funciona sem internet
- ✅ **Sync Automático** - Sincroniza quando volta online
- ✅ **Multi-tenant** - Suporta múltiplas empresas
- ✅ **JWT Auth** - Autenticação segura com HttpOnly cookies
- ✅ **SQLite** - Banco embarcado para fácil deploy
- ✅ **RESTful API** - Endpoints bem documentados

## 🛠️ Stack

```
Node.js + Express
SQLite (pode migrar para PostgreSQL)
JWT Authentication
CORS habilitado
```

## 📦 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

Copiar arquivo de exemplo:

```bash
cp .env.example .env
```

Editar `.env` com suas configurações:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu-secret-muito-seguro
```

## 🚀 Executar

### Desenvolvimento (com hot-reload)

```bash
npm run dev
```

### Produção

```bash
npm start
```

Server roda em `http://localhost:3000`

## 📡 API Endpoints

### 🔐 Authentication

```
POST   /api/auth/register    - Registrar novo usuário
POST   /api/auth/login       - Fazer login
POST   /api/auth/logout      - Fazer logout
GET    /api/auth/me          - Obter usuário autenticado
```

### 📋 Clients

```
GET    /api/clients          - Listar clientes (com paginação)
GET    /api/clients/:id      - Obter cliente específico
POST   /api/clients          - Criar novo cliente
PUT    /api/clients/:id      - Atualizar cliente
DELETE /api/clients/:id      - Deletar cliente
```

### 📊 Quotations

```
GET    /api/quotations       - Listar orçamentos (com filtros)
GET    /api/quotations/:id   - Obter orçamento com linhas
POST   /api/quotations       - Criar novo orçamento
PUT    /api/quotations/:id   - Atualizar orçamento
```

### 🏭 Materials

```
GET    /api/materials        - Listar materiais
POST   /api/materials        - Criar novo material
PUT    /api/materials/:id    - Atualizar material
```

### 🔄 Sync (Offline-First)

```
GET    /api/sync/snapshot    - Download completo (sincronização inicial)
GET    /api/sync/delta       - Apenas mudanças desde um timestamp
POST   /api/sync/import      - Upload de mudanças locais
```

## 🔄 Fluxo de Sincronização

### 1. **Sincronização Inicial**

```bash
GET /api/sync/snapshot
# Retorna: clients, materials, quotations, lines
# Salva tudo no IndexedDB local
```

### 2. **Modo Offline**

```
App funciona 100% localmente
Salva mudanças no IndexedDB
Rastreia quais mudanças foram offline
```

### 3. **Volta Online**

```bash
POST /api/sync/import
# Envia mudanças offline para o servidor
# Servidor faz merge com versão remota
# Retorna delta com mudanças remota
# App atualiza IndexedDB
```

### 4. **Sincronização Periódica**

```bash
GET /api/sync/delta?since=2024-05-05T10:00:00Z
# Busca mudanças desde um timestamp
# Faz merge inteligente com dados locais
```

## 🔐 Autenticação

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "email": "admin@example.com",
    "name": "Administrador",
    "password": "senha123",
    "tenantId": "tenant-123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "login": "admin",
    "password": "senha123",
    "tenantId": "tenant-123"
  }'
```

Token é salvo em **HttpOnly cookie** automaticamente.

## 📊 Request com Autenticação

```bash
curl http://localhost:3000/api/clients \
  -b cookies.txt
# Cookie é enviado automaticamente
```

## 🗄️ Database Schema

### users
```
id, tenant_id, login, email, name, password_hash, role, created_at, updated_at
```

### clients
```
id, tenant_id, name, contact, phone, email, address_*, primary_color, notes, created_at, updated_at
```

### materials
```
id, tenant_id, name, density, cost_price, sell_price, base_price, created_at, updated_at
```

### quotations
```
id, tenant_id, client_id, number, date, status, total_price, total_weight, operator_id, notes, created_at, updated_at
```

### quotation_lines
```
id, quotation_id, material_id, name, quantity, weight_kg, cost_price, sell_price, total_cost, total_price
```

## 🧪 Testes

### Testar Health Check

```bash
curl http://localhost:3000/health
# { "status": "ok", "timestamp": "..." }
```

### Testar Sincronização

```bash
# 1. Obter snapshot inicial
curl http://localhost:3000/api/sync/snapshot \
  -b cookies.txt

# 2. Fazer mudança offline
# ... app salva no IndexedDB ...

# 3. Importar mudanças
curl -X POST http://localhost:3000/api/sync/import \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{ "changes": { "clients": [...] } }'

# 4. Buscar delta (mudanças remotas)
curl "http://localhost:3000/api/sync/delta?since=2024-05-05T10:00:00Z" \
  -b cookies.txt
```

## 🚀 Deploy

### Heroku

```bash
heroku create metalflow-api
heroku config:set JWT_SECRET=seu-secret
git push heroku main
```

### Railway

```bash
railway up
```

### Docker

```bash
docker build -t metalflow-backend .
docker run -p 3000:3000 metalflow-backend
```

## 📝 Roadmap

- [ ] PostgreSQL migration
- [ ] Webhook support
- [ ] Advanced sync conflict resolution
- [ ] Rate limiting
- [ ] API logging
- [ ] Backup automático
- [ ] Tests (Jest)

## 📞 Suporte

Se tiver problemas, abra uma issue no repositório!

---

**Desenvolvido com ❤️ para MetalFlow**
