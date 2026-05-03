import React, { useState, useEffect } from 'react';

function AppDebug() {
  const [status, setStatus] = useState('Inicializando...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const test = async () => {
      try {
        setStatus('1. Testando localStorage...');
        localStorage.setItem('test', 'ok');
        setStatus('2. Testando IndexedDB...');
        
        const dbRequest = indexedDB.open('metalflow', 1);
        dbRequest.onupgradeneeded = (e) => {
          console.log('DB upgrade needed');
        };
        dbRequest.onsuccess = () => {
          setStatus('3. Tudo ok! IndexedDB funcionando');
        };
        dbRequest.onerror = () => {
          setError('Erro no IndexedDB: ' + dbRequest.error);
        };
      } catch (err) {
        setError('Erro: ' + err.message);
        console.error(err);
      }
    };
    test();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', textAlign: 'center' }}>
      <h1>🔍 Debug Status</h1>
      <p style={{ color: error ? 'red' : 'green', fontSize: '18px' }}>
        {error || status}
      </p>
      {error && (
        <button 
          onClick={() => {
            localStorage.clear();
            indexedDB.deleteDatabase('metalflow');
            window.location.reload();
          }}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Limpar tudo e recarregar
        </button>
      )}
    </div>
  );
}

export default AppDebug;
