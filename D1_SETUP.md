# 🗄️ MetalFlow + Cloudflare D1 Setup

## O que é D1?

**D1** é banco de dados SQLite serverless do Cloudflare:
- ✅ Grátis
- ✅ Global (200+ servidores)
- ✅ Zero latência
- ✅ Integrado com Workers

---

## 📋 Passo 1: Criar D1 Database

### Via CLI:
```bash
npx wrangler d1 create metalflow
```

Output vai parecer:
```
✓ Created database metalflow (ID: abc123)
```

Copie o **ID** (database_id)!

### Via Dashboard:
1. Vá para: https://dash.cloudflare.com/
2. **Workers & Pages** → **D1**
3. **Create database** → Nome: `metalflow`
4. Copie o **ID**

---

## 🔧 Passo 2: Atualizar wrangler.toml

No arquivo `wrangler.toml`, adicione seu database_id:

```toml
[[d1_databases]]
binding = "DB"
database_name = "metalflow"
database_id = "abc123xyz"  # ← Seu ID aqui!
```

---

## 🗂️ Passo 3: Criar Schema (Tabelas)

```bash
npx wrangler d1 execute metalflow --file=schema.sql
```

Isso cria todas as tabelas do MetalFlow!

---

## 📝 Passo 4: Inserir Dados Padrão

```bash
npx wrangler d1 execute metalflow --command="
  INSERT INTO tenants (id, name) VALUES ('default-tenant', 'MetalFlow');
  
  INSERT INTO materials (id, tenant_id, name, density, cost_price, sell_price, base_price) VALUES
  ('aço-carbono', 'default-tenant', 'Aço Carbono', 7850, 3.50, 4.25, 4.25),
  ('inox', 'default-tenant', 'Inox 304', 8000, 4.10, 5.30, 5.30),
  ('aluminio', 'default-tenant', 'Alumínio 1050', 2700, 4.50, 6.00, 6.00);
"
```

---

## 🚀 Passo 5: Deploy Worker (API)

### Via Wrangler:
```bash
npx wrangler deploy --route api/* src/worker/index.js
```

Ou configure no `wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "api/*", zone_name = "metalflow.pages.dev" }
]
```

---

## 🔗 Passo 6: Conectar Frontend ao Worker

Atualize a URL da API no frontend:

**Em `src/services/databaseConnection.js`:**
```javascript
const API_BASE_URL = 'https://metalflow.pages.dev/api';
```

Ou use variáveis de ambiente:
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'https://metalflow.pages.dev/api';
```

**Em `src/main.jsx`:**
```javascript
window.API_BASE_URL = 'https://metalflow.pages.dev/api';
```

---

## 📊 Passo 7: Testar Conexão

### Health Check:
```bash
curl https://metalflow.pages.dev/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-09T...",
  "database": "D1"
}
```

### Buscar Clientes:
```bash
curl https://metalflow.pages.dev/api/clients
```

Response:
```json
[
  { "id": "client-1", "name": "Cliente A", ... },
  ...
]
```

---

## 💾 Passo 8: Migrar Dados Existentes

Se você tem dados em IndexedDB, exporte como JSON:

**No navegador (DevTools Console):**
```javascript
// Exportar IndexedDB
const db = await indexedDB.databases()[0];
// ... código para extrair dados ...
console.log(JSON.stringify(data));
```

**Depois insira no D1:**
```bash
npx wrangler d1 execute metalflow --command="
  INSERT INTO clients (...) VALUES (...);
  -- Repita para cada cliente
"
```

---

## 🔄 Sincronização Automática

O Frontend automaticamente:
1. ✅ Busca dados via `/api/sync/snapshot` (primeira vez)
2. ✅ Salva localmente em IndexedDB
3. ✅ Ao sair do modo offline, sincroniza via `/api/sync/import`
4. ✅ Recebe mudanças remotas via `/api/sync/delta`

---

## 🛠️ Comandos Úteis

### Ver dados do D1:
```bash
npx wrangler d1 execute metalflow --command="SELECT * FROM clients LIMIT 10;"
```

### Backup:
```bash
npx wrangler d1 execute metalflow --json --command="SELECT * FROM clients;" > backup.json
```

### Limpar banco:
```bash
npx wrangler d1 execute metalflow --command="DELETE FROM clients;"
```

### Ver logs:
```bash
npx wrangler tail metalflow
```

---

## 📱 URLs Finais

| Componente | URL |
|-----------|-----|
| Frontend | https://metalflow.pages.dev |
| API | https://metalflow.pages.dev/api |
| Banco D1 | Integrado no Worker |
| Dashboard | https://dash.cloudflare.com/ → D1 |

---

## ✅ Checklist

- [ ] D1 database criado
- [ ] database_id em wrangler.toml
- [ ] Schema executado (tabelas criadas)
- [ ] Worker deployado
- [ ] Frontend conectado à API
- [ ] Health check funcionando
- [ ] Dados sincronizando

---

## 🚀 Pronto!

Seu MetalFlow agora está **100% no Cloudflare**:
- ✅ Frontend (Pages)
- ✅ Backend (Workers)
- ✅ Banco (D1)
- ✅ Global
- ✅ Rápido
- ✅ Grátis!

**Qualquer dúvida, veja: https://developers.cloudflare.com/d1/**
