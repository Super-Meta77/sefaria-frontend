"use client";

import { useEffect } from "react";
import { useLanguage } from "./language-context";

export function DynamicLangAttribute() {
  const { language } = useLanguage();

  useEffect(() => {
    // Update the HTML lang attribute when language changes
    document.documentElement.lang = language;
  }, [language]);

  // This component doesn't render anything visible
  return null;
}

