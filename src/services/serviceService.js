const API = '/api/services';

// Cache em memória para acesso síncrono no QuotationBuilder
export let SERVICE_PRICES = {};

// Carrega serviços da API e atualiza o cache
export const loadServicesFromAPI = async () => {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('API indisponível');
    const list = await res.json();
    SERVICE_PRICES = {};
    list.forEach(s => { SERVICE_PRICES[s.name] = s; });
    return list;
  } catch {
    const defaults = [
      { id: 'corte-laser',  name: 'Corte Laser',  costPerKg: 100, sellPrice: 120, marginPercent: 20, description: 'Corte de precisão com laser' },
      { id: 'corte-plasma', name: 'Corte Plasma', costPerKg: 35,  sellPrice: 50,  marginPercent: 43, description: 'Corte rápido com plasma' },
      { id: 'oxicorte',     name: 'Oxicorte',     costPerKg: 12,  sellPrice: 18,  marginPercent: 50, description: 'Corte com oxicorte para chapas grossas' },
      { id: 'guilhotina',   name: 'Guilhotina',   costPerKg: 12,  sellPrice: 15,  marginPercent: 25, description: 'Corte com guilhotina mecânica' },
      { id: 'dobra',        name: 'Dobra',        costPerKg: 30,  sellPrice: 40,  marginPercent: 33, description: 'Processo de dobra' },
      { id: 'solda',        name: 'Solda',        costPerKg: 55,  sellPrice: 70,  marginPercent: 27, description: 'Solda de precisão' },
      { id: 'usinagem',     name: 'Usinagem',     costPerKg: 80,  sellPrice: 100, marginPercent: 25, description: 'Usinagem CNC' },
    ];
    defaults.forEach(s => { SERVICE_PRICES[s.name] = s; });
    return defaults;
  }
};

export const getServiceNames = () => Object.keys(SERVICE_PRICES);
export const getService = (name) => SERVICE_PRICES[name] || null;

export const calculateServiceCost = (serviceName, weightKg) => {
  const service = SERVICE_PRICES[serviceName];
  if (!service) return 0;
  return service.costPerKg * weightKg;
};

export const getAllServices = async () => {
  return await loadServicesFromAPI();
};

export const addService = async (name, costPerKg, sellPrice = null, marginPercent = 50, description = '') => {
  try {
    const cost = parseFloat(costPerKg);
    const sell = sellPrice ? parseFloat(sellPrice) : cost * (1 + marginPercent / 100);
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, costPerKg: cost, sellPrice: sell, marginPercent: parseFloat(marginPercent), description }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    SERVICE_PRICES[data.name] = data;
    return { ok: true, service: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const updateService = async (id, name, costPerKg, sellPrice = null, marginPercent = 50, description = '') => {
  try {
    const cost = parseFloat(costPerKg);
    const sell = sellPrice ? parseFloat(sellPrice) : cost * (1 + marginPercent / 100);
    const res = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, costPerKg: cost, sellPrice: sell, marginPercent: parseFloat(marginPercent), description }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    await loadServicesFromAPI();
    return { ok: true, service: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const deleteService = async (id) => {
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error };
    await loadServicesFromAPI();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const resetServices = () => ({ ok: false, error: 'Use o painel admin para editar serviços' });
