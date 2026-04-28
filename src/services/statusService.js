export const QUOTATION_STATUS = {
  'em-andamento': {
    label: 'Em andamento',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    textColor: '#1e40af',
  },
  'em-analise': {
    label: 'Em análise',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#92400e',
  },
  'enviando': {
    label: 'Enviando',
    color: '#8b5cf6',
    bgColor: '#faf5ff',
    textColor: '#5b21b6',
  },
  'aguardando-retorno': {
    label: 'Aguardando retorno do cliente',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    textColor: '#831843',
  },
  'em-negociacao': {
    label: 'Em negociação',
    color: '#06b6d4',
    bgColor: '#ecf9ff',
    textColor: '#164e63',
  },
  'aprovado': {
    label: 'Aprovado',
    color: '#10b981',
    bgColor: '#ecfdf5',
    textColor: '#065f46',
  },
  'reprovado': {
    label: 'Reprovado',
    color: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#7f1d1d',
  },
};

export const getStatusLabel = (status) => {
  return QUOTATION_STATUS[status]?.label || status || 'Sem status';
};

export const getStatusColor = (status) => {
  return QUOTATION_STATUS[status]?.color || '#6b7280';
};

export const getStatusBg = (status) => {
  return QUOTATION_STATUS[status]?.bgColor || '#f3f4f6';
};

export const getStatusText = (status) => {
  return QUOTATION_STATUS[status]?.textColor || '#374151';
};
