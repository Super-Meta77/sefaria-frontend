"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="About Sefaria" 
          hebrewTitle="אודות ספריא"
          movable={true}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="bg-white rounded-xl border p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Our Mission
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Sefaria is building the future of Jewish learning in an open and participatory way. 
              We are assembling a free living library of Jewish texts and their interconnections, 
              in Hebrew and in translation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Open Source</h3>
              <p className="text-slate-600 text-sm">All of our code and content is freely available for use and contribution.</p>
            </div>
            
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Community Driven</h3>
              <p className="text-slate-600 text-sm">Built by and for the global Jewish community.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}





