# 🚀 METALFLOW - Premium Quotation System

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![Vite](https://img.shields.io/badge/vite-5.4.21-purple)
![License](https://img.shields.io/badge/license-MIT-green)

**Sistema premium de orçamentos para Aston Metalúrgica com dashboard profissional, persistência robusta e design moderno.**

---

## ✨ FEATURES PRINCIPAIS

### 📊 Dashboard Premium
- Timeline de evolução mensal
- Gráficos de distribuição por status
- Funil de conversão
- Top clientes
- Status summary visual

### 📋 Sistema de Orçamentos
- 7 status diferentes (em andamento, em análise, enviando, aguardando, negociação, aprovado, reprovado)
- Criação/edição de orçamentos
- Cálculo automático de preços e pesos
- Geração de PDF profissional com branding Aston
- Status tracking com cores personalizadas

### 🗄️ Persistência Robusta
- **IndexedDB**: Armazenamento local de todos os dados
- **Auto-backup**: A cada 30 minutos em localStorage
- **Auditoria completa**: Log de todas as ações com timestamp
- **Soft-delete archive**: Recuperação de dados deletados
- **Sincronização entre abas**: Dados sincronizados em tempo real

### 👥 Gestão de Dados
- Clientes com histórico de orçamentos
- Materiais com densidades e preços
- Usuários com papéis (admin/user)
- Gerenciamento de serviços e margens
- Painel administrativo completo

### 🔐 Segurança
- Autenticação com senha SHA-256 hasheada
- Session em localStorage com timeout
- Validação de dados
- Proteção de dados sensíveis

---

## 🛠️ TECH STACK

### Frontend
- **React 18.2.0** - UI Framework
- **Vite 5.4.21** - Build tool (super rápido)
- **Tailwind CSS 3.3.5** - Styling
- **Recharts 3.8.1** - Data visualization
- **html2pdf.js 0.14.0** - PDF generation

### Storage
- **IndexedDB** - Persistência local (browser)
- **localStorage** - Backup automático
- **Auditor Logs** - Rastreamento completo

### Dev
- **Node.js 16+**
- **npm 8+**

---

## 🚀 QUICK START

### Instalação
```bash
cd /Users/jeancarlosseverino/Documents/metalflow-project
npm install
```

### Desenvolvimento
```bash
npm run dev
# App abrirá em http://localhost:5173
```

### Build
```bash
npm run build
# Output em dist/
```

### Preview
```bash
npm run preview
```

---

## 📁 ESTRUTURA DO PROJETO

```
metalflow-project/
├── src/
│   ├── components/
│   │   ├── DashboardPage.jsx          # Dashboard principal
│   │   ├── QuotationBuilder.jsx       # Construtor de orçamentos
│   │   ├── AdminPage.jsx              # Painel admin
│   │   ├── DataManagementPanel.jsx    # Gerenciamento de dados
│   │   ├── ClientsPage.jsx            # Gerenciamento de clientes
│   │   ├── ReportPage.jsx             # Relatórios
│   │   ├── LoginPage.jsx              # Autenticação
│   │   └── [outros componentes]
│   ├── services/
│   │   ├── storageService.js          # IndexedDB operations
│   │   ├── persistenceService.js      # Auditoria + backup
│   │   ├── autoBackupService.js       # Auto-backup automático
│   │   ├── authService.js             # Autenticação
│   │   ├── pdfService.js              # Geração de PDFs
│   │   ├── statusService.js           # Status definitions
│   │   ├── themeService.js            # Temas e cores
│   │   └── [outros serviços]
│   ├── App.jsx                         # Componente raiz
│   ├── main.jsx                        # Entry point
│   └── index.html
├── dist/                               # Build output
├── .claude/
│   ├── project.json                    # Configuração do projeto
│   └── memory/                         # Memória persistente
├── package.json
├── vite.config.js
├── tailwind.config.js
├── DEPLOY.md                           # Guia de deployment
└── README.md                           # Este arquivo
```

---

## 💾 DADOS & PERSISTÊNCIA

### O que é salvo?
- ✅ **Orçamentos** - Todos os detalhes, status, PDFs link
- ✅ **Clientes** - Contatos, histórico
- ✅ **Materiais** - Densidades, preços
- ✅ **Usuários** - Senhas hasheadas
- ✅ **Auditoria** - Logs completos com timestamp
- ✅ **Arquivo** - Dados deletados (recuperáveis)

### Onde é salvo?
```
IndexedDB (local do browser)
    ↓
localStorage (backup automático)
    ↓
Sincronização entre abas (em tempo real)
```

### Backup automático
- **Frequency**: A cada 30 minutos
- **Location**: localStorage (metalflow_auto_backup)
- **Format**: JSON
- **Exportable**: Sim, via painel administrativo

---

## 🔑 CREDENCIAIS PADRÃO

```
Login: adm
Senha: adm
Role: admin
```

⚠️ **Mude a senha após primeiro login!**

---

## 📊 COMPONENTES PRINCIPAIS

### DashboardPage
- Timeline de evolução mensal
- Gráficos de status
- Métricas de desempenho
- Quick access buttons

### QuotationBuilder
- Interface de criação de orçamentos
- Cálculo automático de preços
- Suporte a múltiplos materiais/serviços
- Preview em tempo real

### DataManagementPanel
- Status do banco de dados
- Backup/import
- Visualização de arquivos
- Auditoria logs

### AdminPage
- CRUD completo de dados
- Gerenciamento de preços
- Usuários e permissões
- Sincronização de dados

---

## 🚀 DEPLOYMENT

### Vercel (Recomendado)
```bash
# 1. Fazer push para GitHub
git remote add origin https://github.com/SEU_USUARIO/metalflow.git
git push -u origin main

# 2. Deploy no Vercel
# - Abra https://vercel.com/new
# - Conecte GitHub
# - Selecione "metalflow"
# - Clique Deploy
```

Para mais detalhes, veja **DEPLOY.md**

---

## 🔍 DESENVOLVIMENTO

### Adicionar novo componente
```jsx
// src/components/MeuComponente.jsx
import React from 'react';

export default function MeuComponente() {
  return (
    <div>
      {/* Seu código */}
    </div>
  );
}
```

### Adicionar novo serviço
```js
// src/services/meuService.js
export const minhaFuncao = async () => {
  // Seu código
};
```

### Adicionar novo comando
Edite `package.json` → `scripts`

---

## 📝 API ENDPOINTS (Services)

### Storage
- `initDB()` - Inicializar IndexedDB
- `getMaterials()` - Obter materiais
- `getClients()` - Obter clientes
- `getQuotations()` - Obter orçamentos
- `addQuotation(q)` - Criar orçamento
- `updateQuotation(q)` - Editar orçamento

### Persistence
- `initPersistence()` - Inicializar persistência
- `exportBackup()` - Exportar backup JSON
- `importBackup(data)` - Importar backup
- `getAuditLog()` - Obter logs de auditoria
- `archiveQuotation(id)` - Arquivar orçamento
- `restoreFromArchive(id)` - Restaurar do arquivo

### Auto-Backup
- `initAutoBackup()` - Iniciar auto-backup
- `performAutoBackup()` - Forçar backup agora
- `getBackupSummary()` - Resumo do backup

### Auth
- `loginUser(login, password)` - Fazer login
- `createUser(...)` - Criar usuário
- `getSession()` - Obter sessão atual
- `clearSession()` - Fazer logout

---

## 🐛 TROUBLESHOOTING

### Dados desapareceram
1. Verifique no DevTools: F12 → Application → IndexedDB
2. Restaure do backup: Painel Admin → 🗄️ Dados → 💾 Backup
3. Se ainda não funcionar, reimporte o arquivo JSON

### Erro ao criar orçamento
- Verifique se cliente está selecionado
- Verifique se todas as peças têm dados completos
- Verifique console (F12) para erros

### Senha não funciona
- Senhas são SHA-256 hasheadas
- Tente senha padrão: `adm`
- Se esqueceu, exporte/importe banco

### App lenta
- Verifique IndexedDB size: DevTools → Storage
- Faça backup e limpe dados antigos
- Reinicie o navegador

---

## 📞 SUPORTE

Para issues, sugestões ou bugs:
1. Verifique **DEPLOY.md** para deployment
2. Verifique **Painel Admin → 🗄️ Dados** para status
3. Consulte console (F12) para erros

---

## 📄 LICENSE

MIT License - Sinta-se livre para usar e modificar!

---

## 🎉 CRÉDITOS

Desenvolvido com ❤️ usando Claude Code

**Versão**: 1.0.0  
**Última atualização**: 2026-04-28  
**Status**: ✅ Production Ready
