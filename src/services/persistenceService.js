import { initDB, addQuotation, updateQuotation, getQuotations, addClient, updateClient, getClients, addMaterial, updateMaterial, getMaterials, addUser, updateUser, getAllUsers } from './storageService';

const AUDIT_STORE = 'auditLogs';
const ARCHIVE_STORE = 'archivedData';
const BACKUP_KEY = 'metalflow_backup_latest';
const SYNC_KEY = 'metalflow_sync_timestamp';

let db = null;

export const initPersistence = async () => {
  try {
    db = await initDB();

    // Criar stores de auditoria e arquivo se não existirem
    const request = indexedDB.open('AstonDB', 2);

    return new Promise((resolve, reject) => {
      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        if (!database.objectStoreNames.contains(AUDIT_STORE)) {
          const auditStore = database.createObjectStore(AUDIT_STORE, { keyPath: 'id', autoIncrement: true });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
          auditStore.createIndex('entityType', 'entityType', { unique: false });
          auditStore.createIndex('entityId', 'entityId', { unique: false });
          auditStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!database.objectStoreNames.contains(ARCHIVE_STORE)) {
          const archiveStore = database.createObjectStore(ARCHIVE_STORE, { keyPath: 'id' });
          archiveStore.createIndex('archivedAt', 'archivedAt', { unique: false });
          archiveStore.createIndex('entityType', 'entityType', { unique: false });
        }
      };

      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar persistência:', error);
    throw error;
  }
};

// ── AUDITORIA ──────────────────────────────────────────────────────────────

const logAudit = async (action, entityType, entityId, userId, changes = {}) => {
  if (!db) return;

  try {
    const transaction = db.transaction([AUDIT_STORE], 'readwrite');
    const store = transaction.objectStore(AUDIT_STORE);

    const logEntry = {
      action,
      entityType,
      entityId,
      userId,
      changes,
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(logEntry);
      request.onsuccess = () => resolve(logEntry);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Erro ao registrar auditoria:', error);
  }
};

export const getAuditLog = async (filters = {}) => {
  if (!db) return [];

  try {
    const transaction = db.transaction([AUDIT_STORE], 'readonly');
    const store = transaction.objectStore(AUDIT_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let logs = request.result;

        if (filters.entityType) logs = logs.filter(l => l.entityType === filters.entityType);
        if (filters.entityId) logs = logs.filter(l => l.entityId === filters.entityId);
        if (filters.userId) logs = logs.filter(l => l.userId === filters.userId);
        if (filters.action) logs = logs.filter(l => l.action === filters.action);

        logs.sort((a, b) => b.timestampMs - a.timestampMs);
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Erro ao buscar auditoria:', error);
    return [];
  }
};

// ── QUOTATIONS COM AUDITORIA ──────────────────────────────────────────────

export const createQuotationWithAudit = async (quotation, userId = 'system') => {
  const id = Date.now().toString();
  const newQuotation = {
    ...quotation,
    id,
    date: new Date().toISOString(),
    createdBy: userId,
    createdAt: new Date().toISOString(),
    editHistory: [
      {
        timestamp: new Date().toISOString(),
        editedBy: userId,
        changes: { status: 'created' },
      }
    ],
  };

  try {
    await addQuotation(newQuotation);
    await logAudit('CREATE', 'quotation', id, userId, { number: quotation.number });
    return newQuotation;
  } catch (error) {
    console.error('❌ Erro ao criar orçamento:', error);
    throw error;
  }
};

export const updateQuotationWithAudit = async (quotation, userId = 'system', changes = {}) => {
  const oldQuotation = await new Promise((resolve) => {
    const transaction = db.transaction(['quotations'], 'readonly');
    const request = transaction.objectStore('quotations').get(quotation.id);
    request.onsuccess = () => resolve(request.result);
  });

  const updatedQuotation = {
    ...quotation,
    editHistory: [
      ...(quotation.editHistory || []),
      {
        timestamp: new Date().toISOString(),
        editedBy: userId,
        changes: changes || { status: quotation.status },
        previousValues: oldQuotation ? { status: oldQuotation.status } : {},
      }
    ],
  };

  try {
    await updateQuotation(updatedQuotation);
    await logAudit('UPDATE', 'quotation', quotation.id, userId, changes);
    return updatedQuotation;
  } catch (error) {
    console.error('❌ Erro ao atualizar orçamento:', error);
    throw error;
  }
};

// ── ARQUIVO (Soft Delete) ──────────────────────────────────────────────────

export const archiveQuotation = async (quotationId, userId = 'system') => {
  if (!db) return;

  try {
    const transaction = db.transaction(['quotations', ARCHIVE_STORE], 'readwrite');
    const quotationStore = transaction.objectStore('quotations');
    const archiveStore = transaction.objectStore(ARCHIVE_STORE);

    const getRequest = quotationStore.get(quotationId);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = async () => {
        const quotation = getRequest.result;
        if (!quotation) {
          reject(new Error('Orçamento não encontrado'));
          return;
        }

        const archivedEntry = {
          id: `archived_${quotationId}`,
          originalId: quotationId,
          entityType: 'quotation',
          data: quotation,
          archivedAt: new Date().toISOString(),
          archivedBy: userId,
        };

        const archiveAddRequest = archiveStore.add(archivedEntry);
        const deleteRequest = quotationStore.delete(quotationId);

        archiveAddRequest.onsuccess = () => {
          deleteRequest.onsuccess = async () => {
            await logAudit('ARCHIVE', 'quotation', quotationId, userId, {});
            resolve(archivedEntry);
          };
        };

        archiveAddRequest.onerror = () => reject(archiveAddRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('❌ Erro ao arquivar:', error);
    throw error;
  }
};

export const getArchivedData = async (filters = {}) => {
  if (!db) return [];

  try {
    const transaction = db.transaction([ARCHIVE_STORE], 'readonly');
    const store = transaction.objectStore(ARCHIVE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let archived = request.result;

        if (filters.entityType) archived = archived.filter(a => a.entityType === filters.entityType);
        if (filters.archivedBy) archived = archived.filter(a => a.archivedBy === filters.archivedBy);

        archived.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
        resolve(archived);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Erro ao buscar arquivo:', error);
    return [];
  }
};

export const restoreFromArchive = async (archivedId, userId = 'system') => {
  if (!db) return;

  try {
    const transaction = db.transaction([ARCHIVE_STORE, 'quotations'], 'readwrite');
    const archiveStore = transaction.objectStore(ARCHIVE_STORE);
    const quotationStore = transaction.objectStore('quotations');

    const getRequest = archiveStore.get(archivedId);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const archived = getRequest.result;
        if (!archived) {
          reject(new Error('Item arquivado não encontrado'));
          return;
        }

        const restored = archived.data;
        const addRequest = quotationStore.add(restored);
        const deleteRequest = archiveStore.delete(archivedId);

        addRequest.onsuccess = () => {
          deleteRequest.onsuccess = async () => {
            await logAudit('RESTORE', 'quotation', archived.originalId, userId, {});
            resolve(restored);
          };
        };

        addRequest.onerror = () => reject(addRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('❌ Erro ao restaurar:', error);
    throw error;
  }
};

// ── BACKUP AUTOMÁTICO ──────────────────────────────────────────────────────

export const exportBackup = async () => {
  try {
    const quotations = await getQuotations();
    const clients = await getClients();
    const materials = await getMaterials();
    const users = await getAllUsers();
    const auditLogs = await getAuditLog();
    const archived = await getArchivedData();

    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        quotations,
        clients,
        materials,
        users,
      },
      metadata: {
        auditLogs,
        archived,
        totalQuotations: quotations.length,
        totalClients: clients.length,
        totalMaterials: materials.length,
      },
    };

    // Salvar em localStorage
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));

    // Salvar timestamp de sincronização
    localStorage.setItem(SYNC_KEY, new Date().toISOString());

    return backup;
  } catch (error) {
    console.error('❌ Erro ao fazer backup:', error);
    throw error;
  }
};

export const downloadBackup = async () => {
  try {
    const backup = await exportBackup();

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `metalflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    return backup;
  } catch (error) {
    console.error('❌ Erro ao baixar backup:', error);
    throw error;
  }
};

export const importBackup = async (backupData, userId = 'system') => {
  try {
    const { data } = backupData;

    let imported = { quotations: 0, clients: 0, materials: 0, users: 0 };

    if (data.materials && Array.isArray(data.materials)) {
      for (const material of data.materials) {
        try {
          await addMaterial(material);
          imported.materials++;
        } catch (e) {
          // Material pode já existir
          await updateMaterial(material);
          imported.materials++;
        }
      }
    }

    if (data.clients && Array.isArray(data.clients)) {
      for (const client of data.clients) {
        try {
          await addClient(client);
          imported.clients++;
        } catch (e) {
          await updateClient(client);
          imported.clients++;
        }
      }
    }

    if (data.quotations && Array.isArray(data.quotations)) {
      for (const quotation of data.quotations) {
        try {
          await addQuotation(quotation);
          imported.quotations++;
        } catch (e) {
          await updateQuotation(quotation);
          imported.quotations++;
        }
      }
    }

    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        try {
          await addUser(user);
          imported.users++;
        } catch (e) {
          await updateUser(user);
          imported.users++;
        }
      }
    }

    await logAudit('IMPORT', 'backup', 'system', userId, imported);

    return imported;
  } catch (error) {
    console.error('❌ Erro ao importar backup:', error);
    throw error;
  }
};

// ── SINCRONIZAÇÃO ENTRE ABAS ────────────────────────────────────────────

export const enableTabSync = (onDataChange) => {
  const handleStorageChange = (e) => {
    if (e.key === SYNC_KEY) {
      console.log('🔄 Sincronizando dados com outra aba...');
      onDataChange?.();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export const triggerTabSync = () => {
  localStorage.setItem(SYNC_KEY, new Date().toISOString());
};

// ── VALIDAÇÃO DE BANCO ──────────────────────────────────────────────────

export const validateDatabase = async () => {
  try {
    const quotations = await getQuotations();
    const clients = await getClients();
    const materials = await getMaterials();
    const users = await getAllUsers();

    const validation = {
      isHealthy: true,
      timestamp: new Date().toISOString(),
      stats: {
        quotations: quotations.length,
        clients: clients.length,
        materials: materials.length,
        users: users.length,
      },
      issues: [],
    };

    // Validar quotations órfãs
    const orphanedQuotations = quotations.filter(q =>
      !clients.find(c => c.id === q.clientId)
    );
    if (orphanedQuotations.length > 0) {
      validation.issues.push({
        severity: 'warning',
        message: `${orphanedQuotations.length} orçamentos com clientes deletados`,
      });
    }

    // Validar quotations sem status
    const noStatusQuotations = quotations.filter(q => !q.status);
    if (noStatusQuotations.length > 0) {
      validation.issues.push({
        severity: 'warning',
        message: `${noStatusQuotations.length} orçamentos sem status`,
      });
    }

    validation.isHealthy = validation.issues.length === 0;

    return validation;
  } catch (error) {
    console.error('❌ Erro ao validar banco:', error);
    return {
      isHealthy: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      stats: {},
      issues: [{ severity: 'error', message: error.message }],
    };
  }
};
