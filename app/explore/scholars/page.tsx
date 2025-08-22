"use client";
import React, { useState } from "react";
import ScholarsMap from "./ScholarsMap";
import AuthorProfileModal from "./AuthorProfileModal";

export default function ScholarsMapPage() {
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Chronological-Conceptual Map of Authors & Texts</h1>
        <ScholarsMap onAuthorClick={setSelectedAuthor} />
        {selectedAuthor && (
          <AuthorProfileModal author={selectedAuthor} onClose={() => setSelectedAuthor(null)} />
        )}
      </div>
    </div>
  );
}
