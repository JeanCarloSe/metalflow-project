/**
 * 🔄 SyncService - Gerenciador de sincronização offline-first
 * Sincroniza dados entre IndexedDB local e backend remoto
 */

import DatabasePool from './databasePool.js';
import backendApi from './apiBackendService.js';

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

    this.initialize();
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
      console.error('❌ Erro na sincronização:', error);
      this.emit('syncError', { error });
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
      const response = await backendApi.getSyncSnapshot();

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
      // 1. Enviar mudanças locais
      const changes = this.changeLog;
      if (changes.length > 0) {
        console.log(`📤 Enviando ${changes.length} mudanças offline...`);

        await this.uploadLocalChanges(changes);
        this.changeLog = [];
      }

      // 2. Buscar mudanças remotas
      console.log('📥 Buscando mudanças remotas...');
      const delta = await backendApi.getSyncDelta(this.lastSyncTime);

      if (delta.ok && delta.delta) {
        await this.applyDelta(delta.delta);
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
      // Agrupar mudanças por tipo
      const grouped = {
        clients: changes.filter(c => c.entity === 'clients').map(c => c.data),
        materials: changes.filter(c => c.entity === 'materials').map(c => c.data),
        quotations: changes.filter(c => c.entity === 'quotations').map(c => c.data),
      };

      const response = await backendApi.importSyncChanges(grouped);

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
