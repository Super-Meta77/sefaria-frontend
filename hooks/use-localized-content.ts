import { useLanguage } from "@/components/language-context";

export interface LocalizedContent {
  title: string;
  description: string;
  category: string;
  commentator?: string;
  collectiveTitle?: string;
}

export function useLocalizedContent<T extends Record<string, any>>(item: T): LocalizedContent {
  const { language } = useLanguage();
  const isHebrew = language === "he";

  const getLocalizedValue = <K extends keyof T>(
    enKey: K,
    heKey: K,
    fallback?: string
  ): string => {
    if (isHebrew && item[heKey]) {
      return String(item[heKey]);
    }
    if (item[enKey]) {
      return String(item[enKey]);
    }
    return fallback || "";
  };

  return {
    title: getLocalizedValue("title", "heTitle", item.category || ""),
    description: getLocalizedValue("enShortDesc", "heShortDesc", item.enShortDesc || ""),
    category: getLocalizedValue("category", "heCategory", item.category || ""),
    commentator: getLocalizedValue("commentator", "heCommentator", item.commentator || ""),
    collectiveTitle: getLocalizedValue("collectiveTitle", "heCollectiveTitle", item.collectiveTitle || ""),
  };
}

