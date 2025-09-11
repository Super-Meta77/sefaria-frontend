"use client"

import Link from "next/link"
import { Menu, Search, HelpCircle, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "./language-context"
import { GlobalLanguageSwitcher } from "./global-language-switcher"
import { getTranslation } from "@/lib/translations"
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";

export default function SiteHeader({ onCalendarClick }: { onCalendarClick?: () => void }) {
    const { language } = useLanguage()
    const router = useRouter();
    const [exploreOpen, setExploreOpen] = useState(false);
    const exploreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
                setExploreOpen(false);
            }
        }
        if (exploreOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [exploreOpen]);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo and Nav */}
                    <div className="flex items-center space-x-8 flex-shrink-0">
                        <Link href="/" className="flex items-center space-x-2">
                            <img src="/icons/logo.svg" alt="Sefaria" className="h-7 w-auto" />
                        </Link>
                        <nav className="hidden md:flex space-x-6">
                            <Link
                                href="/texts"
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors border-b-2 border-blue-600"
                            >
                                {getTranslation(language, "texts")}
                            </Link>
                            <div className="relative" ref={exploreRef}>
                                <button
                                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors flex items-center"
                                    type="button"
                                    onClick={() => setExploreOpen((open) => !open)}
                                    aria-expanded={exploreOpen}
                                >
                                    Explore <ChevronDown className="w-4 h-4 ml-1" />
                                </button>
                                {exploreOpen && (
                                    <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded shadow-lg z-50">
                                        <Link
                                            href="/explore/scholars"
                                            className="block px-4 py-2 text-slate-700 hover:bg-blue-50 w-full text-left"
                                            onClick={() => setExploreOpen(false)}
                                        >
                                            Scholars
                                        </Link>
                                        <Link
                                            href="/explore/concepts"
                                            className="block px-4 py-2 text-slate-700 hover:bg-blue-50 w-full text-left"
                                            onClick={() => setExploreOpen(false)}
                                        >
                                            Concepts
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <Link
                                href="/community"
                                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                {getTranslation(language, "community")}
                            </Link>
                            <Link
                                href="/donate"
                                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                {getTranslation(language, "donate")}
                            </Link>
                        </nav>
                    </div>
                    {/* Right: Search, Icons, Auth */}
                    <div className="flex items-center space-x-4 flex-grow justify-end">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                type="search"
                                placeholder={getTranslation(language, "searchPlaceholder")}
                                className="pl-10 w-64 bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {/* Calendar Icon Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={"Calendar"}
                            onClick={onCalendarClick}
                            className="hover:bg-blue-50 focus:bg-blue-100"
                        >
                            <Calendar className="w-7 h-7" />
                        </Button>
                        <Button asChild variant="ghost" size="icon" aria-label={getTranslation(language, "help")}>
                            <Link href="/help">
                                <HelpCircle className="w-8 h-8" />
                            </Link>
                        </Button>
                        <GlobalLanguageSwitcher />
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/login">{getTranslation(language, "login")}</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/signup">{getTranslation(language, "signup")}</Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}


