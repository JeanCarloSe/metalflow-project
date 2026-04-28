# 🔐 Acesso Total do Administrador

## 👑 O QUE O ADM PODE FAZER

O ADM (Administrador) tem acesso **TOTAL** a todas as funcionalidades do sistema:

---

## 📋 **1. Gerenciar Orçamentos (Aba Principal)**

### Ver Todos os Orçamentos
- ✅ Lista completa de TODOS os orçamentos criados
- ✅ Filtrar por cliente
- ✅ Ver detalhes: número, cliente, operador, quantidade de peças, peso, valor
- ✅ Total acumulado de orçamentos

### Informações Visíveis
```
Nº do Orçamento → Cliente → Operador que criou
Quantidade de peças → Peso total → Valor total → Data
```

**Exemplo:**
```
ORC-2026-0001 | ABC Indústrias | João Silva
3 peças | 45,50 kg | R$ 2.450,00 | 26/04/2026
```

---

## ⚙️ **2. Gerenciar Serviços**

### CRUD Completo
- ✅ **Criar** novo serviço com nome, custo/kg e descrição
- ✅ **Ler** lista de todos os serviços
- ✅ **Atualizar** custo e descrição de serviços
- ✅ **Deletar** serviços

### Exemplo
```
Nome: Pintura Eletrostática
Custo: R$ 35,00/kg
Descrição: Pintura a pó com cura em estufa
```

---

## 📦 **3. Gerenciar Materiais**

### CRUD Completo
- ✅ **Criar** novo material com nome, densidade e preço
- ✅ **Ler** lista de todos os materiais
- ✅ **Atualizar** densidade e preço por kg
- ✅ **Deletar** materiais

### Campos Editáveis
```
Nome: Cobre Puro
Densidade: 8960 kg/m³
Preço: R$ 12,50/kg
```

---

## 🏢 **4. Gerenciar Clientes**

### CRUD Completo
- ✅ **Criar** novo cliente com dados completos
- ✅ **Ler** lista de todos os clientes
- ✅ **Atualizar** qualquer informação do cliente
- ✅ **Deletar** clientes

### Informações de Cliente
```
Nome da Empresa
Tagline / Slogan
Email
Telefone
Contato (pessoa)
Website
URL do Logo
Cor Primária (para personalização)
```

---

## 👥 **5. Gerenciar Usuários**

### Criar Usuários
- ✅ **Criar** novos usuários com qualquer role
- ✅ Definir **ADM** ou **OPERADOR**
- ✅ Definir login, senha, nome, matrícula

### Ver Usuários
- ✅ Lista completa de todos os usuários
- ✅ Ver: Nome, Login, Matrícula, Tipo (ADM/OP), Data criação

### Permissões Especiais
- ✅ Criar múltiplos ADMs (se necessário)
- ✅ Criar múltiplos OPERADOREs

---

## 💰 **6. Gerenciar Preços**

### Atualização Automática
- ✅ **Buscar Preços** de mercado de 5 fontes (com um clique)
- ✅ Progress bar em tempo real
- ✅ Ver qual fonte conseguiu trazer dados

### Atualização Manual
- ✅ **Editar** preço de qualquer material
- ✅ Ver **histórico** de todas as alterações
- ✅ Rastrear: quem mudou, quando mudou, qual era o valor anterior

### Histórico Completo
```
26/04/2026 14:30 - ADM mudou para R$ 5,50/kg (antes: R$ 5,30)
24/04/2026 10:15 - Sistema atualizou para R$ 5,30 (Gravia)
23/04/2026 08:00 - Manual: R$ 5,25 (Operador)
```

---

## 📊 **Comparação de Permissões**

| Funcionalidade | ADM | OPERADOR |
|---|---|---|
| **Ver Orçamentos** | ✅ Todos | ✅ Seus |
| **Editar Orçamentos** | ✅ Todos | ✅ Seus |
| **Deletar Orçamentos** | ✅ Sim | ❌ Não |
| **Criar Serviços** | ✅ Sim | ❌ Não |
| **Editar Serviços** | ✅ Sim | ❌ Não |
| **Editar Materiais** | ✅ Sim | ❌ Não |
| **Editar Preços** | ✅ Sim | ❌ Não |
| **Editar Clientes** | ✅ Sim | ❌ Não |
| **Criar Usuários** | ✅ Sim | ❌ Não |
| **Ver Usuários** | ✅ Sim | ❌ Não |

---

## 🎯 **Fluxo de Controle Total**

```
ADM entra no Painel
├─ 📋 Orçamentos (monitorar tudo)
├─ ⚙️ Serviços (controlar custos de serviço)
├─ 📦 Materiais (controlar densidades e preços base)
├─ 🏢 Clientes (gerenciar dados de clientes)
├─ 👥 Usuários (criar e gerenciar operadores)
└─ 💰 Preços (buscar e atualizar preços de mercado)

OPERADOR entra no Sistema
├─ Clientes (visualizar clientes)
├─ Orçador (criar orçamentos)
├─ Materiais (visualizar apenas - read-only)
└─ Histórico (ver orçamentos criados)
```

---

## 🔒 **Segurança**

- ✅ Primeiro usuário do sistema é sempre ADM
- ✅ ADM pode criar outros ADMs se necessário
- ✅ Cada ação é rastreada com timestamp
- ✅ Histórico de edições mantém quem fez cada mudança
- ✅ Senhas são hasheadas (SHA-256 + SALT)

---

## 📝 **Abas do Painel ADM**

```
[📋 Orçamentos] [⚙️ Serviços] [📦 Materiais] [🏢 Clientes] [👥 Usuários] [💰 Preços]
```

O ADM começa na aba **📋 Orçamentos** para monitorar toda a atividade do sistema.

---

## ✨ **Status Atual**

✅ ADM tem acesso total a 6 abas
✅ ADM pode editar qualquer serviço
✅ ADM pode editar qualquer material
✅ ADM pode editar qualquer cliente
✅ ADM pode criar qualquer usuário
✅ ADM pode atualizar qualquer preço
✅ ADM pode visualizar todos os orçamentos
✅ OPERADOR tem acesso limitado apenas a orçamentos
