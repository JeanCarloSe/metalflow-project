# 🚀 DEPLOY NO VERCEL

## PASSO 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `metalflow`
3. Descrição: `Premium quotation system for Aston Metalúrgica`
4. Visibilidade: `Public` (ou Private)
5. Clique: **Create repository**

## PASSO 2: Fazer Push para GitHub

Copie e execute os comandos do GitHub (parecido com isso):

```bash
# No terminal, na pasta do projeto:
git remote add origin https://github.com/SEU_USUARIO/metalflow.git
git branch -M main
git push -u origin main
```

Substitua `SEU_USUARIO` pelo seu username do GitHub.

## PASSO 3: Deploy no Vercel

1. Acesse: https://vercel.com/new
2. Clique: **Import Git Repository**
3. Conecte sua conta GitHub
4. Selecione: `metalflow`
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Clique: **Deploy**

## ✅ PRONTO!

Seu app estará acessível em:
```
https://metalflow-SEU_USUARIO.vercel.app
```

---

## 🎯 APÓS DEPLOY

1. **Dados persistem?** SIM! IndexedDB funciona no navegador de qualquer lugar
2. **Auto-backup funciona?** SIM! localStorage está disponível
3. **PDFs funcionam?** SIM! html2pdf.js carrega da CDN

## 🔗 LINKS ÚTEIS

- Vercel: https://vercel.com
- GitHub: https://github.com
- Documentação Vercel para Vite: https://vercel.com/docs/frameworks/vite

## 📝 VARIÁVEIS DE AMBIENTE (Se necessário)

Não há variáveis obrigatórias para este projeto (tudo é local).
Se adicionar backend depois, configure em Vercel → Settings → Environment Variables.

---

## 🛠️ TROUBLESHOOTING

### Erro: "npm ERR! missing script"
→ Verifique `package.json` tem `build` script

### Erro: "Cannot find module"
→ Rode `npm install` antes de fazer push

### Dados desaparecem após deploy?
→ Não! IndexedDB persiste por origin/domain
→ Cada browser tem seu próprio IndexedDB
→ Baixe backup em JSON se quiser migrar dados

---

Boa sorte! 🎉
