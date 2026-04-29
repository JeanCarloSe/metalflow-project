# Phase 8: Enterprise Features

## Visão Geral

Phase 8 adiciona recursos de nível enterprise para atender grandes organizações com requisitos de segurança, compliance e governança avançados.

## 🔐 Access Control (RBAC)

### Roles Definidos

```javascript
const ROLES = {
  ADMIN: {
    permissions: ['all'],
    description: 'Acesso total ao sistema'
  },
  
  MANAGER: {
    permissions: [
      'quotations:create',
      'quotations:edit',
      'quotations:delete',
      'clients:manage',
      'reports:view',
      'users:manage',
      'analytics:view'
    ],
    description: 'Gerencia operadores e orçamentos'
  },
  
  OPERATOR: {
    permissions: [
      'quotations:create',
      'quotations:edit',
      'quotations:view',
      'clients:view',
      'dashboard:view',
      'analytics:view_own'
    ],
    description: 'Cria e gerencia orçamentos'
  },
  
  SALES: {
    permissions: [
      'quotations:view',
      'clients:view',
      'clients:create',
      'analytics:view',
      'reports:export'
    ],
    description: 'Visualiza e busca clientes'
  },
  
  VIEWER: {
    permissions: [
      'dashboard:view_only',
      'quotations:view_own',
      'reports:view'
    ],
    description: 'Leitura apenas'
  }
};
```

### Permission System

```javascript
// Middleware de autorização
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!hasPermission(req.user, requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/quotations', 
  authorize('quotations:create'),
  quotationController.create
);
```

## 🔑 Authentication Enhancements

### Single Sign-On (SSO)

```javascript
// OAuth2 / SAML2 Configuration
const ssoConfig = {
  provider: 'azure-ad', // ou 'okta', 'google-workspace'
  clientId: process.env.SSO_CLIENT_ID,
  clientSecret: process.env.SSO_CLIENT_SECRET,
  discoveryUrl: 'https://login.microsoftonline.com/...',
};

// Login flow
router.get('/auth/sso/callback', async (req, res) => {
  const tokens = await exchangeAuthorizationCode(req.query.code);
  const user = await getUserInfo(tokens.accessToken);
  
  // Auto-provision user if first login
  let dbUser = await User.findByEmail(user.email);
  if (!dbUser) {
    dbUser = await User.create({
      email: user.email,
      name: user.name,
      ssoId: user.sub,
      tenant: user.tenant_id // From custom claims
    });
  }
  
  res.cookie('auth_token', generateJWT(dbUser));
  res.redirect('/dashboard');
});
```

### Two-Factor Authentication (2FA)

```javascript
// TOTP (Time-based One-Time Password)
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const enable2FA = async (userId) => {
  const secret = speakeasy.generateSecret({
    name: `Metalflow (${user.email})`,
    issuer: 'Metalflow',
  });
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode: qrCode,
    backupCodes: generateBackupCodes()
  };
};

export const verify2FA = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};
```

## 📋 Audit & Compliance

### Comprehensive Audit Logging

```javascript
// Audit trail para TODAS as operações
const auditLog = {
  timestamp: new Date().toISOString(),
  userId: req.user.id,
  userEmail: req.user.email,
  action: 'QUOTATION_CREATED',
  resource: 'quotation',
  resourceId: quotation.id,
  changes: {
    before: null,
    after: quotationData
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  status: 'SUCCESS'
};

await AuditLog.create(auditLog);
```

### Compliance Reports

```javascript
// GDPR Compliance
export async function generateDataExportReport(userId) {
  const user = await User.findById(userId);
  const quotations = await Quotation.find({ userId });
  const clients = await Client.find({ userId });
  const auditLogs = await AuditLog.find({ userId });
  
  return {
    user: sanitizePersonalData(user),
    quotations,
    clients,
    auditLogs,
    exportedAt: new Date(),
    format: 'json'
  };
}

// LGPD Right to be Forgotten
export async function deleteUserData(userId) {
  await User.update(userId, {
    email: `deleted-${userId}@metalflow.internal`,
    personalData: null
  });
  
  await AuditLog.create({
    action: 'USER_DATA_DELETED',
    userId: userId,
    timestamp: new Date()
  });
}
```

## 🔒 Data Security

### Encryption at Rest

```javascript
// Fields encryption
const encryptedFields = [
  'email',
  'phone',
  'companyRegistration',
  'bankData'
];

const encryptionKey = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

export function encrypt(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData) {
  const [iv, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'hex'));
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
```

### SSL/TLS

```javascript
// Enforce HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// HSTS Header
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## 🏢 Advanced Tenant Management

### Tenant Isolation

```javascript
// Database-level isolation
const quotationSchema = new Schema({
  tenantId: { type: String, index: true, required: true },
  // ... other fields
});

// Query middleware - automatic tenant filtering
quotationSchema.pre('find', function(next) {
  this.where({ tenantId: req.user.tenantId });
  next();
});

// Cross-tenant data prevention
router.get('/quotations/:id', (req, res) => {
  const quotation = await Quotation.findById(req.params.id);
  
  if (quotation.tenantId !== req.user.tenantId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  res.json(quotation);
});
```

### Tenant-Specific Customizations

```javascript
const tenantCustomizations = {
  themes: {
    primary: '#0170B9',
    secondary: '#D4AF37'
  },
  features: {
    invoicing: true,
    integrations: ['hubspot', 'sendgrid'],
    advancedAnalytics: true
  },
  limits: {
    maxUsers: 50,
    maxQuotationsPerMonth: 1000,
    maxStorageGB: 100
  },
  branding: {
    logoUrl: '...',
    favicon: '...'
  }
};
```

## 📞 Support & SLA

### Support Ticketing System

```javascript
const supportTicket = {
  id: 'TK-2026-0001',
  tenantId: tenant.id,
  subject: 'Pricing suggestions not working',
  description: '...',
  priority: 'high', // low, medium, high, critical
  status: 'open', // open, in-progress, resolved, closed
  assignedTo: supportAgentId,
  createdAt: new Date(),
  updatedAt: new Date(),
  resolvedAt: null,
  slaDeadline: calculateSLADeadline('high'), // 4 hours for high
};
```

### SLA Monitoring

```javascript
const slaConfig = {
  critical: { responseTime: 1, resolutionTime: 4 }, // hours
  high: { responseTime: 2, resolutionTime: 8 },
  medium: { responseTime: 4, resolutionTime: 24 },
  low: { responseTime: 8, resolutionTime: 72 }
};
```

## 🎯 Advanced Features

### White-Label Support

```javascript
const whitelabelConfig = {
  tenantId: 'partner-xyz',
  companyName: 'Partner Company',
  logo: '...',
  colors: { primary: '#...' },
  domain: 'quotations.partnercompany.com.br',
  emailDomain: '@partnercompany.com.br',
  hideBranding: true
};
```

### Custom Workflows

```javascript
// Tenant-specific status workflows
const customWorkflow = {
  tenantId: 'client-abc',
  statuses: [
    'draft',
    'internal-review',
    'management-approval',
    'client-sent',
    'negotiations',
    'approved',
    'rejected'
  ],
  validTransitions: {
    'draft': ['internal-review', 'rejected'],
    'internal-review': ['management-approval', 'draft'],
    'management-approval': ['client-sent', 'internal-review'],
    'client-sent': ['negotiations', 'rejected'],
    'negotiations': ['approved', 'rejected']
  }
};
```

### Notifications & Webhooks

```javascript
// Outgoing webhooks
const webhookEvent = {
  id: 'evt_123',
  tenantId: 'tenant-id',
  event: 'quotation.approved',
  timestamp: new Date(),
  data: {
    quotationId: 'q-123',
    quotationNumber: 'ORC-2026-001',
    clientName: 'Cliente XYZ',
    totalPrice: 5000
  }
};

// Webhook delivery
await fetch(tenant.webhookUrl, {
  method: 'POST',
  headers: {
    'X-Webhook-Signature': generateSignature(webhookEvent),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(webhookEvent)
});
```

## 🔄 Disaster Recovery

### Backup Strategy

```
Daily Backups
├── Database snapshots (PostgreSQL)
├── File uploads (S3/Cloud Storage)
└── Configuration backups

Retention: 30 days daily, 12 months monthly, 7 years yearly

Recovery: Max 1 hour RPO (Recovery Point Objective)
          Max 4 hours RTO (Recovery Time Objective)
```

### High Availability

```javascript
// Load balancing
const lb = new LoadBalancer({
  servers: [
    'api-1.metalflow.com',
    'api-2.metalflow.com',
    'api-3.metalflow.com'
  ],
  healthCheck: { interval: 30, path: '/health' },
  failover: 'automatic'
});

// Database replication
const dbConfig = {
  primary: 'db-primary.internal',
  replicas: [
    'db-replica-1.internal',
    'db-replica-2.internal'
  ],
  replication: 'synchronous'
};
```

## 📊 Monitoring & Alerting

```javascript
// Prometheus metrics
app.get('/metrics', (req, res) => {
  res.send(prometheus.register.metrics());
});

// Key metrics
registerMetric('quotation_creation_duration_ms');
registerMetric('api_request_latency_ms');
registerMetric('database_query_latency_ms');
registerMetric('active_user_sessions');
registerMetric('error_rate_percent');

// Alerting rules
{
  alert: 'HighErrorRate',
  expr: 'error_rate_percent > 5',
  for: '5m',
  annotations: {
    summary: 'High error rate detected'
  }
}
```

## 🚀 Roadmap

| Feature | Priority | Timeline |
|---------|----------|----------|
| RBAC | High | Months 1-2 |
| SSO | High | Months 2-3 |
| 2FA | High | Months 1-2 |
| Audit Logging | Critical | Months 1-2 |
| Encryption at Rest | High | Months 2-3 |
| GDPR Compliance | Critical | Months 3-4 |
| White-Label | Medium | Months 4-5 |
| Advanced Support | Medium | Months 3-4 |
| HA/DR | High | Months 4-6 |

## 📚 Compliance Standards

- ✅ LGPD (Lei Geral de Proteção de Dados - Brasil)
- ✅ GDPR (Geral Data Protection Regulation - EU)
- ✅ SOC 2 Type II
- ✅ ISO 27001 (Information Security)
- ✅ HIPAA (se necessário para healthcare)

---

Phase 8 transforma Metalflow em uma solução enterprise-grade pronta para grandes corporações com requisitos severos de segurança e compliance.
