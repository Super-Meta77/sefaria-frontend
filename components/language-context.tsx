"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "he";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸"
  },
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
    flag: "🇮🇱"
  }
];

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  getLanguageOption: (code: Language) => LanguageOption | undefined;
  getCurrentLanguageOption: () => LanguageOption;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("sefaria-language") as Language;
      if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.warn("Failed to load language preference from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("sefaria-language", lang);
    } catch (error) {
      console.warn("Failed to save language preference to localStorage:", error);
    }
  };
  
  const toggleLanguage = () => {
    const newLang = language === "en" ? "he" : "en";
    setLanguage(newLang);
  };

  const getLanguageOption = (code: Language): LanguageOption | undefined => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  };

  const getCurrentLanguageOption = (): LanguageOption => {
    return getLanguageOption(language) || SUPPORTED_LANGUAGES[0];
  };
  
  // Don't render children until language is initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      toggleLanguage, 
      getLanguageOption,
      getCurrentLanguageOption
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
