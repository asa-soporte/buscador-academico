import React from 'react';
import { Globe, X } from 'lucide-react';
import { LanguageCode } from '../types';

interface LanguageModalProps {
  isOpen: boolean;
  currentLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode, label: string) => void;
  onClose: () => void;
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'all', label: 'Todos los idiomas', flag: '🌐' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'Inglés', flag: '🇬🇧' },
  { code: 'pt', label: 'Portugués', flag: '🇵🇹' },
  { code: 'fr', label: 'Francés', flag: '🇫🇷' },
  { code: 'de', label: 'Alemán', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="languageModal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="languageModalCard"
        className="bg-[#0b121c] border border-[#182635] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 transform transition-transform"
      >
        <div className="flex items-center justify-between border-b border-[#182635] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#32E6E2]/10 text-[#32E6E2] rounded-xl border border-[#32E6E2]/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Idioma de Búsqueda</h3>
              <p className="text-xs text-slate-400">Filtro rápido de publicaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#182635] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-medium" id="langOptionsGrid">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onSelectLanguage(lang.code, lang.label)}
                data-lang={lang.code}
                className={`lang-option-btn p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                  isSelected
                    ? 'border-[#32E6E2] bg-[#32E6E2]/10 text-[#32E6E2] font-bold'
                    : 'border-[#182635] bg-[#060B10] hover:border-[#32E6E2]/50 text-white'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 truncate">{lang.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#182635] hover:bg-[#203246] text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
