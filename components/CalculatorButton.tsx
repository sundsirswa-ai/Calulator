
import React from 'react';

interface CalculatorButtonProps {
  label: string;
  onClick: () => void;
  type?: 'number' | 'operator' | 'action' | 'scientific';
  className?: string;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ 
  label, 
  onClick, 
  type = 'number',
  className = ''
}) => {
  const getBaseStyle = () => {
    switch (type) {
      case 'operator':
        return 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20';
      case 'action':
        return 'bg-slate-700 hover:bg-slate-600 text-white';
      case 'scientific':
        return 'bg-slate-800/50 hover:bg-slate-700 text-blue-300 text-sm';
      default:
        return 'bg-slate-800 hover:bg-slate-700 text-slate-200';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${getBaseStyle()}
        ${className}
        h-14 sm:h-16 rounded-xl font-medium transition-all duration-150
        active:scale-95 flex items-center justify-center text-lg math-mono
      `}
    >
      {label}
    </button>
  );
};

export default CalculatorButton;
