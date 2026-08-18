import React from "react";
import { motion } from "motion/react";
import { Search, Sparkles, Bookmark, Bot, Wrench } from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

export type NavTab = "search" | "extract" | "library" | "chat" | "tools";

interface AndroidNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  libraryCount?: number;
  darkMode?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onSelectTab,
  libraryCount = 0,
  darkMode = false,
}) => {
  const tabs = [
    {
      id: "search" as NavTab,
      label: "Buscar",
      icon: Search,
    },
    {
      id: "extract" as NavTab,
      label: "Metadatos",
      icon: Sparkles,
    },
    {
      id: "library" as NavTab,
      label: "Biblioteca",
      icon: Bookmark,
      badge: libraryCount > 0 ? libraryCount : undefined,
    },
    {
      id: "chat" as NavTab,
      label: "Asistente IA",
      icon: Bot,
      highlight: true,
    },
    {
      id: "tools" as NavTab,
      label: "Herramientas",
      icon: Wrench,
    },
  ];

  return (
    <nav
      id="android-bottom-navigation"
      className={`w-full border-t transition-colors duration-200 z-30 select-none pb-safe ${
        darkMode ? "bg-slate-900/95 border-slate-800 text-slate-400" : "bg-white/95 border-slate-200/90 text-slate-600"
      } backdrop-blur-md`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => {
                triggerHaptic("selection");
                onSelectTab(tab.id);
              }}
              className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[58px] transition-all group"
            >
              <div className="relative">
                {/* Material 3 Active Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className={`absolute inset-0 -mx-3 -my-1 rounded-full ${
                      darkMode ? "bg-sky-500/20" : "bg-sky-100"
                    }`}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <div
                  className={`relative z-10 p-1 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-active:scale-95"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? darkMode
                          ? "text-sky-400 stroke-[2.2]"
                          : "text-sky-600 stroke-[2.2]"
                        : darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  />

                  {/* Badge */}
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-sky-600 rounded-full shadow-xs">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}

                  {tab.highlight && !isActive && (
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </div>
              </div>

              <span
                className={`text-[11px] font-medium mt-1 tracking-tight z-10 transition-colors ${
                  isActive
                    ? darkMode
                      ? "text-sky-400 font-semibold"
                      : "text-sky-700 font-semibold"
                    : darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Android Gesture Bar */}
      <div className="w-full flex justify-center pb-1 pt-0.5">
        <div className={`w-28 h-1 rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />
      </div>
    </nav>
  );
};
