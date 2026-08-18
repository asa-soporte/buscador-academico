import React, { useState, useEffect } from "react";
import { Wifi, BatteryMedium, Signal } from "lucide-react";

interface AndroidStatusBarProps {
  darkMode?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ darkMode = false }) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="android-status-bar"
      className={`w-full px-5 py-1.5 flex items-center justify-between text-xs select-none transition-colors duration-200 z-40 ${
        darkMode ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"
      }`}
    >
      <div className="flex items-center space-x-1.5 font-medium tracking-tight">
        <span>{time || "12:00"}</span>
      </div>

      <div className="flex items-center space-x-2 text-[11px] opacity-85">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-semibold">92%</span>
          <BatteryMedium className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
