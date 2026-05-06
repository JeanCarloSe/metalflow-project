import { useEffect, useState } from 'react';
import SyncService from '../services/syncService.js';

/**
 * 🔄 Hook para gerenciar sincronização offline-first
 */
export const useSync = () => {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: localStorage.getItem('metalflow_lastSync'),
    pendingChanges: 0,
  });

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const syncService = SyncService.getInstance();

    // Sincronizar ao montar
    syncService.syncNow();

    // Listeners
    const updateStatus = () => {
      setSyncStatus(syncService.getStatus());
    };

    syncService.on('online', () => {
      updateStatus();
      addNotification('✅ Volta online - sincronizando...', 'success');
    });

    syncService.on('offline', () => {
      updateStatus();
      addNotification('❌ Sem internet - trabalhe offline', 'warning');
    });

    syncService.on('synced', (data) => {
      updateStatus();
      addNotification('✅ Sincronizado com sucesso', 'success');
    });

    syncService.on('syncError', (error) => {
      updateStatus();
      addNotification(`❌ Erro na sincronização: ${error.message}`, 'error');
    });

    syncService.on('changesUploaded', (results) => {
      addNotification(`✅ ${results.imported} mudanças enviadas`, 'success');
    });

    // Update status periodicamente
    const statusInterval = setInterval(updateStatus, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto-remove após 3 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  return {
    ...syncStatus,
    notifications,
    syncNow: () => SyncService.getInstance().syncNow(),
    trackChange: (entity, data) => SyncService.getInstance().trackChange(entity, data),
  };
};

export default useSync;
