/**
 * 📁 CAD File Service - Gerencia arquivos DXF/DWG importados
 * Usa DatabasePool para evitar vazamento de conexões
 */

import DatabasePool from './databasePool.js';

const STORE_NAME = 'cadFiles';

/**
 * Salvar arquivo CAD importado
 */
export const saveCadFile = async (cadFile) => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const fileData = {
        id: `cad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: cadFile.fileName,
        clientId: cadFile.clientId,
        quotationId: cadFile.quotationId || null,
        fileContent: cadFile.fileContent, // Base64 encoded
        fileSize: cadFile.fileSize,
        layers: cadFile.layers, // Array de layers
        createdAt: new Date().toISOString(),
        importedBy: cadFile.importedBy,
        description: cadFile.description || '',
        status: 'active'
      };

      const req = store.add(fileData);

      req.onsuccess = () => {
        console.log(`✅ CAD file saved: ${fileData.fileName}`);
        resolve(fileData);
      };

      req.onerror = () => {
        const error = new Error(`Failed to save CAD file: ${req.error}`);
        reject(error);
      };

      tx.onerror = () => {
        reject(new Error(`Transaction error: ${tx.error}`));
      };
    });
  } catch (error) {
    console.error('❌ Error saving CAD file:', error);
    throw error;
  }
};

/**
 * Obter arquivos CAD de um cliente
 */
export const getCadFilesByClient = async (clientId) => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('clientId');

      const req = index.getAll(clientId);

      req.onsuccess = () => {
        console.log(`✅ Retrieved ${req.result.length} CAD files for client ${clientId}`);
        resolve(req.result || []);
      };

      req.onerror = () => {
        reject(new Error(`Failed to get CAD files: ${req.error}`));
      };

      tx.onerror = () => {
        reject(new Error(`Transaction error: ${tx.error}`));
      };
    });
  } catch (error) {
    console.error('❌ Error getting CAD files:', error);
    return [];
  }
};

/**
 * Obter arquivos CAD de um orçamento
 */
export const getCadFilesByQuotation = async (quotationId) => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('quotationId');

      const req = index.getAll(quotationId);

      req.onsuccess = () => {
        resolve(req.result || []);
      };

      req.onerror = () => {
        reject(new Error(`Failed to get CAD files: ${req.error}`));
      };

      tx.onerror = () => {
        reject(new Error(`Transaction error: ${tx.error}`));
      };
    });
  } catch (error) {
    console.error('❌ Error getting CAD files by quotation:', error);
    return [];
  }
};

/**
 * Obter conteúdo de um arquivo CAD específico
 */
export const getCadFileContent = async (cadFileId) => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const req = store.get(cadFileId);

      req.onsuccess = () => {
        if (req.result) {
          console.log(`✅ Retrieved CAD file: ${req.result.fileName}`);
          resolve(req.result);
        } else {
          reject(new Error('CAD file not found'));
        }
      };

      req.onerror = () => {
        reject(new Error(`Failed to get CAD file: ${req.error}`));
      };

      tx.onerror = () => {
        reject(new Error(`Transaction error: ${tx.error}`));
      };
    });
  } catch (error) {
    console.error('❌ Error getting CAD file content:', error);
    throw error;
  }
};

/**
 * Deletar arquivo CAD
 */
export const deleteCadFile = async (cadFileId) => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const req = store.delete(cadFileId);

      req.onsuccess = () => {
        console.log(`✅ CAD file deleted: ${cadFileId}`);
        resolve(true);
      };

      req.onerror = () => {
        reject(new Error(`Failed to delete CAD file: ${req.error}`));
      };

      tx.onerror = () => {
        reject(new Error(`Transaction error: ${tx.error}`));
      };
    });
  } catch (error) {
    console.error('❌ Error deleting CAD file:', error);
    throw error;
  }
};

/**
 * Atualizar status de arquivo CAD
 */
export const updateCadFileStatus = async (cadFileId, status) => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const getReq = store.get(cadFileId);

      getReq.onsuccess = () => {
        const cadFile = getReq.result;
        if (!cadFile) {
          reject(new Error('CAD file not found'));
          return;
        }

        cadFile.status = status;
        const updateReq = store.put(cadFile);

        updateReq.onsuccess = () => {
          console.log(`✅ CAD file status updated to: ${status}`);
          resolve(cadFile);
        };

        updateReq.onerror = () => {
          reject(new Error(`Failed to update CAD file: ${updateReq.error}`));
        };
      };

      getReq.onerror = () => {
        reject(new Error(`Failed to get CAD file: ${getReq.error}`));
      };

      tx.onerror = () => {
        reject(new Error(`Transaction error: ${tx.error}`));
      };
    });
  } catch (error) {
    console.error('❌ Error updating CAD file status:', error);
    throw error;
  }
};

/**
 * Obter todas CAD files (para backup)
 */
export const getAllCadFiles = async () => {
  try {
    const db = await DatabasePool.getInstance().getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      const req = store.getAll();

      req.onsuccess = () => {
        console.log(`✅ Retrieved ${req.result.length} total CAD files`);
        resolve(req.result || []);
      };

      req.onerror = () => {
        reject(new Error(`Failed to get all CAD files: ${req.error}`));
      };

      tx.onerror = () => {
        reject(new Error(`Transaction error: ${tx.error}`));
      };
    });
  } catch (error) {
    console.error('❌ Error getting all CAD files:', error);
    return [];
  }
};

/**
 * Obter histórico de CAD files (para exibição)
 */
export const getCadFileHistory = async (cadFileId) => {
  try {
    const cadFile = await getCadFileContent(cadFileId);
    if (!cadFile) return [];

    return [{
      date: cadFile.createdAt,
      action: 'imported',
      user: cadFile.importedBy,
      fileName: cadFile.fileName
    }];
  } catch (error) {
    console.error('❌ Error getting CAD file history:', error);
    return [];
  }
};

/**
 * Arquivar arquivo CAD (marcar como inativo)
 */
export const archiveCadFile = async (cadFileId) => {
  return updateCadFileStatus(cadFileId, 'archived');
};
