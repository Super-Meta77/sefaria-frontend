import React, { useState } from "react";

// Example data
const authors = [
  { id: 1, name: "Rashi", century: 11, geography: "France", x: 11, y: 2, works: ["Commentary on Tanakh"], schools: ["Tosafists"], influenced: [2], influencedBy: [] },
  { id: 2, name: "Rambam", century: 12, geography: "Spain", x: 12, y: 3, works: ["Mishneh Torah"], schools: ["Maimonidean"], influenced: [3], influencedBy: [1] },
  { id: 3, name: "Yosef Karo", century: 16, geography: "Ottoman Empire", x: 16, y: 4, works: ["Shulchan Arukh"], schools: ["Safed Mystics"], influenced: [], influencedBy: [2] },
];
const geographies = ["Babylonia", "France", "Spain", "Ottoman Empire", "Israel"];
const nodeRadius = 32;
const svgWidth = 1000;
const svgHeight = 500;
const xStart = 80;
const xEnd = svgWidth - 40;
const yStart = svgHeight - 60;
const yEnd = 60;
const xStep = (xEnd - xStart) / 19;
const yStep = (yStart - yEnd) / (geographies.length - 1);

export default function ScholarsMap({ onAuthorClick }: { onAuthorClick: (author: any) => void }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Map author x/y to reversed axes
  const getNodePos = (author: any) => {
    const x = xStart + (author.x - 1) * xStep;
    const y = yStart - (author.y - 1) * yStep;
    return { x, y };
  };

  // Find all edges for highlighting
  const getConnectedIds = (id: number) => {
    const out = authors.find(a => a.id === id)?.influenced || [];
    const incoming = authors.filter(a => a.influenced.includes(id)).map(a => a.id);
    return new Set([id, ...out, ...incoming]);
  };
  const connected = hoveredId ? getConnectedIds(hoveredId) : new Set();

  return (
    <div className="border rounded-lg bg-white shadow p-4" style={{ width: "100%", height: svgHeight }}>
      <svg width={svgWidth} height={svgHeight} style={{ display: 'block', margin: '0 auto' }}>
        {/* X-axis line (bottom) */}
        <line x1={xStart} y1={yStart} x2={xEnd} y2={yStart} stroke="#888" strokeWidth={2} />
        {/* Y-axis line (left) */}
        <line x1={xStart} y1={yStart} x2={xStart} y2={yEnd} stroke="#888" strokeWidth={2} />
        {/* X-axis label */}
        <text x={(xStart + xEnd) / 2} y={svgHeight - 20} textAnchor="middle" className="text-xs fill-slate-700 font-bold">Century</text>
        {/* Y-axis label */}
        <text x={20} y={(yStart + yEnd) / 2} textAnchor="middle" className="text-xs fill-slate-700 font-bold" transform={`rotate(-90 20,${(yStart + yEnd) / 2})`}>Geography</text>
        {/* X: Century ticks and labels */}
        {[...Array(20)].map((_, i) => {
          const x = xStart + i * xStep;
          return (
            <g key={i}>
              <line x1={x} y1={yStart} x2={x} y2={yStart + 8} stroke="#888" strokeWidth={1} />
              <text x={x} y={yStart + 22} textAnchor="middle" className="text-xs fill-slate-700">{i + 1}th</text>
            </g>
          );
        })}
        {/* Y: Geography ticks and labels */}
        {geographies.map((geo, i) => {
          const y = yStart - i * yStep;
          return (
            <g key={geo}>
              <line x1={xStart - 8} y1={y} x2={xStart} y2={y} stroke="#888" strokeWidth={1} />
              <text x={xStart - 12} y={y + 5} textAnchor="end" className="text-xs fill-slate-700">{geo}</text>
            </g>
          );
        })}
        {/* Influence lines */}
        {authors.map((author) => author.influenced.map((targetId) => {
          const target = authors.find(a => a.id === targetId);
          if (!target) return null;
          const { x: x1, y: y1 } = getNodePos(author);
          const { x: x2, y: y2 } = getNodePos(target);
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          const r = nodeRadius;
          const startX = x1 + (dx / len) * r;
          const startY = y1 + (dy / len) * r;
          const endX = x2 - (dx / len) * r;
          const endY = y2 - (dy / len) * r;
          const isHighlighted = hoveredId && (connected.has(author.id) && connected.has(target.id));
          return (
            <line
              key={author.id + "-" + targetId}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={isHighlighted ? "#f59e42" : "#e5e7eb"}
              strokeWidth={isHighlighted ? 4 : 2}
              markerEnd="url(#arrowhead)"
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
            />
          );
        }))}
        {/* Author nodes */}
        {authors.map((author) => {
          const { x, y } = getNodePos(author);
          const isHighlighted = hoveredId === author.id || connected.has(author.id);
          return (
            <g
              key={author.id}
              transform={`translate(${x},${y})`}
              onMouseEnter={() => setHoveredId(author.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onAuthorClick(author)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r={nodeRadius}
                fill={isHighlighted ? "#1d4ed8" : "#2563eb"}
                stroke={isHighlighted ? "#f59e42" : "#fff"}
                strokeWidth={isHighlighted ? 4 : 2}
                style={{ transition: 'fill 0.2s, stroke 0.2s, stroke-width 0.2s' }}
              />
              <text
                x={0}
                y={6}
                textAnchor="middle"
                className="font-bold"
                style={{
                  fontSize: 16,
                  fill: isHighlighted ? '#fff' : '#fff',
                  textShadow: '0 1px 4px #1e293b, 0 0 2px #000',
                  fontWeight: 700,
                  pointerEvents: 'none',
                  letterSpacing: 0.5,
                }}
              >
                {author.name}
              </text>
            </g>
          );
        })}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e42" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

