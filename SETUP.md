# 🚀 Setup Completo - MetalFlow

Guia completo para rodar MetalFlow com backend offline-first.

---

## 📋 Pré-requisitos

- Node.js 16+ (https://nodejs.org)
- npm ou yarn

---

## 🛠️ Instalação

### 1️⃣ **Clonar/Preparar Repositório**

```bash
# Já deve estar no diretório
cd /Users/jeancarlosseverino/Documents/metalflow-project
```

### 2️⃣ **Instalar Dependências Frontend**

```bash
# No diretório raiz
npm install
```

### 3️⃣ **Instalar Dependências Backend**

```bash
cd backend
npm install
```

---

## ⚙️ Configuração

### Frontend

Criar arquivo `.env`:

```bash
# Na raiz do projeto
cp .env.example .env
```

Editar `.env`:

```env
VITE_BACKEND_API=http://localhost:3000/api
VITE_ENV=development
VITE_ENABLE_OFFLINE_SYNC=true
VITE_ENABLE_AUTO_BACKUP=true
```

### Backend

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu-secret-super-seguro-mude-em-producao
```

---

## 🚀 Rodar Aplicação

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Esperado:**
```
╔═══════════════════════════════════════════════╗
║  🎯 MetalFlow Backend rodando em porta 3000   ║
║  📍 http://localhost:3000/api                 ║
║  ✅ Database: SQLite                          ║
╚═══════════════════════════════════════════════╝
```

### Terminal 2: Frontend

```bash
# Na raiz do projeto
npm run dev
```

**Esperado:**
```
  VITE v5.4.21  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## ✅ Verificar Funcionamento

### 1️⃣ **Health Check Backend**

```bash
curl http://localhost:3000/health
# Resposta: { "status": "ok", "timestamp": "..." }
```

### 2️⃣ **Abrir Aplicação**

Acesse: **http://localhost:5173**

Você deve ver:
- ✅ App carregando
- ✅ SyncIndicator no canto inferior direito (mostrando status)
- ✅ Console mostrando logs de sincronização

### 3️⃣ **Testar Offline-First**

```
1. Abrir DevTools (F12)
2. Network → Offline
3. Criar um novo cliente
4. Mudar para Online
5. Ver sincronização automática
6. Verificar SyncIndicator: "✅ Volta online - sincronizando..."
```

---

## 🔄 Fluxo Offline-First Completo

### 1. Primeira Sincronização

```
App inicia
  ↓
SyncService.initialize()
  ↓
Faz GET /api/sync/snapshot
  ↓
Recebe: clients, materials, quotations, lines
  ↓
Salva tudo no IndexedDB
  ↓
✅ Pronto para offline!
```

### 2. Modo Offline

```
Sem internet?
  ↓
App funciona 100% localmente
  ↓
Cria/edita dados
  ↓
Rastreia mudanças no change log
  ↓
Ícone mostra "❌ Offline"
  ↓
Dados salvos localmente
```

### 3. Volta Online

```
Internet volta
  ↓
SyncService detecta (evento 'online')
  ↓
POST /api/sync/import (mudanças offline)
  ↓
GET /api/sync/delta (mudanças remotas)
  ↓
Merge inteligente (last-write-wins)
  ↓
IndexedDB atualizado
  ↓
✅ Sincronizado!
```

---

## 📊 Dados de Teste

### Registrar Primeiro Usuário

Ao abrir o app pela primeira vez, você pode:

```
1. Login/Signup (se tiver API funcionando)
   ou
2. Usar dados locais (modo demo)
```

### Dados Padrão Inclusos

- Materiais: Aço, Inox, Alumínio
- Clientes: Vários de exemplo
- Orçamentos: Alguns com dados reais

---

## 🐛 Troubleshooting

### Backend não conecta

```bash
# Verificar porta 3000
lsof -i :3000

# Limpar node_modules
cd backend
rm -rf node_modules
npm install

# Rodar novamente
npm run dev
```

### Frontend não conecta ao backend

```bash
# Verificar .env
cat .env

# Verificar URL da API
# Console deve mostrar: 📡 Backend API URL: http://localhost:3000/api

# Testar health check
curl http://localhost:3000/health
```

### Dados não sincronizam

```bash
# DevTools → Console
# Procurar por: 🔄 Inicializando SyncService

# Se não encontrar, SyncService não inicializou
# Verificar App.jsx se tem SyncIndicator

# Limpar localStorage
localStorage.clear()

# Recarregar página
```

### Erro 401 (Unauthorized)

```
Backend quer autenticação
  ↓
Registre um usuário primeiro
  ↓
ou
  ↓
Bypass com modo demo local
```

---

## 📈 Monitorar Sincronização

### Console Logs

```
🔄 Inicializando SyncService...
✅ SyncService inicializado
🔄 Iniciando sincronização...
📥 Importando snapshot completo...
✅ Importados X clientes
✅ Sincronização concluída
```

### SyncIndicator Status

- 🟢 **Online** - Conectado, atualizando
- 🔴 **Offline** - Sem conexão, trabalhe offline
- 🔄 **Sincronizando** - Enviando/recebendo dados
- ⏰ **Último sync** - Hora da última sincronização
- ⚠️ **Mudanças pendentes** - Quantas mudanças não sincronizadas

---

## 🚀 Deploy em Produção

### Frontend (Vercel)

```bash
npm run build
# Deploy para Vercel
```

### Backend (Railway)

```bash
cd backend
railway up
```

---

## 📝 Logs Importantes

### Frontend

```bash
# Logs de sincronização
localStorage.getItem('metalflow_lastSync')

# Status da conexão
navigator.onLine

# Dados locais
indexedDB.databases()
```

### Backend

```bash
# Ver dados salvos
sqlite3 data/metalflow.db "SELECT COUNT(*) FROM clients;"

# Ver sync log
sqlite3 data/metalflow.db "SELECT * FROM sync_log;"
```

---

## ✨ Próximos Passos

1. Testar offline-first completo
2. Criar alguns clientes/orçamentos
3. Testar sincronização
4. Verificar dados no backend
5. Explorar relatórios
6. Customizar para sua empresa

---

## 📞 Suporte

Qualquer problema:

1. Verificar console (F12)
2. Verificar logs do backend
3. Verificar .env files
4. Limpar cache/localStorage
5. Reiniciar services

---

**Tudo pronto para rodar! 🎉**
