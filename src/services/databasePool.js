/**
 * 🗄️ DatabasePool - Gerencia conexão única com IndexedDB
 * Evita múltiplas conexões abertas que causam travamentos
 */

class DatabasePool {
  static instance = null;
  static db = null;
  static DB_NAME = 'AstonDB';
  static DB_VERSION = 3;
  static isConnecting = false;

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabasePool();
    }
    return this.instance;
  }

  async getDB() {
    // Se já está conectado, retornar imediatamente
    if (DatabasePool.db) {
      return DatabasePool.db;
    }

    // Evitar múltiplas tentativas simultâneas de conexão
    if (DatabasePool.isConnecting) {
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (DatabasePool.db) {
            clearInterval(checkConnection);
            resolve(DatabasePool.db);
          }
        }, 50);
      });
    }

    DatabasePool.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(
          DatabasePool.DB_NAME,
          DatabasePool.DB_VERSION
        );

        request.onsuccess = () => {
          DatabasePool.db = request.result;
          DatabasePool.isConnecting = false;
          console.log('✅ Database pool connected to AstonDB v3');
          resolve(DatabasePool.db);
        };

        request.onerror = () => {
          DatabasePool.isConnecting = false;
          const error = new Error(`Database error: ${request.error}`);
          console.error('❌ Database pool error:', error);
          reject(error);
        };

        request.onupgradeneeded = (event) => {
          console.log('📦 Upgrading database schema...');
          this.setupSchema(event.target.result);
        };

        request.onblocked = () => {
          console.warn('⚠️ Database upgrade blocked by other connections');
        };
      } catch (error) {
        DatabasePool.isConnecting = false;
        console.error('❌ Failed to open database:', error);
        reject(error);
      }
    });
  }

  setupSchema(db) {
    const stores = [
      'clients',
      'quotations',
      'materials',
      'users',
      'cadFiles',
      'settings',
      'auditLog'
    ];

    stores.forEach((storeName) => {
      if (!db.objectStoreNames.contains(storeName)) {
        try {
          db.createObjectStore(storeName, { keyPath: 'id' });
          console.log(`📦 Created store: ${storeName}`);
        } catch (error) {
          console.error(`Error creating store ${storeName}:`, error);
        }
      }
    });
  }

  async transaction(storeNames, mode = 'readonly') {
    const db = await this.getDB();
    if (!db) {
      throw new Error('Database not available');
    }
    return db.transaction(storeNames, mode);
  }

  async transactionWithPromise(storeNames, mode, callback) {
    try {
      const tx = await this.transaction(storeNames, mode);
      return await new Promise((resolve, reject) => {
        callback(tx, resolve, reject);
        tx.oncomplete = () => {
          console.log(`✅ Transaction complete: ${storeNames.join(', ')}`);
        };
        tx.onerror = () => {
          reject(new Error(`Transaction failed: ${tx.error}`));
        };
        tx.onabort = () => {
          reject(new Error('Transaction aborted'));
        };
      });
    } catch (error) {
      console.error('❌ Transaction error:', error);
      throw error;
    }
  }

  disconnect() {
    if (DatabasePool.db) {
      DatabasePool.db.close();
      DatabasePool.db = null;
      console.log('🔌 Database pool disconnected');
    }
  }

  async healthCheck() {
    try {
      const db = await this.getDB();
      if (!db) return false;

      const tx = db.transaction(['clients'], 'readonly');
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export default DatabasePool;
