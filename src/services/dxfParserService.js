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
 * Agora aceita: layers específicas, layer 0, ou tudo em uma única layer
 */
export const extractLayers = (dxfData) => {
  if (!dxfData?.entities || dxfData.entities.length === 0) {
    console.warn('[extractLayers] Nenhuma entidade encontrada no DXF');
    return [];
  }

  console.log('[extractLayers] Processando', dxfData.entities.length, 'entidades');

  const layerMap = {};
  const entityTypes = {};
  let hasNonBlockEntities = false;

  // Agrupar entidades por layer - ACEITAR TODAS
  dxfData.entities.forEach(entity => {
    if (!entity) return;

    // Contar tipos de entidades
    entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;

    // Usar layer da entidade ou "0" se não especificada
    const layerName = entity.layer || '0';
    if (!layerMap[layerName]) layerMap[layerName] = [];
    layerMap[layerName].push(entity);

    // Verificar se tem geometria real (não é apenas referência de bloco)
    if (entity.type !== 'INSERT') {
      hasNonBlockEntities = true;
    }
  });

  console.log('[extractLayers] Layers encontradas:', Object.keys(layerMap).length);
  console.log('[extractLayers] Tipos de entidades:', Object.entries(entityTypes).map(([k, v]) => `${k}(${v})`).join(', '));

  // Converter map em array de layers
  let layers = Object.entries(layerMap)
    .map(([layerName, entities]) => {
      const boundingBox = calculateBoundingBox(entities);
      let width = Math.round((boundingBox.maxX - boundingBox.minX) * 1000) / 1000;
      let height = Math.round((boundingBox.maxY - boundingBox.minY) * 1000) / 1000;
      let depth = Math.round((boundingBox.maxZ - boundingBox.minZ) * 1000) / 1000;

      // Se dimensões calculadas são 0, usar valor padrão
      if (width <= 0) width = 100;
      if (height <= 0) height = 100;
      if (depth <= 0) depth = 10;

      const layer = {
        name: layerName,
        entityCount: entities.length,
        width,
        height,
        depth,
        minX: boundingBox.minX,
        minY: boundingBox.minY,
        minZ: boundingBox.minZ,
        scale: 1,
        selected: true,
        entities,
        x: boundingBox.minX,
        y: boundingBox.minY,
        z: boundingBox.minZ
      };

      console.log(`[extractLayers] Layer "${layerName}": ${width}×${height}×${depth}mm, ${entities.length} entidades`);
      return layer;
    })
    .sort((a, b) => {
      // Ordenar: layers nomeadas primeiro, depois "0"
      if (a.name === '0') return 1;
      if (b.name === '0') return -1;
      return a.name.localeCompare(b.name);
    });

  // Se temos layers mas nenhuma com geometria real (só blocos), extrair dos blocos
  if (layers.length > 0 && !hasNonBlockEntities && dxfData.blocks) {
    console.log('[extractLayers] Apenas blocos/inserts encontrados. Extraindo de BLOCKS...');
    const blockLayers = extractFromBlocks(dxfData.blocks);
    if (blockLayers.length > 0) {
      console.log('[extractLayers] Encontrados', blockLayers.length, 'blocos');
      return blockLayers;
    }
  }

  return layers;
};

/**
 * Extrair layers de blocos (BLOCKS section)
 */
const extractFromBlocks = (blocks) => {
  if (!blocks) return [];

  return Object.entries(blocks)
    .filter(([name]) => !name.startsWith('*')) // Ignorar blocos internos
    .map(([blockName, blockData]) => {
      const entities = blockData?.entities || [];
      if (entities.length === 0) return null;

      const boundingBox = calculateBoundingBox(entities);
      let width = Math.round((boundingBox.maxX - boundingBox.minX) * 1000) / 1000;
      let height = Math.round((boundingBox.maxY - boundingBox.minY) * 1000) / 1000;
      let depth = Math.round((boundingBox.maxZ - boundingBox.minZ) * 1000) / 1000;

      if (width <= 0) width = 100;
      if (height <= 0) height = 100;
      if (depth <= 0) depth = 10;

      return {
        name: blockName,
        entityCount: entities.length,
        width,
        height,
        depth,
        minX: boundingBox.minX,
        minY: boundingBox.minY,
        minZ: boundingBox.minZ,
        scale: 1,
        selected: true,
        entities,
        x: boundingBox.minX,
        y: boundingBox.minY,
        z: boundingBox.minZ,
        isBlock: true
      };
    })
    .filter(layer => layer !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Calcular bounding box das entidades
 * Suporta: LINE, CIRCLE, ARC, POLYLINE, LWPOLYLINE, SPLINE, TEXT, SOLID, 3DFACE, ELLIPSE, etc
 */
const calculateBoundingBox = (entities) => {
  let minX = Infinity,  maxX = -Infinity;
  let minY = Infinity,  maxY = -Infinity;
  let minZ = Infinity,  maxZ = -Infinity;

  const updateBounds = (x, y, z = 0) => {
    if (x !== undefined && x !== null && !isNaN(x)) minX = Math.min(minX, x);
    if (x !== undefined && x !== null && !isNaN(x)) maxX = Math.max(maxX, x);
    if (y !== undefined && y !== null && !isNaN(y)) minY = Math.min(minY, y);
    if (y !== undefined && y !== null && !isNaN(y)) maxY = Math.max(maxY, y);
    if (z !== undefined && z !== null && !isNaN(z)) minZ = Math.min(minZ, z);
    if (z !== undefined && z !== null && !isNaN(z)) maxZ = Math.max(maxZ, z);
  };

  entities.forEach(entity => {
    if (!entity) return;

    switch (entity.type) {
      // Polígonos: POLYLINE, LWPOLYLINE
      case 'LWPOLYLINE':
      case 'POLYLINE':
        if (entity.vertices && Array.isArray(entity.vertices)) {
          entity.vertices.forEach(v => {
            updateBounds(v.x, v.y, v.z);
          });
        }
        break;

      // Spline (curve)
      case 'SPLINE':
        if (entity.controlPoints && Array.isArray(entity.controlPoints)) {
          entity.controlPoints.forEach(pt => {
            updateBounds(pt.x, pt.y, pt.z);
          });
        }
        break;

      // Linhas: LINE, MLINE, XLINE
      case 'LINE':
      case 'MLINE':
      case 'XLINE':
        const x1 = entity.start?.x ?? entity.x1 ?? 0;
        const y1 = entity.start?.y ?? entity.y1 ?? 0;
        const z1 = entity.start?.z ?? entity.z1 ?? 0;
        const x2 = entity.end?.x ?? entity.x2 ?? 0;
        const y2 = entity.end?.y ?? entity.y2 ?? 0;
        const z2 = entity.end?.z ?? entity.z2 ?? 0;
        updateBounds(x1, y1, z1);
        updateBounds(x2, y2, z2);
        break;

      // Círculos
      case 'CIRCLE':
        const cx = entity.center?.x ?? entity.x ?? 0;
        const cy = entity.center?.y ?? entity.y ?? 0;
        const cz = entity.center?.z ?? entity.z ?? 0;
        const radius = entity.radius ?? entity.r ?? 0;
        updateBounds(cx - radius, cy - radius, cz);
        updateBounds(cx + radius, cy + radius, cz);
        break;

      // Arcos
      case 'ARC':
        const acx = entity.center?.x ?? entity.x ?? 0;
        const acy = entity.center?.y ?? entity.y ?? 0;
        const acz = entity.center?.z ?? entity.z ?? 0;
        const aradius = entity.radius ?? entity.r ?? 0;
        updateBounds(acx - aradius, acy - aradius, acz);
        updateBounds(acx + aradius, acy + aradius, acz);
        break;

      // Elipse
      case 'ELLIPSE':
        const ecx = entity.center?.x ?? entity.x ?? 0;
        const ecy = entity.center?.y ?? entity.y ?? 0;
        const ecz = entity.center?.z ?? entity.z ?? 0;
        const majorAxis = entity.majorAxis ?? entity.majorAxisLength ?? 50;
        const minorAxis = entity.minorAxis ?? entity.minorAxisLength ?? 25;
        updateBounds(ecx - majorAxis, ecy - minorAxis, ecz);
        updateBounds(ecx + majorAxis, ecy + minorAxis, ecz);
        break;

      // Sólidos e faces
      case 'SOLID':
      case '3DFACE':
        for (let i = 0; i < 4; i++) {
          const pt = entity[`point${i}`] || entity.points?.[i];
          if (pt) updateBounds(pt.x, pt.y, pt.z);
        }
        break;

      // Textos
      case 'TEXT':
      case 'MTEXT':
        const tx = entity.position?.x ?? entity.x ?? 0;
        const ty = entity.position?.y ?? entity.y ?? 0;
        const tz = entity.position?.z ?? entity.z ?? 0;
        const textWidth = (entity.text?.length ?? 0) * 2.5; // Aprox.
        const textHeight = 5; // Aprox.
        updateBounds(tx, ty, tz);
        updateBounds(tx + textWidth, ty + textHeight, tz);
        break;

      // Pontos
      case 'POINT':
        const ptx = entity.position?.x ?? entity.x ?? 0;
        const pty = entity.position?.y ?? entity.y ?? 0;
        const ptz = entity.position?.z ?? entity.z ?? 0;
        updateBounds(ptx, pty, ptz);
        break;

      // Retângulos e padrões
      case 'RECT':
      case 'RECTANGLE':
        if (entity.vertices && Array.isArray(entity.vertices)) {
          entity.vertices.forEach(v => {
            updateBounds(v.x, v.y, v.z);
          });
        }
        break;

      // Referência de bloco (INSERT)
      case 'INSERT':
        const ix = entity.position?.x ?? entity.x ?? 0;
        const iy = entity.position?.y ?? entity.y ?? 0;
        const iz = entity.position?.z ?? entity.z ?? 0;
        const iw = (entity.scaleX ?? 1) * 50;
        const ih = (entity.scaleY ?? 1) * 50;
        updateBounds(ix, iy, iz);
        updateBounds(ix + iw, iy + ih, iz);
        break;

      // Fallback: tentar propriedades genéricas
      default:
        if (entity.x !== undefined && entity.y !== undefined) {
          updateBounds(entity.x, entity.y, entity.z ?? 0);
        }
        if (entity.position) {
          updateBounds(entity.position.x, entity.position.y, entity.position.z);
        }
        if (entity.center) {
          updateBounds(entity.center.x, entity.center.y, entity.center.z);
        }
        if (entity.start && entity.end) {
          updateBounds(entity.start.x, entity.start.y, entity.start.z);
          updateBounds(entity.end.x, entity.end.y, entity.end.z);
        }
    }
  });

  // Se nenhuma entidade foi processada, retornar valores padrão
  if (minX === Infinity) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 0 };
  }

  // Garantir que min < max
  if (minX === maxX) maxX = minX + 100;
  if (minY === maxY) maxY = minY + 100;
  if (minZ === maxZ) maxZ = minZ + 10;

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
