import * as dxf from 'dxf';

/**
 * Parse arquivo DXF
 */
export const parseDxfFile = async (file) => {
  try {
    const text = await file.text();
    console.log('[parseDxfFile] File loaded:', text.length, 'bytes');

    // Verificar se dxf.parseString existe
    if (typeof dxf.parseString !== 'function') {
      console.error('[parseDxfFile] dxf.parseString not found. Available:', Object.keys(dxf).join(', '));
      throw new Error('parseString não está disponível');
    }

    const dxfData = dxf.parseString(text);
    console.log('[parseDxfFile] Parsed. Entities:', dxfData?.entities?.length || 0);

    return dxfData;
  } catch (error) {
    console.error('[parseDxfFile] Error:', error);
    throw new Error(`Erro ao fazer parse do DXF: ${error.message}`);
  }
};

/**
 * Extrair layers com dimensões e informações
 */
export const extractLayers = (dxfData) => {
  if (!dxfData?.entities || dxfData.entities.length === 0) {
    return [];
  }

  const layerMap = {};
  let hasValidLayers = false;

  dxfData.entities.forEach(entity => {
    if (!entity) return;
    const layerName = entity.layer || 'Padrão';
    if (!layerMap[layerName]) layerMap[layerName] = [];
    layerMap[layerName].push(entity);
    if (layerName !== '0') hasValidLayers = true;
  });

  const layers = Object.entries(layerMap)
    .map(([layerName, entities]) => {
      const boundingBox = calculateBoundingBox(entities);
      const width = Math.round((boundingBox.maxX - boundingBox.minX) * 1000) / 1000;
      const height = Math.round((boundingBox.maxY - boundingBox.minY) * 1000) / 1000;

      return {
        name: layerName,
        entityCount: entities.length,
        width,
        height,
        depth: Math.round((boundingBox.maxZ - boundingBox.minZ) * 1000) / 1000,
        minX: boundingBox.minX,
        minY: boundingBox.minY,
        minZ: boundingBox.minZ,
        scale: 1,
        selected: true,
        entities
      };
    })
    .filter(layer => layer.width > 0 && layer.height > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  return layers;
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
        const x1 = entity.start?.x || 0;
        const y1 = entity.start?.y || 0;
        const z1 = entity.start?.z || 0;
        const x2 = entity.end?.x || 0;
        const y2 = entity.end?.y || 0;
        const z2 = entity.end?.z || 0;
        minX = Math.min(minX, x1, x2);
        maxX = Math.max(maxX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxY = Math.max(maxY, y1, y2);
        minZ = Math.min(minZ, z1, z2);
        maxZ = Math.max(maxZ, z1, z2);
        break;

      case 'CIRCLE':
      case 'ARC':
        // Estrutura do dxf: x, y, r (não center e radius)
        const cx = entity.x || entity.center?.x || 0;
        const cy = entity.y || entity.center?.y || 0;
        const cz = entity.z || entity.center?.z || 0;
        const radius = entity.r || entity.radius || 0;
        minX = Math.min(minX, cx - radius);
        maxX = Math.max(maxX, cx + radius);
        minY = Math.min(minY, cy - radius);
        maxY = Math.max(maxY, cy + radius);
        minZ = Math.min(minZ, cz);
        maxZ = Math.max(maxZ, cz);
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
        minX = Math.min(minX, entity.position?.x || entity.x || 0);
        maxX = Math.max(maxX, entity.position?.x || entity.x || 0);
        minY = Math.min(minY, entity.position?.y || entity.y || 0);
        maxY = Math.max(maxY, entity.position?.y || entity.y || 0);
        minZ = Math.min(minZ, entity.position?.z || entity.z || 0);
        maxZ = Math.max(maxZ, entity.position?.z || entity.z || 0);
        break;

      default:
        // Tentar x,y,z direto
        if (entity.x !== undefined || entity.y !== undefined) {
          minX = Math.min(minX, entity.x || 0);
          maxX = Math.max(maxX, entity.x || 0);
          minY = Math.min(minY, entity.y || 0);
          maxY = Math.max(maxY, entity.y || 0);
          minZ = Math.min(minZ, entity.z || 0);
          maxZ = Math.max(maxZ, entity.z || 0);
        } else if (entity.position) {
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
      thicknessMm: Math.max(1, Math.round(layer.depth * 10) / 10 || 1),
      quantity: layer.entityCount || 1,
      services: services || [],
      priceAdjustmentPercent: 0,
      sourceLayer: layer.name,
      sourceLayerEntities: layer.entityCount
    }));
};

/**
 * Validar layers e retornar avisos
 */
export const validateLayers = (layers) => {
  const MIN_DIMENSION = 10; // mm
  const MAX_DIMENSION = 5000; // mm
  const MIN_THICKNESS = 0.5; // mm

  return layers.map(layer => {
    const warnings = [];

    if (layer.entityCount === 0) {
      warnings.push('Layer vazia - nenhuma entidade encontrada');
    }

    if (layer.width < MIN_DIMENSION || layer.height < MIN_DIMENSION) {
      warnings.push(`Dimensões muito pequenas (mín: ${MIN_DIMENSION}mm)`);
    }

    if (layer.width > MAX_DIMENSION || layer.height > MAX_DIMENSION) {
      warnings.push(`Dimensões muito grandes (máx: ${MAX_DIMENSION}mm)`);
    }

    if (layer.depth < MIN_THICKNESS && layer.depth > 0) {
      warnings.push(`Espessura muito fina (mín: ${MIN_THICKNESS}mm)`);
    }

    return {
      ...layer,
      warnings,
      isValid: warnings.length === 0
    };
  });
};

/**
 * Estimar peso da layer baseado em dimensões e material
 */
export const estimateWeight = (layer, material) => {
  if (!material || !material.density) return 0;

  const lengthM = layer.width / 1000;
  const widthM = layer.height / 1000;
  const thicknessM = (layer.depth || 1) / 1000;

  const volumeM3 = lengthM * widthM * thicknessM;
  return volumeM3 * material.density;
};

/**
 * Sugerir material baseado no peso estimado
 */
export const suggestMaterial = (weight, materials) => {
  if (!materials || materials.length === 0) return null;

  // Sugerir aço para peças acima de 5kg, alumínio para menores
  if (weight > 5) {
    return materials.find(m => m.name.toLowerCase().includes('aço')) || materials[0];
  } else {
    return materials.find(m => m.name.toLowerCase().includes('alumínio')) || materials[0];
  }
};
