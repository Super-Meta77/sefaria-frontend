"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLibraryData, type SefariaItem } from "@/components/data-provider";
import { useLanguage } from "@/components/language-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TextsSidebar } from "@/components/texts-sidebar";
import { PageHeader } from "@/components/page-header";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Color mapping only for the /texts landing cards
const categoryColorMap: Record<
  string,
  { card: string; text: string; badge: string }
> = {
  Tanakh: {
    card: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    text: "text-blue-900",
    badge: "bg-white/70",
  },
  Mishnah: {
    card: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    text: "text-purple-900",
    badge: "bg-white/70",
  },
  Talmud: {
    card: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    text: "text-emerald-900",
    badge: "bg-white/70",
  },
  Midrash: {
    card: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    text: "text-amber-900",
    badge: "bg-white/70",
  },
  Halakhah: {
    card: "bg-rose-50 border-rose-200 hover:bg-rose-100",
    text: "text-rose-900",
    badge: "bg-white/70",
  },
  Kabbalah: {
    card: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    text: "text-indigo-900",
    badge: "bg-white/70",
  },
  Liturgy: {
    card: "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
    text: "text-cyan-900",
    badge: "bg-white/70",
  },
  "Jewish Thought": {
    card: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    text: "text-orange-900",
    badge: "bg-white/70",
  },
  Tosefta: {
    card: "bg-lime-50 border-lime-200 hover:bg-lime-100",
    text: "text-lime-900",
    badge: "bg-white/70",
  },
  Chasidut: {
    card: "bg-pink-50 border-pink-200 hover:bg-pink-100",
    text: "text-pink-900",
    badge: "bg-white/70",
  },
  Musar: {
    card: "bg-violet-50 border-violet-200 hover:bg-violet-100",
    text: "text-violet-900",
    badge: "bg-white/70",
  },
  Responsa: {
    card: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    text: "text-teal-900",
    badge: "bg-white/70",
  },
  "Second Temple": {
    card: "bg-slate-50 border-slate-200 hover:bg-slate-100",
    text: "text-slate-900",
    badge: "bg-white/70",
  },
  Reference: {
    card: "bg-gray-50 border-gray-200 hover:bg-gray-100",
    text: "text-gray-900",
    badge: "bg-white/70",
  },
};

export default function TextsPage() {
  const { data, status, error } = useLibraryData();
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const isHebrew = language === "he";

  const filtered = useMemo(() => {
    return data.filter((i) =>
      [i.category, i.enShortDesc].some((v) =>
        (v ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const handleCategoryClick = (_e: MouseEvent, item: SefariaItem) => {
    try {
      sessionStorage.setItem("selectedCategory", JSON.stringify(item));
    } catch {
      // ignore storage errors
    }
  };

  const loading = status === "loading";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header moved to global layout */}

      <main className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <PageHeader 
              title="Browse the Library" 
              movable={false}
            />

            {loading && (
              <div
                className="flex flex-col items-center justify-center py-12"
                role="status"
                aria-live="polite"
              >
                <LoadingSpinner size="lg" text="Loading categories..." />
              </div>
            )}

            {error && !loading && (
              <div className="text-center text-red-600">{error}</div>
            )}

            {!loading && !error && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                  "grid grid-cols-1 md:grid-cols-2 gap-6",
                  isHebrew && "font-hebrew"
                )}
              >
                {filtered.map((item) => {
                  const colors =
                    categoryColorMap[item.category] ??
                    ({
                      card: "bg-gray-50 border-gray-200 hover:bg-gray-100",
                      text: "text-gray-900",
                      badge: "bg-white/70",
                    } as const);

                  const displayCategory = isHebrew
                    ? item.heCategory || item.category
                    : item.category;
                  const displayDescription = isHebrew
                    ? item.heShortDesc || item.enShortDesc
                    : item.enShortDesc;

                  return (
                    <motion.div
                      key={`${item.order}-${item.category}`}
                      variants={itemVariants}
                    >
                      <Link
                        href={`/texts/${encodeURIComponent(item.category)}`}
                        onClick={(e) => handleCategoryClick(e, item)}
                      >
                        <Card
                          className={cn(
                            "border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer h-full",
                            colors.card,
                            isHebrew && "direction-rtl"
                          )}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle
                                className={cn(
                                  "text-2xl font-bold ",
                                  colors.text,
                                  isHebrew && "text-right"
                                )}
                              >
                                {displayCategory || "Untitled"}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription
                              className={cn(
                                "opacity-80 leading-relaxed",
                                colors.text,
                                isHebrew && "text-right"
                              )}
                            >
                              {displayDescription ||
                                "No description available."}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TextsSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
