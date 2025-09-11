"use client";

import { motion } from "framer-motion";
import { useLanguage } from "./language-context";
import { useOptionalContentLanguage } from "./content-language-context";
import { ContentLanguageSwitcher } from "./content-language-switcher";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  hebrewTitle?: string;
  className?: string;
  movable?: boolean;
}

function PageHeaderInner({ title, hebrewTitle, className, movable = true }: PageHeaderProps) {
  const { language } = useLanguage();
  const { effectiveLanguage, isSwitcherVisible } = useOptionalContentLanguage();
  const isHebrew = effectiveLanguage === "he";
  const displayTitle = isHebrew ? (hebrewTitle || title) : title;

  // When movable is false (like on /texts page), positions stay fixed
  if (!movable) {
    return (
      <div className={cn(
        "flex items-center justify-between mt-8 mb-8 pb-4 border-b",
        className
      )}>
        <h1 className="text-3xl font-bold text-slate-900 font-times">
          {displayTitle}
        </h1>
        {isSwitcherVisible && <ContentLanguageSwitcher />}
      </div>
    );
  }

  // When movable is true, use absolute positioning for direct position swapping
  return (
    <div className={cn(
      "relative mt-8 mb-8 pb-4 border-b h-12",
      className
    )}>
      {/* Title - positioned based on language */}
      <motion.h1
        initial={false}
        animate={{
          left: isHebrew ? "60px" : "0px",
          right: isHebrew ? "0px" : "auto",
          textAlign: isHebrew ? "right" : "left"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={
          cn("text-3xl font-bold text-slate-900 absolute top-0 font-times")
        }
        dir={isHebrew ? "rtl" : "ltr"}
        style={{
          width: "calc(100% - 60px)"
        }}
      >
        {displayTitle}
      </motion.h1>

      {/* Content Language Switcher - positioned based on content language */}
      <motion.div
        initial={false}
        animate={{
          left: isHebrew ? "0px" : "auto",
          right: isHebrew ? "auto" : "0px"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute top-0"
      >
        {isSwitcherVisible && <ContentLanguageSwitcher />}
      </motion.div>
    </div>
  );
}

export function PageHeader(props: PageHeaderProps) {
  return <PageHeaderInner {...props} />;
}
