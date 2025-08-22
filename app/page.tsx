"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
        <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 relative py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-5xl font-bold text-slate-900 leading-tight">A Living Library of Torah</h1>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                Explore 3,000 years of Jewish texts with modern tools, translations, and visualizations.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/texts" className="inline-flex items-center px-6 h-11 rounded-md bg-blue-900 text-white hover:bg-blue-800">Browse Texts</Link>
                <Link href="/community" className="inline-flex items-center px-6 h-11 rounded-md border border-slate-300 text-slate-800 hover:bg-slate-50">Join the Community</Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-white shadow-sm border p-6 flex items-center justify-center">
                {/* Judaism-themed motif */}
                <svg viewBox="0 0 200 200" className="w-full h-full text-blue-600/20">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>
                  <g fill="url(#grad)">
                    {/* Star of David */}
                    <polygon points="100,15 120,50 160,50 130,80 145,120 100,95 55,120 70,80 40,50 80,50" />
                    {/* Menorah */}
                    <rect x="95" y="120" width="10" height="30" />
                    <rect x="80" y="120" width="8" height="20" />
                    <rect x="112" y="120" width="8" height="20" />
                    <circle cx="84" cy="118" r="3" />
                    <circle cx="116" cy="118" r="3" />
                    <circle cx="100" cy="118" r="3" />
                  </g>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Texts", "Translations", "Visual Tools"].map((title, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="rounded-xl border p-6 bg-white">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm">Discover curated collections, bilingual texts, and interactive diagrams to deepen your learning.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-slate-50 border-y">
        <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Tanakh", href: "/texts/tanakh" },
              { title: "Talmud", href: "/texts/talmud" },
              { title: "Mishneh Torah", href: "/texts" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }} className="group rounded-xl border bg-white p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-900">{item.title}</h3>
                  <span className="text-blue-700 group-hover:underline">Explore →</span>
                </div>
                <Link href={item.href} className="absolute inset-0" aria-label={item.title} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-semibold text-slate-900">A Global Community of Learners</h2>
            <p className="mt-3 text-slate-600">Join people around the world who learn, share, and build together. Create source sheets, contribute translations, and explore connections across centuries.</p>
            <div className="mt-6">
              <Link href="/community" className="inline-flex items-center px-5 h-11 rounded-md bg-slate-900 text-white hover:bg-slate-800">Explore Community</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="rounded-2xl border bg-white p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                {["Parasha", "Daf Yomi", "Mishnah"].map((k) => (
                  <div key={k} className="p-4">
                    <div className="text-2xl font-bold text-slate-900">{k}</div>
                    <div className="text-xs text-slate-500 mt-1">Daily learning</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Connect */}
      <section className="bg-gradient-to-r from-blue-50 to-sky-50 border-t">
        <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Stay Connected</h3>
              <p className="text-slate-600 mt-1">News, learning schedules, and featured resources—right to your inbox.</p>
            </div>
            <Link href="#" className="inline-flex items-center px-6 h-11 rounded-md border border-slate-300 text-slate-800 hover:bg-white bg-white">Sign up for Newsletter</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
