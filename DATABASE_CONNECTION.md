# 🔌 Database Connection - Guia Completo

## 📋 Visão Geral

Sistema robusto de conexão com banco de dados (IndexedDB) com:
- ✅ Health checks automáticos (a cada 30 segundos)
- ✅ Reconexão automática em caso de desconexão
- ✅ Validação pós-deploy
- ✅ Retry com backoff exponencial

---

## 🏗️ Arquitetura

### 1. **DatabasePool.js**
Gerencia a instância única do IndexedDB
- Evita múltiplas conexões
- Sincronização de tentativas simultâneas
- Schema initialization automática

### 2. **DatabaseConnection.js** (NOVO)
Wrapper resiliente sobre DatabasePool
- Health checks periódicos
- Reconexão automática
- Event listeners para falhas
- Status tracking

### 3. **useDatabaseConnection Hook** (NOVO)
Hook React para usar em componentes
- Inicializa conexão ao montar
- Atualiza status periodicamente
- Limpa resources ao desmontar

### 4. **postDeploy.js Script** (NOVO)
Validação automática após build
- Verifica arquivos de configuração
- Valida sintaxe do código
- Testa integração no App.jsx
- Executa automaticamente com `npm run build`

---

## 🔄 Fluxo de Conexão

```
App.jsx inicializa
    ↓
DatabaseConnection.getInstance()
    ↓
dbConnection.initialize()
    ↓
DatabasePool.getDB() abre IndexedDB
    ↓
startHealthChecks() inicia monitor (30s)
    ↓
✅ Conectado - Health checks periódicos
    ↓
(Se detectar desconexão)
    ↓
scheduleReconnect() com backoff exponencial
    ↓
Tentativa 1: 1s
Tentativa 2: 2s
Tentativa 3: 4s
Tentativa 4: 8s
Tentativa 5: 16s
    ↓
Se todas falharem: notifyConnectionFailure()
```

---

## 💻 Como Usar

### Em App.jsx (já configurado)
```jsx
import DatabaseConnection from './services/databaseConnection';

const bootstrap = async () => {
  const dbConnection = DatabaseConnection.getInstance();
  await dbConnection.initialize();
};
```

### Em Componentes React
```jsx
import useDatabaseConnection from './hooks/useDatabaseConnection';

function MyComponent() {
  const { isConnected, lastHealthCheck } = useDatabaseConnection();

  return (
    <div>
      Status: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      Último check: {lastHealthCheck?.timestamp}
    </div>
  );
}
```

### Health Check Manual
```jsx
const dbConnection = DatabaseConnection.getInstance();
const isHealthy = await dbConnection.performHealthCheck();
const status = dbConnection.getStatus();
```

### Forçar Reconexão (após deploy)
```jsx
const dbConnection = DatabaseConnection.getInstance();
await dbConnection.forceReconnect();
```

---

## 🚀 Deploy

### Automático (Recomendado)
```bash
npm run build
```

Isso executará:
1. `vite build` - Compila o projeto
2. `npm run validate:deploy` - Valida a conexão

### Manual
```bash
npm run validate:deploy
```

---

## 📊 Status da Conexão

Acesse o status em tempo real:
```jsx
const dbConnection = DatabaseConnection.getInstance();
const status = dbConnection.getStatus();

// Retorna:
{
  isConnected: boolean,
  lastHealthCheck: { timestamp, status },
  reconnectAttempts: number,
  maxReconnectAttempts: number
}
```

---

## 🔔 Event Listeners

### Falha de Conexão
```jsx
window.addEventListener('dbConnectionFailed', (event) => {
  console.log('Conexão perdida:', event.detail.message);
  // Mostrar notificação para usuário
});
```

---

## ⚙️ Configuração

### Interval de Health Check
Editar em `DatabaseConnection.js` linha 65:
```js
}, 30000); // Mudar para outro valor em ms
```

### Max Reconnect Attempts
Editar em `DatabaseConnection.js` linha 11:
```js
static maxReconnectAttempts = 5; // Mudar quantas tentativas
```

### Reconnect Delay
Editar em `DatabaseConnection.js` linha 12:
```js
static reconnectDelay = 1000; // Delay inicial em ms
```

---

## 🐛 Troubleshooting

### Mensagem: "Máximo de tentativas de reconexão atingido"
**Causa**: Banco de dados indisponível por muito tempo

**Solução**:
1. Verificar console do navegador (F12)
2. Limpar cache: `IndexedDB > AstonDB > Delete Database`
3. Recarregar página (F5)
4. Se persistir, verificar quota de armazenamento do navegador

### Health checks com erro
**Causa**: IndexedDB corrompido ou quota excedida

**Solução**:
1. Executar `npm run validate:deploy`
2. Verificar validação do banco em `initPersistence()`
3. Limpar dados antigos em `persistenceService.js`

### Não conecta após deploy
**Causa**: Erro na validação pós-deploy

**Solução**:
1. Executar `npm run validate:deploy`
2. Corrigir erros apontados
3. Executar `npm run build` novamente

---

## 📈 Monitoramento

### Ver logs de conexão
Abrir DevTools > Console (F12)
- Procurar por `[DB]` para filtrar mensagens

### Performance
Abrir DevTools > Performance
- Monitorar `DatabasePool.getDB()` e health checks

### Storage
Abrir DevTools > Storage > IndexedDB
- Ver tamanho do banco
- Verificar stores disponíveis

---

## 🎯 Best Practices

1. **Não chamar forceReconnect() repetidamente**
   - Deixar o sistema fazer retry automático

2. **Usar hooks em componentes**
   - Não acessar DatabaseConnection diretamente se possível

3. **Lidar com falhas graciosamente**
   - Mostrar mensagem ao usuário se banco indisponível
   - Não fazer operações críticas sem confirmar conexão

4. **Verificar após deploy**
   - Executar `npm run validate:deploy` sempre

---

## 📝 Logs Esperados

```
✅ [DB] Inicializando conexão...
✅ [DB] Banco de dados conectado com sucesso
✅ [DB] Iniciando health checks periódicos
📦 [DB] Upgrading database schema...
📦 [DB] Created store: clients
✅ [DB] Transaction complete: ...
```

---

## 🔒 Segurança

- ✅ IndexedDB é sandboxed por origem
- ✅ Sem acesso direto ao código do cliente
- ✅ Dados criptografados no navegador
- ✅ Session tokens isolados por aba

---

## 🎉 Resultado

✨ **Banco de dados sempre disponível**
- Conexão automática ao iniciar app
- Health checks contínuos
- Reconexão automática em falhas
- Deploy seguro com validação

Desfrutar de uma aplicação confiável! 🚀
