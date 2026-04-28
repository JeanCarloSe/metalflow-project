const OPERATOR_KEY = 'metalflow_operator';

export const getOperator = () => {
  const raw = localStorage.getItem(OPERATOR_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const saveOperator = (operator) => {
  localStorage.setItem(OPERATOR_KEY, JSON.stringify(operator));
};
