import DatabasePool from './databasePool.js';

const DB_NAME    = 'AstonDB';
const DB_VERSION = 3;

const STORES = {
  MATERIALS:  'materials',
  CLIENTS:    'clients',
  QUOTATIONS: 'quotations',
  PARTS:      'parts',
  USERS:      'users',
  CAD_FILES:  'cadFiles',
};

let db = null;

// Cache simples para melhor performance
const cache = {
  clients: null,
  materials: null,
  quotations: null,
  users: null,
  lastUpdate: {}
};

const invalidateCache = (store) => {
  cache[store] = null;
  cache.lastUpdate[store] = null;
};

export const initDB = async () => {
  try {
    db = await DatabasePool.getInstance().getDB();
    console.log('✅ Database initialized via pool');
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

// ── helpers ────────────────────────────────────────────────────────────────
const getAll = (store) => new Promise((res, rej) => {
  // Usar cache se disponível (menos de 5 segundos)
  if (cache[store] && cache.lastUpdate[store] && Date.now() - cache.lastUpdate[store] < 5000) {
    return res(cache[store]);
  }

  const t = db.transaction([store], 'readonly');
  const r = t.objectStore(store).getAll();
  r.onerror = () => rej(r.error);
  r.onsuccess = () => {
    cache[store] = r.result;
    cache.lastUpdate[store] = Date.now();
    res(r.result);
  };
});
const putOne = (store, obj) => new Promise((res, rej) => {
  const t = db.transaction([store], 'readwrite');
  const r = t.objectStore(store).put(obj);
  r.onerror = () => rej(r.error);
  r.onsuccess = () => {
    invalidateCache(store);
    res(r.result);
  };
});

const addOne = (store, obj) => new Promise((res, rej) => {
  const t = db.transaction([store], 'readwrite');
  const r = t.objectStore(store).add(obj);
  r.onerror = () => rej(r.error);
  r.onsuccess = () => {
    invalidateCache(store);
    res(r.result);
  };
});

const delOne = (store, id) => new Promise((res, rej) => {
  const t = db.transaction([store], 'readwrite');
  const r = t.objectStore(store).delete(id);
  r.onerror = () => rej(r.error);
  r.onsuccess = () => {
    invalidateCache(store);
    res(r.result);
  };
});

// ── materials ──────────────────────────────────────────────────────────────
export const getMaterials    = () => getAll(STORES.MATERIALS);
export const addMaterial     = (m) => addOne(STORES.MATERIALS, {
  id: m.id || Date.now().toString(),
  name: m.name,
  density: m.density || 7850,
  costPrice: m.costPrice || 0,      // Preço de compra (R$/kg)
  sellPrice: m.sellPrice || 100,    // Preço de venda (R$/kg)
  basePrice: m.basePrice || m.sellPrice || 100,  // Compatibilidade (igual a sellPrice)
  lastPriceUpdate: m.lastPriceUpdate || null
});
export const updateMaterial  = (m) => putOne(STORES.MATERIALS, m);
export const deleteMaterial  = (id) => delOne(STORES.MATERIALS, id);

// ── clients ────────────────────────────────────────────────────────────────
export const getClients   = () => getAll(STORES.CLIENTS);
export const addClient = (c) => {
  const clientWithId = { id: c.id || Date.now().toString(), ...c };
  return new Promise((res, rej) => {
    const t = db.transaction([STORES.CLIENTS], 'readwrite');
    const r = t.objectStore(STORES.CLIENTS).add(clientWithId);
    r.onerror = () => rej(r.error);
    r.onsuccess = () => {
      invalidateCache(STORES.CLIENTS);
      res(r.result);
    };
  });
};

export const updateClient = (c) => {
  return new Promise((res, rej) => {
    const t = db.transaction([STORES.CLIENTS], 'readwrite');
    const r = t.objectStore(STORES.CLIENTS).put(c);
    r.onerror = () => rej(r.error);
    r.onsuccess = () => {
      invalidateCache(STORES.CLIENTS);
      res(r.result);
    };
  });
};
export const deleteClient = (id) => delOne(STORES.CLIENTS, id);

// ── quotations ─────────────────────────────────────────────────────────────
export const getQuotations   = () => getAll(STORES.QUOTATIONS);
export const addQuotation    = (q) => addOne(STORES.QUOTATIONS, {
  ...q,
  id: Date.now().toString(),
  date: new Date().toISOString(),
  editHistory: [],
  cadFileId: q.cadFileId || null,
  cadFileName: q.cadFileName || null,
  importedLayers: q.importedLayers || null
});
export const updateQuotation = (q) => putOne(STORES.QUOTATIONS, q);

export const cleanDuplicateQuotations = async () => {
  const all = await getAll(STORES.QUOTATIONS);
  if (all.length === 0) return;

  const seenNumbers = new Set();
  const duplicateIds = [];

  all.forEach(q => {
    if (q.number && seenNumbers.has(q.number)) {
      duplicateIds.push(q.id);
    } else if (q.number) {
      seenNumbers.add(q.number);
    }
  });

  for (const id of duplicateIds) {
    await delOne(STORES.QUOTATIONS, id);
  }

  return duplicateIds.length;
};

// ── users ──────────────────────────────────────────────────────────────────
export const getAllUsers      = () => getAll(STORES.USERS);
export const addUser         = (u) => addOne(STORES.USERS, u);
export const updateUser      = (u) => putOne(STORES.USERS, u);
export const deleteUser      = (id) => delOne(STORES.USERS, id);

// ── import/restore ─────────────────────────────────────────────────────────
export const clearAllStores = async () => {
  const storeNames = Object.values(STORES);
  for (const storeName of storeNames) {
    const t = db.transaction([storeName], 'readwrite');
    const req = t.objectStore(storeName).clear();
    await new Promise((res, rej) => {
      req.onerror = () => rej(req.error);
      req.onsuccess = () => {
        invalidateCache(storeName);
        res();
      };
    });
  }
};

export const importBackup = async (backup) => {
  try {
    // Limpar banco atual
    await clearAllStores();

    // Importar cada tipo de dado em batch (mais rápido)
    const imported = {};

    if (backup.materials?.length) {
      await new Promise((res, rej) => {
        const t = db.transaction([STORES.MATERIALS], 'readwrite');
        const st = t.objectStore(STORES.MATERIALS);
        for (const m of backup.materials) st.put(m);
        t.onerror = () => rej(t.error);
        t.oncomplete = () => {
          invalidateCache(STORES.MATERIALS);
          res();
        };
      });
      imported.materials = backup.materials.length;
    }

    if (backup.clients?.length) {
      await new Promise((res, rej) => {
        const t = db.transaction([STORES.CLIENTS], 'readwrite');
        const st = t.objectStore(STORES.CLIENTS);
        for (const c of backup.clients) st.put(c);
        t.onerror = () => rej(t.error);
        t.oncomplete = () => {
          invalidateCache(STORES.CLIENTS);
          res();
        };
      });
      imported.clients = backup.clients.length;
    }

    if (backup.users?.length) {
      await new Promise((res, rej) => {
        const t = db.transaction([STORES.USERS], 'readwrite');
        const st = t.objectStore(STORES.USERS);
        for (const u of backup.users) st.put(u);
        t.onerror = () => rej(t.error);
        t.oncomplete = () => {
          invalidateCache(STORES.USERS);
          res();
        };
      });
      imported.users = backup.users.length;
    }

    if (backup.quotations?.length) {
      await new Promise((res, rej) => {
        const t = db.transaction([STORES.QUOTATIONS], 'readwrite');
        const st = t.objectStore(STORES.QUOTATIONS);
        for (const q of backup.quotations) st.put(q);
        t.onerror = () => rej(t.error);
        t.oncomplete = () => {
          invalidateCache(STORES.QUOTATIONS);
          res();
        };
      });
      imported.quotations = backup.quotations.length;
    }

    if (backup.cadFiles?.length) {
      await new Promise((res, rej) => {
        const t = db.transaction([STORES.CAD_FILES], 'readwrite');
        const st = t.objectStore(STORES.CAD_FILES);
        for (const cf of backup.cadFiles) st.put(cf);
        t.onerror = () => rej(t.error);
        t.oncomplete = () => {
          invalidateCache(STORES.CAD_FILES);
          res();
        };
      });
      imported.cadFiles = backup.cadFiles.length;
    }

    return {
      success: true,
      imported
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
