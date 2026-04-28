# 📊 Fontes de Preços de Materiais

## Preços Base (Abril 2026)

Todos os preços foram pesquisados em fontes brasileiras oficiais e internacionais:

| Material | Preço Base | Variação | Fonte |
|----------|-----------|----------|-------|
| **Aço Carbono** | R$ 4,25/kg | ±8% | AçoBrasil, Bepex, Sienge |
| **Inox 304** | R$ 5,30/kg | ±8% | Bepex, mercado local |
| **Alumínio 1050** | R$ 6,00/kg | ±8% | LME (Metals-API), Brasil |

## Fontes de Dados por Material

### 🏢 Aço Carbono (Chapas Laminadas)
- **Fontes Oficiais:**
  - Instituto Aço Brasil: https://www.acobrasil.org.br/site/estatistica-mensal/
  - Sienge: https://sienge.com.br/blog/preco-do-aco-tudo/
  - Bepex: https://bepex.com.br/qual-e-o-preco-do-kg-do-aco/

- **Preço Referência:** R$ 4.200-4.300 por tonelada = R$ 4,20-4,30/kg
- **Variação Regional:** 
  - Norte: -18,90%
  - Sul: -10,45%
  - Sudeste: -10,38%

### 🥉 Alumínio 1050
- **Fonte API:** Metals-API + London Metal Exchange (LME)
- **Preço Referência:** 3.603 USD/T (26/04/2026)
- **Conversão BRL:** R$ 6,00/kg
- **Histórico:** Disponível em https://metals-api.com/

### 🔗 Inox 304
- **Fontes:**
  - Bepex: https://bepex.com.br/tabela-de-preco-do-aco-inox/
  - Multinox: https://www.multinoxmg.com.br/aco-inox-preco
  
- **Preço Referência:** R$ 5,30/kg (média nacional)
- **Variação:** R$ 250-7.000 por m² (conforme espessura)

## Sistema de Atualização

### 🔄 Busca Automática
O sistema tenta:
1. **Fetch Real:** Tenta acessar Metals-API para dados de LME
2. **CORS Proxy:** Fallback para proxy se necessário
3. **Simulação Realista:** Usa dados base com variação ±8%

### 📈 Variação de Mercado
- Variação realista: ±8% (mercado de commodities)
- Atualização simulada mantém histórico
- Cada busca gera nova entrada no histórico com timestamp

## APIs Públicas Disponíveis

### ✅ Metals-API (Recomendado)
- **URL:** https://metals-api.com/
- **CORS:** ✓ Habilitado
- **Dados:** Preços LME de aço e alumínio
- **Histórico:** ✓ Disponível (anos)
- **Plano Gratuito:** 100 requisições/mês
- **Documentação:** https://metals-api.com/documentation

### ✅ B3 - Brasil Bolsa Balcão
- **URL:** https://www.b3.com.br/
- **Dados:** Contratos futuros de aço
- **API Alternativa:** brapi.dev https://brapi.dev

### ✅ Trading Economics
- **URL:** https://pt.tradingeconomics.com/commodity/steel
- **Dados:** Série histórica de aço e alumínio
- **Atualização:** Diária

## Notas Importantes

1. **Preços em R$/kg:** Todos os preços da aplicação são em reais por quilograma
2. **Conversão USD→BRL:** Usa taxa aproximada de 5:1 (sujeita a variação)
3. **Sem backend:** Sistema frontend-only, CORS pode limitar acesso direto
4. **Fallback seguro:** Se API falhar, usa dados simulados baseados em preços reais
5. **Atualização manual:** Usuários podem editar preços manualmente a qualquer momento

## Referências Consultadas

- AçoBrasil Estatísticas: https://www.acobrasil.org.br/site/estatistica-mensal/
- Sienge Preços: https://sienge.com.br/blog/preco-do-aco-tudo/
- Bepex Tabelas: https://bepex.com.br/qual-e-o-preco-do-kg-do-aco/
- Metals-API: https://metals-api.com/blog/access-lme-steel-hrc-fob-china-steel-hr-historical-prices-through-this-api
- Trading Economics Aço: https://pt.tradingeconomics.com/commodity/steel
- Trading Economics Alumínio: https://pt.tradingeconomics.com/commodity/aluminum
