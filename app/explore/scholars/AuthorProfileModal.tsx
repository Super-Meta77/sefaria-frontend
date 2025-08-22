import React from "react";

export default function AuthorProfileModal({ author, onClose }: { author: any, onClose: () => void }) {
  if (!author) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-2">{author.name}</h2>
        <div className="mb-2 text-sm text-slate-600">Century: {author.century} | Geography: {author.geography}</div>
        <div className="mb-2">
          <span className="font-semibold">Major Works:</span> {author.works.join(", ")}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Schools:</span> {author.schools.join(", ")}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Influenced by:</span> {author.influencedBy.length ? author.influencedBy.join(", ") : "None"}
        </div>
        <div className="flex gap-3">
          <a href="#" className="text-blue-600 hover:underline">View Library</a>
          <a href="#" className="text-blue-600 hover:underline">All Works</a>
        </div>
      </div>
    </div>
  );
}

