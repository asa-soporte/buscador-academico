import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bookmark,
  Folder,
  FolderPlus,
  Tag,
  Star,
  Download,
  Upload,
  Trash2,
  Edit3,
  Quote,
  Sparkles,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Share2,
  FileText,
  FileCode,
  SlidersHorizontal,
} from "lucide-react";
import { AcademicReference, Collection, ReadingStatus } from "../types";
import { triggerHaptic } from "../utils/haptics";

interface LibraryTabProps {
  references: AcademicReference[];
  collections: Collection[];
  onCite: (ref: AcademicReference) => void;
  onSummarize: (ref: AcademicReference) => void;
  onEdit: (ref: AcademicReference) => void;
  onDelete: (refId: string) => void;
  onToggleFavorite: (refId: string) => void;
  onUpdateStatus: (refId: string, status: ReadingStatus) => void;
  onCreateCollection: (name: string, color: string) => void;
  onImportReferences: (importedRefs: AcademicReference[]) => void;
  darkMode?: boolean;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  references,
  collections,
  onCite,
  onSummarize,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateStatus,
  onCreateCollection,
  onImportReferences,
  darkMode = false,
}) => {
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState("#3b82f6");

  // Gather unique tags
  const allTags = Array.from(
    new Set(references.flatMap((r) => r.tags || []))
  );

  // Filtered references
  const filteredReferences = references.filter((r) => {
    if (selectedCollection !== "all" && r.collectionId !== selectedCollection) return false;
    if (showOnlyFavorites && !r.isFavorite) return false;
    if (selectedTag !== "all" && !(r.tags || []).includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchAuthor = r.authors.some((a) => `${a.family} ${a.given}`.toLowerCase().includes(q));
      const matchJournal = (r.journalOrBook || "").toLowerCase().includes(q);
      const matchDoi = (r.doi || "").toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchJournal && !matchDoi) return false;
    }
    return true;
  });

  // Export full library as BibTeX
  const exportAsBibTeX = () => {
    triggerHaptic("light");
    const bibtexStrings = filteredReferences.map((ref) => {
      const key = (ref.authors[0]?.family || "ref").toLowerCase().replace(/[^a-z0-9]/g, "") + (ref.year || "2024");
      const authors = ref.authors.map((a) => `${a.family}, ${a.given}`).join(" and ");
      return `@article{${key},
  title = {${ref.title}},
  author = {${authors}},
  year = {${ref.year}},
  journal = {${ref.journalOrBook || ""}},
  volume = {${ref.volume || ""}},
  pages = {${ref.pages || ""}},
  doi = {${ref.doi || ""}}
}`;
    }).join("\n\n");

    const blob = new Blob([bibtexStrings], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bibliografia_${selectedCollection}_${new Date().toISOString().split("T")[0]}.bib`;
    link.click();
  };

  // Export as RIS
  const exportAsRIS = () => {
    triggerHaptic("light");
    const risStrings = filteredReferences.map((ref) => {
      const authors = ref.authors.map((a) => `AU  - ${a.family}, ${a.given}`).join("\n");
      return `TY  - JOUR
TI  - ${ref.title}
${authors}
PY  - ${ref.year}
JO  - ${ref.journalOrBook || ""}
VL  - ${ref.volume || ""}
DO  - ${ref.doi || ""}
ER  -`;
    }).join("\n\n");

    const blob = new Blob([risStrings], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bibliografia_${new Date().toISOString().split("T")[0]}.ris`;
    link.click();
  };

  const handleCreateCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    triggerHaptic("selection");
    onCreateCollection(newCollectionName.trim(), newCollectionColor);
    setNewCollectionName("");
    setShowNewCollectionModal(false);
  };

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Top Stats & Quick Actions */}
      <div
        className={`p-4 rounded-3xl border shadow-xs transition-all ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>Mi Gestor Bibliográfico</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {references.length} referencias guardadas • {collections.length} colecciones
            </p>
          </div>

          {/* Export Actions Menu */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={exportAsBibTeX}
              title="Exportar como BibTeX"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1 active:scale-95 transition-all ${
                darkMode ? "bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-sky-700 hover:bg-slate-100"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>.BIB</span>
            </button>

            <button
              onClick={exportAsRIS}
              title="Exportar como RIS"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1 active:scale-95 transition-all ${
                darkMode ? "bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-indigo-700 hover:bg-slate-100"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>.RIS</span>
            </button>
          </div>
        </div>

        {/* Local Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar en biblioteca por título, autor, DOI..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              darkMode ? "bg-slate-800/80 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          />
        </div>

        {/* Collections / Folders Carousel */}
        <div className="mt-3 flex items-center space-x-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => {
              triggerHaptic("selection");
              setSelectedCollection("all");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              selectedCollection === "all"
                ? "bg-sky-600 text-white shadow-xs"
                : darkMode
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Todas ({references.length})</span>
          </button>

          {collections.map((col) => {
            const count = references.filter((r) => r.collectionId === col.id).length;
            const isSelected = selectedCollection === col.id;

            return (
              <button
                key={col.id}
                onClick={() => {
                  triggerHaptic("selection");
                  setSelectedCollection(col.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-xs"
                    : darkMode
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color || "#3b82f6" }}
                />
                <span>{col.name}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}

          {/* New folder button */}
          <button
            onClick={() => {
              triggerHaptic("light");
              setShowNewCollectionModal(true);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border border-dashed flex items-center space-x-1 whitespace-nowrap ${
              darkMode ? "border-slate-700 text-slate-400 hover:border-slate-500" : "border-slate-300 text-slate-600 hover:border-slate-400"
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5 text-sky-500" />
            <span>Nueva Carpeta</span>
          </button>
        </div>

        {/* Tags & Favorite toggle */}
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              triggerHaptic("light");
              setShowOnlyFavorites(!showOnlyFavorites);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 whitespace-nowrap transition-all ${
              showOnlyFavorites
                ? "bg-amber-500 text-white"
                : darkMode
                ? "bg-slate-800 text-slate-400"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Star className={`w-3 h-3 ${showOnlyFavorites ? "fill-white" : ""}`} />
            <span>Favoritos</span>
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                triggerHaptic("light");
                setSelectedTag(selectedTag === tag ? "all" : tag);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? "bg-indigo-600 text-white"
                  : darkMode
                  ? "bg-slate-800/60 text-slate-400"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Reference Cards List */}
      {filteredReferences.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Bookmark className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
          <p className="text-xs font-medium">No se encontraron referencias en esta colección.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReferences.map((ref) => {
            const authorList = ref.authors.map((a) => `${a.family}, ${a.given}`).join("; ");

            return (
              <motion.div
                key={ref.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-3xl border transition-all ${
                  darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                {/* Meta header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {ref.year || "s.f."}
                    </span>
                    <span>•</span>
                    <span className="font-medium truncate max-w-[180px]">
                      {ref.journalOrBook || "Publicación"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Favorite Toggle */}
                    <button
                      onClick={() => onToggleFavorite(ref.id)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          ref.isFavorite
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-400"
                        }`}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        triggerHaptic("heavy");
                        onDelete(ref.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug mb-1">
                  {ref.title}
                </h3>

                {/* Authors */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 truncate">
                  {authorList}
                </p>

                {/* Personal Notes */}
                {ref.notes && (
                  <div
                    className={`p-2.5 rounded-xl mb-2.5 text-xs border ${
                      darkMode ? "bg-amber-950/20 border-amber-900/40 text-amber-200" : "bg-amber-50/70 border-amber-200/70 text-amber-900"
                    }`}
                  >
                    <span className="font-bold text-[10px] uppercase tracking-wider block mb-0.5 opacity-75">
                      Nota de investigación:
                    </span>
                    <p className="line-clamp-2 leading-relaxed">{ref.notes}</p>
                  </div>
                )}

                {/* Tags */}
                {ref.tags && ref.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ref.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    {/* Cite */}
                    <button
                      onClick={() => onCite(ref)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all ${
                        darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      <Quote className="w-3.5 h-3.5 text-sky-500" />
                      <span>Citar</span>
                    </button>

                    {/* AI Summarize */}
                    <button
                      onClick={() => onSummarize(ref)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Resumen IA</span>
                    </button>
                  </div>

                  {/* Edit */}
                  <button
                    onClick={() => onEdit(ref)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Editar detalles"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: New Folder / Collection */}
      <AnimatePresence>
        {showNewCollectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewCollectionModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm rounded-3xl p-5 z-10 shadow-2xl ${
                darkMode ? "bg-slate-900 text-slate-100 border border-slate-800" : "bg-white text-slate-900"
              }`}
            >
              <h3 className="font-bold text-base mb-3 flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-sky-600" />
                <span>Nueva Carpeta de Colección</span>
              </h3>

              <form onSubmit={handleCreateCollectionSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Nombre de la carpeta
                  </label>
                  <input
                    type="text"
                    required
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g. Tesis Capítulo 2, Marco Teórico..."
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Color identificador
                  </label>
                  <div className="flex space-x-2">
                    {["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCollectionColor(color)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          newCollectionColor === color ? "scale-125 ring-2 ring-sky-500 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewCollectionModal(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-xs"
                  >
                    Crear Carpeta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
