# 🚀 DEPLOY NO CLOUDFLARE PAGES

## Visão Geral

MetalFlow agora está otimizado para **Cloudflare Pages** com:
- ✅ Code splitting (separação de Three.js, DXF, Recharts)
- ✅ Cache headers otimizados
- ✅ SPA routing configurado
- ✅ Security headers
- ✅ Bundle size reduzido

---

## PASSO 1: Setup Inicial (First Time Only)

### 1.1 Instalar Wrangler CLI
```bash
npm install -g wrangler
```

### 1.2 Fazer Login no Cloudflare
```bash
wrangler login
```

Isso abre seu navegador. Autorize a aplicação e retorne ao terminal.

### 1.3 Conectar o Git Repository
Certifique-se de que o código está no GitHub:
```bash
git remote add origin https://github.com/SEU_USUARIO/metalflow.git
git branch -M main
git push -u origin main
```

---

## PASSO 2: Deploy via Cloudflare Dashboard (Recomendado)

### 2.1 Acessar Cloudflare Pages
1. Vá para: https://dash.cloudflare.com/
2. Selecione sua conta
3. Clique em **Pages** (barra lateral esquerda)
4. Clique em **Create a project**

### 2.2 Conectar GitHub
1. Selecione **Connect to Git**
2. Autorize Cloudflare a acessar seu GitHub
3. Selecione repositório `metalflow`
4. Clique **Begin setup**

### 2.3 Configurar Build
Na página de configuração, defina:

| Campo | Valor |
|-------|-------|
| **Production branch** | `main` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (deixar vazio) |

### 2.4 Variáveis de Ambiente (Opcional)
Se necessário adicionar depois:
1. Vá para **Settings > Environment variables**
2. Adicione variáveis desejadas
3. Redeploy

### 2.5 Deploy
Clique em **Save and Deploy**

O Cloudflare vai:
1. Clonar seu repo
2. Instalar dependências
3. Executar `npm run build`
4. Deploy para a rede global

✅ **Seu app estará disponível em:** `https://metalflow-xxxx.pages.dev`

---

## PASSO 3: Deploy via CLI (Para Deploys Manuais)

### 3.1 Build Local
```bash
npm run build
```

### 3.2 Deploy
```bash
npm run deploy:cloudflare
```

Ou manualmente:
```bash
wrangler pages deploy dist
```

### 3.3 Deploy Preview
Para testar antes de publicar:
```bash
npm run deploy:cloudflare:preview
```

---

## 🎯 Funcionalidades Após Deploy

| Recurso | Status | Notas |
|---------|--------|-------|
| **Dados persistem** | ✅ SIM | IndexedDB funciona globalmente |
| **Auto-backup** | ✅ SIM | localStorage está disponível |
| **PDFs (html2pdf)** | ✅ SIM | Carrega da CDN |
| **DXF import** | ✅ SIM | Three.js carregado lazy |
| **Performance** | ✅ OTIMIZADO | Code splitting ativado |
| **Cache global** | ✅ SIM | Assets cachados por 1 ano |
| **HTTPS** | ✅ AUTOMÁTICO | Cloudflare fornece |

---

## 📊 Monitoramento & Analytics

### Monitoramento de Performance
1. Dashboard → **Analytics**
2. Veja:
   - Requests total
   - Status codes
   - Cache hit rate
   - Bandwidth

### Logs
```bash
# Ver logs em tempo real
wrangler tail <project-id>

# Ou no dashboard: Pages → Deployments → View logs
```

---

## 🔄 Continuous Deployment (CD)

Após conectar GitHub, **qualquer push** para `main` dispara deploy automático:

```bash
# Seu workflow automático:
1. Push para main
2. Cloudflare detecta mudança
3. Executa build
4. Deploy automático
5. Live em segundos
```

Para **preview deploys** em branches:
1. Vá para **Settings > Builds & deployments**
2. Enable **Preview deployments** para todos os branches
3. Push para feature branch → preview URL gerada automaticamente

---

## 🛠️ Troubleshooting

### Erro: "Build failed"
```bash
# Verificar localmente
npm run build

# Ver logs completos no dashboard
# Pages → Deployments → [latest] → View build logs
```

### Erro: "Cannot find module"
```bash
# Limpar cache e rebuildar
rm -rf node_modules dist
npm install
npm run build
```

### Dados desaparecem?
- ❌ NÃO desaparecem! IndexedDB persiste por origin
- Cada navegador tem seu próprio IndexedDB
- Compartilhar entre dispositivos: use JSON export

### Bundle muito grande?
```bash
# Verificar tamanho
npm run build

# Analisar quebra
# Arquivos em dist/assets/*
```

---

## 🔐 Segurança & Headers

Cloudflare Pages automaticamente adiciona:
- ✅ HTTPS/TLS
- ✅ DDoS protection
- ✅ Security headers (em `public/_headers`)

Headers customizados já configurados:
```
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
```

---

## 📌 Próximos Passos

1. **Adicionar Custom Domain** (opcional)
   - Pages Settings → Custom domains
   - Apontar seu domínio para Cloudflare

2. **Configurar Email Forwarding** (opcional)
   - Email → Email Routing
   - Setup para sua domain

3. **Ambiente Staging**
   - Usar branch preview como staging
   - Testar antes de mergear para main

4. **Monitoring Avançado**
   - Integrar Workers Analytics
   - Dashboard customizado

---

## 📚 Documentação

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler/
- **Vite Build Config:** https://vitejs.dev/config/

---

## 💡 Dicas de Performance

### Cache Strategy
- **Assets (CSS, JS):** 1 ano (immutable)
- **HTML:** 1 hora (revalidate frequently)
- **Dynamic:** 1 hora (default)

### Code Splitting Automático
Já configurado em `vite.config.js`:
- `three.js` → chunk separado
- `dxf-parser` → chunk separado  
- `recharts` → chunk separado
- `react` → vendor chunk

### Build Otimizado
- ✅ Minification (Terser)
- ✅ Tree-shaking
- ✅ CSS splitting
- ✅ Console statements removidos em produção

---

Boa sorte! 🎉 Qualquer dúvida, cheque os logs ou entre em contato com Cloudflare Support.
