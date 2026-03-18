"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/i18n/config";

const languageNames: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
};

const languageFlags: Record<Locale, string> = {
  en: "🇺🇸",
  ru: "🇷🇺",
  uz: "🇺🇿",
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (locale: Locale) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 px-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base">{languageFlags[currentLocale]}</span>
        <span className="text-sm font-medium">{languageNames[currentLocale]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent transition ${
                locale === currentLocale ? "bg-accent" : ""
              }`}
            >
              <span className="text-base">{languageFlags[locale]}</span>
              <span>{languageNames[locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
