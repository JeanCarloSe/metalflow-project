/**
 * 🔄 SyncService - Gerenciador de sincronização offline-first
 * Sincroniza dados entre IndexedDB local e backend remoto
 */

import DatabasePool from './databasePool.js';
import backendApi from './apiBackendService.js';
import demoBackendService from './demoBackendService.js';

class SyncService {
  static instance = null;

  static getInstance() {
    if (!this.instance) {
      this.instance = new SyncService();
    }
    return this.instance;
  }

  constructor() {
    this.isOnline = navigator.onLine;
    this.lastSyncTime = localStorage.getItem('metalflow_lastSync') || null;
    this.isSyncing = false;
    this.changeLog = [];
    this.listeners = new Map();
    this.useDemo = false;
    this.backendApi = backendApi;

    this.initialize();
  }

  /**
   * 🔌 Obter API a usar (real ou demo)
   */
  getApi() {
    return this.useDemo ? demoBackendService : this.backendApi;
  }

  /**
   * 🔌 Inicializar sync service
   */
  async initialize() {
    console.log('🔄 Inicializando SyncService...');

    // Detectar mudanças de conexão
    window.addEventListener('online', () => this.onOnline());
    window.addEventListener('offline', () => this.onOffline());

    // Sincronizar periodicamente (a cada 5 min)
    setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncNow();
      }
    }, 5 * 60 * 1000);

    console.log('✅ SyncService inicializado');
  }

  /**
   * 📡 Quando volta online
   */
  async onOnline() {
    console.log('✅ Volta online - sincronizando...');
    this.isOnline = true;
    this.emit('online');

    // Sincronizar imediatamente
    await this.syncNow();
  }

  /**
   * 📡 Quando fica offline
   */
  onOffline() {
    console.log('❌ Modo offline ativado');
    this.isOnline = false;
    this.emit('offline');
  }

  /**
   * 🔄 Sincronizar agora
   */
  async syncNow() {
    if (this.isSyncing) {
      console.log('⏳ Sincronização já em andamento...');
      return;
    }

    this.isSyncing = true;
    console.log('🔄 Iniciando sincronização...');

    try {
      // Verificar se está online
      if (!this.isOnline) {
        console.log('📴 Offline - pulando sincronização');
        this.isSyncing = false;
        return;
      }

      // Se não tem lastSyncTime, fazer snapshot (primeira vez)
      if (!this.lastSyncTime) {
        await this.importSnapshot();
      } else {
        // Caso contrário, fazer sync incremental
        await this.syncIncremental();
      }

      this.lastSyncTime = new Date().toISOString();
      localStorage.setItem('metalflow_lastSync', this.lastSyncTime);

      console.log('✅ Sincronização concluída');
      this.emit('synced', {
        timestamp: new Date(),
        lastSyncTime: this.lastSyncTime,
      });
    } catch (error) {
      const errorMsg = error?.message || String(error) || 'Erro desconhecido';
      console.error('❌ Erro na sincronização:', errorMsg);
      console.error('   Stack:', error?.stack);

      // Se for erro de conexão e não estamos em demo mode, ativar demo
      if (!this.useDemo && (
        errorMsg.includes('fetch') ||
        errorMsg.includes('network') ||
        errorMsg.includes('Failed') ||
        errorMsg.includes('Backend') ||
        errorMsg.includes('Cannot') ||
        errorMsg.includes('null')
      )) {
        console.log('📱 Ativando modo demo (backend indisponível)');
        this.useDemo = true;

        // Tentar sincronizar novamente em modo demo
        try {
          if (!this.lastSyncTime) {
            await this.importSnapshot();
          } else {
            await this.syncIncremental();
          }

          this.lastSyncTime = new Date().toISOString();
          localStorage.setItem('metalflow_lastSync', this.lastSyncTime);

          console.log('✅ Modo demo ativado com sucesso');
          this.emit('synced', {
            timestamp: new Date(),
            lastSyncTime: this.lastSyncTime,
            isDemoMode: true,
          });
        } catch (demoError) {
          console.error('❌ Erro até no modo demo:', demoError);
          this.emit('syncWarning', {
            message: '⚠️ Trabalhando em modo offline local. Backend indisponível.',
          });
        }
      } else {
        this.emit('syncError', {
          error: errorMsg,
          details: error
        });
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 📥 Importar snapshot (primeira sincronização)
   */
  async importSnapshot() {
    console.log('📥 Importando snapshot completo...');

    try {
      const api = this.getApi();
      const response = await api.getSyncSnapshot();

      if (!response) {
        throw new Error('Backend não respondeu (null response)');
      }

      if (response.ok && response.snapshot) {
        const { clients, materials, quotations, lines } = response.snapshot;

        const db = DatabasePool.getInstance();
        const pool = db;

        // Salvar clientes
        if (clients && clients.length > 0) {
          for (const client of clients) {
            await pool.transactionWithPromise(
              ['clients'],
              'readwrite',
              (tx, resolve) => {
                const store = tx.objectStore('clients');
                store.put(client);
                resolve();
              }
            );
          }
          console.log(`✅ Importados ${clients.length} clientes`);
        }

        // Salvar materiais
        if (materials && materials.length > 0) {
          for (const material of materials) {
            await pool.transactionWithPromise(
              ['materials'],
              'readwrite',
              (tx, resolve) => {
                const store = tx.objectStore('materials');
                store.put(material);
                resolve();
              }
            );
          }
          console.log(`✅ Importados ${materials.length} materiais`);
        }

        // Salvar orçamentos
        if (quotations && quotations.length > 0) {
          for (const quotation of quotations) {
            await pool.transactionWithPromise(
              ['quotations'],
              'readwrite',
              (tx, resolve) => {
                const store = tx.objectStore('quotations');
                store.put(quotation);
                resolve();
              }
            );
          }
          console.log(`✅ Importados ${quotations.length} orçamentos`);
        }

        // Snapshot importado com sucesso
        this.changeLog = [];
      }
    } catch (error) {
      console.error('❌ Erro ao importar snapshot:', error);
      throw error;
    }
  }

  /**
   * 🔄 Sincronização incremental (delta sync)
   */
  async syncIncremental() {
    console.log('🔄 Sincronização incremental desde:', this.lastSyncTime);

    try {
      const api = this.getApi();

      // 1. Enviar mudanças locais
      const changes = this.changeLog;
      if (changes.length > 0) {
        console.log(`📤 Enviando ${changes.length} mudanças offline...`);

        await this.uploadLocalChanges(changes);
        this.changeLog = [];
      }

      // 2. Buscar mudanças remotas
      console.log('📥 Buscando mudanças remotas...');
      const delta = await api.getSyncDelta(this.lastSyncTime);

      if (!delta) {
        console.warn('⚠️ Backend não respondeu no delta');
        return;
      }

      if (delta.ok && delta.delta) {
        await this.applyDelta(delta.delta);
      } else {
        console.warn('⚠️ Resposta delta inválida:', delta);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização incremental:', error);
      throw error;
    }
  }

  /**
   * 📤 Enviar mudanças locais
   */
  async uploadLocalChanges(changes) {
    try {
      const api = this.getApi();

      // Agrupar mudanças por tipo
      const grouped = {
        clients: changes.filter(c => c.entity === 'clients').map(c => c.data),
        materials: changes.filter(c => c.entity === 'materials').map(c => c.data),
        quotations: changes.filter(c => c.entity === 'quotations').map(c => c.data),
      };

      const response = await api.importSyncChanges(grouped);

      if (response.ok) {
        console.log(`✅ Mudanças sincronizadas:`, response.results);
        this.emit('changesUploaded', response.results);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mudanças:', error);
      throw error;
    }
  }

  /**
   * 📥 Aplicar delta (mudanças remotas)
   */
  async applyDelta(delta) {
    try {
      const db = DatabasePool.getInstance();
      const { clients, materials, quotations, deletions } = delta;

      // Aplicar mudanças de clientes
      if (clients && clients.length > 0) {
        for (const client of clients) {
          await db.transactionWithPromise(
            ['clients'],
            'readwrite',
            (tx, resolve) => {
              const store = tx.objectStore('clients');
              store.put(client);
              resolve();
            }
          );
        }
        console.log(`✅ Atualizados ${clients.length} clientes`);
      }

      // Aplicar mudanças de materiais
      if (materials && materials.length > 0) {
        for (const material of materials) {
          await db.transactionWithPromise(
            ['materials'],
            'readwrite',
            (tx, resolve) => {
              const store = tx.objectStore('materials');
              store.put(material);
              resolve();
            }
          );
        }
        console.log(`✅ Atualizados ${materials.length} materiais`);
      }

      // Aplicar mudanças de orçamentos
      if (quotations && quotations.length > 0) {
        for (const quotation of quotations) {
          await db.transactionWithPromise(
            ['quotations'],
            'readwrite',
            (tx, resolve) => {
              const store = tx.objectStore('quotations');
              store.put(quotation);
              resolve();
            }
          );
        }
        console.log(`✅ Atualizados ${quotations.length} orçamentos`);
      }

      // Processar deletions
      if (deletions && deletions.length > 0) {
        for (const deletion of deletions) {
          const { entity_type, entity_id } = deletion;
          await db.transactionWithPromise(
            [entity_type],
            'readwrite',
            (tx, resolve) => {
              const store = tx.objectStore(entity_type);
              store.delete(entity_id);
              resolve();
            }
          );
        }
        console.log(`✅ Removidos ${deletions.length} registros`);
      }

      this.emit('deltaApplied', delta);
    } catch (error) {
      console.error('❌ Erro ao aplicar delta:', error);
      throw error;
    }
  }

  /**
   * 📝 Rastrear mudança local
   */
  trackChange(entity, data) {
    this.changeLog.push({
      entity,
      data,
      timestamp: new Date().toISOString(),
    });
    console.log(`📝 Mudança rastreada: ${entity}`, data.id);
  }

  /**
   * 🎧 Adicionar listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 🔔 Emitir evento
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro no listener de ${event}:`, error);
        }
      });
    }
  }

  /**
   * 📊 Obter status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.changeLog.length,
    };
  }
}

export default SyncService;
