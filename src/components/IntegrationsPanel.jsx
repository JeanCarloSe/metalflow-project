import React, { useState, useEffect, useCallback } from 'react';
import { getIntegrationStatus } from '../services/integrationsService';
import Toast from './Toast';
import { useIntegration } from '../hooks/useIntegration';
import { INTEGRATIONS_CONFIG, SECURITY_TIPS } from '../constants/integrations';

const IntegrationsPanel = ({ onClose }) => {
  const [status, setStatus] = useState({});
  const [credentials, setCredentials] = useState({});
  const [expandedIntegration, setExpandedIntegration] = useState(null);
  const [toast, setToast] = useState(null);

  const { connecting, connect, disconnect } = useIntegration((type, message) => {
    setToast({ type, message });
  });

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = useCallback(() => {
    setStatus(getIntegrationStatus());
  }, []);

  const handleConnect = useCallback(async (integrationId, credentialValue) => {
    const success = await connect(integrationId, credentialValue);
    if (success) {
      loadStatus();
      setCredentials(prev => ({ ...prev, [integrationId]: '' }));
    }
  }, [connect, loadStatus]);

  const handleDisconnect = useCallback((integrationId) => {
    if (window.confirm('Tem certeza que deseja desconectar? Esta ação não pode ser desfeita.')) {
      const success = disconnect(integrationId);
      if (success) {
        loadStatus();
      }
    }
  }, [disconnect, loadStatus]);

  const IntegrationCard = ({ config, enabled, connectedAt }) => {
    const isExpanded = expandedIntegration === config.id;
    const isComing = config.status === 'coming_soon';
    const isActive = config.status === 'active';

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
        <button
          onClick={() => !isComing && setExpandedIntegration(isExpanded ? null : config.id)}
          disabled={isComing}
          className={`w-full p-5 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between ${!isComing && 'cursor-pointer hover:from-gray-100'}`}
          aria-expanded={isExpanded}
          aria-label={`Integração ${config.title}`}
        >
          <div className="flex items-center gap-4 flex-1 text-left">
            <span className="text-3xl" aria-hidden="true">{config.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-base">{config.title}</h3>
              <p className="text-xs text-gray-600 mt-1">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {isActive && (
              enabled ? (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                  ✓ Ativo
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  ◯ Inativo
                </span>
              )
            )}
            {isComing && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                🔜 Em breve
              </span>
            )}
            {!isComing && (
              <span className="text-gray-400 text-lg transition-transform" aria-hidden="true">
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
          </div>
        </button>

        {isExpanded && isActive && (
          <div className="border-t border-gray-200 p-5 bg-white space-y-4 animate-slideDown">
            {enabled ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    ✓ Conectado em {new Date(connectedAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDisconnect(config.id)}
                  className="w-full px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-colors border border-red-200 text-sm"
                  aria-label={`Desconectar ${config.title}`}
                >
                  Desconectar Integração
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor={`credential-${config.id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                    {config.credentialLabel}
                  </label>
                  <input
                    id={`credential-${config.id}`}
                    type={config.credentialType}
                    value={credentials[config.id] || ''}
                    onChange={e => setCredentials({ ...credentials, [config.id]: e.target.value })}
                    placeholder={config.credentialPlaceholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    aria-describedby={`help-${config.id}`}
                  />
                  <p id={`help-${config.id}`} className="text-xs text-gray-600 mt-2">
                    {config.helpText}
                    {config.docLink && (
                      <a href={config.docLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        Documentação →
                      </a>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleConnect(config.id, credentials[config.id])}
                  disabled={connecting[config.id] || !credentials[config.id]?.trim()}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                  aria-label={`Conectar ${config.title}`}
                >
                  {connecting[config.id] ? '🔄 Conectando...' : `Conectar ${config.title}`}
                </button>
              </>
            )}
          </div>
        )}

        {isExpanded && isComing && (
          <div className="border-t border-gray-200 p-5 bg-blue-50">
            <p className="text-sm text-blue-800">
              Essa integração em breve. Entre em contato com o suporte para mais informações.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Integrações</h2>
              <p className="text-sm text-gray-600 mt-1">Conecte seus serviços favoritos</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fechar painel de integrações"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-3">
            {Object.values(INTEGRATIONS_CONFIG).map(config => (
              <IntegrationCard
                key={config.id}
                config={config}
                enabled={status[config.id]?.enabled}
                connectedAt={status[config.id]?.connectedAt}
              />
            ))}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-900">Dicas de Segurança</p>
              <ul className="space-y-1">
                {SECURITY_TIPS.slice(0, 2).map((tip, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="flex-shrink-0">🔒</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>
    </>
  );
};

export default IntegrationsPanel;
