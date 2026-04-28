const CODE_COUNTERS_KEY = 'aston_code_counters';

const getCounters = () => {
  const stored = localStorage.getItem(CODE_COUNTERS_KEY);
  return stored ? JSON.parse(stored) : { clientCounter: 0, quotationCounter: 0 };
};

const saveCounters = (counters) => {
  localStorage.setItem(CODE_COUNTERS_KEY, JSON.stringify(counters));
};

export const generateClientCode = () => {
  const counters = getCounters();
  counters.clientCounter += 1;
  saveCounters(counters);
  return `CLI-${String(counters.clientCounter).padStart(4, '0')}`;
};

export const generateQuotationCode = () => {
  const counters = getCounters();
  counters.quotationCounter += 1;
  saveCounters(counters);
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const number = String(counters.quotationCounter).padStart(4, '0');
  return `ORC-${month}${year}-${number}`;
};
