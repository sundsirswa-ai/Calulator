
import React from 'react';

interface DisplayProps {
  expression: string;
  result: string;
}

const Display: React.FC<DisplayProps> = ({ expression, result }) => {
  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl mb-6 shadow-inner border border-slate-800 flex flex-col items-end justify-end h-32 overflow-hidden">
      <div className="text-slate-400 text-sm mb-1 math-mono truncate w-full text-right h-6">
        {expression}
      </div>
      <div className="text-white text-4xl font-semibold math-mono truncate w-full text-right">
        {result || '0'}
      </div>
    </div>
  );
};

export default Display;
