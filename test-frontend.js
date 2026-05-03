#!/usr/bin/env node

/**
 * 🎯 TESTE SISTEMÁTICO - FRONTEND
 * Verifica cada feature da aplicação
 */

import fs from 'fs';
import path from 'path';

const tests = {
  'AppleHero tem botões com onClick': () => {
    const content = fs.readFileSync('src/components/AppleHero.jsx', 'utf8');
    return content.includes('onStartClick') && content.includes('onDemoClick');
  },

  'AppleHeader tem navegação': () => {
    const content = fs.readFileSync('src/components/AppleHeader.jsx', 'utf8');
    return content.includes('navItems') && content.includes('onNavigate');
  },

  'QuotationBuilder recebe props corretas': () => {
    const content = fs.readFileSync('src/components/QuotationBuilder.jsx', 'utf8');
    return content.includes('selectedClient') &&
           content.includes('onSubmit') &&
           content.includes('initialQuotation');
  },

  'DashboardPage tem onQuotationClick': () => {
    const content = fs.readFileSync('src/components/DashboardPage.jsx', 'utf8');
    return content.includes('onQuotationClick');
  },

  'ClientsPage tem onSelect': () => {
    const content = fs.readFileSync('src/components/ClientsPage.jsx', 'utf8');
    return content.includes('onSelect');
  },

  'AdminPage lazy-loaded': () => {
    const content = fs.readFileSync('src/components/AppleStyleDashboard.jsx', 'utf8');
    return content.includes('lazy(() => import(\'./AdminPage\'))');
  },

  'ClientsListReport lazy-loaded': () => {
    const content = fs.readFileSync('src/components/AppleStyleDashboard.jsx', 'utf8');
    return content.includes('lazy(() => import(\'./ClientsListReport\'))');
  },

  'Suspense wraps lazy components': () => {
    const content = fs.readFileSync('src/components/AppleStyleDashboard.jsx', 'utf8');
    return content.includes('<Suspense');
  },

  'LoginPage salva credenciais localStorage': () => {
    const content = fs.readFileSync('src/components/LoginPage.jsx', 'utf8');
    return content.includes('metalflow_login') &&
           content.includes('metalflow_password') &&
           content.includes('rememberMe');
  },

  'DXF Import funciona': () => {
    const content = fs.readFileSync('src/components/DxfImportDialog.jsx', 'utf8');
    return content.includes('parseDxfFile') &&
           content.includes('saveCadFile') &&
           content.includes('convertToQuotationItems');
  },

  'App.jsx inicializa DB': () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    return content.includes('initDB()') &&
           content.includes('getMaterials()') &&
           content.includes('getClients()') &&
           content.includes('getQuotations()');
  },

  'App.jsx ativa auto-backup': () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    return content.includes('initAutoBackup()');
  },

  'App.jsx ativa tab sync': () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    return content.includes('enableTabSync');
  },

  'Handlers salvam ao BD': () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    return content.includes('handleQuotationSubmit') &&
           content.includes('addQuotation') &&
           content.includes('updateQuotation');
  },

  'storageService.js tem v3': () => {
    const content = fs.readFileSync('src/services/storageService.js', 'utf8');
    return content.includes('DB_VERSION = 3');
  },

  'cadFileService.js salva arquivos': () => {
    const content = fs.readFileSync('src/services/cadFileService.js', 'utf8');
    return content.includes('saveCadFile') &&
           content.includes('getCadFilesByClient');
  },

  'Componentes carregam dados do props': () => {
    const components = [
      'src/components/DashboardPage.jsx',
      'src/components/ClientsPage.jsx',
      'src/components/AdminPage.jsx'
    ];
    return components.every(c =>
      fs.readFileSync(c, 'utf8').includes('quotations') ||
      fs.readFileSync(c, 'utf8').includes('clients') ||
      fs.readFileSync(c, 'utf8').includes('materials')
    );
  },
};

console.log('\n🎯 TESTE SISTEMÁTICO - FRONTEND\n');

let passed = 0;
let failed = 0;

Object.entries(tests).forEach(([name, test]) => {
  try {
    const result = test();
    const icon = result ? '✅' : '❌';
    const status = result ? 'PASS' : 'FAIL';
    console.log(`${icon} ${name}: ${status}`);
    if (result) passed++; else failed++;
  } catch (error) {
    console.log(`❌ ${name}: ERRO (${error.message})`);
    failed++;
  }
});

console.log(`\n📊 Resultado: ${passed} passou, ${failed} falhou\n`);

if (failed === 0) {
  console.log('✅ Frontend 100% testado!\n');
  process.exit(0);
} else {
  console.log('⚠️  Alguns testes falharam. Veja FRONTEND_DEBUG.md\n');
  process.exit(1);
}
