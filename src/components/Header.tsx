import React from 'react';
import { GraduationCap, Search, Bookmark, Layers, Sparkles, Download } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  savedCount: number;
  canInstall?: boolean;
  onInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  canInstall,
  onInstall,
}) => {
  return (
    <header className="border-b border-[#182635] bg-[#0a1118]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 sm:p-2.5 bg-[#32E6E2] text-[#060B10] rounded-xl shadow-lg shadow-[#32E6E2]/20 flex-shrink-0 font-bold">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-white leading-tight flex items-center gap-2">
                <span>DOI Finder</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#32E6E2]/20 text-[#32E6E2] border border-[#32E6E2]/30 rounded-full">
                  v2.2
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                Buscador Académico, Metadatos, Citas y Gestor Bibliográfico
              </p>
            </div>
          </div>

          {/* Quick Install Button for mobile users */}
          {canInstall && onInstall && (
            <button
              type="button"
              onClick={onInstall}
              className="sm:hidden px-2.5 py-1.5 bg-[#32E6E2]/15 border border-[#32E6E2]/40 text-[#32E6E2] text-[11px] font-bold rounded-lg flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}
        </div>

        {/* Responsive Navigation Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <nav className="flex items-center space-x-1 bg-[#060B10] p-1 rounded-xl border border-[#182635] text-xs font-semibold overflow-x-auto scrollbar-none w-full sm:w-auto min-w-0 flex-1">
            <button
              onClick={() => onTabChange('search')}
              id="tab-search"
              className={`tab-btn px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'search'
                  ? 'active text-[#060B10] bg-[#32E6E2] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscador</span>
            </button>

            <button
              onClick={() => onTabChange('library')}
              id="tab-library"
              className={`tab-btn px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap flex-1 sm:flex-initial relative ${
                activeTab === 'library'
                  ? 'active text-[#060B10] bg-[#32E6E2] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Biblioteca</span>
              {savedCount > 0 && (
                <span
                  id="savedCountBadge"
                  className="ml-1 px-1.5 py-0.2 bg-[#32E6E2] text-[#060B10] font-bold text-[10px] rounded-full"
                >
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('batch')}
              id="tab-batch"
              className={`tab-btn px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'batch'
                  ? 'active text-[#060B10] bg-[#32E6E2] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lote DOI</span>
            </button>

            <button
              onClick={() => onTabChange('assistant')}
              id="tab-assistant"
              className={`tab-btn px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                activeTab === 'assistant'
                  ? 'active text-[#060B10] bg-[#32E6E2] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Asistente IA</span>
            </button>
          </nav>

          {/* Desktop Install App Button */}
          {canInstall && onInstall && (
            <button
              type="button"
              onClick={onInstall}
              className="hidden sm:flex px-3 py-1.5 bg-[#32E6E2]/15 hover:bg-[#32E6E2]/25 border border-[#32E6E2]/40 text-[#32E6E2] text-xs font-bold rounded-xl items-center gap-1.5 transition-colors flex-shrink-0"
              title="Instalar DOI Finder como aplicación nativa en tu dispositivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

