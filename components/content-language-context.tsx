"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLanguage } from "./language-context";
import { usePathname } from "next/navigation";

export type ContentLanguage = "en" | "he";

interface ContentLanguageContextValue {
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
  toggleContentLanguage: () => void;
  isSwitcherVisible: boolean;
  effectiveLanguage: ContentLanguage;
}

const ContentLanguageContext = createContext<ContentLanguageContextValue | undefined>(undefined);

export function ContentLanguageProvider({ children }: { children: React.ReactNode }) {
  const { language: globalLanguage } = useLanguage();
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>("en");
  const [initialized, setInitialized] = useState(false);
  const pathname = usePathname();

  const isExcludedRoute = useMemo(() => {
    if (!pathname) return false;
    if (pathname === "/") return true;
    const chapterPattern = /^\/texts\/[^/]+\/[^/]+\/[^/]+$/;
    return chapterPattern.test(pathname);
  }, [pathname]);

  // Initialize from sessionStorage to keep preference across navigation, fallback to English
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("sefaria-content-language") as ContentLanguage | null;
      if (saved === "en" || saved === "he") {
        setContentLanguage(saved);
      }
    } catch {
      // ignore
    }
    setInitialized(true);
  }, []);

  // Persist changes
  useEffect(() => {
    try {
      sessionStorage.setItem("sefaria-content-language", contentLanguage);
    } catch {
      // ignore
    }
  }, [contentLanguage]);

  // Visibility rule: hide main content switcher when global is Hebrew or on excluded routes
  const isSwitcherVisible = useMemo(() => globalLanguage === "en" && !isExcludedRoute, [globalLanguage, isExcludedRoute]);

  const effectiveLanguage: ContentLanguage = useMemo(() => {
    // On excluded routes, do not apply the content override
    if (isExcludedRoute) {
      return globalLanguage === "he" ? "he" : "en";
    }
    return globalLanguage === "he" ? "he" : contentLanguage;
  }, [globalLanguage, contentLanguage, isExcludedRoute]);

  const toggleContentLanguage = () => {
    setContentLanguage(prev => (prev === "en" ? "he" : "en"));
  };

  if (!initialized) return null;

  return (
    <ContentLanguageContext.Provider value={{ contentLanguage, setContentLanguage, toggleContentLanguage, isSwitcherVisible, effectiveLanguage }}>
      {children}
    </ContentLanguageContext.Provider>
  );
}

export function useContentLanguage() {
  const ctx = useContext(ContentLanguageContext);
  if (!ctx) throw new Error("useContentLanguage must be used within ContentLanguageProvider");
  return ctx;
}

export function useOptionalContentLanguage(): ContentLanguageContextValue {
  const ctx = useContext(ContentLanguageContext);
  const { language: globalLanguage } = useLanguage();
  if (ctx) return ctx;
  return {
    contentLanguage: globalLanguage === "he" ? "he" : "en",
    effectiveLanguage: globalLanguage === "he" ? "he" : "en",
    isSwitcherVisible: false,
    setContentLanguage: () => {},
    toggleContentLanguage: () => {},
  };
}


