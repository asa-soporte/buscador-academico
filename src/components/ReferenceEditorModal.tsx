import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Plus, Trash2, BookOpen } from "lucide-react";
import { AcademicReference, Collection, DocumentType } from "../types";
import { triggerHaptic } from "../utils/haptics";

interface ReferenceEditorModalProps {
  reference: AcademicReference | null;
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (ref: AcademicReference) => void;
  darkMode?: boolean;
}

export const ReferenceEditorModal: React.FC<ReferenceEditorModalProps> = ({
  reference,
  collections,
  isOpen,
  onClose,
  onSave,
  darkMode = false,
}) => {
  const [formData, setFormData] = useState<Partial<AcademicReference>>({
    title: "",
    authors: [{ given: "", family: "" }],
    year: new Date().getFullYear(),
    journalOrBook: "",
    volume: "",
    issue: "",
    pages: "",
    publisher: "",
    doi: "",
    url: "",
    abstract: "",
    documentType: "journal_article",
    collectionId: "col-all",
    notes: "",
    tags: [],
    readingStatus: "to_read",
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (reference) {
      setFormData(reference);
    } else {
      setFormData({
        title: "",
        authors: [{ given: "", family: "" }],
        year: new Date().getFullYear(),
        journalOrBook: "",
        volume: "",
        issue: "",
        pages: "",
        publisher: "",
        doi: "",
        url: "",
        abstract: "",
        documentType: "journal_article",
        collectionId: "col-all",
        notes: "",
        tags: [],
        readingStatus: "to_read",
      });
    }
  }, [reference, isOpen]);

  const handleAuthorChange = (index: number, field: "given" | "family", val: string) => {
    const updated = [...(formData.authors || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, authors: updated });
  };

  const addAuthor = () => {
    triggerHaptic("light");
    setFormData({
      ...formData,
      authors: [...(formData.authors || []), { given: "", family: "" }],
    });
  };

  const removeAuthor = (index: number) => {
    triggerHaptic("light");
    const updated = (formData.authors || []).filter((_, i) => i !== index);
    setFormData({ ...formData, authors: updated });
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    triggerHaptic("light");
    const currentTags = formData.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...currentTags, tagInput.trim()] });
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    triggerHaptic("light");
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    triggerHaptic("medium");
    const newRef: AcademicReference = {
      id: reference?.id || `ref-${Date.now()}`,
      title: formData.title || "Sin título",
      authors:
        formData.authors && formData.authors.length > 0
          ? formData.authors.filter((a) => a.family.trim() || a.given.trim())
          : [{ given: "Autor", family: "Desconocido" }],
      year: formData.year || new Date().getFullYear(),
      journalOrBook: formData.journalOrBook || "",
      volume: formData.volume || "",
      issue: formData.issue || "",
      pages: formData.pages || "",
      publisher: formData.publisher || "",
      doi: formData.doi || "",
      url: formData.url || "",
      abstract: formData.abstract || "",
      documentType: formData.documentType || "journal_article",
      collectionId: formData.collectionId || "col-all",
      notes: formData.notes || "",
      tags: formData.tags || [],
      readingStatus: formData.readingStatus || "to_read",
      isFavorite: formData.isFavorite || false,
      dateAdded: formData.dateAdded || new Date().toISOString().split("T")[0],
    };

    onSave(newRef);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col z-10 shadow-2xl overflow-hidden ${
            darkMode ? "bg-slate-900 text-slate-100 border border-slate-800" : "bg-white text-slate-900 border border-slate-200"
          }`}
        >
          <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
            <div className={`w-12 h-1.5 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />
          </div>

          <div className="px-5 py-3 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base tracking-tight">
                {reference ? "Editar Referencia" : "Nueva Referencia"}
              </h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Título del documento *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Deep Residual Learning for Image Recognition"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            {/* Document Type & Collection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Tipo de documento
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="journal_article">Artículo de Revista</option>
                  <option value="conference_paper">Ponencia / Conferencia</option>
                  <option value="book">Libro</option>
                  <option value="book_chapter">Capítulo de Libro</option>
                  <option value="thesis">Tesis / Disertación</option>
                  <option value="preprint">Preprint (arXiv, etc.)</option>
                  <option value="report">Informe Técnico</option>
                  <option value="webpage">Sitio Web / Enlace</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Carpeta / Colección
                </label>
                <select
                  value={formData.collectionId}
                  onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Authors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Autores (Apellido y Nombre)
                </label>
                <button
                  type="button"
                  onClick={addAuthor}
                  className="flex items-center space-x-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Autor</span>
                </button>
              </div>

              {formData.authors?.map((author, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Apellidos"
                    value={author.family}
                    onChange={(e) => handleAuthorChange(index, "family", e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Nombres o Iniciales"
                    value={author.given}
                    onChange={(e) => handleAuthorChange(index, "given", e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                  {formData.authors!.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Publication details: Year, Journal/Book, Vol, Issue, Pages */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Año
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Revista / Editorial
                </label>
                <input
                  type="text"
                  value={formData.journalOrBook}
                  onChange={(e) => setFormData({ ...formData, journalOrBook: e.target.value })}
                  placeholder="Nature, IEEE, Elsevier..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Volumen
                </label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="14"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  placeholder="2"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Páginas
                </label>
                <input
                  type="text"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  placeholder="120-135"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
            </div>

            {/* DOI & URL */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  DOI
                </label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  placeholder="10.1038/..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  URL / PDF Link
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Resumen / Abstract
              </label>
              <textarea
                rows={3}
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                placeholder="Texto del resumen científico..."
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            {/* Tags & Reading Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Etiquetas / Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Añadir tag (e.g. Tesis, Revisión)..."
                  className={`flex-1 px-3 py-1.5 rounded-xl text-xs border ${
                    darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold"
                >
                  Añadir
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
                  >
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Notas personales del investigador
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anotaciones, citas textuales importantes, ideas para la tesis..."
                className={`w-full px-3 py-2 rounded-xl text-xs border ${
                  darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-sm shadow-md active:scale-98 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar en Biblioteca</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
