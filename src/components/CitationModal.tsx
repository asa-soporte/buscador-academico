import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check, Quote, Share2, FileCode, BookMarked, Sparkles } from "lucide-react";
import { AcademicReference, CitationStyle, FormattedCitations } from "../types";
import { triggerHaptic } from "../utils/haptics";

interface CitationModalProps {
  reference: AcademicReference | null;
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  reference,
  isOpen,
  onClose,
  darkMode = false,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>("apa7");
  const [citations, setCitations] = useState<FormattedCitations | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!reference || !isOpen) return;

    const fetchCitations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/academic/generate-citations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        if (res.ok) {
          const data = await res.json();
          setCitations(data.citations);
        }
      } catch (err) {
        console.error("Error fetching citations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCitations();
  }, [reference, isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    triggerHaptic("light");
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const citationStyles: { id: CitationStyle; label: string; desc: string }[] = [
    { id: "apa7", label: "APA 7ª Ed.", desc: "Ciencias Sociales, Psicología, Educación" },
    { id: "ieee", label: "IEEE", desc: "Ingeniería, Computación, Telecomunicaciones" },
    { id: "vancouver", label: "Vancouver", desc: "Medicina, Biomedicina, Farmacia" },
    { id: "harvard", label: "Harvard", desc: "Economía, Negocios, Humanidades" },
    { id: "chicago_ad", label: "Chicago (Autor-Año)", desc: "Ciencias Físicas y Sociales" },
    { id: "mla9", label: "MLA 9ª Ed.", desc: "Literatura, Lingüística, Artes" },
    { id: "bibtex", label: "BibTeX", desc: "LaTeX, Overleaf, Zotero" },
    { id: "ris", label: "RIS", desc: "EndNote, Mendeley, RefWorks" },
  ];

  if (!isOpen || !reference) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col z-10 shadow-2xl overflow-hidden ${
            darkMode ? "bg-slate-900 text-slate-100 border border-slate-800" : "bg-white text-slate-900 border border-slate-200"
          }`}
        >
          {/* Android Sheet Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
            <div className={`w-12 h-1.5 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />
          </div>

          {/* Header */}
          <div className="px-5 py-3 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Quote className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight">Citar Referencia</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
                  {reference.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Style Selector Chips (Horizontal Scrollable) */}
          <div className="px-4 py-2.5 overflow-x-auto flex space-x-2 border-b border-slate-100 dark:border-slate-800/60 no-scrollbar">
            {citationStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  triggerHaptic("selection");
                  setSelectedStyle(style.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStyle === style.id
                    ? "bg-sky-600 text-white shadow-sm"
                    : darkMode
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Generando normas bibliográficas...</span>
              </div>
            ) : citations ? (
              <>
                {/* Main Citation Box */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    darkMode ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      {citationStyles.find((s) => s.id === selectedStyle)?.label}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          citations[selectedStyle] || "",
                          `main-${selectedStyle}`
                        )
                      }
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-all active:scale-95 shadow-xs"
                    >
                      {copiedKey === `main-${selectedStyle}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {selectedStyle === "bibtex" || selectedStyle === "ris" ? (
                    <pre className="text-xs font-mono p-3 bg-slate-950 text-emerald-400 rounded-xl overflow-x-auto whitespace-pre-wrap select-all">
                      {citations[selectedStyle]}
                    </pre>
                  ) : (
                    <p className="text-sm font-serif leading-relaxed select-all">
                      {citations[selectedStyle]}
                    </p>
                  )}
                </div>

                {/* In-text citation preview for APA / Harvard */}
                {selectedStyle === "apa7" && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Citas en el texto (APA 7):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div
                        onClick={() =>
                          copyToClipboard(
                            citations.apa7InTextParenthetical,
                            "parenthetical"
                          )
                        }
                        className={`p-3 rounded-xl border cursor-pointer hover:border-sky-500 transition-all ${
                          darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mb-1">
                          <span>Parentética</span>
                          {copiedKey === "parenthetical" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </div>
                        <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 font-mono">
                          {citations.apa7InTextParenthetical}
                        </p>
                      </div>

                      <div
                        onClick={() =>
                          copyToClipboard(citations.apa7InTextNarrative, "narrative")
                        }
                        className={`p-3 rounded-xl border cursor-pointer hover:border-sky-500 transition-all ${
                          darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mb-1">
                          <span>Narrativa</span>
                          {copiedKey === "narrative" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </div>
                        <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 font-mono">
                          {citations.apa7InTextNarrative}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata summary badge list */}
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {reference.doi && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                      DOI: {reference.doi}
                    </span>
                  )}
                  {reference.year && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                      Año: {reference.year}
                    </span>
                  )}
                  {reference.documentType && (
                    <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 capitalize">
                      Tipo: {reference.documentType.replace("_", " ")}
                    </span>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
