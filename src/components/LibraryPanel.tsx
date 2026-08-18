import React from 'react';
import { Bookmark, FileCode, Download, Trash2, ArrowRight, BookmarkX } from 'lucide-react';
import { ArticleItem } from '../types';
import { exportLibraryBibTeX, exportLibraryRIS } from '../utils/academicSearch';

interface LibraryPanelProps {
  savedLibrary: ArticleItem[];
  onToggleSave: (article: ArticleItem) => void;
  onInspectArticle: (doi: string) => void;
  onClearLibrary: () => void;
  onShowToast: (message: string) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({
  savedLibrary,
  onToggleSave,
  onInspectArticle,
  onClearLibrary,
  onShowToast,
}) => {
  const handleExport = (type: 'bibtex' | 'ris') => {
    if (savedLibrary.length === 0) {
      onShowToast('No hay artículos guardados para exportar');
      return;
    }

    if (type === 'bibtex') {
      exportLibraryBibTeX(savedLibrary);
      onShowToast('Biblioteca exportada como .BIB');
    } else {
      exportLibraryRIS(savedLibrary);
      onShowToast('Biblioteca exportada como .RIS');
    }
  };

  return (
    <div id="panel-library" className="space-y-4 sm:space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b121c] border border-[#182635] rounded-2xl p-4 sm:p-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-[#32E6E2]" />
            <span>Mi Biblioteca Guardada</span>
          </h2>
          <p className="text-xs text-slate-400">
            {savedLibrary.length}{' '}
            {savedLibrary.length === 1 ? 'artículo guardado' : 'artículos guardados'}{' '}
            localmente en tu navegador
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={() => handleExport('bibtex')}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Exportar .BIB</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('ris')}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar .RIS</span>
          </button>

          <button
            type="button"
            onClick={onClearLibrary}
            className="px-3 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-800/60 text-red-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <span>Vaciar</span>
          </button>
        </div>
      </div>

      {/* Library Content */}
      {savedLibrary.length === 0 ? (
        <div className="bg-[#0b121c] border border-[#182635] rounded-xl p-8 text-center text-slate-400 space-y-2">
          <BookmarkX className="w-8 h-8 mx-auto text-slate-500" />
          <p className="font-medium text-sm">No tienes artículos guardados en tu biblioteca.</p>
          <p className="text-xs text-slate-500">
            Guarda artículos desde los resultados de búsqueda para consultarlos luego.
          </p>
        </div>
      ) : (
        <div id="libraryContainer" className="grid grid-cols-1 gap-3 sm:gap-4">
          {savedLibrary.map((art) => (
            <div
              key={art.doi}
              className="bg-[#0b121c] border border-[#182635] rounded-xl p-4 transition-all hover:border-[#32E6E2]/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#060B10] text-[#32E6E2] border border-[#182635] rounded text-[10px] font-mono">
                      {art.doi}
                    </span>
                    <span className="text-xs text-slate-400">
                      {art.year} • <span className="italic text-slate-300">{art.journal}</span>
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base leading-snug break-words">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    <strong>Autores:</strong> {art.authors}
                  </p>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-start flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleSave(art)}
                    className="p-2 bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-800/60 rounded-lg text-xs transition-colors"
                    title="Eliminar de la biblioteca"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onInspectArticle(art.doi)}
                    className="px-3 py-2 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors"
                  >
                    <span>Ficha</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
