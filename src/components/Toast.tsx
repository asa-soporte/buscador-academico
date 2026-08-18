import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  return (
    <div
      id="toast"
      className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md bg-[#32E6E2] text-[#060B10] text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between sm:justify-start space-x-2 transition-all duration-300 z-50 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="flex items-center space-x-2 min-w-0">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span id="toastMessage" className="truncate">
          {message || '¡Acción realizada con éxito!'}
        </span>
      </div>
    </div>
  );
};
