import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles, Edit3, FolderPlus, ScanLine, X } from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

interface AndroidFabProps {
  onOpenExtractor: () => void;
  onOpenManualEditor: () => void;
  onOpenNewFolder: () => void;
  darkMode?: boolean;
}

export const AndroidFab: React.FC<AndroidFabProps> = ({
  onOpenExtractor,
  onOpenManualEditor,
  onOpenNewFolder,
  darkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    triggerHaptic("medium");
    setIsOpen(!isOpen);
  };

  const actions = [
    {
      id: "scan",
      label: "Extraer por DOI / Texto",
      icon: Sparkles,
      color: "bg-sky-600 text-white",
      onClick: () => {
        setIsOpen(false);
        onOpenExtractor();
      },
    },
    {
      id: "manual",
      label: "Añadir referencia manual",
      icon: Edit3,
      color: "bg-indigo-600 text-white",
      onClick: () => {
        setIsOpen(false);
        onOpenManualEditor();
      },
    },
    {
      id: "folder",
      label: "Nueva carpeta de colección",
      icon: FolderPlus,
      color: "bg-emerald-600 text-white",
      onClick: () => {
        setIsOpen(false);
        onOpenNewFolder();
      },
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end pointer-events-none">
      {/* Backdrop when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 pointer-events-auto"
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Actions */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="flex flex-col items-end space-y-3 mb-3 z-40 pointer-events-auto"
          >
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center space-x-3"
                >
                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md ${
                      darkMode ? "bg-slate-800 text-slate-100 border border-slate-700" : "bg-white text-slate-800 border border-slate-200"
                    }`}
                  >
                    {action.label}
                  </span>
                  <button
                    id={`fab-action-${action.id}`}
                    onClick={() => {
                      triggerHaptic("selection");
                      action.onClick();
                    }}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform ${action.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Action Button */}
      <motion.button
        id="main-android-fab"
        whileTap={{ scale: 0.92 }}
        onClick={toggle}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl z-40 pointer-events-auto transition-colors ${
          isOpen
            ? "bg-slate-800 text-white"
            : "bg-gradient-to-tr from-sky-600 to-indigo-600 text-white"
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </motion.div>
      </motion.button>
    </div>
  );
};
