# 🎯 DEBUGGING SISTEMÁTICO - FRONTEND

## 1️⃣ CHECKLIST DE INICIALIZAÇÃO

### Verificar no Browser Console (F12 → Console)

```javascript
// 1. Verificar se App iniciou
console.log('window.__REACT_DEVTOOLS_GLOBAL_HOOK__')

// 2. Verificar banco de dados
indexedDB.databases().then(dbs => console.table(dbs))

// 3. Listar clientes
const openDB = async () => {
  const r = indexedDB.open('AstonDB');
  return new Promise((res, rej) => {
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
};

const db = await openDB();
const tx = db.transaction('clients', 'readonly');
tx.objectStore('clients').getAll().onsuccess = 
  e => console.table(e.target.result);

// 4. Listar materiais
const tx2 = db.transaction('materials', 'readonly');
tx2.objectStore('materials').getAll().onsuccess = 
  e => console.table(e.target.result);

// 5. Listar orçamentos
const tx3 = db.transaction('quotations', 'readonly');
tx3.objectStore('quotations').getAll().onsuccess = 
  e => console.table(e.target.result);
```

### ✅ Esperado na inicialização
- [ ] React renderizado (sem erros vermelhos)
- [ ] IndexedDB "AstonDB" v3 criado
- [ ] Dados carregados: clientes, materiais, orçamentos
- [ ] Auto-backup ativo (a cada 30min)
- [ ] Tab sync funcionando

---

## 2️⃣ TESTE POR PÁGINA

### 🏠 HOME
```
Verificar:
□ AppleHero renderiza
□ Botão "Começar Agora" → vai para Orçador
□ Botão "Ver Demo" → vai para Dashboard
□ AppleFeatures mostra 4 cards
□ Animações smooth (Framer Motion)
```

### 📋 DASHBOARD
```
Verificar:
□ Quotations listadas
□ Clientes mostrados
□ Filtros funcionam
□ Clique em quotation → abre editor
□ Cards com dados corretos
□ Relatórios carregam
```

### 🏢 CLIENTES
```
Verificar:
□ Lista de clientes carrega
□ Botão "+ Novo Cliente" abre form
□ Form valida dados (email obrigatório)
□ Salvar cliente → IndexedDB + refresh
□ Editar cliente → muda dados
□ Deletar cliente → remove do BD
□ 📋 Lista → mostra tabela JSON
```

### 💼 ORÇADOR
```
Verificar:
□ Selecionar cliente → habilita save
□ Adicionar peça → novo item
□ Remover peça → tira da lista
□ Cálculo de totais (material + serviço)
□ Importar DXF → abre dialog
□ Salvar → gera PDF + salva BD
□ CAD associado → mostra badge
□ Editar orçamento → carrega dados
```

### 📦 MATERIAIS
```
Verificar:
□ Lista de materiais carrega
□ Densidade, preço de custo, venda
□ Adicionar material → salva BD
□ Editar inline (densidade, preços)
□ Salvar edição → atualiza BD
□ Deletar material → confirma
□ Dropdown em DXF import → mostra materiais
```

### 📁 LISTA DE CLIENTES
```
Verificar:
□ Tabela carrega com clients
□ JSON preview aparece
□ Total de clientes correto
□ Colunas: ID, Nome, Email, Telefone, Website, Data
```

### ⚙️ ADMIN (botão no header)
```
Verificar:
□ Botão ⚙️ Admin aparece só para admin
□ Modal abre/fecha
□ Abas funcionam: Orçamentos, Serviços, Materiais, Clientes, Usuários, Preços, CADs, Dados
□ Cada aba carrega dados
□ Operações salvam no BD
```

---

## 3️⃣ TESTE DE DADOS

### Criar dados de teste
```javascript
// No Console:

// 1. Criar cliente teste
const cliente = {
  id: 'test-client-' + Date.now(),
  name: 'Empresa Teste LTDA',
  email: 'teste@empresa.com.br',
  phone: '(47) 99999-9999',
  website: 'https://empresa.com.br',
  primaryColor: '#3b82f6',
  createdAt: new Date().toISOString()
};

// Salvar (via fetch ou direto no IndexedDB)
const saveClient = async () => {
  const db = await openDB();
  const tx = db.transaction('clients', 'readwrite');
  return new Promise((res, rej) => {
    const r = tx.objectStore('clients').add(cliente);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
};

await saveClient();
console.log('✅ Cliente criado');
```

### Verificar persistência
```javascript
// Atualizar página
// Ir para 📋 Lista
// Cliente deve estar lá
```

---

## 4️⃣ TESTE DE FLUXO COMPLETO

### Fluxo: Criar Orçamento
```
1. Login (admin/123456)
   └─ ✅ Usuário no header
   
2. Ir para Orçador
   └─ ✅ Página carrega
   
3. Selecionar cliente
   └─ ✅ Cliente selecionado (banner mostra)
   
4. Adicionar peça
   └─ ✅ Novo item aparece
   
5. Preencher dados
   └─ ✅ Nome, material, dimensões, serviços
   
6. Importar DXF (opcional)
   └─ ✅ Dialog abre
   └─ ✅ Layers selecionadas
   └─ ✅ Itens importados
   
7. Salvar orçamento
   └─ ✅ Validação passa
   └─ ✅ PDF gerado (download)
   └─ ✅ Mensagem sucesso
   └─ ✅ Orçamento no Dashboard
   
8. Editar orçamento
   └─ ✅ Dados carregam
   └─ ✅ Mudanças salvam
   └─ ✅ Novo PDF gerado
```

---

## 5️⃣ TESTE DE PERSISTÊNCIA

### Ciclo de vida dos dados
```
1. Criar cliente A
   F5 (refresh) → Cliente A ainda lá? ✅
   
2. Criar orçamento para A
   F5 (refresh) → Orçamento ainda lá? ✅
   
3. Abrir em nova aba
   F5 na aba 1 → Dados sincronizados? ✅
   
4. Criar material B
   F5 → Material B em todos lugar? ✅
   
5. Deletar cliente A
   F5 → Realmente deletado? ✅
```

---

## 6️⃣ TESTE DE PERFORMANCE

### Verificar no DevTools (F12 → Performance)
```
[ ] Tempo de load < 3s
[ ] FCP (First Contentful Paint) < 1.5s
[ ] LCP (Largest Contentful Paint) < 2.5s
[ ] Sem memory leaks
[ ] Sem frame drops durante animações
```

### Console commands
```javascript
// Tempo de script
console.time('bootstrap');
// ... ações
console.timeEnd('bootstrap');

// Memory usage
performance.memory

// Frame rate
requestAnimationFrame(function measure() {
  console.log('FPS:', 1000 / performance.now());
});
```

---

## 7️⃣ ERROS COMUNS & SOLUÇÕES

| Erro | Causa | Solução |
|------|-------|---------|
| Página branca | Erro JS não capturado | Ver console (F12) |
| Dados não aparecem | BD não inicializado | Rodar `initDB()` |
| Botões não clicam | onClick não atribuído | Verificar handler |
| Dados desaparecem após F5 | Não salva BD | Verificar `addQuotation()` |
| Material não aparece no select | Query vazia | Verificar `getMaterials()` |
| PDF não gera | Erro em `pdfService` | Ver console errors |
| Admin modal vazio | Lazy load falhou | Ver imports |
| Animações travadas | Performance ruim | Desabilitar Framer Motion |
| IndexedDB cheio | Quota excedida | Limpar dados antigos |
| Login não funciona | Fallback não ativa | Usar "admin/123456" |

---

## 8️⃣ CHECKLIST ANTES DE MERGEAR

- [ ] Sem erros console (F12)
- [ ] `npm run diagnose` passa
- [ ] Login funciona
- [ ] Criar cliente → salva BD
- [ ] Criar orçamento → salva BD
- [ ] Editar → atualiza BD
- [ ] Deletar → remove BD
- [ ] F5 refresh → dados persistem
- [ ] 2 abas abertas → sync funciona
- [ ] Admin acessa orçador
- [ ] Botões da home clicam
- [ ] DXF import funciona
- [ ] PDF gera ao salvar
- [ ] Sem memory leaks

---

## 🎮 COMANDOS RÁPIDOS

```bash
# Verificar saúde
node diagnose.js

# Limpar e reiniciar
rm -rf node_modules/.vite
npm run dev

# Build para produção
npm run build && npm run preview

# Ver logs em tempo real
tail -f npm-debug.log

# Listar portas ocupadas
lsof -i :5173
```

---

## 📊 TEMPLATE DE TESTE

```
Data: _______________
Usuário: _______________
Navegador: _______________

TESTES:
□ Home → Dashboard OK
□ Home → Orçador OK
□ Criar cliente OK
□ Editar cliente OK
□ Deletar cliente OK
□ Criar orçamento OK
□ Editar orçamento OK
□ Salvar orçamento OK
□ PDF gera OK
□ DXF import OK
□ Admin acessa OK
□ Performance OK
□ Dados persistem OK
□ Sync multi-aba OK

BUGS ENCONTRADOS:
1. _____________________________
2. _____________________________
3. _____________________________

OBSERVAÇÕES:
_________________________________
```
