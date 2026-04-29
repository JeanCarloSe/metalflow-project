import React, { useState, useEffect } from 'react';
import syncBackendService from '../services/syncBackendService';

const SyncStatusIndicator = () => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    status: 'Pronto',
    lastSync: null,
  });

  useEffect(() => {
    // Subscribe a mudanças de sync
    const unsubscribe = syncBackendService.subscribe(newStatus => {
      setStatus(prev => ({ ...prev, ...newStatus }));
    });

    // Checagem inicial
    setStatus(syncBackendService.getStatus());

    return unsubscribe;
  }, []);

  const getStatusColor = () => {
    if (status.isSyncing) return '#3B82F6'; // blue - syncing
    if (!status.isOnline) return '#EF4444'; // red - offline
    return '#10B981'; // green - online
  };

  const getStatusIcon = () => {
    if (status.isSyncing) return '⟳'; // spinning
    if (!status.isOnline) return '🔴'; // offline
    return '🟢'; // online
  };

  const getStatusLabel = () => {
    if (status.isSyncing) return 'Sincronizando...';
    if (!status.isOnline) return 'Offline';
    return status.status || 'Online';
  };

  const getLastSyncText = () => {
    if (!status.lastSync) return '';
    const date = new Date(status.lastSync);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    return date.toLocaleTimeString('pt-BR');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 70,
        right: 10,
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: `2px solid ${getStatusColor()}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 999,
        minWidth: '200px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          fontWeight: 'bold',
        }}
      >
        <span
          style={{
            fontSize: '16px',
            animation: status.isSyncing ? 'spin 1s linear infinite' : 'none',
          }}
        >
          {getStatusIcon()}
        </span>
        <span style={{ color: getStatusColor() }}>{getStatusLabel()}</span>
      </div>

      {/* Info */}
      <div style={{ color: '#666', fontSize: '11px', lineHeight: '1.5' }}>
        {status.lastSync && (
          <div>
            Última sync: <strong>{getLastSyncText()}</strong>
          </div>
        )}
        <div>
          {status.isOnline ? (
            <span style={{ color: '#10B981' }}>✓ Conectado</span>
          ) : (
            <span style={{ color: '#EF4444' }}>✗ Desconectado</span>
          )}
        </div>
      </div>

      {/* Sync Button */}
      <button
        onClick={() => syncBackendService.syncNow()}
        disabled={status.isSyncing || !status.isOnline}
        style={{
          marginTop: '8px',
          padding: '6px 8px',
          width: '100%',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: status.isSyncing || !status.isOnline ? '#E5E7EB' : '#0170B9',
          color: status.isSyncing || !status.isOnline ? '#999' : 'white',
          cursor: status.isSyncing || !status.isOnline ? 'not-allowed' : 'pointer',
          fontSize: '11px',
          fontWeight: 'bold',
          transition: 'all 0.2s',
        }}
      >
        {status.isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
      </button>

      {/* Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SyncStatusIndicator;
