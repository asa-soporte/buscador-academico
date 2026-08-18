import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  ClipboardPaste,
  Quote,
  CheckCircle,
  FileCode,
  ArrowRight,
  BookOpen,
  Calendar,
  User,
  Hash,
  Link,
  Layers,
  Save,
} from "lucide-react";
import { AcademicReference } from "../types";
import { triggerHaptic } from "../utils/haptics";

interface MetadataExtractorTabProps {
  onSaveToLibrary: (ref: AcademicReference) => void;
  onCite: (ref: AcademicReference) => void;
  darkMode?: boolean;
}

export const MetadataExtractorTab: React.FC<MetadataExtractorTabProps> = ({
  onSaveToLibrary,
  onCite,
  darkMode = false,
}) => {
  const [inputText, setInputText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedRef, setExtractedRef] = useState<AcademicReference | null>(null);
  const [extractionMethod, setExtractionMethod] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick preset examples
  const exampleInputs = [
    {
      label: "DOI de Nature",
      text: "10.1038/s41586-020-2649-2",
    },
    {
      label: "Cita desordenada",
      text: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., ... & Polosukhin, I. (2017). Attention is all you need. Advances in neural information processing systems, 30.",
    },
    {
      label: "BibTeX",
      text: `@article{goodfellow2014generative,
  title={Generative adversarial nets},
  author={Goodfellow, Ian and Pouget-Abadie, Jean and Mirza, Mehdi and Xu, Bing and Warde-Farley, David and Ozair, Sherjil and Courville, Aaron and Bengio, Yoshua},
  journal={Advances in neural information processing systems},
  volume={27},
  year={2014}
}`,
    },
  ];

  const handlePasteFromClipboard = async () => {
    triggerHaptic("light");
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleExtract = async (textToExtract: string = inputText) => {
    if (!textToExtract.trim()) return;
    triggerHaptic("medium");
    setIsExtracting(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/academic/extract-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: textToExtract.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedRef(data.extracted);
        setExtractionMethod(data.method);
      }
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!extractedRef) return;
    triggerHaptic("selection");
    onSaveToLibrary(extractedRef);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Header Info */}
      <div
        className={`p-4 rounded-3xl border shadow-xs transition-all ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
              Extractor & Normalizador de Metadatos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pega un DOI, cita de texto crudo, BibTeX o fragmento de PDF
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-3 relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ejemplo: 10.1016/j.cell.2021.05.012  o pega la cita textual de un paper..."
            className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed ${
              darkMode
                ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                darkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Pegar portapapeles</span>
            </button>

            <button
              type="button"
              onClick={() => handleExtract()}
              disabled={isExtracting || !inputText.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extrayendo con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Procesar Metadatos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Probar ejemplos:</span>
          {exampleInputs.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(ex.text);
                handleExtract(ex.text);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border active:scale-95 transition-all ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Result Card */}
      {extractedRef && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`p-5 rounded-3xl border shadow-lg transition-all ${
            darkMode ? "bg-slate-900 border-sky-900/60" : "bg-white border-sky-200"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {extractionMethod === "DOI_CROSSREF" ? "Resolución DOI Oficial" : "Normalizado con Gemini IA"}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>100% Estructurado</span>
              </span>
            </div>

            <span className="text-xs font-bold text-slate-400 capitalize">
              {extractedRef.documentType.replace("_", " ")}
            </span>
          </div>

          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug mb-3">
            {extractedRef.title}
          </h3>

          {/* Metadata Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 text-xs">
            <div className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center space-x-1 text-slate-400 font-semibold text-[10px] mb-1">
                <User className="w-3 h-3 text-sky-500" />
                <span>AUTORES</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {extractedRef.authors.map((a) => `${a.family}, ${a.given}`).join("; ")}
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center space-x-1 text-slate-400 font-semibold text-[10px] mb-1">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                <span>REVISTA / FUENTE</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {extractedRef.journalOrBook || "N/A"}{" "}
                {extractedRef.volume ? `Vol. ${extractedRef.volume}` : ""}{" "}
                {extractedRef.pages ? `pp. ${extractedRef.pages}` : ""}
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center space-x-1 text-slate-400 font-semibold text-[10px] mb-1">
                <Calendar className="w-3 h-3 text-emerald-500" />
                <span>AÑO DE PUBLICACIÓN</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {extractedRef.year || "s.f."}
              </p>
            </div>

            <div className={`p-2.5 rounded-xl border ${darkMode ? "bg-slate-800/50 border-slate-700/80" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center space-x-1 text-slate-400 font-semibold text-[10px] mb-1">
                <Hash className="w-3 h-3 text-violet-500" />
                <span>IDENTIFICADOR DOI</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {extractedRef.doi || "No especificado"}
              </p>
            </div>
          </div>

          {/* Abstract if available */}
          {extractedRef.abstract && (
            <div className={`p-3 rounded-2xl mb-4 text-xs border ${darkMode ? "bg-slate-800/30 border-slate-800" : "bg-slate-50/70 border-slate-200"}`}>
              <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">
                Resumen / Abstract
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {extractedRef.abstract}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onCite(extractedRef)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                darkMode ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
              }`}
            >
              <Quote className="w-4 h-4 text-sky-500" />
              <span>Ver Citas (APA, IEEE, BibTeX)</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs active:scale-95 ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-sky-600 hover:bg-sky-700 text-white"
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>¡Añadido a Biblioteca!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar en Mi Biblioteca</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
