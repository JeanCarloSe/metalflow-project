/**
 * Serviço para gerenciar arquivos CAD (DXF/DWG) importados
 * Armazena no IndexedDB com relacionamento com cliente e orçamento
 */

const DB_NAME = 'metalflow';
const STORE_NAME = 'cadFiles';

/**
 * Inicializar IndexedDB para CAD files
 */
export const initCadFileStore = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('clientId', 'clientId', { unique: false });
        store.createIndex('quotationId', 'quotationId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Salvar arquivo CAD importado
 */
export const saveCadFile = async (cadFile) => {
  const db = await initCadFileStore();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const fileData = {
      id: `cad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: cadFile.fileName,
      clientId: cadFile.clientId,
      quotationId: cadFile.quotationId,
      fileContent: cadFile.fileContent, // Base64 encoded
      fileSize: cadFile.fileSize,
      layers: cadFile.layers, // Array de layers extraídas
      createdAt: new Date().toISOString(),
      importedBy: cadFile.importedBy, // user.id
      description: cadFile.description || '',
      status: 'active' // active ou archived
    };
    
    const req = store.add(fileData);
    
    req.onsuccess = () => resolve(fileData);
    req.onerror = () => reject(req.error);
    
    tx.oncomplete = () => db.close();
  });
};

/**
 * Obter arquivos CAD de um cliente
 */
export const getCadFilesByClient = async (clientId) => {
  const db = await initCadFileStore();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('clientId');
    
    const req = index.getAll(clientId);
    
    req.onsuccess = () => {
      const files = req.result.filter(f => f.status === 'active');
      files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(files);
    };
    req.onerror = () => reject(req.error);
    
    tx.oncomplete = () => db.close();
  });
};

/**
 * Obter arquivos CAD de um orçamento
 */
export const getCadFilesByQuotation = async (quotationId) => {
  const db = await initCadFileStore();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('quotationId');
    
    const req = index.getAll(quotationId);
    
    req.onsuccess = () => {
      const files = req.result.filter(f => f.status === 'active');
      files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(files);
    };
    req.onerror = () => reject(req.error);
    
    tx.oncomplete = () => db.close();
  });
};

/**
 * Obter histórico de todos os CAD files
 */
export const getCadFileHistory = async (clientId, options = {}) => {
  const db = await initCadFileStore();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('clientId');
    
    const req = index.getAll(clientId);
    
    req.onsuccess = () => {
      let files = req.result;
      
      // Filtrar por status se especificado
      if (options.status) {
        files = files.filter(f => f.status === options.status);
      }
      
      // Ordenar por data (mais recente primeiro)
      files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Limitar resultados se especificado
      if (options.limit) {
        files = files.slice(0, options.limit);
      }
      
      resolve(files);
    };
    req.onerror = () => reject(req.error);
    
    tx.oncomplete = () => db.close();
  });
};

/**
 * Deletar arquivo CAD (marcar como archived)
 */
export const archiveCadFile = async (cadFileId) => {
  const db = await initCadFileStore();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const getReq = store.get(cadFileId);
    
    getReq.onsuccess = () => {
      const file = getReq.result;
      if (file) {
        file.status = 'archived';
        file.archivedAt = new Date().toISOString();
        store.put(file);
      }
    };
    
    tx.oncomplete = () => {
      resolve();
      db.close();
    };
    
    tx.onerror = () => reject(tx.error);
  });
};

/**
 * Obter estatísticas de arquivos CAD
 */
export const getCadFileStats = async (clientId) => {
  const files = await getCadFilesByClient(clientId);
  
  return {
    totalFiles: files.length,
    totalLayers: files.reduce((sum, f) => sum + (f.layers?.length || 0), 0),
    totalSize: files.reduce((sum, f) => sum + (f.fileSize || 0), 0),
    latestFile: files[0]?.createdAt || null,
    importedBy: [...new Set(files.map(f => f.importedBy))]
  };
};

/**
 * Exportar arquivo CAD (recuperar do banco)
 */
export const getCadFileContent = async (cadFileId) => {
  const db = await initCadFileStore();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const req = store.get(cadFileId);
    
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    
    tx.oncomplete = () => db.close();
  });
};
