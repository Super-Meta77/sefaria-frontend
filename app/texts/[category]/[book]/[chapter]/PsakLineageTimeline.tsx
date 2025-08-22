import React from "react";

// Example psak lineage data
const psakLineage = [
  {
    id: "shulchan-arukh",
    title: "Shulchan Arukh",
    excerpt: "The final halakhic ruling on this matter is...",
  },
  {
    id: "beit-yosef",
    title: "Beit Yosef",
    excerpt: "Rabbi Yosef Karo discusses the sources and opinions...",
  },
  {
    id: "rambam",
    title: "Rambam (Maimonides)",
    excerpt: "Maimonides codifies the law as follows...",
  },
  {
    id: "talmud",
    title: "Talmud",
    excerpt: "The Talmudic discussion begins with...",
  },
  {
    id: "bible",
    title: "Biblical Verse",
    excerpt: "The verse states: 'You shall...'",
  },
];

export default function PsakLineageTimeline({ onNodeClick }: { onNodeClick: (node: { id: string }) => void }) {
  return (
    <div className="flex flex-row space-x-6 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {psakLineage.map((node, idx) => (
        <div key={node.id} className="flex flex-col items-center min-w-[200px]">
          <button
            className="bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-2 mb-2 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            onClick={() => onNodeClick(node)}
          >
            <div className="font-semibold text-slate-900 text-center mb-1">{node.title}</div>
            <div className="text-xs text-slate-600 text-center line-clamp-2">{node.excerpt}</div>
          </button>
          {idx < psakLineage.length - 1 && (
            <div className="w-12 h-1 bg-blue-200 rounded-full my-1" />
          )}
        </div>
      ))}
    </div>
  );
}

