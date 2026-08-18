import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Target, Compass, CheckCircle2, AlertTriangle, Lightbulb, Copy, Check } from "lucide-react";
import { AcademicReference, PaperSummary } from "../types";
import { triggerHaptic } from "../utils/haptics";

interface PaperSummaryModalProps {
  reference: AcademicReference | null;
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const PaperSummaryModal: React.FC<PaperSummaryModalProps> = ({
  reference,
  isOpen,
  onClose,
  darkMode = false,
}) => {
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference || !isOpen) return;

    const generateSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/academic/summarize-paper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: reference.title,
            abstract: reference.abstract,
            fullText: reference.notes,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
        } else {
          setError("No se pudo generar el resumen con Gemini.");
        }
      } catch (err: any) {
        setError(err.message || "Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [reference, isOpen]);

  const copyFullSummary = () => {
    if (!summary) return;
    triggerHaptic("light");
    const text = `SÍNTESIS CIENTÍFICA: ${reference?.title}\n\n🎯 TL;DR: ${summary.tldr}\n\n📌 Objetivo: ${summary.objective}\n\n🔬 Metodología: ${summary.methodology}\n\n✨ Hallazgos Clave:\n${summary.keyFindings.map((k) => `• ${k}`).join("\n")}\n\n⚠️ Limitaciones:\n${summary.limitations.map((l) => `• ${l}`).join("\n")}\n\n💡 Implicaciones: ${summary.practicalImplications}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col z-10 shadow-2xl overflow-hidden ${
            darkMode ? "bg-slate-900 text-slate-100 border border-slate-800" : "bg-white text-slate-900 border border-slate-200"
          }`}
        >
          {/* Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
            <div className={`w-12 h-1.5 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />
          </div>

          {/* Header */}
          <div className="px-5 py-3 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight flex items-center space-x-1.5">
                  <span>Síntesis IA del Artículo</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                    Gemini
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                  {reference.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {summary && (
                <button
                  onClick={copyFullSummary}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  title="Copiar síntesis"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium animate-pulse">
                  Gemini está analizando la metodología y resultados...
                </span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {error}
              </div>
            ) : summary ? (
              <>
                {/* TL;DR Highlight Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-sky-500/10 to-indigo-500/10 border border-violet-500/20">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Conclusión en 1 Oración (TL;DR)</span>
                  </div>
                  <p className="text-sm font-medium leading-snug">{summary.tldr}</p>
                </div>

                {/* Objective */}
                <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 mb-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Objetivo de Investigación</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {summary.objective}
                  </p>
                </div>

                {/* Methodology */}
                <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Diseño Metodológico</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {summary.methodology}
                  </p>
                </div>

                {/* Key Findings */}
                <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hallazgos Principales</span>
                  </div>
                  <ul className="space-y-1.5">
                    {summary.keyFindings.map((finding, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {summary.limitations && summary.limitations.length > 0 && (
                  <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Limitaciones y Sesgos</span>
                    </div>
                    <ul className="space-y-1.5">
                      {summary.limitations.map((lim, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practical Implications */}
                <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Implicaciones Prácticas y Futuras</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {summary.practicalImplications}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
