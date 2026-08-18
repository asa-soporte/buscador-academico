import React from "react";
import { BookOpen, Moon, Sun, Smartphone, Monitor, ShieldCheck } from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

interface AndroidTopBarProps {
  title: string;
  subtitle?: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
}

export const AndroidTopBar: React.FC<AndroidTopBarProps> = ({
  title,
  subtitle,
  darkMode,
  onToggleDarkMode,
  isDeviceFrame,
  onToggleDeviceFrame,
}) => {
  return (
    <header
      id="android-top-app-bar"
      className={`w-full px-4 py-2.5 flex items-center justify-between border-b select-none transition-colors duration-200 ${
        darkMode
          ? "bg-slate-900/90 border-slate-800/80 text-slate-100"
          : "bg-white/90 border-slate-200/80 text-slate-900"
      } backdrop-blur-md sticky top-0 z-20`}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-bold tracking-tight truncate flex items-center space-x-1.5">
            <span>{title}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              Android Native
            </span>
          </h1>
          {subtitle && (
            <p className="text-[11px] opacity-70 truncate font-normal">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        {/* Device frame toggle (Mobile preview vs Fluid Responsive) */}
        <button
          id="toggle-device-frame-btn"
          onClick={() => {
            triggerHaptic("light");
            onToggleDeviceFrame();
          }}
          title={isDeviceFrame ? "Ver en pantalla completa" : "Ver en marco de Android"}
          className={`p-2 rounded-full transition-colors ${
            darkMode
              ? "hover:bg-slate-800 text-slate-300"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          {isDeviceFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>

        {/* Dark mode toggle */}
        <button
          id="toggle-theme-btn"
          onClick={() => {
            triggerHaptic("light");
            onToggleDarkMode();
          }}
          title={darkMode ? "Modo Claro" : "Modo Oscuro"}
          className={`p-2 rounded-full transition-colors ${
            darkMode
              ? "hover:bg-slate-800 text-amber-400"
              : "hover:bg-slate-100 text-slate-600"
          }`}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
