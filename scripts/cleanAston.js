// Script para limpar todas as referências ao cliente Aston
console.log('🧹 Iniciando limpeza de dados Aston...');

// Limpar localStorage
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('aston')) {
    localStorage.removeItem(key);
    console.log(`✅ Removido do localStorage: ${key}`);
  }
});

// Limpar IndexedDB
const deleteDB = (dbName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => {
      console.log(`✅ Banco de dados removido: ${dbName}`);
      resolve();
    };
    request.onerror = () => {
      console.error(`❌ Erro ao remover banco: ${dbName}`, request.error);
      reject(request.error);
    };
  });
};

// Remover bancos de dados relacionados
Promise.all([
  deleteDB('metalflow'),
  deleteDB('AstonDB')
]).then(() => {
  console.log('✅ Limpeza completa! Recarregue a página para começar do zero.');
  console.log('📝 Todos os dados foram removidos. Crie um novo usuário MetalFlow.');
}).catch(err => {
  console.error('❌ Erro na limpeza:', err);
});
