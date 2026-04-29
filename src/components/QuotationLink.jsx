import React from 'react';
import { THEME } from '../services/themeService';

const QuotationLink = ({ number, quotationId, onClick, className = '' }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(quotationId || number);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`font-semibold transition-all hover:opacity-80 hover:underline cursor-pointer ${className}`}
      style={{
        color: THEME.primary,
        background: 'none',
        border: 'none',
        padding: '0',
        fontFamily: 'inherit',
      }}
    >
      {number}
    </button>
  );
};

export default QuotationLink;
