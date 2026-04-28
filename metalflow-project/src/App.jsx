import React, { useState, useEffect } from 'react';
import QuotationForm from './components/QuotationForm';
import { initDB, getMaterials, addMaterial } from './services/storageService';

const DEFAULT_MATERIALS = [
  { id: 'aço-carbono', name: 'Aço Carbono', density: 7850, basePrice: 100 },
  { id: 'inox', name: 'Inox 304', density: 8000, basePrice: 150 },
  { id: 'aluminio', name: 'Alumínio 1050', density: 2700, basePrice: 80 },
];

function App() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('quotation');

  useEffect(() => {
    const setupDB = async () => {
      try {
        await initDB();
        let loadedMaterials = await getMaterials();

        if (loadedMaterials.length === 0) {
          for (const material of DEFAULT_MATERIALS) {
            await addMaterial(material);
          }
          loadedMaterials = await getMaterials();
        }

        setMaterials(loadedMaterials);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    setupDB();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-blue-600 mb-4">MetalFlow</div>
          <div className="text-gray-400 font-mono text-sm">Inicializando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-950 border-b-2 border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-mono font-bold text-blue-600">⚙️ MetalFlow</h1>
            <nav className="flex gap-6">
              <button onClick={() => setCurrentPage('quotation')} className={`text-sm font-mono uppercase tracking-wider pb-2 border-b-2 transition-colors ${currentPage === 'quotation' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Orçador</button>
              <button onClick={() => setCurrentPage('materials')} className={`text-sm font-mono uppercase tracking-wider pb-2 border-b-2 transition-colors ${currentPage === 'materials' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Materiais</button>
              <button onClick={() => setCurrentPage('clients')} className={`text-sm font-mono uppercase tracking-wider pb-2 border-b-2 transition-colors ${currentPage === 'clients' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Clientes</button>
              <button onClick={() => setCurrentPage('history')} className={`text-sm font-mono uppercase tracking-wider pb-2 border-b-2 transition-colors ${currentPage === 'history' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>Histórico</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'quotation' && <div className="max-w-2xl"><QuotationForm materials={materials} onSubmit={(q) => console.log(q)} /></div>}
        {currentPage === 'materials' && <div className="bg-gray-800 border border-gray-700 p-6"><h2 className="text-2xl font-mono font-bold mb-6 text-blue-600">Materiais</h2><div className="grid gap-4">{materials.map(m => <div key={m.id} className="bg-gray-900 border border-gray-700 p-4"><h3 className="font-mono font-bold">{m.name}</h3><p className="text-xs text-gray-500 mt-1">R$ {m.basePrice} | {m.density} kg/m³</p></div>)}</div></div>}
        {currentPage === 'clients' && <div className="bg-gray-800 border border-gray-700 p-6"><h2 className="text-2xl font-mono font-bold mb-6 text-blue-600">Clientes</h2><p className="text-gray-400 font-mono text-sm">Nenhum cliente cadastrado.</p></div>}
        {currentPage === 'history' && <div className="bg-gray-800 border border-gray-700 p-6"><h2 className="text-2xl font-mono font-bold mb-6 text-blue-600">Histórico</h2><p className="text-gray-400 font-mono text-sm">Nenhum orçamento salvo.</p></div>}
      </main>

      <footer className="border-t border-gray-700 bg-gray-950 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-500 font-mono">MetalFlow v0.1</div>
      </footer>
    </div>
  );
}

export default App;
