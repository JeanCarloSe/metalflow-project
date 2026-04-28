const SERVICES_CACHE_KEY = 'aston_services';

// Serviços padrão iniciais
const DEFAULT_SERVICES = {
  'Corte Laser': { id: 'corte-laser', name: 'Corte Laser', costPerKg: 100, sellPrice: 120, marginPercent: 20, description: 'Corte de precisão com laser' },
  'Corte Plasma': { id: 'corte-plasma', name: 'Corte Plasma', costPerKg: 35, sellPrice: 50, marginPercent: 43, description: 'Corte rápido com plasma' },
  'Oxicorte': { id: 'oxicorte', name: 'Oxicorte', costPerKg: 12, sellPrice: 18, marginPercent: 50, description: 'Corte com oxicorte para chapas grossas' },
  'Guilhotina': { id: 'guilhotina', name: 'Guilhotina', costPerKg: 12, sellPrice: 15, marginPercent: 25, description: 'Corte com guilhotina mecânica' },
  'Dobra': { id: 'dobra', name: 'Dobra', costPerKg: 30, sellPrice: 40, marginPercent: 33, description: 'Processo de dobra' },
  'Solda': { id: 'solda', name: 'Solda', costPerKg: 55, sellPrice: 70, marginPercent: 27, description: 'Solda de precisão' },
  'Usinagem': { id: 'usinagem', name: 'Usinagem', costPerKg: 80, sellPrice: 100, marginPercent: 25, description: 'Usinagem CNC' },
};

// Exporta SERVICE_PRICES para compatibilidade com código existente
export let SERVICE_PRICES = { ...DEFAULT_SERVICES };

const loadServices = () => {
  const cached = localStorage.getItem(SERVICES_CACHE_KEY);
  if (cached) {
    SERVICE_PRICES = JSON.parse(cached);
  } else {
    SERVICE_PRICES = { ...DEFAULT_SERVICES };
    localStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(SERVICE_PRICES));
  }
};

const saveServices = () => {
  localStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(SERVICE_PRICES));
};

// Carrega serviços ao iniciar
loadServices();

export const getServiceNames = () => Object.keys(SERVICE_PRICES);

export const getService = (name) => SERVICE_PRICES[name] || null;

export const calculateServiceCost = (serviceName, weightKg) => {
  const service = SERVICE_PRICES[serviceName];
  if (!service) return 0;
  return service.costPerKg * weightKg;
};

// Gerenciamento de serviços (apenas ADM)
export const getAllServices = () => {
  loadServices();
  return Object.values(SERVICE_PRICES);
};

export const addService = (name, costPerKg, sellPrice = null, marginPercent = 50, description = '') => {
  if (SERVICE_PRICES[name]) return { ok: false, error: 'Serviço já existe' };

  const cost = parseFloat(costPerKg);
  const finalSellPrice = sellPrice ? parseFloat(sellPrice) : cost * (1 + marginPercent / 100);

  SERVICE_PRICES[name] = {
    id: Date.now().toString(),
    name,
    costPerKg: cost,
    sellPrice: finalSellPrice,
    marginPercent: parseFloat(marginPercent),
    description: description.trim(),
  };
  saveServices();
  return { ok: true, service: SERVICE_PRICES[name] };
};

export const updateService = (name, costPerKg, sellPrice = null, marginPercent = 50, description = '') => {
  if (!SERVICE_PRICES[name]) return { ok: false, error: 'Serviço não encontrado' };

  const cost = parseFloat(costPerKg);
  const finalSellPrice = sellPrice ? parseFloat(sellPrice) : cost * (1 + marginPercent / 100);

  SERVICE_PRICES[name] = {
    ...SERVICE_PRICES[name],
    costPerKg: cost,
    sellPrice: finalSellPrice,
    marginPercent: parseFloat(marginPercent),
    description: description.trim(),
  };
  saveServices();
  return { ok: true, service: SERVICE_PRICES[name] };
};

export const deleteService = (name) => {
  if (!SERVICE_PRICES[name]) return { ok: false, error: 'Serviço não encontrado' };
  delete SERVICE_PRICES[name];
  saveServices();
  return { ok: true };
};

export const resetServices = () => {
  SERVICE_PRICES = { ...DEFAULT_SERVICES };
  localStorage.removeItem(SERVICES_CACHE_KEY);
  return { ok: true };
};
