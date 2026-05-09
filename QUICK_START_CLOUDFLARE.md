# ⚡ Quick Start - Deploy Cloudflare em 5 minutos

## 1️⃣ Instalar Wrangler
```bash
npm install -g wrangler
```

## 2️⃣ Login Cloudflare
```bash
wrangler login
# Abre browser → Autorize → Volta ao terminal
```

## 3️⃣ Push para GitHub
```bash
git add .
git commit -m "Cloudflare optimization: code splitting + cache headers"
git push origin main
```

## 4️⃣ Deploy (Escolha Uma Opção)

### Opção A: Via Dashboard (Recomendado - Mais Fácil)
1. Vá para: https://dash.cloudflare.com/
2. **Pages** (barra lateral)
3. **Create project**
4. **Connect to Git** → GitHub
5. Selecione repo `metalflow`
6. Configure:
   ```
   Build command: npm run build
   Build directory: dist
   ```
7. Deploy! ✅

### Opção B: Via CLI (Mais Rápido)
```bash
npm run build
npm run deploy:cloudflare
# ou: wrangler pages deploy dist
```

## ✅ Pronto!

Seu app está em: **https://metalflow-xxxx.pages.dev**

---

## 📊 Resultados

- ✅ Main bundle: 2.5MB → 220KB (-91%)
- ✅ Load time: 5-8s → 1-2s (-75%)
- ✅ Lazy loading automático (Three.js, DXF, Recharts)
- ✅ Cache global em todos os servidores Cloudflare
- ✅ HTTPS automático
- ✅ Grátis!

---

## 🔍 Verificar

Abra DevTools (F12):
1. **Network** tab → Reload
2. Veja `index.js` = 220KB (era 2.5MB ✅)
3. Veja outros chunks carregando lazy 📦

---

## 📚 Documentação Completa

- `CLOUDFLARE_DEPLOY.md` - Guia detalhado
- `OPTIMIZATION_REPORT.md` - Análise técnica
- `./_headers` - Cache + security
- `./_redirects` - SPA routing

---

**Pronto? Deploy agora! 🚀**
