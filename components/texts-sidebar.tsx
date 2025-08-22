"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TextsSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-24 space-y-8 bg-gray-50 rounded-lg border border-gray-200"
      style={{ padding: "2.5rem 3rem 2rem 2rem" }}
    >
      {/* A Living Library of Torah */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          A Living Library of Torah
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed text-sm">
            Sefaria is home to 3,000 years of Jewish texts. We are a nonprofit
            organization offering free access to texts, translations, and
            commentaries so that everyone can participate in the ongoing process
            of studying, interpreting, and creating Torah.{" "}
            <Link href="/about" className="text-blue-600 hover:text-blue-700">
              Learn More ›
            </Link>
          </p>
          <Button className="bg-slate-700 hover:bg-slate-800 text-white text-sm px-4 py-2 rounded">
            <span className="mr-2">▶</span>
            Getting Started (2 min)
          </Button>
        </div>
      </div>

      {/* Translations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          Translations
        </h2>
        <div className="space-y-3">
          <p className="text-gray-600 text-sm">
            Access key works from the library in several languages.
          </p>
          <div className="flex flex-wrap gap-1 text-xs text-gray-600">
            <span>Arabic</span>
            <span>•</span>
            <span>German</span>
            <span>•</span>
            <span>English</span>
            <span>•</span>
            <span>Esperanto</span>
            <span>•</span>
            <span>Spanish</span>
            <span>•</span>
            <span>Farsi</span>
            <span>•</span>
            <span>Finnish</span>
            <span>•</span>
            <span>French</span>
            <span>•</span>
            <span>Romanian</span>
            <span>•</span>
            <span>Italian</span>
            <span>•</span>
            <span>Polish</span>
            <span>•</span>
            <span>Portuguese</span>
            <span>•</span>
            <span>Russian</span>
            <span>•</span>
            <span>Yiddish</span>
          </div>
        </div>
      </div>

      {/* Learning Schedules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          Learning Schedules
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm mb-2">Weekly Torah Portion</p>
            <div className="flex items-center text-sm text-gray-700 mb-3">
              <img
                src="/icons/book.svg"
                className="navSidebarIcon size-[20px] inline-block"
                alt="book icon"
              />{" "} &nbsp; &nbsp;
              <span className="font-medium">Re'eh</span>
              <span className="text-gray-500 ml-2">
                Deuteronomy 11:26-16:17
              </span>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">Haftarah</p>
            <div className="flex items-center text-sm text-gray-700 mb-3">
              <img
                src="/icons/book.svg"
                className="navSidebarIcon size-[20px] inline-block"
                alt="book icon"
              />{" "} &nbsp; &nbsp;
              <span className="font-medium">I Samuel 20:18-42</span>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">Daf Yomi</p>
            <div className="flex items-center text-sm text-gray-700 mb-3">
              <img
                src="/icons/book.svg"
                className="navSidebarIcon size-[20px] inline-block"
                alt="book  icon"
              />{" "} &nbsp; &nbsp;
              <span className="font-medium">Avodah Zarah 55</span>
            </div>
          </div>

          <Link
            href="/learning-schedules"
            className="text-gray-500 text-sm hover:text-blue-600"
          >
            All Learning Schedules ›
          </Link>
        </div>
      </div>

      {/* Join the Conversation */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          Join the Conversation
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            People around the world use Sefaria to create and share Torah
            resources. You're invited to add your voice.
          </p>
          <Button className="bg-slate-700 hover:bg-slate-800 text-white text-sm px-4 py-2 rounded w-full">
            <span className="mr-2">💬</span>
            Explore the Community
          </Button>
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          Resources
        </h2>
        <div className="space-y-2">
          <Link
            href="/mobile"
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            <span className="w-4 h-4 mr-3 text-gray-400">📱</span>
            Mobile Apps
          </Link>
          <Link
            href="/create"
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            <span className="w-4 h-4 mr-3 text-gray-400">✏️</span>
            Create with Sefaria
          </Link>
          <Link
            href="/collections"
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            <span className="w-4 h-4 mr-3 text-gray-400">📚</span>
            Collections
          </Link>
          <Link
            href="/teach"
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            <span className="w-4 h-4 mr-3 text-gray-400">🎓</span>
            Teach with Sefaria
          </Link>
          <Link
            href="/visualizations"
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            <span className="w-4 h-4 mr-3 text-gray-400">📊</span>
            Visualizations
          </Link>
          <Link
            href="/torah-tab"
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            <span className="w-4 h-4 mr-3 text-gray-400">🔖</span>
            Torah Tab
          </Link>
          <Link
            href="/help"
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            <span className="w-4 h-4 mr-3 text-gray-400">❓</span>
            Help
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
