# 📊 Performance Profiling Completo - Guia Definitivo

## 🎯 O Que Este Sistema Faz

Monitora **TUDO** que acontece na página em tempo real:

```
┌────────────────────────────────────────────────────────┐
│          PERFORMANCE MONITOR GLOBAL                     │
│                                                          │
│  ✅ Erros (console.error, unhandledRejection)         │
│  ✅ Warnings (console.warn)                            │
│  ✅ Timeouts (operações > 5 segundos)                 │
│  ✅ Requisições lentas (> 1 segundo)                  │
│  ✅ Requisições com erro (status >= 400)              │
│  ✅ FPS (frame rate)                                   │
│  ✅ Memory (uso de heap)                               │
│  ✅ Cliques                                             │
│  ✅ Navegação                                           │
│  ✅ Web Vitals (FCP, LCP, CLS)                        │
│  ✅ Todas as ações do usuário                          │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Como Usar

### 1. Abra o Dashboard
```bash
open performance-dashboard.html
```

Isso abre um painel com 10 abas mostrando:

| Aba | O Que Mostra |
|-----|-----------|
| **Core Metrics** | Tempos de carregamento (FCP, LCP, CLS) |
| **Real-time Stats** | FPS, Memory, Uptime |
| **Counters** | Total de cliques, requests, navegações |
| **Alerts** | Avisos de problemas detectados |
| **Recent Errors** | Últimos 5 erros capturados |
| **Recent Warnings** | Últimos 5 warnings |
| **Slow Requests** | Requisições > 1000ms |
| **Recent Activity** | Timeline de ações |
| **Failed Requests** | Requisições com erro (4xx, 5xx) |
| **Timeout Operations** | Operações que demoraram > 5s |

### 2. Abra a App em Outra Aba
```
http://localhost:5173
```

### 3. Use Normalmente!
- Navegue entre páginas
- Crie clientes
- Crie orçamentos
- Gere PDFs
- Tudo será monitorado automaticamente

### 4. Observe o Dashboard
O painel se atualiza **a cada 500ms** com:
- Novos erros
- Requisições lentas
- FPS drops
- Memory leaks
- Timeouts

---

## 📈 Métricas Monitoradas

### Core Metrics (Web Vitals)
```
FCP (First Contentful Paint)
- Tempo até aparecer o primeiro conteúdo
- Target: < 1800ms

LCP (Largest Contentful Paint)
- Tempo até carregar o maior elemento
- Target: < 2500ms

CLS (Cumulative Layout Shift)
- Mudanças inesperadas de layout
- Target: < 0.1
```

### Real-time Stats
```
FPS (Frames Per Second)
- 60fps = Smooth
- 30-59fps = Aceitável
- < 30fps = Jank/Lag

Memory (MB)
- < 100MB = Ótimo
- 100-200MB = Bom
- > 200MB = Atenção! Pode ter memory leak

Uptime
- Quanto tempo a página está aberta
```

### Requests
```
Total Requests: Todas as chamadas fetch/XHR

Slow Requests (> 1000ms)
- Quais endpoints estão lentos?
- Exemplo: GET /api/quotations (1234ms)

Failed Requests (status >= 400)
- Quais deram erro?
- Exemplo: POST /api/clients (500)
```

### Errors & Warnings
```
Errors
- Erros não capturados
- Unhandled promise rejections
- Exemplos: "Cannot read property X", etc

Warnings
- console.warn() chamadas
- Limites atingidos (memory, fps)
- Operações lentas

Timeouts
- Operações > 5 segundos
- Pode indicar travamento
- Exemplo: "db-operation (6234ms)"
```

---

## 🎨 Indicadores Coloridos

```
🟢 Verde   = Tudo OK ✅
🟠 Laranja = Atenção ⚠️
🔴 Vermelho = Problema ❌
```

### Cores Específicas:

**FPS**
- 🟢 60fps = Perfeito
- 🟠 30-59fps = Aceitável
- 🔴 < 30fps = Problema

**Memory**
- 🟢 < 150MB = Ótimo
- 🟠 150-200MB = Atenção
- 🔴 > 200MB = Problema

**Requests**
- 🟢 < 500ms = Rápido
- 🟠 500-1000ms = Normal
- 🔴 > 1000ms = Lento

---

## 🧪 Exemplos de Teste

### Teste 1: Performance Geral
```
Passos:
1. Abra http://localhost:5173
2. Observe o Core Metrics:
   - FCP deve ser < 2000ms
   - LCP deve ser < 3000ms
   
Esperado:
✅ Página carrega rápido
✅ Nenhum erro no console
✅ FPS = 60
```

### Teste 2: Criar Clientes
```
Passos:
1. Admin → Gerenciar Clientes
2. Crie 5 clientes rapidamente
3. Observe:
   - Requests (cada create = 1 request)
   - Memory (deve manter estável)
   - FPS (não deve cair)
   - Errors (nenhum esperado)

Esperado:
✅ 5 requests com status 200
✅ Memory < 200MB
✅ FPS ≥ 30
✅ 0 erros
```

### Teste 3: Criar Orçamento
```
Passos:
1. Clique "Novo Orçamento"
2. Selecione cliente
3. Adicione 5 peças
4. Clique "Salvar"
5. Veja o PDF gerado

Monitorar:
- Slow Requests (PDF generation pode ser lento)
- Memory (pode subir com canvas)
- Errors (falhas no PDF?)

Esperado:
✅ PDF gerado < 2000ms
✅ Memory retorna ao normal após
✅ Nenhum erro
```

### Teste 4: Sob Pressão
```
Passos:
1. Navegue rapidamente entre páginas
2. Crie 10 clientes seguidos
3. Crie 5 orçamentos
4. Deixe aberto por 5 minutos

Observar:
- Memory (deve manter estável, não crescer infinitamente)
- Errors (não deve acumular)
- FPS (deve manter 60)

Esperado:
✅ Memory não passa de 250MB
✅ FPS mantém 60 (ou cai para 30 no máximo)
✅ Menos de 10 erros/warnings
```

---

## 🚨 Interpretar Problemas

### Problema: Memory Crescendo
```
Você vê: Memory 100MB → 150MB → 200MB → 250MB (subindo)

Causa: Memory leak provável

Ação:
1. Copiar o relatório
2. Informar: "Memory cresceu de 100MB para XXX em X minutos"
3. Será investigado
```

### Problema: FPS Caindo
```
Você vê: FPS 60 → 45 → 30 → 15 (caindo)

Causa: Render pesado ou animação travada

Ação:
1. Qual ação causou?
2. Informar: "FPS caiu para XX ao fazer [ação]"
```

### Problema: Requisição Lenta
```
Você vê: Slow Requests
   POST /api/quotations (5234ms)

Causa: Backend ou rede lenta

Ação:
1. Copiar URL e tempo
2. Informar: "POST /api/quotations demora 5s"
```

### Problema: Muitos Erros
```
Você vê: Recent Errors
   ❌ Cannot read property 'name'
   ❌ IndexedDB error
   ❌ JSON parse error

Causa: Bug na aplicação

Ação:
1. Copiar a mensagem de erro
2. Informar: "Erro: [mensagem completa]"
```

---

## 📊 Dashboard Columns Explicadas

### Esquerda (4 colunas)
1. **Core Metrics** - Tempos de carregamento
2. **Real-time Stats** - FPS, Memory, Uptime
3. **Counters** - Estatísticas de uso
4. **Alerts** - Avisos de problemas

### Meio-Direita (2x2)
5. **Recent Errors** - Últimos erros
6. **Recent Warnings** - Últimos warnings
7. **Slow Requests** - Requisições > 1s
8. **Recent Activity** - Timeline

### Direita (2x2)
9. **Failed Requests** - Erros 4xx, 5xx
10. **Timeout Operations** - Operações travadas

---

## 🔧 Dados Capturados

### Cada Sessão Salva:
```json
{
  "timestamp": "2026-05-03T00:30:00Z",
  "totalErrors": 2,
  "totalWarnings": 5,
  "totalRequests": 23,
  "totalClicks": 45,
  "totalNavigations": 3,
  "metrics": {
    "pageLoadTime": 1234,
    "firstContentfulPaint": 456,
    "fps": 60,
    "memory": { "usedJSHeapSize": 125, ... }
  },
  "slowRequests": [
    { "method": "POST", "url": "/api/quotations", "status": 200, "duration": 1234 }
  ],
  "failedRequests": [
    { "method": "GET", "url": "/api/clients", "status": 500, "duration": 234 }
  ],
  "recentErrors": [ ... ],
  "recentWarnings": [ ... ]
}
```

---

## ✅ Checklist de Teste Completo

- [ ] **Carregamento**: FCP < 2000ms, LCP < 3000ms
- [ ] **Performance**: FPS = 60 (aceitável > 30)
- [ ] **Memory**: < 200MB, estável
- [ ] **Clicks**: Registra cada clique
- [ ] **Requests**: Todas com status 200 (ou esperado)
- [ ] **Errors**: 0 erros inicialmente
- [ ] **Create Cliente**: Sem erro, < 1s
- [ ] **Edit Cliente**: Sem erro, < 1s
- [ ] **Create Quotation**: Sem erro, < 2s
- [ ] **PDF Generation**: Sem erro, < 2s
- [ ] **Navigation**: Rápida, sem lag
- [ ] **Memory Stable**: Não cresce infinitamente
- [ ] **Timeouts**: 0 operações travadas

---

## 📞 Como Reportar

Se descobrir um problema:

```
Problema: [tipo - error/slow/timeout/memory]
Ação que causou: [o que você estava fazendo]
Tempo: [quando aconteceu]
Duração: [quanto tempo durou]
Mensagem: [copiar exatamente o que aparece]

Exemplo:
Problema: Slow Request
Ação: Criar novo cliente
Tempo: 14:35:22
Duração: 2345ms
Mensagem: POST /api/clients (2345ms) status 200
```

---

## 🎯 Objetivo Final

Este sistema permite:

1. **Detectar problemas automaticamente** sem ter que ficar olhando
2. **Rastrear exatamente onde** está o gargalo
3. **Medir performance** objetivamente
4. **Coletar dados** para otimizações futuras
5. **Alertar quando** algo der errado

**Resultado**: App mais rápida, confiável e sem surpresas! 🚀

---

**Status**: ✅ Sistema Ativo
**Monitoramento**: Em tempo real (atualiza a cada 500ms)
**Dados**: Capturados na memória (últimas 100-200 entradas)
**Dashboard**: Sempre disponível em performance-dashboard.html
