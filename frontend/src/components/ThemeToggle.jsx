import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span className="text-white text-sm font-medium">
        {darkMode ? "" : ""}
      </span>
      <button
        onClick={toggleDarkMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${
          darkMode ? "bg-blue-600" : "bg-blue-300"
        }`}
        role="switch"
        aria-checked={darkMode}
        aria-label="Toggle dark mode"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            darkMode ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-white text-sm font-medium">
        {darkMode ? "Dark" : "Light"}
      </span>
    </div>
  );
}
