import React, { useState } from 'react';
import {
  ArrowLeft,
  Unlock,
  Lock,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Languages,
  Loader2,
  FileDown,
  Search,
  ExternalLink,
  Quote,
  Download,
  Copy,
} from 'lucide-react';
import { ArticleItem, CitationFormat } from '../types';
import { translateAbstractText, downloadBlob } from '../utils/academicSearch';

interface ArticleDetailViewProps {
  article: ArticleItem;
  isSaved: boolean;
  onToggleSave: (article: ArticleItem) => void;
  onBack: () => void;
  onShowToast: (message: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  isSaved,
  onToggleSave,
  onBack,
  onShowToast,
}) => {
  const [selectedCitationFormat, setSelectedCitationFormat] = useState<CitationFormat>('apa');
  const [abstractLang, setAbstractLang] = useState<'es' | 'orig'>('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<ArticleItem>(article);

  const handleTranslate = async () => {
    if (!currentArticle.abstract) {
      onShowToast('No hay resumen disponible para traducir.');
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateAbstractText(currentArticle.abstract);
      if (translated) {
        const updated = {
          ...currentArticle,
          spanishAbstract: translated,
          isSpanishAvailable: true,
        };
        setCurrentArticle(updated);
        setAbstractLang('es');
        onShowToast('¡Resumen traducido al español con IA!');
      }
    } catch {
      onShowToast('No se pudo traducir el resumen.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyCitation = () => {
    let text = currentArticle.apa;
    if (selectedCitationFormat === 'mla') text = currentArticle.mla;
    else if (selectedCitationFormat === 'ieee') text = currentArticle.ieee;
    else if (selectedCitationFormat === 'chicago') text = currentArticle.chicago;
    else if (selectedCitationFormat === 'bibtex') text = currentArticle.bibtex;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => onShowToast('¡Cita copiada al portapapeles!'))
        .catch(() => {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    onShowToast('¡Cita copiada al portapapeles!');
  };

  const handleDownloadSingle = (type: 'bib' | 'ris') => {
    const content = type === 'bib' ? currentArticle.bibtex : currentArticle.ris;
    const filename = `${currentArticle.doi.replace(/[^a-zA-Z0-9]/g, '_')}.${type}`;
    downloadBlob(content, filename, 'text/plain');
    onShowToast(`Archivo .${type.toUpperCase()} descargado`);
  };

  const cleanAbstractText = (text: string) => {
    return text ? text.replace(/<[^>]*>?/gm, '') : '';
  };

  return (
    <div
      id="articleDetailView"
      className="bg-[#0b121c] border border-[#182635] rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-xl animate-fade-in"
    >
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182635] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-[#060B10] hover:bg-[#101b2b] text-slate-300 rounded-lg border border-[#182635] text-xs font-semibold flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>

          {currentArticle.isOpenAccess || currentArticle.pdfUrl ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <Unlock className="w-3.5 h-3.5" />
              <span>Acceso Abierto / PDF Disponible</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#060B10] text-slate-400 border border-[#182635]">
              <Lock className="w-3.5 h-3.5" />
              <span>Suscripción / Editorial</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={() => onToggleSave(currentArticle)}
            className={`px-3.5 py-1.5 rounded-lg border border-[#182635] text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              isSaved ? 'bg-[#32E6E2] text-[#060B10]' : 'bg-[#060B10] text-slate-300 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* Title and metadata */}
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight break-words">
          {currentArticle.title}
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 space-y-1.5">
          <p>
            <strong className="text-slate-400">Revista:</strong>{' '}
            <span className="italic text-[#32E6E2]">{currentArticle.journal}</span> ({currentArticle.year})
          </p>
          <p>
            <strong className="text-slate-400">Autores:</strong>{' '}
            <span className="break-words">{currentArticle.authors}</span>
          </p>
          <p>
            <strong className="text-slate-400">DOI Identificador:</strong>{' '}
            <span className="font-mono text-xs text-[#32E6E2] break-all">{currentArticle.doi}</span>
          </p>
        </div>
      </div>

      {/* Abstract Section */}
      {(currentArticle.tldr || currentArticle.abstract || currentArticle.spanishAbstract) && (
        <div className="bg-[#060B10] border border-[#182635] rounded-xl p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182635] pb-2">
            <h4 className="text-xs font-bold text-[#32E6E2] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Resumen / Abstract</span>
            </h4>

            {currentArticle.isSpanishAvailable ? (
              <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] sm:text-[11px] rounded-md font-semibold flex items-center gap-1 self-start sm:self-auto">
                <CheckCircle2 className="w-3 h-3" />
                <span>Disponible en Español</span>
              </span>
            ) : (
              <button
                id="translateBtn"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="px-2.5 py-1 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Traduciendo...</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-3.5 h-3.5" />
                    <span>Traducir a Español con IA</span>
                  </>
                )}
              </button>
            )}
          </div>

          {currentArticle.tldr && (
            <p className="text-xs font-medium text-amber-200/90 italic break-words">
              <strong>TL;DR:</strong> {currentArticle.tldr}
            </p>
          )}

          {currentArticle.isSpanishAvailable &&
            currentArticle.spanishAbstract !== currentArticle.abstract && (
              <div className="flex items-center space-x-1.5 text-[11px] font-medium border-b border-[#060B10] pb-1">
                <button
                  onClick={() => setAbstractLang('es')}
                  id="btn-abs-es"
                  className={`px-2.5 py-1 rounded ${
                    abstractLang === 'es'
                      ? 'bg-[#32E6E2] text-[#060B10] font-bold'
                      : 'bg-[#0b121c] text-slate-400 border border-[#182635]'
                  }`}
                >
                  Español
                </button>
                <button
                  onClick={() => setAbstractLang('orig')}
                  id="btn-abs-orig"
                  className={`px-2.5 py-1 rounded ${
                    abstractLang === 'orig'
                      ? 'bg-[#32E6E2] text-[#060B10] font-bold'
                      : 'bg-[#0b121c] text-slate-400 border border-[#182635]'
                  }`}
                >
                  Original / Inglés
                </button>
              </div>
            )}

          <div id="abstractTextContainer">
            <p className="text-xs text-slate-300 leading-relaxed max-h-52 sm:max-h-60 overflow-y-auto custom-scrollbar break-words">
              {abstractLang === 'es' && currentArticle.spanishAbstract
                ? cleanAbstractText(currentArticle.spanishAbstract)
                : cleanAbstractText(currentArticle.abstract)}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons: PDF Download & Publisher Link */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        {currentArticle.pdfUrl ? (
          <a
            href={currentArticle.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-3 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-[#32E6E2]/20 active:scale-98 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Descargar PDF Gratis</span>
          </a>
        ) : (
          <a
            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(
              currentArticle.title || currentArticle.doi
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-3 bg-[#182635] hover:bg-[#203246] text-[#32E6E2] border border-[#32E6E2]/40 hover:border-[#32E6E2] rounded-xl text-xs font-bold flex items-center justify-center space-x-2 active:scale-98 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Buscar PDF en Google Scholar</span>
          </a>
        )}

        <a
          href={currentArticle.publisherUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-3 bg-[#060B10] hover:bg-[#101b2b] text-slate-200 border border-[#182635] rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 active:scale-98 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Ver en Editorial / Publisher</span>
        </a>
      </div>

      {/* Citation Generator & Export */}
      <div className="bg-[#060B10] border border-[#182635] rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182635] pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Quote className="w-4 h-4 text-[#32E6E2]" />
            <span>Generador de Citas & Exportación</span>
          </h3>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => handleDownloadSingle('bib')}
              className="px-2.5 py-1 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded text-xs flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>.BIB</span>
            </button>
            <button
              onClick={() => handleDownloadSingle('ris')}
              className="px-2.5 py-1 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded text-xs flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>.RIS</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
            {(['apa', 'mla', 'ieee', 'chicago', 'bibtex'] as CitationFormat[]).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedCitationFormat(style)}
                id={`cite-btn-${style}`}
                className={`px-3 py-1 rounded font-bold whitespace-nowrap transition-colors ${
                  selectedCitationFormat === style
                    ? 'bg-[#32E6E2] text-[#060B10]'
                    : 'bg-[#0b121c] text-slate-400 border border-[#182635]'
                }`}
              >
                {style === 'apa'
                  ? 'APA 7'
                  : style === 'mla'
                  ? 'MLA 9'
                  : style === 'ieee'
                  ? 'IEEE'
                  : style === 'chicago'
                  ? 'Chicago 17'
                  : 'BibTeX'}
              </button>
            ))}
          </div>

          <div className="relative bg-[#0b121c] p-3 sm:p-3.5 rounded-lg border border-[#182635]">
            <div id="citationBoxText" className="text-xs text-slate-200 font-serif leading-relaxed select-all pr-10 break-words overflow-x-auto">
              {selectedCitationFormat === 'bibtex' ? (
                <pre className="font-mono text-[11px] leading-normal whitespace-pre-wrap break-all">
                  {currentArticle.bibtex}
                </pre>
              ) : selectedCitationFormat === 'mla' ? (
                currentArticle.mla
              ) : selectedCitationFormat === 'ieee' ? (
                currentArticle.ieee
              ) : selectedCitationFormat === 'chicago' ? (
                currentArticle.chicago
              ) : (
                currentArticle.apa
              )}
            </div>
            <button
              onClick={handleCopyCitation}
              className="absolute right-2 top-2 p-1.5 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded shadow transition-colors"
              title="Copiar cita"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
