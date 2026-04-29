/**
 * Sync Backend Service
 * Versão simplificada - apenas loga sincronização
 */

import apiBackendService from './apiBackendService';

class SyncBackendService {
  constructor() {
    this.syncInterval = null;
    this.isSyncing = false;
    this.lastSync = localStorage.getItem('quoteos_lastSync') || null;
    this.syncListeners = [];
  }

  async init() {
    console.log('🔄 Initializing sync service...');
    if (apiBackendService.isAuthenticated()) {
      try {
        await this.syncWithBackend();
      } catch (error) {
        console.warn('Initial sync failed:', error);
      }
    }
    this.startAutoSync();
    console.log('✅ Sync service initialized');
  }

  async syncWithBackend() {
    if (this.isSyncing || !apiBackendService.isOnline()) {
      return;
    }

    this.isSyncing = true;
    try {
      console.log('🔄 Syncing with backend...');
      this.notifyListeners({ isSyncing: true, status: 'Sincronizando...' });

      // Chamar backend para validar conexão
      await apiBackendService.getWorkflowStatuses();

      this.lastSync = new Date().toISOString();
      localStorage.setItem('quoteos_lastSync', this.lastSync);

      console.log('✅ Sync complete');
      this.notifyListeners({
        isSyncing: false,
        status: 'Sincronizado',
        lastSync: this.lastSync,
        isOnline: true,
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.notifyListeners({
        isSyncing: false,
        status: `Erro: ${error.message}`,
        isOnline: apiBackendService.isOnline(),
      });
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  startAutoSync() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(async () => {
      if (apiBackendService.isOnline() && !this.isSyncing) {
        try {
          await this.syncWithBackend();
        } catch (error) {
          console.warn('Auto-sync failed:', error.message);
        }
      }
    }, 30000);

    console.log('✅ Auto-sync started (every 30s)');
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }

  async syncNow() {
    return this.syncWithBackend();
  }

  getStatus() {
    return {
      isOnline: apiBackendService.isOnline(),
      isAuthenticated: apiBackendService.isAuthenticated(),
      isSyncing: this.isSyncing,
      lastSync: this.lastSync,
      autoSyncRunning: !!this.syncInterval,
    };
  }

  subscribe(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  notifyListeners(status) {
    this.syncListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  reset() {
    this.stopAutoSync();
    this.lastSync = null;
    localStorage.removeItem('quoteos_lastSync');
    localStorage.removeItem('quoteos_token');
  }
}

export default new SyncBackendService();
