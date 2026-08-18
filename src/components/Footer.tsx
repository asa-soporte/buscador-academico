import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#182635] bg-[#060B10]/80 backdrop-blur-sm py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center text-xs text-slate-400 space-x-1.5">
        <span className="text-slate-500">Desarrollado por:</span>
        <span className="font-extrabold tracking-wide text-[#32E6E2]">
          ASA SOPORTE INFORMÁTICO
        </span>
      </div>
    </footer>
  );
};
