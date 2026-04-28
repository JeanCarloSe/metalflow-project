const DB_NAME    = 'AstonDB';
const DB_VERSION = 2;

const STORES = {
  MATERIALS:  'materials',
  CLIENTS:    'clients',
  QUOTATIONS: 'quotations',
  PARTS:      'parts',
  USERS:      'users',
};

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => { db = request.result; resolve(db); };

    request.onupgradeneeded = (event) => {
      const database  = event.target.result;
      const oldVersion = event.oldVersion;

      if (!database.objectStoreNames.contains(STORES.MATERIALS)) {
        const s = database.createObjectStore(STORES.MATERIALS, { keyPath: 'id' });
        s.createIndex('name', 'name', { unique: true });
      }
      if (!database.objectStoreNames.contains(STORES.CLIENTS)) {
        const s = database.createObjectStore(STORES.CLIENTS, { keyPath: 'id' });
        s.createIndex('name', 'name', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.QUOTATIONS)) {
        const s = database.createObjectStore(STORES.QUOTATIONS, { keyPath: 'id' });
        s.createIndex('clientId', 'clientId', { unique: false });
        s.createIndex('date',     'date',     { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.PARTS)) {
        database.createObjectStore(STORES.PARTS, { keyPath: 'id' });
      }
      // v2: users
      if (oldVersion < 2 && !database.objectStoreNames.contains(STORES.USERS)) {
        const s = database.createObjectStore(STORES.USERS, { keyPath: 'id' });
        s.createIndex('login', 'login', { unique: true });
      }
    };
  });
};

// ── helpers ────────────────────────────────────────────────────────────────
const getAll  = (store)  => new Promise((res, rej) => { const t = db.transaction([store], 'readonly'); const r = t.objectStore(store).getAll(); r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result); });
const putOne  = (store, obj) => new Promise((res, rej) => { const t = db.transaction([store], 'readwrite'); const r = t.objectStore(store).put(obj); r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result); });
const addOne  = (store, obj) => new Promise((res, rej) => { const t = db.transaction([store], 'readwrite'); const r = t.objectStore(store).add(obj); r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result); });
const delOne  = (store, id) => new Promise((res, rej) => { const t = db.transaction([store], 'readwrite'); const r = t.objectStore(store).delete(id); r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result); });
const getByIndex = (store, index, value) => new Promise((res, rej) => { const t = db.transaction([store], 'readonly'); const r = t.objectStore(store).index(index).get(value); r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result || null); });

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
export const addClient    = (c) => addOne(STORES.CLIENTS, { id: c.id || Date.now().toString(), ...c });
export const updateClient = (c) => putOne(STORES.CLIENTS, c);
export const deleteClient = (id) => delOne(STORES.CLIENTS, id);

// ── quotations ─────────────────────────────────────────────────────────────
export const getQuotations   = () => getAll(STORES.QUOTATIONS);
export const addQuotation    = (q) => addOne(STORES.QUOTATIONS, { ...q, id: Date.now().toString(), date: new Date().toISOString(), editHistory: [] });
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
export const getUserByLogin  = (login) => getByIndex(STORES.USERS, 'login', login);
export const deleteUser      = (id) => delOne(STORES.USERS, id);
