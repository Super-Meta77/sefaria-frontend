"use client";
import React, { useState } from "react";

const concepts = [
  "Free Will", "Providence", "Redemption", "Holiness", "Justice", "Mercy", "Repentance", "Exile", "Messiah", "Creation", "Sabbath", "Prayer", "Charity", "Law", "Faith", "Wisdom", "Prophecy", "Purity", "Sin", "Atonement"
];

const traditions = ["Maimonidean", "Kabbalistic", "Hasidic", "Rationalist", "Mystical"];

export default function ConceptsIndexPage() {
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [selectedLens, setSelectedLens] = useState(traditions[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="max-w-7xl mx-auto w-full p-8">
        <h1 className="text-3xl font-bold mb-6">Queryable Conceptual Index</h1>
        {!selectedConcept ? (
          <div className="flex flex-wrap gap-4">
            {concepts.map((concept) => (
              <button
                key={concept}
                className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold text-lg shadow hover:bg-blue-200 transition"
                onClick={() => setSelectedConcept(concept)}
              >
                {concept}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 mt-8">
            {/* Left: Timeline */}
            <div className="col-span-3 bg-white rounded-lg shadow p-4 overflow-auto">
              <h2 className="text-xl font-bold mb-5">Timeline of Sources</h2>
              <ul className="space-y-4">
                {/* Placeholder timeline data */}
                <li>Genesis 2:7</li>
                <li>Exodus 20:13</li>
                <li>Mishnah Avot 3:1</li>
                <li>Talmud Berakhot 33b</li>
                <li>Rambam, Hilkhot Teshuvah 5:1</li>
                <li>Zohar 1:15a</li>
                <li>Hasidic Discourses</li>
              </ul>
            </div>
            {/* Center: Excerpts */}
            <div className="col-span-6 bg-white rounded-lg shadow p-4 overflow-auto">
              <h2 className="text-lg font-bold mb-3">Excerpts: {selectedConcept}</h2>
              <div className="space-y-4">
                {/* Placeholder excerpts */}
                <div className="border-l-4 border-blue-400 pl-4">
                  <div className="text-slate-700 font-semibold mb-2">Genesis 2:7</div>
                  <div className="text-slate-600 text-sm">"And the Lord God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul."</div>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <div className="text-slate-700 font-semibold mb-2">Rambam, Hilkhot Teshuvah 5:1</div>
                  <div className="text-slate-600 text-sm">"Every person is given free will. If one desires to turn toward the good way and be righteous, the choice is his."</div>
                </div>
                <div className="border-l-4 border-blue-400 pl-4">
                  <div className="text-slate-700 font-semibold mb-2">Zohar 1:15a</div>
                  <div className="text-slate-600 text-sm">"The secret of free will is hidden in the supernal wisdom..."</div>
                </div>
              </div>
            </div>
            {/* Right: Lens Filter */}
            <div className="col-span-3 bg-white rounded-lg shadow p-4 overflow-auto">
              <h2 className="text-lg font-bold mb-3">Lens: Tradition</h2>
              <div className="mb-4">
                <select
                  className="w-full border rounded px-2 py-1"
                  value={selectedLens}
                  onChange={e => setSelectedLens(e.target.value)}
                >
                  {traditions.map(trad => (
                    <option key={trad} value={trad}>{trad}</option>
                  ))}
                </select>
              </div>
              <div className="text-slate-600 text-sm">
                {/* Placeholder lens content */}
                {selectedLens === "Maimonidean" && (
                  <div>Maimonides interprets free will as a rational necessity for moral responsibility.</div>
                )}
                {selectedLens === "Kabbalistic" && (
                  <div>Kabbalistic sources see free will as a mystical interplay between divine providence and human action.</div>
                )}
                {selectedLens === "Hasidic" && (
                  <div>Hasidic thought emphasizes the inner struggle and the soul's yearning for connection to God.</div>
                )}
                {/* Add more tradition explanations as needed */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
