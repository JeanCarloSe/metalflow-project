const DB_NAME = 'MetalFlowDB';
const DB_VERSION = 1;

const STORES = {
  MATERIALS: 'materials',
  CLIENTS: 'clients',
  QUOTATIONS: 'quotations',
  PARTS: 'parts',
};

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORES.MATERIALS)) {
        const materialsStore = database.createObjectStore(STORES.MATERIALS, { keyPath: 'id' });
        materialsStore.createIndex('name', 'name', { unique: true });
      }

      if (!database.objectStoreNames.contains(STORES.CLIENTS)) {
        const clientsStore = database.createObjectStore(STORES.CLIENTS, { keyPath: 'id' });
        clientsStore.createIndex('name', 'name', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.QUOTATIONS)) {
        const quotationsStore = database.createObjectStore(STORES.QUOTATIONS, { keyPath: 'id' });
        quotationsStore.createIndex('clientId', 'clientId', { unique: false });
        quotationsStore.createIndex('date', 'date', { unique: false });
      }

      if (!database.objectStoreNames.contains(STORES.PARTS)) {
        const partsStore = database.createObjectStore(STORES.PARTS, { keyPath: 'id' });
        partsStore.createIndex('quotationId', 'quotationId', { unique: false });
      }
    };
  });
};

export const getMaterials = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MATERIALS], 'readonly');
    const store = transaction.objectStore(STORES.MATERIALS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const addMaterial = (material) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MATERIALS], 'readwrite');
    const store = transaction.objectStore(STORES.MATERIALS);
    const request = store.add({
      id: material.id || Date.now().toString(),
      name: material.name,
      density: material.density || 7850,
      basePrice: material.basePrice || 100,
    });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getClients = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CLIENTS], 'readonly');
    const store = transaction.objectStore(STORES.CLIENTS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getQuotations = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.QUOTATIONS], 'readonly');
    const store = transaction.objectStore(STORES.QUOTATIONS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};
