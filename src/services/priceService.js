// Market price sources reference - Official sources for price updates
// Preços base (Abril 2026): Aço Carbono R$4,25/kg | Inox 304 R$5,30/kg | Alumínio R$6,00/kg
export const PRICE_SOURCES = {
  GRAVIA: { name: 'Gravia Chapas', url: 'https://www.gravia.com', materialType: 'Aço Carbono', source: 'Metals-API + LME' },
  TOTALMETAL: { name: 'Total Metal', url: 'https://www.totalmetal.com.br', materialType: 'Aço Carbono', source: 'AçoBrasil' },
  ACOBRASIL: { name: 'AçoBrasil', url: 'https://www.acobrasil.org.br/site/', materialType: 'Aço Carbono', source: 'Instituto Aço Brasil' },
  LME: { name: 'London Metal Exchange', url: 'https://www.lme.com', materialType: 'Alumínio 1050', source: 'Metals-API + LME' },
  APERAM: { name: 'Aperam', url: 'https://brasil.aperam.com', materialType: 'Inox 304', source: 'Dados locais' },
};

// Default market prices (manually updated or cached)
const DEFAULT_MARKET_PRICES = {
  'Aço Carbono': { basePrice: 100, lastChecked: null, sources: [] },
  'Inox 304': { basePrice: 150, lastChecked: null, sources: [] },
  'Alumínio 1050': { basePrice: 80, lastChecked: null, sources: [] },
};

const PRICE_CACHE_KEY = 'aston_market_prices';
const PRICE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas

export const getMarketPrices = () => {
  const cached = localStorage.getItem(PRICE_CACHE_KEY);
  return cached ? JSON.parse(cached) : DEFAULT_MARKET_PRICES;
};

export const setMarketPrice = (materialName, price, source = 'Manual') => {
  const prices = getMarketPrices();
  const now = new Date().toISOString();

  if (!prices[materialName]) {
    prices[materialName] = { basePrice: price, lastChecked: now, sources: [] };
  } else {
    prices[materialName].basePrice = price;
    prices[materialName].lastChecked = now;
    prices[materialName].sources = prices[materialName].sources || [];
    prices[materialName].sources.unshift({ source, price, date: now });
    prices[materialName].sources = prices[materialName].sources.slice(0, 10); // Keep last 10 entries
  }

  localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(prices));
  return prices[materialName];
};

export const getPriceHistory = (materialName) => {
  const prices = getMarketPrices();
  return prices[materialName]?.sources || [];
};

export const resetMarketPrices = () => {
  localStorage.removeItem(PRICE_CACHE_KEY);
};

// URL references for manual lookup
export const getSourceUrls = () => PRICE_SOURCES;
