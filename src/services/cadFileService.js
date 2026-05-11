/**
 * CAD File Service - In-memory session storage for DXF imports
 * Files are held in memory during the session only (no local persistence)
 */

const cadFilesCache = new Map();

export const saveCadFile = async (cadFile) => {
  const fileData = {
    id: `cad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fileName: cadFile.fileName,
    clientId: cadFile.clientId,
    quotationId: cadFile.quotationId || null,
    fileContent: cadFile.fileContent,
    fileSize: cadFile.fileSize,
    layers: cadFile.layers,
    createdAt: new Date().toISOString(),
    importedBy: cadFile.importedBy,
    description: cadFile.description || '',
    status: 'active',
  };
  cadFilesCache.set(fileData.id, fileData);
  return fileData;
};

export const getCadFilesByClient = async (clientId) => {
  return [...cadFilesCache.values()].filter(
    f => f.clientId === clientId && f.status === 'active'
  );
};

export const getCadFileContent = async (fileId) => {
  return cadFilesCache.get(fileId) || null;
};

export const deleteCadFile = async (fileId) => {
  const file = cadFilesCache.get(fileId);
  if (file) {
    cadFilesCache.set(fileId, { ...file, status: 'deleted' });
  }
  return true;
};
