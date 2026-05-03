#!/usr/bin/env node

/**
 * 🔧 Diagnóstico Automático - Aston Metalflow
 * Verifica saúde da aplicação
 */

import fs from 'fs';
import path from 'path';

console.log('\n🔍 DIAGNÓSTICO ASTON METALFLOW\n');

const checks = {
  'Arquivos principais existem': () => {
    const files = [
      'src/App.jsx',
      'src/main.jsx',
      'src/services/storageService.js',
      'src/components/AppleStyleDashboard.jsx',
    ];
    return files.every(f => fs.existsSync(f));
  },

  'package.json válido': () => {
    try {
      JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return true;
    } catch {
      return false;
    }
  },

  'node_modules instalado': () => fs.existsSync('node_modules'),

  'DB_VERSION correto em storageService': () => {
    const content = fs.readFileSync('src/services/storageService.js', 'utf8');
    return content.includes('DB_VERSION = 3');
  },

  'AstonDB database name usado': () => {
    const content = fs.readFileSync('src/services/storageService.js', 'utf8');
    return content.includes("DB_NAME    = 'AstonDB'");
  },

  'AdminPage.jsx existe': () => fs.existsSync('src/components/AdminPage.jsx'),

  'cadFileService.js existe': () => fs.existsSync('src/services/cadFileService.js'),

  'dxfParserService.js existe': () => fs.existsSync('src/services/dxfParserService.js'),

  'initAutoBackup em App.jsx': () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    return content.includes('initAutoBackup');
  },

  'enableTabSync em App.jsx': () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    return content.includes('enableTabSync');
  },

  'handleQuotationSubmit usa handlers': () => {
    const content = fs.readFileSync('src/App.jsx', 'utf8');
    return content.includes('handleQuotationSubmit') &&
           content.includes('addQuotation') &&
           content.includes('updateQuotation');
  },
};

let passCount = 0;
let failCount = 0;

Object.entries(checks).forEach(([name, check]) => {
  try {
    const result = check();
    const icon = result ? '✅' : '❌';
    const status = result ? 'PASS' : 'FAIL';
    console.log(`${icon} ${name}: ${status}`);
    if (result) passCount++; else failCount++;
  } catch (error) {
    console.log(`❌ ${name}: ERRO (${error.message})`);
    failCount++;
  }
});

console.log(`\n📊 Resultado: ${passCount} passou, ${failCount} falhou\n`);

if (failCount === 0) {
  console.log('✅ Aplicação saudável!\n');
  process.exit(0);
} else {
  console.log('⚠️  Problemas encontrados. Veja DEBUG_GUIDE.md\n');
  process.exit(1);
}
