"use client";

import { useLanguage } from "./language-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageSwitchButtonProps {
  className?: string;
  movable?: boolean;
}

export function LanguageSwitchButton({ className, movable = true }: LanguageSwitchButtonProps) {
  const { language, setLanguage, getCurrentLanguageOption } = useLanguage();
  const currentLang = getCurrentLanguageOption();

  const handleToggle = () => {
    const newLang = language === "en" ? "he" : "en";
    setLanguage(newLang);
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Button
        onClick={handleToggle}
        variant="outline"
        size="sm"
        aria-label={language === "he" ? "Switch to English" : "Switch to Hebrew"}
        className="w-[40px] h-[40px] px-4 py-2 border-2 border-slate-300 hover:border-blue-500 transition-colors bg-transparent"
      >
        {language === "en" ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 148.33 206.05"
            className="fill-current"
          >
            <path
              d="M502,228.14Q521,234.93,521,252.62q0,14.66-11.79,29.84h-3.4v-6.61a7.8,7.8,0,0,0-1.16-4.74q-1.16-1.52-5.27-1.52-9.29,14.48-13,24.39a54.16,54.16,0,0,0-3.75,19.21q0,13.58,9.47,24.66L508.65,357q13.94,15.73,13.94,32.88,0,15.55-12.51,27h-4.82q0-12.51-9.29-23.05l-77.56-89q-19.84,10-19.84,25.73a25.7,25.7,0,0,0,3.4,12.33,60.45,60.45,0,0,0,8.31,11.71l9.83,10.9a58.51,58.51,0,0,1,8.31,11.88,26.76,26.76,0,0,1,3.4,12.51q0,8.4-6,16.17t-12.42,7.77H379.09v-5q10.72-2.86,10.72-12.33,0-4.83-7.77-23.32t-7.77-26.9q0-27.7,37.35-49l-21.8-24.84q-13.58-15.72-13.58-32.7,0-15.72,12.15-29H393a36.58,36.58,0,0,0,9.29,25l67.2,76.31a120.6,120.6,0,0,1,18-43.78q-26.63-4.29-26.63-32.88,0-14.12,7.33-24.66h4.65q3,11.08,13.76,13.76Z"
              transform="translate(-374.26 -210.8)"
            />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 200.45 203.7"
            className="fill-current"
          >
            <path
              d="M230.43,292.56c-2.1-6.6-3.3-7.5-12.3-7.5h-45.3c-7.5,0-9.3.9-11.4,7.2l-10.5,31.5c-4.5,13.5-6.6,21.6-6.6,24.9,0,3.6,1.5,5.4,8.7,6l9.9,0.9c2.1,1.5,2.1,6.3-.6,7.5-7.8-.6-17.1-0.6-31.2-0.9-9.9,0-20.7.6-28.8,0.9-1.8-1.2-2.4-6-.6-7.5l9.9-.9c7.2-.6,13.8-3.9,18-14.7,5.4-13.8,13.8-33.3,26.4-66.9l30.6-81c4.2-10.8,6-16.5,5.1-21.3,7.2-2.1,12.3-7.5,15.6-11.4,1.8,0,3.9.6,4.5,2.7,3.9,13.2,8.7,27,13.2,40.2l41.1,120.6c8.7,25.8,12.6,30.3,25.5,31.8l8.1,0.9c2.1,1.5,1.5,6.3,0,7.5-12.3-.6-22.8-0.9-36.3-0.9-14.4,0-25.8.6-34.5,0.9-2.4-1.2-2.7-6-.6-7.5l8.7-.9c6.3-.6,10.5-2.4,10.5-5.4,0-3.3-1.5-8.7-3.9-15.9ZM171,265.86c-2.4,6.9-2.1,7.2,6.3,7.2h36.9c8.7,0,9.3-1.2,6.6-9.3l-16.2-48.9c-2.4-7.2-5.1-15.3-6.9-18.9h-0.6c-0.9,1.5-3.9,8.7-7.2,17.7Z"
              transform="translate(-100.65 -159.36)"
            />
          </svg>
        )}
      </Button>
    </div>
  );
}
