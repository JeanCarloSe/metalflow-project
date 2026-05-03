import { default as DxfParser } from 'dxf';

/**
 * Parse arquivo DXF
 */
export const parseDxfFile = async (file) => {
  try {
    const text = await file.text();
    const dxfData = new DxfParser().parseSync(text);
    return dxfData;
  } catch (error) {
    throw new Error(`Erro ao fazer parse do DXF: ${error.message}`);
  }
};

/**
 * Extrair layers com dimensões e informações
 */
export const extractLayers = (dxfData) => {
  if (!dxfData || !dxfData.layers) {
    return [];
  }

  const layers = [];

  // Iterar sobre cada layer
  Object.entries(dxfData.layers).forEach(([layerName, layer]) => {
    if (!layer || !layer.entities || layer.entities.length === 0) {
      return;
    }

    // Calcular bounding box
    const boundingBox = calculateBoundingBox(layer.entities);
    
    const layerData = {
      name: layerName,
      entityCount: layer.entities.length,
      width: Math.round((boundingBox.maxX - boundingBox.minX) * 1000) / 1000,
      height: Math.round((boundingBox.maxY - boundingBox.minY) * 1000) / 1000,
      depth: Math.round((boundingBox.maxZ - boundingBox.minZ) * 1000) / 1000,
      minX: boundingBox.minX,
      minY: boundingBox.minY,
      minZ: boundingBox.minZ,
      scale: 1,
      selected: true,
      entities: layer.entities
    };

    // Validar dimensões mínimas
    if (layerData.width > 0 && layerData.height > 0) {
      layers.push(layerData);
    }
  });

  return layers.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Calcular bounding box das entidades
 */
const calculateBoundingBox = (entities) => {
  let minX = Infinity,  maxX = -Infinity;
  let minY = Infinity,  maxY = -Infinity;
  let minZ = Infinity,  maxZ = -Infinity;

  entities.forEach(entity => {
    if (!entity) return;

    // Diferentes tipos de entidades têm propriedades diferentes
    switch (entity.type) {
      case 'LWPOLYLINE':
      case 'POLYLINE':
        if (entity.vertices) {
          entity.vertices.forEach(v => {
            minX = Math.min(minX, v.x || 0);
            maxX = Math.max(maxX, v.x || 0);
            minY = Math.min(minY, v.y || 0);
            maxY = Math.max(maxY, v.y || 0);
            minZ = Math.min(minZ, v.z || 0);
            maxZ = Math.max(maxZ, v.z || 0);
          });
        }
        break;

      case 'LINE':
      case 'MLINE':
        minX = Math.min(minX, entity.start?.x || 0, entity.end?.x || 0);
        maxX = Math.max(maxX, entity.start?.x || 0, entity.end?.x || 0);
        minY = Math.min(minY, entity.start?.y || 0, entity.end?.y || 0);
        maxY = Math.max(maxY, entity.start?.y || 0, entity.end?.y || 0);
        minZ = Math.min(minZ, entity.start?.z || 0, entity.end?.z || 0);
        maxZ = Math.max(maxZ, entity.start?.z || 0, entity.end?.z || 0);
        break;

      case 'CIRCLE':
      case 'ARC':
        const radius = entity.radius || 0;
        minX = Math.min(minX, (entity.center?.x || 0) - radius);
        maxX = Math.max(maxX, (entity.center?.x || 0) + radius);
        minY = Math.min(minY, (entity.center?.y || 0) - radius);
        maxY = Math.max(maxY, (entity.center?.y || 0) + radius);
        minZ = Math.min(minZ, entity.center?.z || 0);
        maxZ = Math.max(maxZ, entity.center?.z || 0);
        break;

      case 'RECT':
      case 'RECTANGLE':
        if (entity.vertices && entity.vertices.length >= 2) {
          entity.vertices.forEach(v => {
            minX = Math.min(minX, v.x || 0);
            maxX = Math.max(maxX, v.x || 0);
            minY = Math.min(minY, v.y || 0);
            maxY = Math.max(maxY, v.y || 0);
            minZ = Math.min(minZ, v.z || 0);
            maxZ = Math.max(maxZ, v.z || 0);
          });
        }
        break;

      case 'POINT':
        minX = Math.min(minX, entity.position?.x || 0);
        maxX = Math.max(maxX, entity.position?.x || 0);
        minY = Math.min(minY, entity.position?.y || 0);
        maxY = Math.max(maxY, entity.position?.y || 0);
        minZ = Math.min(minZ, entity.position?.z || 0);
        maxZ = Math.max(maxZ, entity.position?.z || 0);
        break;

      default:
        if (entity.position) {
          minX = Math.min(minX, entity.position.x || 0);
          maxX = Math.max(maxX, entity.position.x || 0);
          minY = Math.min(minY, entity.position.y || 0);
          maxY = Math.max(maxY, entity.position.y || 0);
          minZ = Math.min(minZ, entity.position.z || 0);
          maxZ = Math.max(maxZ, entity.position.z || 0);
        }
    }
  });

  // Se nenhuma entidade foi processada, retornar valores padrão
  if (minX === Infinity) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
  }

  return { minX, maxX, minY, maxY, minZ, maxZ };
};

/**
 * Converter layers selecionadas para items de orçamento
 */
export const convertToQuotationItems = (selectedLayers, materialId, services) => {
  return selectedLayers
    .filter(layer => layer.selected)
    .map(layer => ({
      id: Date.now() + Math.random(),
      name: layer.name,
      materialId: materialId,
      lengthMm: Math.max(1, Math.round(layer.width * 10) / 10),
      widthMm: Math.max(1, Math.round(layer.height * 10) / 10),
      thicknessMm: Math.max(1, Math.round(layer.depth * 10) / 10 || 1), // 1mm se 2D
      quantity: layer.entityCount || 1,
      services: services || [],
      priceAdjustmentPercent: 0
    }));
};
