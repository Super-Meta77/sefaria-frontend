"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Facebook, Instagram, Youtube, Heart } from "lucide-react";

export function CalendarsSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-24 space-y-8 bg-gray-50 rounded-lg border border-gray-200"
      style={{ padding: "2.5rem 3rem 2rem 2rem" }}
    >
      {/* Learning Schedules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          Learning Schedules
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Since biblical times, the Torah has been divided into sections which are
          read each week on a set yearly calendar. Following this practice, many
          other calendars have been created to help communities of learners work
          through specific texts together.
        </p>
      </div>

      {/* Stay Connected */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          Stay Connected
        </h2>
        <p className="text-gray-600 text-sm">
          Get updates on new texts, learning resources, features, and more.
        </p>
        <div className="relative">
          <Input placeholder="Sign up for Newsletter" className="pr-10" />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-6 h-6 flex items-center justify-center bg-white border text-gray-500 hover:text-blue-600"
            aria-label="Submit email"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="https://www.facebook.com/sefaria"
            className="w-10 h-10 rounded-md border flex items-center justify-center text-blue-900 hover:bg-blue-50"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </Link>
          <Link
            href="https://www.instagram.com/sefaria"
            className="w-10 h-10 rounded-md border flex items-center justify-center text-blue-900 hover:bg-blue-50"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </Link>
          <Link
            href="https://www.youtube.com/@SefariaProject"
            className="w-10 h-10 rounded-md border flex items-center justify-center text-blue-900 hover:bg-blue-50"
            aria-label="YouTube"
          >
            <Youtube className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Support Sefaria */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
          Support Sefaria
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Sefaria is an open source, nonprofit project. Support us by making a
          tax-deductible donation.
        </p>
        <Button className="bg-slate-700 hover:bg-slate-800 text-white text-sm px-4 py-2 rounded w-full">
          <span className="mr-2">
            <Heart className="w-4 h-4" />
          </span>
          Make a Donation
        </Button>
      </div>
    </motion.div>
  );
}


