"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader 
          title="Community" 
          hebrewTitle="קהילה"
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
              Join Our Global Community
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Connect with learners from around the world who share your passion for Jewish texts and learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Source Sheets</h3>
              <p className="text-slate-600 text-sm">Create and share source sheets with the community.</p>
            </div>
            
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Translations</h3>
              <p className="text-slate-600 text-sm">Contribute translations and help improve our library.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}





