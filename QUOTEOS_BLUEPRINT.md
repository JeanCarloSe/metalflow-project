# 🏗️ QUOTEOS - Blueprint Técnico

**Proposta:** Transformar Metalflow em plataforma B2B SaaS com IA/automação/inteligência

---

## PHASE 1: Backend Foundation (Semanas 1-3)

### Objetivo
Ter API REST com autenticação real, sincronização bidirecional, dados em PostgreSQL.

### Stack
```
Node.js + NestJS + PostgreSQL + Prisma ORM + JWT
```

### Estrutura Backend
```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts
│   ├── quotations/
│   │   ├── quotations.controller.ts
│   │   ├── quotations.service.ts
│   │   └── quotation.entity.ts
│   ├── clients/
│   ├── users/
│   ├── common/
│   │   └── guards/
│   │       └── jwt.guard.ts
│   └── database/
│       └── schema.prisma
├── .env
├── docker-compose.yml
└── package.json
```

### Banco de Dados (Prisma Schema)
```prisma
model User {
  id        String   @id @default(cuid())
  login     String   @unique
  email     String   @unique
  password  String   // bcrypt hash
  role      String   @default("user") // admin, user
  company   Company? @relation(fields: [companyId], references: [id])
  companyId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Quotation {
  id          String   @id @default(cuid())
  number      String   @unique
  status      String   @default("draft") // draft, review, sent, waiting, negotiation, approved, rejected
  version     Int      @default(1)
  client      Client   @relation(fields: [clientId], references: [id])
  clientId    String
  operator    User     @relation(fields: [operatorId], references: [id])
  operatorId  String
  items       QuotationItem[]
  totalPrice  Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  versions    QuotationVersion[] // histórico de versões
  auditLog    AuditLog[]
}

model QuotationVersion {
  id          String   @id @default(cuid())
  quotation   Quotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  quotationId String
  version     Int
  content     Json     // snapshot completo da versão anterior
  changedBy   User     @relation(fields: [changedById], references: [id])
  changedById String
  createdAt   DateTime @default(now())
}

model AuditLog {
  id          String   @id @default(cuid())
  quotation   Quotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  quotationId String
  action      String   // create, update, send, sign, etc
  changedBy   User     @relation(fields: [changedById], references: [id])
  changedById String
  changes     Json     // { field: oldValue, newValue }
  createdAt   DateTime @default(now())
}
```

### API Endpoints (Phase 1)
```
POST   /auth/register          → Register user
POST   /auth/login             → JWT token
POST   /auth/refresh           → Refresh token

GET    /quotations             → List all (paginated)
GET    /quotations/:id         → Get one
POST   /quotations             → Create
PUT    /quotations/:id         → Update
DELETE /quotations/:id         → Soft delete

GET    /quotations/:id/versions → Version history
POST   /quotations/:id/version  → Create version

GET    /clients                → List
POST   /clients                → Create

GET    /audit-logs             → Audit trail
```

### Frontend Changes (Phase 1)
```javascript
// services/api.js
const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

export const api = {
  // Auth
  register: (login, email, password) => 
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, email, password })
    }).then(r => r.json()),

  login: (login, password) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    }).then(r => r.json()).then(data => {
      token = data.access_token;
      localStorage.setItem('token', token);
      return data;
    }),

  // Quotations
  getQuotations: () =>
    fetch(`${API_URL}/quotations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  createQuotation: (quotation) =>
    fetch(`${API_URL}/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(quotation)
    }).then(r => r.json()),

  // ... outros
};

// Sync com IndexedDB
export const syncWithBackend = async () => {
  // Pega dados do backend
  const quotations = await api.getQuotations();
  
  // Salva no IndexedDB (cache local)
  await storageService.saveQuotations(quotations);
  
  // Se há dados não-sincronizados localmente, envia
  const pending = await storageService.getPendingSync();
  for (const q of pending) {
    await api.createQuotation(q);
  }
};
```

---

## PHASE 2: Workflow Engine (Semanas 3-6)

### Objetivo
Status transitions automáticos, triggers, email notifications, PDF server-side.

### Workflow Engine (Backend)
```typescript
// src/workflow/workflow.service.ts

type WorkflowState = 'draft' | 'review' | 'sent' | 'waiting' | 'negotiation' | 'approved' | 'rejected';

const TRANSITIONS = {
  'draft': ['review', 'rejected'],
  'review': ['sent', 'rejected'],
  'sent': ['waiting', 'rejected'],
  'waiting': ['negotiation', 'rejected'],
  'negotiation': ['approved', 'rejected'],
  'approved': [],
  'rejected': []
};

export class WorkflowService {
  async changeStatus(quotationId: string, newStatus: WorkflowState, userId: string) {
    const quotation = await this.quotations.findUnique({ where: { id: quotationId } });
    
    // Validar transição
    if (!TRANSITIONS[quotation.status].includes(newStatus)) {
      throw new Error(`Cannot transition from ${quotation.status} to ${newStatus}`);
    }

    // Update status
    const updated = await this.quotations.update({
      where: { id: quotationId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      }
    });

    // Log auditoria
    await this.auditLog.create({
      data: {
        quotationId,
        action: `status_changed`,
        changes: { from: quotation.status, to: newStatus },
        changedById: userId
      }
    });

    // Trigger eventos
    await this.triggerEvent(quotationId, newStatus, userId);

    return updated;
  }

  private async triggerEvent(quotationId: string, status: WorkflowState, userId: string) {
    const quotation = await this.quotations.findUnique({
      where: { id: quotationId },
      include: { client: true, operator: true }
    });

    // Enviar email baseado em status
    if (status === 'sent') {
      await this.emailService.send({
        to: quotation.client.email,
        subject: `Orçamento #${quotation.number}`,
        template: 'quotation_sent',
        data: { quotation }
      });
    }

    if (status === 'approved') {
      await this.emailService.send({
        to: quotation.operator.email,
        subject: `Orçamento aprovado: ${quotation.number}`,
        template: 'quotation_approved',
        data: { quotation }
      });
    }
  }
}
```

### Email Service (SendGrid Integration)
```typescript
// src/email/email.service.ts
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async send(options: EmailOptions) {
    const templates = {
      'quotation_sent': 'd-xxx', // Template ID no SendGrid
      'quotation_approved': 'd-yyy',
      'status_changed': 'd-zzz'
    };

    await sgMail.send({
      to: options.to,
      from: 'noreply@quoteos.com',
      templateId: templates[options.template],
      dynamicTemplateData: options.data
    });
  }
}
```

### Frontend: Workflow UI
```jsx
// components/WorkflowButtons.jsx
const WorkflowButtons = ({ quotation, onStatusChange }) => {
  const transitions = {
    'draft': ['review', 'rejected'],
    'review': ['sent', 'rejected'],
    'sent': ['waiting', 'rejected'],
    'waiting': ['negotiation', 'rejected'],
    'negotiation': ['approved', 'rejected'],
  };

  return (
    <div className="flex gap-2">
      {transitions[quotation.status]?.map(nextStatus => (
        <button
          key={nextStatus}
          onClick={() => onStatusChange(nextStatus)}
          className={`btn-${nextStatus}`}
        >
          → {nextStatus}
        </button>
      ))}
    </div>
  );
};
```

---

## PHASE 3: AI/ML Pricing (Semanas 6-10)

### Objetivo
Sugerir preços automáticos baseado em histórico + IA.

### Model Training (Python + FastAPI)
```python
# ml_service/pricing_model.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

class PricingModel:
    def __init__(self):
        self.model = RandomForestRegressor()

    def train(self, historical_data):
        """
        historical_data: [
          { material: 'aço', thickness: 10, flat: 100, quantity: 5, unitPrice: 150 },
          ...
        ]
        """
        df = pd.DataFrame(historical_data)
        X = df[['thickness', 'flat', 'quantity']]
        y = df['unitPrice']
        self.model.fit(X, y)
        joblib.dump(self.model, 'pricing_model.pkl')

    def predict(self, material, thickness, flat, quantity):
        prediction = self.model.predict([[thickness, flat, quantity]])
        return prediction[0]

# FastAPI endpoint
from fastapi import FastAPI
app = FastAPI()
model = PricingModel()

@app.post("/predict-price")
async def predict_price(item: ItemData):
    price = model.predict(
        item.material,
        item.thickness,
        item.flat,
        item.quantity
    )
    return { "suggested_price": price }
```

### Backend: Pricing Service
```typescript
// src/pricing/pricing.service.ts
@Injectable()
export class PricingService {
  constructor(private http: HttpClient) {}

  async suggestPrice(item: QuotationItem): Promise<number> {
    const response = await this.http.post<{ suggested_price: number }>(
      'http://ml-service:8000/predict-price',
      {
        material: item.material,
        thickness: item.thickness,
        flat: item.flat,
        quantity: item.quantity
      }
    ).toPromise();

    return response.suggested_price;
  }
}
```

### Frontend: Real-time Price Suggestions
```jsx
// components/QuotationItemRow.jsx
const QuotationItemRow = ({ item, onPriceChange }) => {
  const [suggestedPrice, setSuggestedPrice] = useState(null);

  useEffect(() => {
    // Chamar API para sugestão
    api.suggestPrice(item).then(setSuggestedPrice);
  }, [item]);

  return (
    <tr>
      <td>{item.material}</td>
      <td>{item.thickness}mm</td>
      <td>{item.flat}</td>
      <td>{item.quantity}</td>
      <td>
        <input value={item.unitPrice} onChange={...} />
        {suggestedPrice && (
          <span className="text-sm text-blue-500">
            Sugestão: R$ {suggestedPrice.toFixed(2)}
          </span>
        )}
      </td>
    </tr>
  );
};
```

---

## PHASE 4: Integrations (Semanas 10-13)

### DocuSign Integration
```typescript
// src/signature/docusign.service.ts
export class DocuSignService {
  async sendEnvelope(quotation: Quotation, clientEmail: string) {
    // 1. Gerar PDF
    const pdf = await this.pdfService.generateQuotation(quotation);

    // 2. Enviar para DocuSign
    const envelope = await docusign.send({
      documents: [{ pdf, name: `ORC-${quotation.number}` }],
      signers: [{ name: quotation.client.name, email: clientEmail }],
      status: 'sent'
    });

    // 3. Salvar envelope ID
    await this.quotations.update({
      where: { id: quotation.id },
      data: { docusignEnvelopeId: envelope.envelopeId }
    });

    return envelope;
  }

  async checkSignatureStatus(quotationId: string) {
    const quotation = await this.quotations.findUnique({ where: { id: quotationId } });
    const envelope = await docusign.getEnvelope(quotation.docusignEnvelopeId);
    return envelope.status; // 'signed' ou 'pending'
  }
}
```

### HubSpot CRM Sync
```typescript
// src/crm/hubspot.service.ts
export class HubSpotService {
  async syncQuotation(quotation: Quotation) {
    // 1. Find ou create contact no HubSpot
    const contact = await hubspot.contacts.searchByEmail(quotation.client.email);

    // 2. Create deal
    const deal = await hubspot.deals.create({
      dealstage: this.mapStatus(quotation.status),
      dealname: `ORC-${quotation.number}`,
      amount: quotation.totalPrice,
      contacts: [contact.id]
    });

    // 3. Salvar deal ID
    await this.quotations.update({
      where: { id: quotation.id },
      data: { hubspotDealId: deal.id }
    });
  }

  private mapStatus(status: string): string {
    const map = {
      'draft': 'negotiation',
      'review': 'negotiation',
      'sent': 'presentationscheduled',
      'waiting': 'qualifiedtobuy',
      'negotiation': 'negotiation',
      'approved': 'closedwon',
      'rejected': 'closedlost'
    };
    return map[status];
  }
}
```

---

## PHASE 5: Multi-Tenant (Semanas 13+)

### Isolação de Dados
```prisma
model Company {
  id    String @id @default(cuid())
  name  String
  users User[]
  quotations Quotation[]
}

// Middleware para validar company_id
middleware.ts: async (req, res, next) => {
  const user = req.user;
  const companyId = req.query.company_id;

  if (user.companyId !== companyId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}
```

---

## 🚀 Como Começar (Next 48 horas)

1. **Setup Backend**
   ```bash
   mkdir quoteos-backend
   cd quoteos-backend
   npm init -y
   npm install @nestjs/core @nestjs/common @nestjs/jwt @prisma/client postgresql
   npx nest new .
   npx prisma init
   ```

2. **Database**
   ```bash
   docker run -d --name quoteos-db \
     -e POSTGRES_PASSWORD=dev \
     -e POSTGRES_DB=quoteos \
     -p 5432:5432 \
     postgres:15
   ```

3. **First Endpoint**
   ```typescript
   // Criar auth.controller.ts com POST /auth/login
   // Criar auth.service.ts com JWT geração
   ```

4. **Frontend Sync**
   ```javascript
   // Atualizar api.js para chamar backend
   // Manter IndexedDB como cache local (offline-first)
   ```

---

**Próximo passo?** Quer começar a implementar Phase 1 ou quer discutir arquitetura?
