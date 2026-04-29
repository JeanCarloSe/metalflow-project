# 🚨 SECURITY AUDIT - Metalflow
**Data:** 2026-04-28  
**Revisor:** Senior Backend Architect  
**Status:** ⚠️ CRÍTICO - NÃO PRONTO PARA PRODUÇÃO

---

## RESUMO EXECUTIVO

Metalflow tem **4 VULNERABILIDADES CRÍTICAS** + 12 sério que impedem deployment. Frontend-only sem backend seguro = **RISCO MÁXIMO** para dados sensíveis.

| Severidade | Qtd | Exemplos |
|-----------|-----|----------|
| 🔴 CRÍTICO | 4 | API keys localStorage, auth fraca, backup exposto, isolamento tenant |
| 🟠 SÉRIO | 12 | Tokens localStorage, sem HTTPS, sem rate limit, emails sem anexo |
| 🟡 MÉDIO | 8 | Sem CSP headers, CORS open, logs locais, IDs previsíveis |

---

## 1️⃣ AUTENTICAÇÃO & SENHAS (authService.js)

### ❌ Problemas

```javascript
// PROBLEMA: SHA-256 com SALT fixo = crackável
const SALT = 'aston_salt_2024'; // Codificado, previsível!
const hash = await crypto.subtle.digest('SHA-256', password + SALT);
```

**Risco:** Um atacante vê o SALT no código-fonte, usa rainbow tables, quebra em <1min.

```javascript
// PROBLEMA: Session em localStorage = vulnerável a XSS
export const setSession = (user) => 
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
```

**Risco:** Qualquer XSS rouba sessão do usuário.

```javascript
// PROBLEMA: IDs previsíveis
id: Date.now().toString() // Fácil adivinhar próximo usuário
```

---

### ✅ Solução

**Usar bcrypt/Argon2 no BACKEND** (não no frontend):

```javascript
// Backend NestJS
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 12; // Dinamicamente mais lento
  return bcrypt.hash(password, SALT_ROUNDS);
}
```

**Usar HttpOnly + Secure cookies:**
```javascript
// Backend - NestJS
res.cookie('auth_token', token, {
  httpOnly: true,      // ✅ JS não acessa
  secure: true,        // ✅ HTTPS only
  sameSite: 'strict',  // ✅ CSRF protection
  maxAge: 3600000      // ✅ 1h
});
```

**IDs seguros:**
```javascript
id: crypto.randomUUID() // Criptograficamente seguro
```

---

## 2️⃣ INTEGRAÇÃO COM BACKEND (apiBackendService.js)

### ❌ Problemas

```javascript
// PROBLEMA: Token em localStorage
this.token = localStorage.getItem('quoteos_token');
// Qualquer XSS rouba tudo
```

```javascript
// PROBLEMA: Sem validação de endpoint
async request(endpoint, method = 'GET', body = null) {
  const url = `${API_URL}${endpoint}`;
  // Injeção de path: endpoint='/../../admin'
}
```

```javascript
// PROBLEMA: Sem retry/timeout
const response = await fetch(url, options);
// Se servidor cair, usuário fica pendurado
```

---

### ✅ Solução

**Backend + HttpOnly cookies:**
```javascript
class BackendAPI {
  async login(login, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include', // ✅ Envia HttpOnly cookies
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Path traversal prevention:**
```javascript
async request(endpoint, method = 'GET', body = null) {
  // Whitelist endpoints
  const ALLOWED = ['/quotations', '/clients', '/auth'];
  const base = endpoint.split('?')[0];
  
  if (!ALLOWED.some(a => base.startsWith(a))) {
    throw new Error('Invalid endpoint');
  }
}
```

**Retry com exponential backoff:**
```javascript
async fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const signal = AbortSignal.timeout(5000);
      return await fetch(url, { ...options, signal });
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => 
        setTimeout(r, Math.pow(2, i) * 1000) // 1s, 2s, 4s
      );
    }
  }
}
```

---

## 3️⃣ INTEGRAÇÕES (🔴 CRÍTICO) - integrationsService.js

### ❌ Problemas GRAVES

```javascript
// PROBLEMA #1: API KEYS EM LOCALSTORAGE!
export function setIntegration(type, config) {
  const integrations = getIntegrations();
  integrations[type] = { ...config, enabled: true };
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
  // ❌ HubSpot API Key visível em Dev Tools!
  // ❌ SendGrid API Key acessível via console!
}

// Alguém faz:
const keys = JSON.parse(localStorage.getItem('metalflow_integrations'));
console.log(keys.sendgrid.apiKey); // Boom! 💣
```

**RISCO:** Comprometerá todas contas HubSpot, SendGrid, Google Drive de TODOS CLIENTES.

```javascript
// PROBLEMA #2: Chamadas diretas de API do frontend
export async function syncClientToHubSpot(client) {
  const apiKey = integrations[...].apiKey;
  const response = await fetch('https://api.hubapi.com/...', {
    headers: { 'Authorization': `Bearer ${apiKey}` }, // Exposto!
  });
}
```

```javascript
// PROBLEMA #3: Sem validação de API keys
export async function connectSendGrid(apiKey) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/validate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    // ✅ Conecta sem verificar formato, rate limit, scope
    setIntegration(INTEGRATION_TYPES.SENDGRID, { apiKey });
  }
}
```

```javascript
// PROBLEMA #4: Sem suporte a ANEXOS (PDF com orçamento)
export async function sendEmailViaSendGrid(to, subject, htmlContent) {
  // ❌ Apenas content[type: 'text/html']
  // ❌ Sem attachments
  body: JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: 'noreply@metalflow.com' },
    subject: subject,
    content: [{ type: 'text/html', value: htmlContent }],
    // ❌ attachments: [] MISSING!
  })
}
```

---

### ✅ Solução CORRETA

**Backend NestJS + Vault:**

```typescript
// Backend - nunca exponha chaves
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private vaultService: VaultService, // AWS Secrets Manager / HashiCorp
    private sendgridService: SendgridService,
  ) {}

  @Post('send-quotation-email')
  async sendQuotationWithPDF(
    @Body() { clientEmail, quotationId }: SendEmailDto,
    @Req() req: Request
  ) {
    // ✅ Valida tenant do usuário
    const tenantId = req.user.tenantId;
    const quotation = await this.quotationService.getByTenant(
      quotationId, 
      tenantId
    );
    
    // ✅ Busca chave do vault (não do cliente)
    const sendgridKey = await this.vaultService.getSecret(
      `sendgrid/${tenantId}`
    );
    
    // ✅ Gera PDF no backend (com proteção)
    const pdfBuffer = await this.pdfService.generateSecure(quotation);
    
    // ✅ Envia com anexo
    const response = await this.sendgridService.send({
      to: clientEmail,
      subject: `Orçamento ${quotation.number}`,
      html: htmlTemplate,
      attachments: [{
        content: pdfBuffer.toString('base64'),
        filename: `ORC-${quotation.number}.pdf`,
        type: 'application/pdf'
      }]
    });
    
    // ✅ Log auditoria
    await this.auditService.log({
      action: 'EMAIL_SENT_WITH_PDF',
      tenantId,
      userId: req.user.id,
      metadata: { quotationId, recipient: clientEmail }
    });
    
    return { success: true, messageId: response.id };
  }
}
```

**Frontend apenas UI:**
```javascript
// Frontend - ZERO chaves!
export async function sendQuotationEmail(clientEmail, quotationId) {
  const response = await apiBackend.request('/integrations/send-quotation-email', 'POST', {
    clientEmail,
    quotationId
  });
  
  if (response.success) {
    showToast('✅ Orçamento enviado com PDF!');
  }
}
```

---

## 4️⃣ ISOLAMENTO MULTI-TENANT (tenantService.js)

### ❌ Problemas

```javascript
// PROBLEMA #1: Sem validação de acesso
export async function switchTenant(tenantId) {
  const tenant = await getTenant(tenantId);
  setCurrentTenant(tenantId); // ❌ Qualquer tenant, qualquer usuário!
}
```

**Risco:** Usuário muda `localStorage` para acessar tenant de concorrente.

```javascript
// PROBLEMA #2: Sem isolamento no backend
export async function generateTenantStats(tenantId, quotations, clients) {
  // ❌ Filtra aqui, mas e se alguém chamar API com outro tenantId?
  const tenantQuotations = quotations.filter(q => q.tenantId === tenantId);
}
```

---

### ✅ Solução

**Backend enforce isolation:**

```typescript
// Backend NestJS - middleware
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantFromToken = request.user.tenantId;
    const tenantFromParam = request.params.tenantId;
    
    if (tenantFromToken !== tenantFromParam) {
      throw new ForbiddenException('Tenant mismatch');
    }
    return true;
  }
}

@Controller('quotations')
export class QuotationsController {
  @Get(':tenantId/:id')
  @UseGuards(AuthGuard, TenantGuard)
  async getQuotation(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Req() req: Request
  ) {
    // ✅ Garantido que req.user.tenantId === tenantId
    const quotation = await this.db.quotation.findFirst({
      where: { id, tenantId }
    });
    
    if (!quotation) throw new NotFoundException();
    return quotation;
  }
}
```

---

## 5️⃣ PERSISTÊNCIA & BACKUP (persistenceService.js)

### ❌ Problemas

```javascript
// PROBLEMA #1: Backup contém TUDO
export const exportBackup = async () => {
  const backup = {
    data: {
      quotations,
      clients,
      materials,
      users,  // ❌ Hashes de senha!
    },
    metadata: {
      auditLogs,  // ❌ Histórico sensível
      archived,
    },
  };
  
  localStorage.setItem(BACKUP_KEY, JSON.stringify(backup)); // ❌ localStorage!
};
```

**Risco:** Backup accessível a qualquer aba/script.

```javascript
// PROBLEMA #2: Sem criptografia
// ❌ Backup é JSON plano, qualquer pessoa vê: senhas, clientes, preços
```

---

### ✅ Solução

**Backend + Criptografia:**

```typescript
@Controller('backup')
export class BackupController {
  constructor(
    private cryptoService: CryptoService,
    private storageService: StorageService,
  ) {}

  @Post('export')
  @UseGuards(AuthGuard)
  async exportBackup(@Req() req: Request) {
    const tenantId = req.user.tenantId;
    
    // ✅ Busca dados do backend (não local)
    const data = await this.storageService.getAllForTenant(tenantId);
    
    // ✅ Remove dados sensíveis
    const sanitized = {
      quotations: data.quotations.map(q => ({
        ...q,
        // ❌ Remover: passwordHashes, internalNotes
      })),
      clients: data.clients,
      materials: data.materials,
    };
    
    // ✅ Criptografa com chave do tenant
    const encrypted = await this.cryptoService.encrypt(
      JSON.stringify(sanitized),
      `backup/${tenantId}`
    );
    
    // ✅ Retorna como attachment, não localStorage
    return {
      filename: `backup-${tenantId}-${Date.now()}.enc`,
      data: encrypted,
      algorithm: 'AES-256-GCM'
    };
  }
}
```

**Frontend:**
```javascript
// Apenas download, sem localStorage
async function downloadBackup() {
  const response = await apiBackend.post('/backup/export');
  const blob = new Blob([response.data]);
  downloadFile(blob, response.filename);
}
```

---

## 6️⃣ GERAÇÃO DE PDFs (pdfService.js)

### ❌ Problemas

```javascript
// PROBLEMA #1: Sem controle de acesso
export const generateQuotationPDF = async (quotation, client) => {
  // ❌ Qualquer um chama, sem validar se tem permissão
  const html = `...${ quotation.totalPrice }...`; // Preço sensível
};
```

```javascript
// PROBLEMA #2: Sem proteção
// ❌ Sem watermark
// ❌ Sem controle de cópia
// ❌ Sem versionamento
```

---

### ✅ Solução

**Backend para gerar PDF:**

```typescript
@Controller('quotations')
export class QuotationsController {
  @Get(':tenantId/:id/pdf')
  @UseGuards(AuthGuard, TenantGuard)
  async getPDF(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const quotation = await this.db.quotation.findFirst({
      where: { id, tenantId: req.user.tenantId }
    });
    
    // ✅ Gera no backend com proteção
    const pdfBuffer = await this.pdfService.generate(quotation, {
      watermark: `Generated for: ${req.user.email}`,
      noCopy: true,
      noModify: true,
    });
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ORC-${quotation.number}.pdf"`,
      'Cache-Control': 'no-store, no-cache',
    });
    
    return res.send(pdfBuffer);
  }
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1 - CRÍTICO (2-3 semanas)

- [ ] Migrar autenticação para backend (bcrypt/Argon2)
- [ ] Remover API keys de localStorage (usar backend)
- [ ] Implementar envio de email com PDF no backend
- [ ] Adicionar HttpOnly + Secure cookies
- [ ] Implementar TenantGuard no backend
- [ ] Setup HTTPS em produção
- [ ] Configurar rate limiting (express-rate-limit)

### FASE 2 - SÉRIO (1-2 semanas)

- [ ] Migrations de database schema
- [ ] Audit logging centralizado
- [ ] Criptografia de backup
- [ ] CORS configuration
- [ ] CSP headers
- [ ] CSRF protection

### FASE 3 - MÉDIO (1 semana)

- [ ] Remove localStorage tokens
- [ ] WAF (Cloudflare)
- [ ] Secrets management (AWS Secrets Manager / HashiCorp Vault)
- [ ] Monitoring & alertas
- [ ] Penetration testing

---

## 🎯 ARQUITETURA RECOMENDADA

```
Frontend (React)
    ↓ HTTPS + HttpOnly Cookies
Backend (NestJS)
    ├── Auth (bcrypt, JWT)
    ├── Integrations (HubSpot, SendGrid - chaves em Vault)
    ├── PDF Generation (com proteção)
    ├── Email Service (com anexos)
    ├── Tenant Guard (isolamento)
    ├── Audit Logging (centralizado)
    └── Database (PostgreSQL + Prisma)
```

---

## 💰 CUSTO DE NÃO FAZER ISSO

**Cenário Real:** SendGrid API key roubada
- Atacante envia 100k emails de phishing
- SendGrid detecta abuso
- Conta suspensa (SLA: 30min~2h)
- Custo: $500+ em emails + reputação dano
- Clientes perdem confiança

**Cenário Real #2:** Isolamento tenant quebrado
- Empresa A acessa dados de Empresa B
- LGPD violation = multa de até 2% da receita global
- Processo judicial = $$$

---

## 📞 PRÓXIMOS PASSOS

1. **Aprovação:** Review deste documento com CTO
2. **Planejamento:** Roadmap de 8-10 semanas
3. **Sprint 0:** Setup backend (NestJS + PostgreSQL)
4. **Sprint 1:** Migração de auth + removendo localStorage
5. **Sprint 2:** Integração segura + emails
6. **Sprint 3:** Multi-tenant seguro + audit

**Estimativa:** 2-3 meses para produção segura.
