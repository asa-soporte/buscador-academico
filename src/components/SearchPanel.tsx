import React, { useState } from 'react';
import {
  Search,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Loader2,
  AlertCircle,
  Bookmark,
  Sparkles,
  PlusCircle,
  Quote,
} from 'lucide-react';
import { ArticleItem, LanguageCode, SearchMode, SearchFilters } from '../types';
import { searchAcademicArticles, fetchArticleFullDetails } from '../utils/academicSearch';
import { ArticleDetailView } from './ArticleDetailView';

interface SearchPanelProps {
  savedLibrary: ArticleItem[];
  onToggleSave: (article: ArticleItem) => void;
  onOpenLanguageModal: () => void;
  currentLanguage: LanguageCode;
  languageLabel: string;
  onShowToast: (message: string) => void;
}

const LANG_MAP: Record<string, string> = {
  es: '🇪🇸 ES',
  en: '🇬🇧 EN',
  pt: '🇵🇹 PT',
  fr: '🇫🇷 FR',
  de: '🇩🇪 DE',
  it: '🇮🇹 IT',
};

export const SearchPanel: React.FC<SearchPanelProps> = ({
  savedLibrary,
  onToggleSave,
  onOpenLanguageModal,
  currentLanguage,
  languageLabel,
  onShowToast,
}) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('auto');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    language: currentLanguage,
    yearMin: '',
    yearMax: '',
    openAccessOnly: false,
    rowsCount: 10,
  });

  const [results, setResults] = useState<ArticleItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  // Keep filters.language in sync with currentLanguage prop
  React.useEffect(() => {
    setFilters((prev) => ({ ...prev, language: currentLanguage }));
  }, [currentLanguage]);

  const executeSearch = async (isLoadMore = false, overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!q) return;

    if (!isLoadMore) {
      setIsLoading(true);
      setErrorMessage('');
      setActiveArticle(null);
      setCurrentOffset(0);
      setSearchedQuery(q);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const nextOffset = isLoadMore ? currentOffset + filters.rowsCount : 0;
      const res = await searchAcademicArticles({
        query: q,
        mode,
        filters,
        offset: nextOffset,
      });

      if (isLoadMore) {
        setResults((prev) => [...prev, ...res.items]);
        setCurrentOffset(nextOffset);
      } else {
        setResults(res.items);
        setTotalResults(res.total);
        setCurrentOffset(0);
      }
    } catch (err: any) {
      if (!isLoadMore) {
        setErrorMessage(
          err.message || 'Error al conectar con los repositorios académicos (Crossref / OpenAlex).'
        );
        setResults([]);
      } else {
        onShowToast('No se pudieron obtener más resultados.');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(false);
  };

  const handleQuickSearch = (sampleQuery: string) => {
    setQuery(sampleQuery);
    executeSearch(false, sampleQuery);
  };

  const handleInspectArticle = async (doi: string) => {
    setIsLoading(true);
    try {
      const fullArt = await fetchArticleFullDetails(doi);
      setActiveArticle(fullArt);
    } catch {
      const existing =
        savedLibrary.find((s) => s.doi === doi) || results.find((r) => r.doi === doi);
      if (existing) {
        setActiveArticle(existing);
      } else {
        onShowToast('Error al obtener la ficha completa del artículo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="panel-search" className="space-y-4 sm:space-y-6">
      {/* Search Header Form Box */}
      <section className="bg-[#0b121c] border border-[#182635] rounded-2xl p-4 sm:p-6 md:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#32E6E2]/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 relative z-10">
          {/* Modes & Language bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#182635] pb-3">
            <div className="flex items-center gap-1.5 text-xs font-medium overflow-x-auto scrollbar-none pb-1 sm:pb-0 w-full sm:w-auto">
              <span className="text-slate-400 mr-1 flex-shrink-0">Modo:</span>

              <button
                type="button"
                onClick={() => setMode('auto')}
                id="mode-auto"
                className={`mode-btn px-2.5 sm:px-3 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                  mode === 'auto'
                    ? 'text-[#060B10] bg-[#32E6E2] font-bold border-[#32E6E2]'
                    : 'border-[#182635] bg-[#060B10] text-slate-400 hover:text-white'
                }`}
              >
                Autodetect
              </button>

              <button
                type="button"
                onClick={() => setMode('title')}
                id="mode-title"
                className={`mode-btn px-2.5 sm:px-3 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                  mode === 'title'
                    ? 'text-[#060B10] bg-[#32E6E2] font-bold border-[#32E6E2]'
                    : 'border-[#182635] bg-[#060B10] text-slate-400 hover:text-white'
                }`}
              >
                Título
              </button>

              <button
                type="button"
                onClick={() => setMode('author')}
                id="mode-author"
                className={`mode-btn px-2.5 sm:px-3 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                  mode === 'author'
                    ? 'text-[#060B10] bg-[#32E6E2] font-bold border-[#32E6E2]'
                    : 'border-[#182635] bg-[#060B10] text-slate-400 hover:text-white'
                }`}
              >
                Autor
              </button>

              <button
                type="button"
                onClick={() => setMode('doi')}
                id="mode-doi"
                className={`mode-btn px-2.5 sm:px-3 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                  mode === 'doi'
                    ? 'text-[#060B10] bg-[#32E6E2] font-bold border-[#32E6E2]'
                    : 'border-[#182635] bg-[#060B10] text-slate-400 hover:text-white'
                }`}
              >
                DOI Directo
              </button>

              {/* Quick Language Trigger */}
              <button
                type="button"
                onClick={onOpenLanguageModal}
                id="quickLangBtn"
                className="px-2.5 sm:px-3 py-1 rounded-lg border border-[#182635] bg-[#060B10] text-slate-300 hover:text-[#32E6E2] hover:border-[#32E6E2]/40 flex items-center space-x-1.5 whitespace-nowrap transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-[#32E6E2]" />
                <span id="quickLangLabel">{languageLabel}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="text-xs text-slate-400 hover:text-[#32E6E2] flex items-center space-x-1 transition-colors self-end sm:self-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros Avanzados</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showAdvancedFilters ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Advanced Filters Grid */}
          {showAdvancedFilters && (
            <div
              id="advancedFilters"
              className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3 sm:p-4 bg-[#060B10] border border-[#182635] rounded-xl text-xs animate-fade-in"
            >
              <div>
                <label className="block text-slate-400 mb-1">Idioma del Artículo</label>
                <select
                  value={filters.language}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, language: e.target.value as LanguageCode }))
                  }
                  id="filterLanguage"
                  className="w-full bg-[#0b121c] border border-[#1a2938] rounded-lg px-3 py-2 text-white outline-none focus:border-[#32E6E2]"
                >
                  <option value="all">Todos los idiomas</option>
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="pt">Portugués</option>
                  <option value="fr">Francés</option>
                  <option value="de">Alemán</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Año Inicio</label>
                <input
                  type="number"
                  value={filters.yearMin || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, yearMin: e.target.value }))}
                  placeholder="Ej: 2018"
                  min="1900"
                  max="2026"
                  id="filterYearMin"
                  className="w-full bg-[#0b121c] border border-[#1a2938] rounded-lg px-3 py-2 text-white outline-none focus:border-[#32E6E2]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Año Fin</label>
                <input
                  type="number"
                  value={filters.yearMax || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, yearMax: e.target.value }))}
                  placeholder="Ej: 2026"
                  min="1900"
                  max="2026"
                  id="filterYearMax"
                  className="w-full bg-[#0b121c] border border-[#1a2938] rounded-lg px-3 py-2 text-white outline-none focus:border-[#32E6E2]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipo de Acceso</label>
                <select
                  value={filters.openAccessOnly ? 'oa' : 'all'}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, openAccessOnly: e.target.value === 'oa' }))
                  }
                  id="filterOpenAccess"
                  className="w-full bg-[#0b121c] border border-[#1a2938] rounded-lg px-3 py-2 text-white outline-none focus:border-[#32E6E2]"
                >
                  <option value="all">Todos los artículos</option>
                  <option value="oa">Solo Acceso Abierto (PDF Gratis)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resultados por Búsqueda</label>
                <select
                  value={filters.rowsCount}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, rowsCount: parseInt(e.target.value) }))
                  }
                  id="filterRowsCount"
                  className="w-full bg-[#0b121c] border border-[#1a2938] rounded-lg px-3 py-2 text-white outline-none focus:border-[#32E6E2]"
                >
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                  <option value="100">100 por página</option>
                </select>
              </div>
            </div>
          )}

          {/* Search Input and Button */}
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                id="searchInput"
                placeholder="Buscar por DOI, Título o Autor..."
                className="w-full bg-[#060B10] border border-[#1a2938] focus:border-[#32E6E2] focus:ring-2 focus:ring-[#32E6E2]/20 text-white placeholder-slate-500 pl-10 sm:pl-12 pr-4 py-3 rounded-xl text-xs sm:text-sm md:text-base outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              id="searchBtn"
              className="w-full sm:w-auto bg-[#32E6E2] hover:bg-[#2bd8d4] disabled:opacity-60 text-[#060B10] font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#32E6E2]/20 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <span>Buscar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 pt-1">
            <span className="text-slate-500 flex-shrink-0">Sugerencias:</span>
            <button
              type="button"
              onClick={() => handleQuickSearch('10.1038/s41586-020-2649-2')}
              className="hover:text-[#32E6E2] underline decoration-slate-700 text-left"
            >
              CRISPR DOI
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => handleQuickSearch('Deep Residual Learning for Image Recognition')}
              className="hover:text-[#32E6E2] underline decoration-slate-700 text-left"
            >
              ResNet Paper
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => handleQuickSearch('Quantum supremacy Google')}
              className="hover:text-[#32E6E2] underline decoration-slate-700 text-left"
            >
              Computación Cuántica
            </button>
          </div>
        </form>
      </section>

      {/* Results Section */}
      {(isLoading || errorMessage || results.length > 0 || activeArticle) && (
        <section id="resultsSection" className="space-y-4 sm:space-y-6">
          {!activeArticle && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#182635] pb-3">
              <div>
                <h3
                  id="resultsTitle"
                  className="text-base sm:text-lg font-bold text-white flex items-center gap-2"
                >
                  <span>
                    {searchedQuery ? `Resultados para "${searchedQuery}"` : 'Resultados Encontrados'}
                  </span>
                </h3>
                <p id="resultsSubtitle" className="text-xs text-slate-400">
                  {results.length > 0
                    ? `Mostrando ${results.length}${
                        totalResults ? ` de ${totalResults.toLocaleString()}` : ''
                      } artículos validados por idioma y precisión de términos.`
                    : 'Selecciona una investigación para ver metadatos, métricas, resumen y citas'}
                </p>
              </div>
              {results.length > 0 && (
                <div id="resultsBadge" className="self-start sm:self-auto">
                  <span className="px-2.5 py-1 bg-[#0b121c] text-[#32E6E2] border border-[#182635] rounded-md text-xs font-semibold">
                    {results.length}
                    {totalResults ? ` de ${totalResults.toLocaleString()}` : ''} Encontrados
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div id="loadingState" className="py-12 sm:py-16 text-center space-y-3">
              <div className="inline-block p-4 bg-[#32E6E2]/10 rounded-full border border-[#32E6E2]/30 text-[#32E6E2] animate-spin">
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <p className="text-slate-300 font-medium text-xs sm:text-sm">
                Consultando Crossref, Semantic Scholar, Unpaywall y OpenAlex...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !isLoading && (
            <div
              id="errorState"
              className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 sm:p-5 text-red-300 text-xs sm:text-sm flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-200">Sin resultados o error de servidor</h4>
                <p id="errorMessage" className="text-xs mt-1 text-red-300/80">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Active Article Detail View */}
          {activeArticle && (
            <ArticleDetailView
              article={activeArticle}
              isSaved={savedLibrary.some((s) => s.doi === activeArticle.doi)}
              onToggleSave={onToggleSave}
              onBack={() => setActiveArticle(null)}
              onShowToast={onShowToast}
            />
          )}

          {/* Multi-Results Cards Grid */}
          {!activeArticle && results.length > 0 && !isLoading && (
            <div id="resultsList" className="grid grid-cols-1 gap-3 sm:gap-4">
              {results.map((item, index) => {
                const isSaved = savedLibrary.some((s) => s.doi === item.doi);
                const langBadge =
                  (item.detectedLanguage && LANG_MAP[item.detectedLanguage]) ||
                  (item.detectedLanguage ? item.detectedLanguage.toUpperCase() : '🌐');
                const isHighRelevance = (item.relevanceScore || 0) >= 300;

                return (
                  <div
                    key={item.id || item.doi || index}
                    className="bg-[#0b121c] border border-[#182635] hover:border-[#32E6E2]/50 rounded-xl p-3.5 sm:p-4 transition-all group animate-fade-in"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="px-2 py-0.5 bg-[#060B10] text-[#32E6E2] border border-[#182635] rounded text-[10px] sm:text-[11px] font-mono font-semibold break-all max-w-full">
                            DOI: {item.doi}
                          </span>
                          <span className="px-1.5 py-0.5 bg-[#182635] text-slate-300 rounded text-[10px] font-bold">
                            {langBadge}
                          </span>
                          {isHighRelevance && (
                            <span className="px-1.5 py-0.5 bg-[#32E6E2]/10 text-[#32E6E2] border border-[#32E6E2]/30 rounded text-[10px] font-extrabold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Alta Coincidencia
                            </span>
                          )}
                          <span className="text-[11px] sm:text-xs text-slate-400">
                            {item.year} • <span className="italic text-slate-300">{item.journal}</span>
                          </span>
                          {item.citationCount > 0 && (
                            <span className="text-[10px] sm:text-[11px] bg-amber-950/60 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                              <Quote className="w-3 h-3" /> {item.citationCount} citas
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-[#32E6E2] transition-colors leading-snug break-words">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 sm:line-clamp-1 break-words">
                          <strong>Autores:</strong> {item.authors}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-start flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#182635] w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => onToggleSave(item)}
                          title="Guardar en biblioteca"
                          className={`p-2 sm:p-2.5 rounded-lg border border-[#182635] text-xs transition-colors ${
                            isSaved
                              ? 'bg-[#32E6E2] text-[#060B10]'
                              : 'bg-[#060B10] text-slate-400 hover:text-white'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInspectArticle(item.doi)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#32E6E2] hover:bg-[#2bd8d4] text-[#060B10] font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors shadow"
                        >
                          <span>Ficha Completa</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {!activeArticle &&
            results.length > 0 &&
            results.length < totalResults &&
            !isLoading && (
              <div id="loadMoreContainer" className="text-center pt-2 pb-4">
                <button
                  type="button"
                  onClick={() => executeSearch(true)}
                  disabled={isLoadingMore}
                  id="loadMoreBtn"
                  className="px-6 py-2.5 bg-[#0b121c] hover:bg-[#101b2b] text-[#32E6E2] border border-[#32E6E2]/40 hover:border-[#32E6E2] rounded-xl text-xs font-extrabold transition-all shadow-md inline-flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cargando más...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Cargar Más Resultados</span>
                    </>
                  )}
                </button>
              </div>
            )}
        </section>
      )}
    </div>
  );
};
