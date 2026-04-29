# 🏗️ QuoteOS Architecture - Phase 2 Complete

Visão geral da arquitetura de Metalflow ↔ QuoteOS Backend.

---

## 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Metalflow (React 18)                          │ │
│  │  ┌──────────────┐      ┌──────────────┐               │ │
│  │  │  Components  │──→   │  Redux/State │               │ │
│  │  └──────────────┘      └──────────────┘               │ │
│  │                                │                        │ │
│  │                                ↓                        │ │
│  │  ┌──────────────────────────────────────────┐          │ │
│  │  │  Services Layer                          │          │ │
│  │  ├──────────────────────────────────────────┤          │ │
│  │  │  ✓ authService (local)                   │          │ │
│  │  │  ✓ storageService (IndexedDB)            │          │ │
│  │  │  ✓ apiBackendService (HTTP → Backend)    │  🆕    │ │
│  │  │  ✓ syncBackendService (Offline-first)    │  🆕    │ │
│  │  │  ✓ persistenceService (auto-backup)      │          │ │
│  │  │  ✓ pdfService, statusService, etc        │          │ │
│  │  └──────────────────────────────────────────┘          │ │
│  │                                                          │ │
│  │                  ↕ (read/write)                          │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────┐          │ │
│  │  │      IndexedDB (Local Cache)             │          │ │
│  │  │  ├─ quotations                           │          │ │
│  │  │  ├─ clients                              │          │ │
│  │  │  ├─ users                                │          │ │
│  │  │  └─ _metadata (lastSync, etc)            │          │ │
│  │  └──────────────────────────────────────────┘          │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   SyncStatusIndicator (Network Status Visual)          │ │
│  │   🟢 Online / 🔴 Offline / ⟳ Syncing                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                 HTTP (REST API)
                           │
           ┌───────────────┴───────────────┐
           │ CORS Enabled (localhost:5173) │
           └───────────────┬───────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    QuoteOS Backend                           │
│                  (Node.js + NestJS)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Layer (REST Endpoints)                            │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Auth Routes          (/auth/*)                  │  │ │
│  │  │  ├─ POST /auth/register                          │  │ │
│  │  │  └─ POST /auth/login                             │  │ │
│  │  │                                                   │  │ │
│  │  │  Quotation Routes     (/quotations/*)            │  │ │
│  │  │  ├─ GET /quotations                              │  │ │
│  │  │  ├─ POST /quotations                             │  │ │
│  │  │  ├─ GET /quotations/:id                          │  │ │
│  │  │  ├─ PUT /quotations/:id                          │  │ │
│  │  │  ├─ PUT /quotations/:id/status    [Workflow]     │  │ │
│  │  │  ├─ GET /quotations/:id/versions [Versionamento] │  │ │
│  │  │  └─ GET /quotations/:id/audit-log[Auditoria]     │  │ │
│  │  │                                                   │  │ │
│  │  │  Client Routes        (/clients/*)               │  │ │
│  │  │  ├─ GET /clients                                 │  │ │
│  │  │  ├─ POST /clients                                │  │ │
│  │  │  ├─ GET /clients/:id                             │  │ │
│  │  │  ├─ PUT /clients/:id                             │  │ │
│  │  │  └─ DELETE /clients/:id                          │  │ │
│  │  │                                                   │  │ │
│  │  │  Workflow Routes      (/workflow/*)              │  │ │
│  │  │  ├─ GET /workflow/statuses                       │  │ │
│  │  │  └─ GET /workflow/transitions/:status            │  │ │
│  │  │                                                   │  │ │
│  │  │  Sync Routes          (/sync/*)                  │  │ │
│  │  │  ├─ GET /sync/snapshot                           │  │ │
│  │  │  ├─ POST /sync/import                            │  │ │
│  │  │  └─ GET /sync/delta?since=...                    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Business Logic Layer                                  │ │
│  │  ├─ QuotationsService (CRUD + versioning)             │ │
│  │  ├─ ClientsService (CRUD)                             │ │
│  │  ├─ AuthService (JWT + password hashing)              │ │
│  │  ├─ WorkflowService (status transitions + triggers)   │ │
│  │  ├─ EmailService (SMTP + templates)                   │ │
│  │  └─ SyncService (snapshot + import + delta)           │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Data Layer (Prisma ORM)                              │ │
│  │  ├─ User (login, password, role, email)              │ │
│  │  ├─ Quotation (number, status, totalPrice)           │ │
│  │  ├─ QuotationItem (material, thickness, qty)         │ │
│  │  ├─ QuotationVersion (versionamento)                 │ │
│  │  ├─ AuditLog (action, changes, timestamp)            │ │
│  │  └─ Client (name, email, logo, colors)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           ↓                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database (Docker)                         │ │
│  │  ├─ users table                                        │ │
│  │  ├─ quotations table                                  │ │
│  │  ├─ quotation_items table                             │ │
│  │  ├─ quotation_versions table                          │ │
│  │  ├─ audit_logs table                                  │ │
│  │  └─ clients table                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  External Services                                     │ │
│  │  ├─ SMTP (Email) → Mailtrap / Gmail / SendGrid        │ │
│  │  ├─ Redis (Caching) [Future: Phase 4]                 │ │
│  │  └─ ML Service (Python) [Future: Phase 3]             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Sincronização (Offline-First)

```
┌─────────────────────────────────────────────────────────┐
│                Frontend Offline Mode                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  User Action (criar orçamento)                   │   │
│  └────────────┬─────────────────────────────────────┘   │
│               │                                          │
│               ↓                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  storageService.addQuotation({               │   │
│  │    _pendingSync: true,                        │   │
│  │    ...dados                                   │   │
│  │  })                                            │   │
│  │                                                │   │
│  │  ✅ Salvo em IndexedDB                         │   │
│  │  ✅ UI atualiza (sem latência)                │   │
│  │  ✅ App continua 100% funcional                │   │
│  └────────────┬─────────────────────────────────────┘   │
│               │                                          │
│               │ (app fica offline por horas...)         │
│               │                                          │
│               ↓                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  User fica Online                                │   │
│  │  syncBackendService detecta                      │   │
│  └────────────┬─────────────────────────────────────┘   │
│               │                                          │
│               ↓                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  POST /sync/import                               │   │
│  │  {                                                │   │
│  │    quotations: [{                                │   │
│  │      id, number, status, totalPrice, items       │   │
│  │    }]                                             │   │
│  │  }                                                │   │
│  └────────────┬─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                │
     HTTP POST (background)
                │
┌─────────────────────────────────────────────────────────┐
│            Backend Processing                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  SyncService.importChanges()                     │   │
│  │  ├─ Valida dados                                 │   │
│  │  ├─ Persiste no PostgreSQL                       │   │
│  │  ├─ Cria auditLog                                │   │
│  │  └─ Retorna { imported: 1, failed: 0 }           │   │
│  └────────────┬─────────────────────────────────────┘   │
│               │                                          │
│               ↓                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Response: 200 OK                                │   │
│  │  { imported: 1, failed: 0 }                       │   │
│  └────────────┬─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                │
     HTTP Response
                │
┌─────────────────────────────────────────────────────────┐
│           Frontend Finalização                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  storageService.updateQuotation()                │   │
│  │  { _pendingSync: false }                         │   │
│  │                                                  │   │
│  │  ✅ Flag removido                                │   │
│  │  ✅ SyncStatusIndicator atualiza                │   │
│  │  ✅ Ready para próxima sincronização             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Workflow Automático (Status Transitions)

```
User: "Enviar orçamento" (click)
              ↓
Frontend: PUT /quotations/:id/status { status: "sent" }
              ↓
┌─────────────────────────────────────────────────────┐
│         WorkflowService.changeStatus()              │
│                                                      │
│  1️⃣  Validar transição                             │
│     if (VALID_TRANSITIONS['draft'].includes('sent')) │
│        ✅ Permitido                                  │
│                                                      │
│  2️⃣  Update Database                               │
│     quotation.status = 'sent'                       │
│     quotation.updatedAt = now                       │
│                                                      │
│  3️⃣  Log Auditoria                                 │
│     auditLog.create({                               │
│       action: 'status_changed',                     │
│       changes: { from: 'draft', to: 'sent' }        │
│     })                                               │
│                                                      │
│  4️⃣  Trigger Eventos                               │
│     if (newStatus === 'sent') {                     │
│       emailService.sendQuotationSent({              │
│         to: client.email,                           │
│         quotationNumber: '0001',                     │
│         totalPrice: 5000                            │
│       })                                             │
│     }                                                │
│                                                      │
│  5️⃣  Return Response                               │
│     { id, status: 'sent', updatedAt, client, ... }  │
└─────────────────────────────────────────────────────┘
              ↓
Frontend: Recebe resposta
              ↓
┌─────────────────────────────────────────────────────┐
│  ✅ Status atualizado na UI                         │
│  ✅ Email enviado para cliente@aston.com.br        │
│  ✅ Audit log registrado                            │
│  ✅ Offline-sync sincroniza mudanças                │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Data Model

```
USER (Autenticação)
├─ id (CUID)
├─ login (unique) ← "adm"
├─ email (unique)
├─ password (bcrypt hash)
├─ name
├─ number (operador)
├─ role (admin | user)
└─ timestamps (createdAt, updatedAt)

QUOTATION (Orçamento)
├─ id (CUID)
├─ number (unique) ← "ORC-0001"
├─ status (draft | review | sent | waiting | negotiation | approved | rejected)
├─ version (incremental, para rastrear mudanças)
├─ clientId (FK → CLIENT)
├─ operatorId (FK → USER)
├─ totalPrice
├─ items (ARRAY of QUOTATION_ITEM)
└─ timestamps

QUOTATION_ITEM (Item do Orçamento)
├─ id
├─ quotationId (FK → QUOTATION)
├─ material (string)
├─ thickness (float)
├─ flat (float)
├─ quantity (int)
├─ workType (string)
├─ unitPrice
├─ totalPrice

QUOTATION_VERSION (Histórico de Versões)
├─ id
├─ quotationId (FK → QUOTATION)
├─ version (int)
├─ content (JSON snapshot)
├─ changedBy (FK → USER)
├─ createdAt

AUDIT_LOG (Auditoria)
├─ id
├─ quotationId (FK → QUOTATION)
├─ action (create | update | status_changed | ...)
├─ changes (JSON { field: oldValue, newValue })
├─ changedBy (FK → USER)
├─ createdAt

CLIENT (Cliente)
├─ id
├─ name
├─ email (unique)
├─ tagline
├─ logoUrl
├─ primaryColor
└─ timestamps
```

---

## 🔐 Security Flow

```
┌───────────────────────────────┐
│  Frontend: Login              │
│  → apiBackendService.login()  │
└───────────────┬───────────────┘
                │
        POST /auth/login
        { login: "adm", password: "adm" }
                │
                ↓
┌───────────────────────────────────────┐
│  Backend: AuthService.login()         │
│  1. Buscar user por login             │
│  2. Verificar password (bcrypt)       │
│  3. Gerar JWT token                   │
│  4. Return { access_token, user }     │
└───────────────┬───────────────────────┘
                │
        Response: { access_token: "eyJ...", user: {...} }
                │
                ↓
┌───────────────────────────────┐
│  Frontend: Store Token        │
│  localStorage.token = token   │
│  apiBackendService.token = token     │
└───────────────┬───────────────┘
                │
        Subsequent requests:
        Authorization: Bearer eyJ...
                │
                ↓
┌───────────────────────────────────────┐
│  Backend: JwtGuard middleware         │
│  1. Extract token from header         │
│  2. Verify signature (JWT_SECRET)     │
│  3. Decode payload { userId, role }   │
│  4. Attach to @Request() user         │
│  5. Allow/Deny access                 │
└───────────────────────────────────────┘
```

---

## 🚀 Próxima Fase: Phase 3

```
Phase 3: Intelligence (Semanas 6-10)

┌─────────────────────────────────────┐
│  ML Service (Python + FastAPI)      │
│                                      │
│  /predict-price                      │
│    ← material, thickness, flat, qty  │
│    → suggested_price                 │
│                                      │
│  Trained on historical data:        │
│  - Materiais (aço, inox, alumínio)  │
│  - Tamanhos (thickness)              │
│  - Flatness (flat m²)                │
│  - Quantidades                       │
│  - Preços históricos                 │
└─────────────────────────────────────┘
            │
Backend: PricingService
    ├─ Chamar ML service
    ├─ Aplicar margens
    └─ Retornar sugestão
            │
Frontend: Real-time price suggestions
    └─ Mostrar: "Sugestão: R$ 150"
```

---

**Status:** ✅ Phase 2 Completo + Frontend Services Pronto

**Próximo:** Integrar App.jsx + LoginPage + QuotationBuilder com backend
