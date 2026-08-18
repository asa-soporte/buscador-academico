import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Wrench,
  Search,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Code,
  Download,
} from "lucide-react";
import { BooleanSearchStrategy } from "../types";
import { triggerHaptic } from "../utils/haptics";

interface ToolsTabProps {
  darkMode?: boolean;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ darkMode = false }) => {
  const [activeTool, setActiveTool] = useState<"boolean" | "apa_auditor" | "pwa_android">("boolean");

  // Boolean Tool State
  const [researchTopic, setResearchTopic] = useState("");
  const [isBuildingBoolean, setIsBuildingBoolean] = useState(false);
  const [booleanStrategy, setBooleanStrategy] = useState<BooleanSearchStrategy | null>(null);
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  // APA Auditor State
  const [citationToCheck, setCitationToCheck] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  const handleBuildBoolean = async () => {
    if (!researchTopic.trim()) return;
    triggerHaptic("medium");
    setIsBuildingBoolean(true);

    try {
      const res = await fetch("/api/academic/boolean-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: researchTopic.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setBooleanStrategy(data.strategy);
      }
    } catch (err) {
      console.error("Boolean builder error:", err);
    } finally {
      setIsBuildingBoolean(false);
    }
  };

  const handleAuditCitation = async () => {
    if (!citationToCheck.trim()) return;
    triggerHaptic("medium");
    setIsAuditing(true);

    try {
      const res = await fetch("/api/academic/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Por favor audita y analiza con rigor estricto la siguiente cita bibliográfica bajo las normas APA 7ª edición (o la norma que corresponda).
Indica:
1. ¿Es correcta la puntuación, cursivas, orden de autores y año?
2. Si tiene errores, muestra la versión 100% corregida.
3. Formato para citarla dentro del texto (Parentética y Narrativa).

Cita a auditar:
"""
${citationToCheck.trim()}
"""`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.reply);
      }
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const copyText = (text: string, key: string) => {
    triggerHaptic("light");
    navigator.clipboard.writeText(text);
    setCopiedQuery(key);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Tool Navigation Chips */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            triggerHaptic("selection");
            setActiveTool("boolean");
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTool === "boolean"
              ? "bg-sky-600 text-white shadow-xs"
              : darkMode
              ? "bg-slate-900 border border-slate-800 text-slate-300"
              : "bg-white border border-slate-200 text-slate-700"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Ecuaciones Booleanas</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic("selection");
            setActiveTool("apa_auditor");
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTool === "apa_auditor"
              ? "bg-sky-600 text-white shadow-xs"
              : darkMode
              ? "bg-slate-900 border border-slate-800 text-slate-300"
              : "bg-white border border-slate-200 text-slate-700"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Auditor de Citas APA 7</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic("selection");
            setActiveTool("pwa_android");
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
            activeTool === "pwa_android"
              ? "bg-sky-600 text-white shadow-xs"
              : darkMode
              ? "bg-slate-900 border border-slate-800 text-slate-300"
              : "bg-white border border-slate-200 text-slate-700"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Nativo Android / APK</span>
        </button>
      </div>

      {/* TOOL 1: BOOLEAN EQUATION BUILDER */}
      {activeTool === "boolean" && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-3xl border shadow-xs ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Generador de Ecuaciones de Búsqueda
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Escribe tu tema o pregunta de investigación en lenguaje natural
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="Ejemplo: Impacto del uso de inteligencia artificial generativa en el rendimiento académico de estudiantes universitarios..."
                className={`w-full p-3.5 rounded-2xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                }`}
              />

              <button
                onClick={handleBuildBoolean}
                disabled={isBuildingBoolean || !researchTopic.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isBuildingBoolean ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Construyendo ecuaciones booleanas con Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Ecuaciones de Búsqueda</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {booleanStrategy && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Google Scholar Query Card */}
              <div
                className={`p-4 rounded-3xl border shadow-xs ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-sky-600 dark:text-sky-400">
                      Google Académico (Scholar)
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyText(booleanStrategy.googleScholarQuery, "scholar")
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-600 text-white flex items-center space-x-1"
                  >
                    {copiedQuery === "scholar" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="text-xs font-mono p-3 rounded-xl bg-slate-950 text-sky-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {booleanStrategy.googleScholarQuery}
                </pre>
              </div>

              {/* Scopus Query Card */}
              <div
                className={`p-4 rounded-3xl border shadow-xs ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    Scopus (TITLE-ABS-KEY)
                  </span>
                  <button
                    onClick={() => copyText(booleanStrategy.scopusQuery, "scopus")}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white flex items-center space-x-1"
                  >
                    {copiedQuery === "scopus" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="text-xs font-mono p-3 rounded-xl bg-slate-950 text-indigo-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {booleanStrategy.scopusQuery}
                </pre>
              </div>

              {/* PubMed Query Card */}
              <div
                className={`p-4 rounded-3xl border shadow-xs ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    PubMed / Medline (MeSH Terms)
                  </span>
                  <button
                    onClick={() => copyText(booleanStrategy.pubmedQuery, "pubmed")}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white flex items-center space-x-1"
                  >
                    {copiedQuery === "pubmed" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar</span>
                  </button>
                </div>
                <pre className="text-xs font-mono p-3 rounded-xl bg-slate-950 text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all">
                  {booleanStrategy.pubmedQuery}
                </pre>
              </div>

              {/* Keywords & Descriptors Tag Cloud */}
              <div
                className={`p-4 rounded-3xl border ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Descriptores y Sinónimos Identificados:
                </h4>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {booleanStrategy.keywordsSpanish.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
                    >
                      🇪🇸 {kw}
                    </span>
                  ))}
                  {booleanStrategy.keywordsEnglish.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                    >
                      🇬🇧 {kw}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2">
                  💡 <strong>Consejo metodológico:</strong> {booleanStrategy.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TOOL 2: APA AUDITOR */}
      {activeTool === "apa_auditor" && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-3xl border shadow-xs ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Auditor y Validador de Citas APA 7
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pega cualquier cita para diagnosticar errores de sangría, puntuación o autores
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={citationToCheck}
                onChange={(e) => setCitationToCheck(e.target.value)}
                placeholder="Pega la cita bibliográfica que deseas validar..."
                className={`w-full p-3.5 rounded-2xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                }`}
              />

              <button
                onClick={handleAuditCitation}
                disabled={isAuditing || !citationToCheck.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isAuditing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Auditando con Gemini 3.7 Flash...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Auditar Normas de Citación</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {auditResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-3xl border shadow-lg leading-relaxed text-xs whitespace-pre-wrap font-sans ${
                darkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Diagnóstico de Auditoría APA 7</span>
                </span>
                <button
                  onClick={() => copyText(auditResult, "audit")}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  {copiedQuery === "audit" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {auditResult}
            </motion.div>
          )}
        </div>
      )}

      {/* TOOL 3: ANDROID NATIVE & APK EXPORT GUIDE */}
      {activeTool === "pwa_android" && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-3xl border shadow-xs ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-600 text-white flex items-center justify-center shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Arquitectura Nativa Android (APK & PWA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Diseñado con Material Design 3, respuesta háptica y soporte offline
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className={`p-3.5 rounded-2xl border ${darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1.5">
                  <span>1. Instalación PWA Directa en Android</span>
                </h4>
                <p>
                  En tu dispositivo Android (Google Chrome), toca el menú de tres puntos <strong>(⋮)</strong> y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>. La app se ejecutará en modo pantalla completa sin barra de navegación del navegador, como una app nativa instalada.
                </p>
              </div>

              <div className={`p-3.5 rounded-2xl border ${darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1.5">
                  <span>2. Compilación a APK / AAB Nativo con Capacitor</span>
                </h4>
                <p className="mb-2">
                  Esta base de código es 100% compatible con <strong>Capacitor / Android Studio</strong> para empaquetar un archivo <code>.apk</code> instalable o publicar en Google Play Store:
                </p>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  npm install @capacitor/core @capacitor/cli @capacitor/android{`\n`}npx cap init "Buscador Academico" "com.academico.app"{`\n`}npx cap add android{`\n`}npx cap open android
                </pre>
              </div>

              <div className={`p-3.5 rounded-2xl border ${darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  3. Características Nativas Incluidas
                </h4>
                <ul className="space-y-1">
                  <li>• 📳 Retroalimentación háptica con la API <code>navigator.vibrate</code>.</li>
                  <li>• 🎙️ Búsqueda por voz con la API nativa de reconocimiento de voz.</li>
                  <li>• 📂 Persistencia local offline en el dispositivo del usuario.</li>
                  <li>• 🎨 Barra de estado y navegación adaptativas estilo Android 15.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
