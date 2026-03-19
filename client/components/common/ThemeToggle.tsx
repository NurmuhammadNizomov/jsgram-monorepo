"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("common.theme");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-3 px-2 xl:px-3 py-3 rounded-xl w-full text-muted-foreground">
        <div className="w-5 h-5 flex-shrink-0" />
        <span className="hidden xl:block text-sm font-medium">Theme</span>
      </button>
    );
  }

  const themes = [
    { 
      key: "light", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      key: "dark", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    },
    { 
      key: "system", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
  ];

  const currentTheme = themes.find(t => t.key === theme) || themes[2];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-2 xl:px-3 py-3 rounded-xl w-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-sm font-medium"
      >
        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{currentTheme.icon}</span>
        <span className="hidden xl:block">
          {theme === "light" ? t("light") : theme === "dark" ? t("dark") : t("system")}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-36 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
          {themes.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setTheme(item.key);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent transition ${
                theme === item.key ? "bg-accent text-accent-foreground" : "text-foreground"
              }`}
            >
              {item.icon}
              <span>{t(item.key)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
