import React, { useState, useEffect } from 'react';
import { hexToRgba, ASTON_BRAND } from '../services/themeService';
import { getMarketPrices, setMarketPrice, getPriceHistory, getSourceUrls } from '../services/priceService';
import { fetchAllPrices, getPriceFetchState, getAveragePricesFromLastFetch } from '../services/priceFetchService';

const MarketPriceModal = ({ materials, onClose, onUpdate }) => {
  const [prices, setPrices] = useState({});
  const [editing, setEditing] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [source, setSource] = useState('Manual');
  const [tab, setTab] = useState('update');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [fetchResults, setFetchResults] = useState([]);
  const [fetchState, setFetchState] = useState(null);

  useEffect(() => {
    setPrices(getMarketPrices());
    setFetchState(getPriceFetchState());
  }, []);

  const handleSavePrice = (materialName) => {
    const price = parseFloat(newPrice);
    if (!price || price <= 0) return;

    setMarketPrice(materialName, price, source);
    setPrices(getMarketPrices());
    setEditing(null);
    setNewPrice('');
    setSource('Manual');
    onUpdate?.();
  };

  const handleFetchPrices = async () => {
    setIsFetching(true);
    setFetchProgress(0);
    setFetchResults([]);

    try {
      const results = await fetchAllPrices((progress) => {
        setFetchProgress(Math.round((progress.current / progress.total) * 100));
      });
      setFetchResults(results);
      setFetchState(getPriceFetchState());
    } catch (error) {
      console.error('Erro ao buscar preços:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleApplyFetchedPrices = () => {
    const averages = getAveragePricesFromLastFetch();
    Object.entries(averages).forEach(([materialName, price]) => {
      const material = materials.find(m => m.name === materialName);
      if (material) {
        setMarketPrice(materialName, price, 'Busca Automática');
      }
    });
    setPrices(getMarketPrices());
    onUpdate?.();
  };

  const sourceUrls = getSourceUrls();

  const inputCls = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="font-bold text-gray-100">Preços de Mercado</p>
            <p className="text-xs font-mono text-gray-500 mt-0.5">Atualizar custos dos materiais</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl font-mono">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 px-6 overflow-x-auto">
          {[
            { id: 'update', label: 'Atualizar preços' },
            { id: 'fetch', label: 'Buscar preços' },
            { id: 'sources', label: 'Fontes de dados' },
            { id: 'history', label: 'Histórico' }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-3 text-sm font-mono font-medium transition-all border-b-2 whitespace-nowrap"
              style={tab === t.id
                ? { color: ASTON_BRAND, borderColor: ASTON_BRAND }
                : { color: '#6b7280', borderColor: 'transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {tab === 'update' && (
            <div className="space-y-4">
              {materials.map(mat => {
                const mPrice = prices[mat.name];
                return (
                  <div key={mat.id} className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-100">{mat.name}</p>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">
                          Preço atual: <span style={{ color: ASTON_BRAND }}>R$ {mat.basePrice.toFixed(2)}</span>
                          {mPrice?.lastChecked && (
                            <span className="text-gray-600 ml-2">
                              (Atualizado: {new Date(mPrice.lastChecked).toLocaleDateString('pt-BR')})
                            </span>
                          )}
                        </p>
                      </div>

                      {editing === mat.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={newPrice}
                            onChange={e => setNewPrice(e.target.value)}
                            placeholder="Novo preço"
                            className="w-28 px-2 py-1.5 bg-gray-900 border border-blue-500/40 rounded text-sm font-mono text-gray-100 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <select
                            value={source}
                            onChange={e => setSource(e.target.value)}
                            className="px-2 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs font-mono text-gray-100 focus:outline-none focus:border-blue-500"
                          >
                            <option>Manual</option>
                            {Object.entries(sourceUrls).map(([key, val]) => (
                              <option key={key} value={val.name}>{val.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSavePrice(mat.name)}
                            className="px-3 py-1.5 text-xs font-mono text-green-400 hover:text-green-300 rounded hover:bg-green-950/40 transition-all"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-3 py-1.5 text-xs font-mono text-gray-500 hover:text-gray-300 rounded hover:bg-gray-700/40 transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditing(mat.id); setNewPrice(String(mat.basePrice)); }}
                          className="px-3 py-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 border border-blue-500/40 rounded hover:bg-blue-950/40 transition-all"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'fetch' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-300 font-mono mb-2">
                  Busca automática de preços (Abril 2026)
                </p>
                <p className="text-xs text-gray-400 font-mono mb-2">
                  <span style={{color: ASTON_BRAND}}>Aço Carbono:</span> R$ 4,25/kg  |
                  <span style={{color: ASTON_BRAND}}> Inox 304:</span> R$ 5,30/kg  |
                  <span style={{color: ASTON_BRAND}}> Alumínio:</span> R$ 6,00/kg
                </p>
                <p className="text-xs text-gray-500 font-mono mb-3">
                  Variação realista: ±8% | Fontes: AçoBrasil, Bepex, Metals-API, LME
                </p>

                {fetchState && fetchState.lastFetchAt && (
                  <p className="text-xs text-gray-500 font-mono mb-3">
                    Última atualização: {new Date(fetchState.lastFetchAt).toLocaleString('pt-BR')}
                    {' · '}
                    <span className="text-green-400">{fetchState.successCount || 0} fontes obtidas</span>
                  </p>
                )}

                <button
                  onClick={handleFetchPrices}
                  disabled={isFetching}
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-mono font-bold transition-all"
                  style={{
                    backgroundColor: isFetching ? '#374151' : ASTON_BRAND,
                    color: isFetching ? '#9ca3af' : 'white',
                    cursor: isFetching ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isFetching ? `Buscando... ${fetchProgress}%` : '🔄 Buscar Preços Agora'}
                </button>

                {isFetching && (
                  <div className="mt-3 w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    <div
                      className="h-2 transition-all"
                      style={{ width: `${fetchProgress}%`, backgroundColor: ASTON_BRAND }}
                    />
                  </div>
                )}
              </div>

              {fetchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-100">Resultados da busca:</p>
                  {fetchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border font-mono text-xs ${
                        result.success
                          ? 'bg-green-950/40 border-green-500/30'
                          : 'bg-red-950/40 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">{result.source}</span>
                        {result.success ? (
                          <span className="text-green-400">✓ OK</span>
                        ) : (
                          <span className="text-red-400">✕ Erro</span>
                        )}
                      </div>
                      {result.success && result.prices ? (
                        <div className="text-gray-400">
                          {Object.entries(result.prices).map(([mat, price]) => (
                            <div key={mat}>
                              {mat}: <span className="text-green-400">R$ {price.toFixed(2)}/kg</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-red-400">{result.error || 'Erro desconhecido'}</div>
                      )}
                    </div>
                  ))}

                  {fetchResults.some(r => r.success) && (
                    <button
                      onClick={handleApplyFetchedPrices}
                      className="w-full mt-4 py-2.5 px-4 rounded-lg text-sm font-mono font-bold text-white transition-all"
                      style={{ backgroundColor: '#10b981' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                      ✓ Aplicar Preços Buscados
                    </button>
                  )}
                </div>
              )}

              {!isFetching && fetchResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-mono text-sm">
                    Clique em "Buscar Preços Agora" para atualizar automaticamente
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'sources' && (
            <div className="space-y-3">
              <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-400 font-mono">
                  <span style={{color: ASTON_BRAND}}>📈 Preços Base (Abril 2026):</span><br/>
                  Aço Carbono: R$ 4,25/kg (bobinas laminadas) | Inox 304: R$ 5,30/kg | Alumínio: R$ 6,00/kg
                </p>
              </div>

              <p className="text-xs text-gray-500 font-mono mb-4">
                Fontes de dados consultadas para atualização de preços:
              </p>
              {Object.entries(sourceUrls).map(([key, source]) => (
                <a
                  key={key}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 bg-gray-900/60 border border-gray-700/40 rounded-xl hover:border-blue-500/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-100">{source.name}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{source.materialType}</p>
                    </div>
                    <span className="text-blue-400 text-lg">↗</span>
                  </div>
                  <p className="text-xs font-mono text-gray-600 truncate">{source.url}</p>
                </a>
              ))}
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-4">
              {materials.map(mat => {
                const history = getPriceHistory(mat.name);
                return (
                  <div key={mat.id}>
                    <p className="font-semibold text-gray-100 mb-2">{mat.name}</p>
                    {history.length === 0 ? (
                      <p className="text-xs text-gray-600 font-mono">Sem histórico de atualização</p>
                    ) : (
                      <div className="space-y-1.5">
                        {history.map((entry, i) => (
                          <div key={i} className="flex items-center justify-between text-xs font-mono bg-gray-900/40 px-3 py-2 rounded border border-gray-700/20">
                            <div className="flex-1">
                              <span className="text-gray-400">{new Date(entry.date).toLocaleString('pt-BR')}</span>
                              <span className="text-gray-500 mx-2">·</span>
                              <span className="text-gray-500">{entry.source}</span>
                            </div>
                            <span style={{ color: ASTON_BRAND }}>R$ {entry.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-700 px-6 py-4 flex gap-3 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-600 text-gray-300 font-mono text-sm rounded-lg hover:bg-gray-700/40 transition-all">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketPriceModal;
