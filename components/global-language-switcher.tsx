"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, SUPPORTED_LANGUAGES } from "./language-context";
import { cn } from "@/lib/utils";

export function GlobalLanguageSwitcher() {
  const { language, setLanguage, getCurrentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = getCurrentLanguageOption();

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode as any);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change site language"
          className="relative hover:bg-slate-100 transition-colors"
        >
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-48"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-medium text-slate-500 px-2 py-1.5">
          Site Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = lang.code === language;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 cursor-pointer",
                isActive && "bg-blue-50 text-blue-700"
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {lang.name}
                </span>
                <span className="text-xs text-slate-500">
                  {lang.nativeName}
                </span>
              </div>
              {isActive && (
                <Check className="w-4 h-4 ml-auto text-blue-600" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

