import React, { useEffect } from 'react';

const Toast = ({ type = 'info', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', icon: '✓' },
    error: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', icon: '✕' },
    info: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', icon: 'ℹ' },
    warning: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', icon: '⚠' },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`fixed top-4 right-4 z-50 ${config.bg} border ${config.border} rounded-xl px-6 py-4 backdrop-blur-sm shadow-lg flex items-center gap-3 animate-slideIn`}>
      <span className={`text-lg font-bold ${config.text}`}>{config.icon}</span>
      <p className={`${config.text} text-sm font-medium`}>{message}</p>
      <button
        onClick={onClose}
        className={`ml-2 ${config.text} hover:opacity-70 text-lg leading-none`}
        aria-label="Fechar notificação"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
