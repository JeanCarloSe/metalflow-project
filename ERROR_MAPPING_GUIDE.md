# 🐛 Guia Completo: Error Mapping e Relatórios

## Overview

Sistema integrado de captura e classificação de erros em tempo real:

1. **PerformanceMonitor** - Captura erros globais
2. **ErrorMapper** - Classifica e mapeia erros
3. **Performance Dashboard** - Visualiza erros em tempo real
4. **Error Report Dashboard** - Painel detalhado para frontend/backend

---

## 🎯 Como Funciona

```
Aplicação
    ↓
console.error(), window.error, unhandledRejection
    ↓
PerformanceMonitor.trackErrors()
    ↓
ErrorMapper.mapError() ← Classifica
    ↓
Armazena em window.errorMapper
    ↓
Dashboards atualizam a cada 500ms
```

---

## 📊 Performance Dashboard (Tempo Real)

**Arquivo:** `performance-dashboard.html`

### Abrir
```bash
open performance-dashboard.html
```

### O Que Monitora
- **Métricas de Carregamento:** FCP, LCP, CLS
- **Performance Real-time:** FPS, Memory, Uptime
- **Requisições:** Slow requests (>1s), Failed requests (4xx, 5xx)
- **Erros:** Últimos 5 erros capturados
- **Error Mapper:** Issues categorizadas em tempo real

### Seção Error Mapper (Nova)
```
🐛 Error Mapper - Issues Categorizadas
┌─────────────────┬─────────────┐
│ CRÍTICAS    │ 2            │
│ ALTAS       │ 5            │
│ MÉDIAS      │ 8            │
│ TOTAIS      │ 15           │
└─────────────────┴─────────────┘

ÚLTIMAS ISSUES
[CRITICAL] DATABASE: IndexedDB error...
[HIGH] NETWORK: POST /api/clients (500)...
[MEDIUM] UI_RENDERING: Cannot read property...
```

### Cores
- 🔴 **Vermelho** = CRITICAL (bloqueia uso)
- 🟠 **Laranja** = HIGH (afeta funcionalidade)
- 🟡 **Amarelo** = MEDIUM (causa inconveniente)
- 🟢 **Verde** = OK

---

## 🔍 Error Report Dashboard (Análise Detalhada)

**Arquivo:** `error-report-dashboard.html`

### Abrir
```bash
open error-report-dashboard.html
```

Ou clicar em "→ Abrir Painel Completo de Erros" no Performance Dashboard.

### Funcionalidades

#### 1. **Estatísticas Gerais**
```
Total de Erros:    25
Críticos:          3
Altos:             8
Médios:            12
Resolvidos:        5
Não Resolvidos:    20
```

#### 2. **Filtros**
- Por Severidade (CRITICAL, HIGH, MEDIUM, LOW)
- Por Categoria (Database, Network, UI, etc)
- Por Status (Resolvido/Não Resolvido)

#### 3. **Abas**
- **Relatório Completo** - Todos os erros
- **Frontend Issues** - Apenas UI, Rendering, Navigation
- **Backend Issues** - Database, API, Network

#### 4. **Tabela de Erros**
```
ID   │ Severidade │ Categoria  │ Componente      │ Mensagem
─────┼────────────┼────────────┼─────────────────┼──────────
a1b2 │ CRITICAL   │ DATABASE   │ DATABASE_LAYER  │ IndexedDB...
c3d4 │ HIGH       │ NETWORK    │ API_INTEGRATION │ POST /api...
```

#### 5. **Ações por Erro**
- **👁️ Ver** - Abrir detalhes completos
- **✓** - Marcar como resolvido rapidamente

#### 6. **Detalhes do Erro**
```
ID:              a1b2c3d4e5f6g7h8
Severidade:      CRITICAL
Categoria:       DATABASE
Componente:      DATABASE_LAYER
Mensagem:        Failed to execute 'transaction' on 'IDBDatabase'
Stack Trace:     (completo para análise)
```

#### 7. **Anotações e Atribuição**
- Adicionar notas técnicas
- Atribuir responsável (nome)
- Salvar para controle

#### 8. **Exportar**
- **JSON** - Para análise de dados
- **CSV** - Para planilhas Excel/Sheets

---

## 📈 Fluxo Completo de Análise

### Passo 1: Monitorar em Tempo Real
```
Abra Performance Dashboard → Veja a seção Error Mapper
- Identifique se há erros críticos
- Acompanhe alterações em tempo real
```

### Passo 2: Investigar Detalhes
```
Clique "Abrir Painel Completo de Erros"
- Use filtros para encontrar problemas específicos
- Analise a severidade e frequência
```

### Passo 3: Classificar por Time
```
Abra aba "Frontend Issues" ou "Backend Issues"
- Frontend team → trabalha em issues da UI/Rendering
- Backend team → trabalha em Database/API/Network
```

### Passo 4: Documentar
```
Clique em "Ver" para cada erro crítico
- Adicione notas técnicas
- Atribua a responsável
- Marque como resolvido quando corrigido
```

### Passo 5: Exportar para Análise
```
Botão "📊 Exportar"
- Escolha tipo (Frontend, Backend, Completo)
- Escolha formato (JSON ou CSV)
- Compartilhe com times
```

---

## 🔴 Categorias de Erro

| Categoria | O Que Significa | Exemplos |
|-----------|-----------------|----------|
| **AUTHENTICATION** | Problemas com login/sessão | Token inválido, session expirada |
| **DATABASE** | Erros no IndexedDB | Transaction failed, constraint violation |
| **NETWORK** | Falhas em requisições | 404, 500, timeout, conexão recusada |
| **PERFORMANCE** | Lentidão ou memory leak | High memory, FPS drop, operação lenta |
| **UI_RENDERING** | Erro ao renderizar componentes | Cannot read property, null reference |
| **VALIDATION** | Dados inválidos | JSON parse error, format mismatch |
| **BUSINESS_LOGIC** | Erro na lógica de negócio | Cálculo errado, regra violada |
| **THIRD_PARTY** | Erro em serviço externo | PDF generation, API externa |
| **UNKNOWN** | Erro desconhecido | Classificação automática falhou |

---

## 🎯 Severidades

| Severidade | Impacto | Exemplo |
|-----------|---------|----------|
| **CRITICAL** | Bloqueia uso da app | Database indisponível, auth falhou |
| **HIGH** | Afeta funcionalidade | Orçamento não salva, cliente não criado |
| **MEDIUM** | Causa inconveniente | Campo de input bugged, UI quebrada |
| **LOW** | Cosmético ou minor | Ícone não aparece, texto alinhado errado |

---

## 🔧 Componentes Rastreados

```
CLIENT_FORM           → Formulário de Clientes
QUOTATION_BUILDER     → Construtor de Orçamentos
PDF_GENERATOR         → Geração de PDF
ADMIN_PANEL           → Painel Admin
DATABASE_LAYER        → Camada de Banco de Dados
API_INTEGRATION       → Integração com APIs
NAVIGATION            → Sistema de navegação
DASHBOARD             → Dashboard principal
```

---

## 📋 Exemplo: Fluxo de Correção

### Cenário: "Clientes não salvam no banco"

**1. Performance Dashboard mostra:**
```
Error Mapper - Issues Categorizadas
CRÍTICAS: 1
[CRITICAL] DATABASE: Failed to execute 'transaction'...
```

**2. Error Report Dashboard detalha:**
```
ID:        a1b2c3d4
Severidade: CRITICAL
Categoria: DATABASE
Componente: CLIENT_FORM
Mensagem: Failed to execute 'transaction' on 'IDBDatabase'
Stack: at addClient (storageService.js:125)
```

**3. Backend team investiga:**
```
- Abre storageService.js:125
- Vê que IndexedDB está sendo acessado incorretamente
- Abre transação sem especificar durability
- Corrige a implementação
```

**4. Frontend team testa:**
```
- Abre novo painel de erros
- Tenta salvar cliente novamente
- Marca como resolvido no dashboard
```

**5. Exporta relatório:**
```
- Clica em "📊 Exportar"
- Seleciona "Backend Issues"
- Formato CSV para planilha
- Compartilha com time
```

---

## 🚀 Checklist de Uso

- [ ] Abri Performance Dashboard
- [ ] Verifiquei erros críticos
- [ ] Abri Error Report Dashboard
- [ ] Filtrei por severidade (CRITICAL primeiro)
- [ ] Revisei Frontend Issues
- [ ] Revisei Backend Issues
- [ ] Adicionei notas em erros importantes
- [ ] Atribuí erros a responsáveis
- [ ] Exportei relatório para análise
- [ ] Marquei erros como resolvidos após corrigir

---

## 📊 Relatórios para Times

### Frontend Team
```
Focar em:
- UI_RENDERING errors
- CLIENT_FORM errors
- NAVIGATION errors
- QUOTATION_BUILDER UI issues

Abrir: error-report-dashboard.html → Aba "Frontend Issues"
```

### Backend Team
```
Focar em:
- DATABASE errors
- NETWORK errors (APIs)
- API_INTEGRATION errors
- Authentication/Validation errors

Abrir: error-report-dashboard.html → Aba "Backend Issues"
```

---

## 🔗 Integração com Aplicação

O ErrorMapper é **automaticamente** integrado ao PerformanceMonitor:

```javascript
// Em App.jsx, quando PerformanceMonitor inicia:
const perfMonitor = PerformanceMonitor.getInstance();
// ↓ Automaticamente inicializa:
window.ErrorMapper = ErrorMapper;
window.errorMapper = ErrorMapper.getInstance();
```

**Todos os erros são capturados automaticamente:**
- ✅ console.error()
- ✅ console.warn()
- ✅ window.error (exceções não capturadas)
- ✅ unhandledRejection (promises rejeitadas)

---

## 💾 Dados Armazenados

Cada erro captura:
```json
{
  "id": "1234567890-abcdef123",
  "timestamp": "2026-05-03T14:35:22.123Z",
  "message": "Failed to execute 'transaction'...",
  "category": "DATABASE",
  "severity": "CRITICAL",
  "component": "DATABASE_LAYER",
  "type": "error",
  "stack": "(completo stack trace)",
  "count": 3,
  "lastSeen": "2026-05-03T14:35:45.000Z",
  "resolved": false,
  "assignee": null,
  "notes": ""
}
```

---

## 🎓 Dicas de Uso

1. **Sempre começar com CRITICAL** - Resolvam problemas críticos primeiro
2. **Agrupar por categoria** - Ficam mais fácil corrigi-los em batch
3. **Usar notas** - Documentem o que tentaram / o que funcionou
4. **Atribuir responsável** - Evita duplicação de esforços
5. **Exportar semanalmente** - Acompanhem o progresso
6. **Feedback loop** - Após corrigir, teste novamente e marque como resolvido

---

## ❓ Troubleshooting

### "Error Report Dashboard mostra 'ErrorMapper não encontrado'"
```
Solução: Abra a aplicação primeiro em outra aba
         Depois abra error-report-dashboard.html
         Precisa que window.ErrorMapper exista
```

### "Erros não aparecem no dashboard"
```
Solução: Verifique se PerformanceMonitor iniciou
         Abra console e digite: window.errorMapper
         Deve mostrar a instância do ErrorMapper
```

### "Dados não atualizam em tempo real"
```
Solução: Dashboard atualiza a cada 500ms automaticamente
         Se não atualiza, verifique se a aba está em foco
         Às vezes navegadores pausam abas inativas
```

---

## 📞 Próximas Etapas

1. ✅ ErrorMapper implementado
2. ✅ Performance Dashboard integrado
3. ✅ Error Report Dashboard criado
4. ⏳ Próxima: Criar webhook para notificar times em Slack/Discord
5. ⏳ Próxima: Implementar alertas automáticos para CRITICAL
6. ⏳ Próxima: Dashboard de analytics (gráficos por dia/semana)

---

**Status:** ✅ Sistema completo e funcionando
**Última atualização:** 2026-05-03
**Versão:** 1.0.0
