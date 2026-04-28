# 👥 Sistema de Roles e Permissões

## Dois Tipos de Usuários

### 🔐 **ADM (Administrador)**
Acessa o **Painel Administrativo** com controle total sobre:

#### ⚙️ **Gerenciar Serviços**
- ✅ Criar novos serviços (ex: Soldagem, Acabamento)
- ✅ Editar custos por kg para cada serviço
- ✅ Adicionar descrições
- ✅ Remover serviços não utilizados
- ✅ Interface completa de CRUD

**Exemplo:**
```
Serviço: Corte Laser
Custo: R$ 50,00/kg
Descrição: Corte de precisão com laser CO2
```

#### 📦 **Gerenciar Materiais** (em desenvolvimento)
- Adicionar novos tipos de material
- Editar densidade e propriedades
- Atualizar preços base

#### 💰 **Gerenciar Preços** (em desenvolvimento)
- Atualizar preços de mercado manualmente
- Buscar preços automaticamente
- Visualizar histórico de preços

#### 🏢 **Gerenciar Clientes** (em desenvolvimento)
- Criar e editar dados de clientes
- Gerenciar contatos
- Visualizar histórico de orçamentos

#### 👥 **Gerenciar Usuários**
- Criar novos operadores
- Visualizar lista de usuários
- Gerenciar permissões

---

### 📝 **OPERADOR**
Acessa a interface de **criação de orçamentos** com:

#### ✅ O que pode fazer:
- ✅ Criar orçamentos usando materiais pré-configurados
- ✅ Selecionar peças com dimensões (mm)
- ✅ Escolher tipo de serviço para cada peça
- ✅ Usar serviços configurados pelo ADM
- ✅ Editar orçamentos (seus próprios)
- ✅ Visualizar histórico de orçamentos
- ✅ Gerar relatórios

#### ❌ O que NÃO pode fazer:
- ❌ Criar novos serviços
- ❌ Editar custos de serviços
- ❌ Editar materiais
- ❌ Atualizar preços
- ❌ Criar outros usuários

---

## 🚀 Como Usar

### 1️⃣ Primeiro Acesso (Cria ADM)
```
Login: adm
Senha: sua_senha_segura
Nome: Seu Nome Completo
Role: Administrador (automático)
```

### 2️⃣ ADM Criando Operador
1. Clica em "Novo usuário" na login
2. Preenche dados:
   - Nome: João Silva
   - Matrícula: OP-001
   - Login: joao.silva
   - Senha: senha_segura
   - **Tipo: Operador (cria orçamentos)**
3. Clica "Criar conta e entrar"

### 3️⃣ ADM Configurando Serviços
1. Entra no **Painel Administrativo**
2. Clica na aba **⚙️ Serviços**
3. Preenche:
   - Nome: Soldagem
   - Custo: R$ 60,00/kg
   - Descrição: Solda manual com eletrodo
4. Clica "+ Adicionar Serviço"

### 4️⃣ Operador Criando Orçamento
1. Entra na aplicação (como OPERADOR)
2. Clica em "Clientes"
3. Seleciona cliente ou cria novo
4. Clica "Novo Orçamento →"
5. Para cada peça:
   - Seleciona material (Aço Carbono, Inox, etc)
   - Digita dimensões (Comprimento, Largura, Espessura em mm)
   - Seleciona serviço (Corte Laser, Soldagem, etc)
   - Quantidade
6. Sistema **calcula automaticamente** baseado em:
   - Peso = (L×W×E)/1000 × densidade
   - Custo material = peso × preço_material
   - Custo serviço = peso × custo_serviço
   - Total = custo material + custo serviço

---

## 💻 Fluxo de Dados

```
ADM
├─ Configura Serviços ──→ localStorage
├─ Atualiza Preços ──────→ localStorage
└─ Gerencia Materiais ──→ IndexedDB

         ↓
         
OPERADOR
├─ Lê Serviços ──────────→ localStorage
├─ Lê Preços ────────────→ localStorage
├─ Cria Orçamentos ──────→ IndexedDB
└─ Edita Orçamentos ────→ IndexedDB

         ↓

SISTEMA
└─ Calcula preços em tempo real
└─ Mantém histórico de edições
└─ Gera relatórios
```

---

## 🔧 Dados Compartilhados

### Serviços (localStorage)
Cada operador vê os serviços criados pelo ADM em tempo real. Se o ADM adiciona novo serviço, todos os operadores veem imediatamente.

### Preços (localStorage)
Preços de materiais sincronizados globalmente. Cada orçamento usa o preço atual do material no momento da criação.

### Histórico de Edições
Cada orçamento registra:
- Quem criou (login + nome do operador)
- Quando criou (timestamp)
- Todas as edições posteriores (quem, quando, o quê mudou)

---

## 📋 Estado Atual

✅ **Implementado:**
- Sistema de autenticação com 2 roles
- Login diferenciado por role
- Painel ADM com abas
- Gerenciamento de serviços (CRUD completo)
- Interface de operador mantida

🚧 **Em Desenvolvimento:**
- Gerenciamento de materiais
- Gerenciamento de clientes
- Gerenciamento de usuários
- Gerenciamento de preços no painel ADM

---

## 🔐 Segurança

- Senhas hasheadas com SHA-256 + SALT
- Session storage para autenticação
- Sem exposição de dados entre usuários
- Histórico de edições para auditoria
