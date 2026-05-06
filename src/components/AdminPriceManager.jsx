import React, { useState, useEffect } from 'react';
import { ASTON_BRAND } from '../services/themeService';
import { getMaterials, updateMaterial } from '../services/storageService';
import { getMarketPrices, setMarketPrice, getPriceHistory } from '../services/priceService';
import { fetchAllPrices, getPriceFetchState } from '../services/priceFetchService';

const AdminPriceManager = () => {
  const [materials, setMaterials] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [fetchState, setFetchState] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const mats = await getMaterials();
      setMaterials(mats || []);
      setFetchState(getPriceFetchState());
    } catch (err) {
      console.error('Erro ao carregar materiais:', err);
      setError('Erro ao carregar materiais');
    }
  };

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  const handleFetchPrices = async () => {
    setIsFetching(true);
    setFetchProgress(0);
    setError('');
    setSuccess('');

    try {
      await fetchAllPrices((progress) => {
        setFetchProgress(Math.round((progress.current / progress.total) * 100));
      });
      setFetchState(getPriceFetchState());
      setSuccess('Preços buscados com sucesso de todas as fontes');
    } catch (err) {
      setError('Erro ao buscar preços');
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdatePrice = async (matId, newPrice) => {
    setError('');
    setSuccess('');

    if (!newPrice || parseFloat(newPrice) <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }

    try {
      const material = materials.find(m => m.id === matId);
      if (!material) return;

      const updated = { ...material, basePrice: parseFloat(newPrice), lastPriceUpdate: new Date().toISOString() };
      await updateMaterial(updated);
      setMarketPrice(material.name, parseFloat(newPrice), 'Manual (ADM)');
      setSuccess(`Preço de "${material.name}" atualizado`);
      setEditingId(null);
      await loadMaterials();
    } catch (err) {
      setError('Erro ao atualizar preço');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="space-y-6">
      <div className="border-b-4 pb-4" style={{ borderColor: '#10B981' }}>
        <h3 className="title-prominent" style={{ color: '#059669' }}>Gerenciar Preços de Materiais</h3>
        <p className="text-sm font-semibold mt-2" style={{ color: '#10B981' }}>Atualize manualmente ou busque preços de mercado</p>
      </div>

      {/* Busca Automática */}
      <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">🔄 Buscar Preços de Mercado</h4>
            <p className="text-xs text-blue-300">Consulta as 5 fontes oficiais (Gravia, Total Metal, AçoBrasil, LME, Aperam)</p>
          </div>
          <button
            onClick={handleFetchPrices}
            disabled={isFetching}
            className="px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-all"
            style={{
              backgroundColor: isFetching ? '#374151' : ASTON_BRAND,
              cursor: isFetching ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={e => !isFetching && (e.target.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => e.target.style.filter = ''}
          >
            {isFetching ? `Buscando... ${fetchProgress}%` : '🔄 Buscar Agora'}
          </button>
        </div>

        {isFetching && (
          <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <div
              className="h-2 transition-all"
              style={{ width: `${fetchProgress}%`, backgroundColor: ASTON_BRAND }}
            />
          </div>
        )}

        {fetchState && fetchState.lastFetchAt && (
          <p className="text-xs text-gray-400 font-mono">
            Última atualização: {new Date(fetchState.lastFetchAt).toLocaleString('pt-BR')}
            {' · '}
            <span style={{ color: ASTON_BRAND }}>{fetchState.successCount || 0} fontes OK</span>
          </p>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm font-mono">✕ {error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-green-400 text-sm font-mono">✓ {success}</p>
        </div>
      )}

      {/* Materiais */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Preços Atuais ({materials.length})</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {materials.map(mat => {
            const history = getPriceHistory(mat.name);
            const lastUpdate = history.length > 0 ? history[0] : null;

            return (
              <div key={mat.id} className="card-premium rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-gray-900">{mat.name}</h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Densidade: {mat.density.toLocaleString('pt-BR')} kg/m³
                    </p>
                  </div>
                  {editingId === mat.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        defaultValue={mat.basePrice}
                        id={`price-${mat.id}`}
                        step="0.01"
                        placeholder="Novo preço"
                        className="w-24 px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const newPrice = document.getElementById(`price-${mat.id}`).value;
                          handleUpdatePrice(mat.id, newPrice);
                        }}
                        className="px-2 py-1.5 text-xs text-green-400 hover:text-green-300 rounded hover:bg-green-950/40 transition-all"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-300 rounded hover:bg-gray-700/40 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="heading-section font-mono" style={{ color: ASTON_BRAND }}>
                        R$ {mat.basePrice.toFixed(2)}
                      </p>
                      <button
                        onClick={() => setEditingId(mat.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
                      >
                        ✏ Editar
                      </button>
                    </div>
                  )}
                </div>

                {/* Histórico */}
                {lastUpdate && (
                  <div className="bg-gray-800/40 rounded p-2 border border-gray-700/20">
                    <p className="text-xs text-gray-500">
                      Última atualização: {new Date(lastUpdate.date).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Fonte: {lastUpdate.source}
                    </p>
                  </div>
                )}

                {/* Histórico Completo */}
                {history.length > 1 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-400">
                      📊 Ver histórico ({history.length - 1} updates)
                    </summary>
                    <div className="mt-2 space-y-1">
                      {history.slice(1, 6).map((entry) => (
                        <div key={`${entry.date}-${entry.source}`} className="text-gray-600 text-xs">
                          {new Date(entry.date).toLocaleDateString('pt-BR')}: R$ {entry.price.toFixed(2)} ({entry.source})
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <div className="card-premium rounded-xl p-4 space-y-2">
        <p className="text-xs text-gray-500 font-mono">
          💡 Preços podem ser atualizados manualmente clicando em "✏ Editar" ou buscando automaticamente
        </p>
        <p className="text-xs text-gray-500 font-mono">
          💡 Cada atualização é registrada com timestamp e fonte para auditoria
        </p>
        <p className="text-xs text-gray-500 font-mono">
          💡 Operadores usam sempre o preço atual ao criar novos orçamentos
        </p>
      </div>
      </div>
    </div>
  );
};

export default AdminPriceManager;
