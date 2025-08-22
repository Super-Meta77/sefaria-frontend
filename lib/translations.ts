import { Language } from "@/components/language-context";

export interface Translations {
  // Header navigation
  texts: string;
  explore: string;
  community: string;
  donate: string;
  
  // Search
  searchPlaceholder: string;
  
  // Buttons
  help: string;
  changeLanguage: string;
  login: string;
  signup: string;
  
  // Language switcher
  siteLanguage: string;
  
  // Footer
  siteLanguageFooter: string;
  
  // Common
  loading: string;
  error: string;
}

const translations: Record<Language, Translations> = {
  en: {
    texts: "Texts",
    explore: "Explore",
    community: "Community",
    donate: "Donate",
    searchPlaceholder: "Search texts...",
    help: "Help",
    changeLanguage: "Change site language",
    login: "Log in",
    signup: "Sign up",
    siteLanguage: "Site Language",
    siteLanguageFooter: "Site Language",
    loading: "Loading...",
    error: "Error"
  },
  he: {
    texts: "טקסטים",
    explore: "חקור",
    community: "קהילה",
    donate: "תרום",
    searchPlaceholder: "חפש טקסטים...",
    help: "עזרה",
    changeLanguage: "שנה שפת האתר",
    login: "התחבר",
    signup: "הירשם",
    siteLanguage: "שפת האתר",
    siteLanguageFooter: "שפת האתר",
    loading: "טוען...",
    error: "שגיאה"
  }
};

export function getTranslation(language: Language, key: keyof Translations): string {
  return translations[language][key] || translations.en[key] || key;
}

export function getTranslations(language: Language): Translations {
  return translations[language];
}

