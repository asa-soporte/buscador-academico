import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  Mic,
  MicOff,
  Filter,
  Sparkles,
  Quote,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  BookOpen,
  FileText,
  Building,
  Check,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { AcademicReference, DocumentType } from "../types";
import { triggerHaptic } from "../utils/haptics";

interface SearchTabProps {
  onCite: (ref: AcademicReference) => void;
  onSummarize: (ref: AcademicReference) => void;
  onSaveToLibrary: (ref: AcademicReference) => void;
  isSaved: (refId: string, doi?: string) => boolean;
  onOpenBooleanBuilder: () => void;
  darkMode?: boolean;
}

export const SearchTab: React.FC<SearchTabProps> = ({
  onCite,
  onSummarize,
  onSaveToLibrary,
  isSaved,
  onOpenBooleanBuilder,
  darkMode = false,
}) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AcademicReference[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Quick suggestion queries
  const suggestions = [
    "Machine Learning in Healthcare",
    "CRISPR gene editing therapy",
    "Solar photovoltaic perovskite",
    "Metodología de la investigación mixta",
    "Generative AI ethics and copyright",
  ];

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    triggerHaptic("medium");
    setIsSearching(true);

    try {
      const res = await fetch("/api/academic/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery.trim(),
          filterType: selectedFilter,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Voice Search with Web Speech API
  const toggleVoiceSearch = () => {
    triggerHaptic("light");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("El reconocimiento de voz no está soportado en este navegador.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSave = (ref: AcademicReference) => {
    triggerHaptic("selection");
    onSaveToLibrary(ref);
    setSavedSuccessId(ref.id);
    setTimeout(() => setSavedSuccessId(null), 2000);
  };

  const filteredResults = results.filter((item) => {
    if (openAccessOnly && !item.openAccess) return false;
    if (selectedFilter !== "all" && item.documentType !== selectedFilter) return false;
    return true;
  });

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Android Search Bar Header */}
      <div
        className={`p-4 rounded-3xl border shadow-xs transition-all ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center"
        >
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            id="academic-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por tema, autor, DOI o título..."
            className={`w-full pl-11 pr-24 py-3 rounded-2xl text-xs sm:text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
              darkMode
                ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="absolute right-2 flex items-center space-x-1">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-2 rounded-xl transition-colors ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : darkMode
                  ? "hover:bg-slate-700 text-slate-400"
                  : "hover:bg-slate-200 text-slate-500"
              }`}
              title="Búsqueda por voz"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Search Submit */}
            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Buscar"
              )}
            </button>
          </div>
        </form>

        {/* Filter Chips */}
        <div className="mt-3 flex items-center space-x-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === "all"
                ? "bg-sky-600 text-white"
                : darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Todos los tipos
          </button>
          <button
            onClick={() => setSelectedFilter("journal_article")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === "journal_article"
                ? "bg-sky-600 text-white"
                : darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Artículos
          </button>
          <button
            onClick={() => setSelectedFilter("conference_paper")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === "conference_paper"
                ? "bg-sky-600 text-white"
                : darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Conferencias
          </button>
          <button
            onClick={() => setSelectedFilter("book")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === "book"
                ? "bg-sky-600 text-white"
                : darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Libros
          </button>

          <button
            onClick={() => setOpenAccessOnly(!openAccessOnly)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all flex items-center space-x-1 ${
              openAccessOnly
                ? "bg-emerald-600 text-white border-emerald-600"
                : darkMode
                ? "bg-slate-800/60 border-slate-700 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <span>Open Access</span>
            {openAccessOnly && <Check className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Boolean Query Helper Banner */}
      <div
        onClick={() => {
          triggerHaptic("light");
          onOpenBooleanBuilder();
        }}
        className={`p-3.5 rounded-2xl border cursor-pointer hover:border-sky-500 transition-all flex items-center justify-between ${
          darkMode
            ? "bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border-sky-900/50 text-slate-200"
            : "bg-gradient-to-r from-sky-50 via-indigo-50 to-white border-sky-100 text-slate-800"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold flex items-center space-x-1">
              <span>Generador de Ecuaciones Booleanas</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-600 text-white font-bold">
                IA
              </span>
            </h4>
            <p className="text-[11px] opacity-75">
              Crea consultas optimizadas con AND, OR, NOT y MeSH para Scopus y PubMed.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* Suggestions if no results yet */}
      {results.length === 0 && !isSearching && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Temas de búsqueda sugeridos:
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(sug);
                  handleSearch(sug);
                }}
                className={`px-3 py-2 rounded-2xl text-xs font-medium border text-left active:scale-95 transition-all flex items-center space-x-1.5 ${
                  darkMode
                    ? "bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Search className="w-3 h-3 text-sky-500 shrink-0" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results List */}
      {isSearching ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Buscando en OpenAlex y CrossRef...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResults.map((item) => {
            const alreadySaved = isSaved(item.id, item.doi);
            const authorList = item.authors.map((a) => `${a.family}, ${a.given}`).join("; ");

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-3xl border transition-all ${
                  darkMode ? "bg-slate-900 border-slate-800/80 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Header Meta */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {item.year || "s.f."}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[180px] font-medium">
                      {item.journalOrBook || "Revista Científica"}
                    </span>
                    {item.openAccess && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        OA
                      </span>
                    )}
                  </div>

                  {item.citationCount !== undefined && item.citationCount > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.citationCount} citas
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm leading-snug tracking-tight text-slate-900 dark:text-slate-100 mb-1.5">
                  {item.title}
                </h3>

                {/* Authors */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 truncate">
                  {authorList || "Autor anónimo"}
                </p>

                {/* Abstract Preview */}
                {item.abstract && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {item.abstract}
                  </p>
                )}

                {/* Action Buttons Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    {/* Cite Button */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        onCite(item);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                        darkMode
                          ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      }`}
                    >
                      <Quote className="w-3.5 h-3.5 text-sky-500" />
                      <span>Citar</span>
                    </button>

                    {/* AI Summarize Button */}
                    <button
                      onClick={() => {
                        triggerHaptic("selection");
                        onSummarize(item);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 flex items-center space-x-1 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Resumen IA</span>
                    </button>

                    {/* Link */}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Abrir fuente original"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Bookmark Save */}
                  <button
                    onClick={() => handleSave(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 ${
                      alreadySaved
                        ? "bg-emerald-600 text-white"
                        : "bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                    }`}
                  >
                    {alreadySaved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Guardado</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
