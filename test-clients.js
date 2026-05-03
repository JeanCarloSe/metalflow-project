#!/usr/bin/env node

/**
 * 🔍 TESTE - Clientes não carregam
 * Diagnóstico completo do problema
 */

import fs from 'fs';

console.log('\n🔍 DIAGNÓSTICO - CLIENTES NÃO CARREGAM\n');

const checks = [
  {
    name: 'getClients é chamado em App.jsx',
    test: () => {
      const content = fs.readFileSync('src/App.jsx', 'utf8');
      return content.includes('getClients') && content.includes('setClients');
    }
  },
  {
    name: 'getClients exportado em storageService',
    test: () => {
      const content = fs.readFileSync('src/services/storageService.js', 'utf8');
      return content.includes('export const getClients');
    }
  },
  {
    name: 'ClientsPage aceita prop clients',
    test: () => {
      const content = fs.readFileSync('src/components/ClientsPage.jsx', 'utf8');
      return content.includes('clients') && content.match(/function.*ClientsPage|const.*ClientsPage/);
    }
  },
  {
    name: 'AppleStyleDashboard passa clients para ClientsPage',
    test: () => {
      const content = fs.readFileSync('src/components/AppleStyleDashboard.jsx', 'utf8');
      return content.includes('clients={clients}');
    }
  },
  {
    name: 'App.jsx passa clients para AppleStyleDashboard',
    test: () => {
      const content = fs.readFileSync('src/App.jsx', 'utf8');
      return content.includes('clients={clients}');
    }
  },
  {
    name: 'initDB() é chamado no useEffect',
    test: () => {
      const content = fs.readFileSync('src/App.jsx', 'utf8');
      return content.includes('await initDB()');
    }
  },
  {
    name: 'CLIENTS store existe em storageService',
    test: () => {
      const content = fs.readFileSync('src/services/storageService.js', 'utf8');
      return content.includes("CLIENTS:    'clients'") || content.includes('CLIENTS:') && content.includes('clients');
    }
  },
  {
    name: 'AppleHeader tem navegação para Clientes',
    test: () => {
      const content = fs.readFileSync('src/components/AppleHeader.jsx', 'utf8');
      return content.includes("'clients'") && content.includes('Clientes');
    }
  },
  {
    name: 'DashboardPage renderiza clientes info',
    test: () => {
      const content = fs.readFileSync('src/components/DashboardPage.jsx', 'utf8');
      return content.includes('clients') && content.includes('quotations');
    }
  },
  {
    name: 'QuotationBuilder recebe clients ou clientes em props',
    test: () => {
      const content = fs.readFileSync('src/components/QuotationBuilder.jsx', 'utf8');
      return content.includes('clients') || content.includes('MaterialContext');
    }
  },
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  try {
    const result = check.test();
    const icon = result ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    if (result) passed++; else failed++;
  } catch (error) {
    console.log(`❌ ${check.name} (erro: ${error.message.slice(0, 50)})`);
    failed++;
  }
});

console.log(`\n📊 Resultado: ${passed}/${checks.length} passou\n`);

if (failed > 0) {
  console.log('⚠️  PROBLEMAS ENCONTRADOS:\n');
  console.log('1. Clientes não aparecem = check de inicialização falhou');
  console.log('2. Solução:');
  console.log('   a) Verificar se App.jsx chama initDB()');
  console.log('   b) Verificar se getClients() retorna dados');
  console.log('   c) Verificar se setClients() é chamado');
  console.log('   d) Verificar se ClientsPage recebe prop clients');
  console.log('   e) F12 → Application → IndexedDB → AstonDB → clients (tem dados?)');
  console.log('\n3. Commands para debug:');
  console.log('   - node diagnose.js');
  console.log('   - open debug-clients.html');
  console.log('   - F12 → Console → Rodar scripts de debug\n');
} else {
  console.log('✅ Todas as verificações passaram!');
  console.log('Se clientes ainda não aparecem, problema pode ser:');
  console.log('1. Nenhum cliente no BD (criar um novo)');
  console.log('2. Erro ao carregar (ver F12 → Console)');
  console.log('3. Problema de renderização React\n');
}

process.exit(failed > 0 ? 1 : 0);
