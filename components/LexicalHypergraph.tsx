"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface SemanticNode {
  id: string
  term: string
  era: string
  meaning: string
  sources: string[]
  year: number
}

interface SemanticLink {
  source: string
  target: string
  type: "evolution" | "contrast" | "parallel"
  strength: number
}

interface LexicalHypergraphProps {
  searchTerm: string;
  onNodeClick: (node: { id: string }) => void;
}

const sampleSemanticData = {
  nodes: [
    {
      id: "chesed_tanakh",
      term: "חסד",
      era: "Tanakh",
      meaning: "Loving-kindness, covenant loyalty",
      sources: ["Genesis 24:12", "Psalms 23:6"],
      year: -500,
    },
    {
      id: "chesed_mishnah",
      term: "חסד",
      era: "Mishnah",
      meaning: "Acts of kindness, charity",
      sources: ["Avot 1:2", "Peah 1:1"],
      year: 200,
    },
    {
      id: "chesed_talmud",
      term: "חסד",
      era: "Talmud",
      meaning: "Supererogatory good deeds",
      sources: ["Berakhot 5b", "Sukkah 49b"],
      year: 500,
    },
    {
      id: "chesed_zohar",
      term: "חסד",
      era: "Zohar",
      meaning: "Divine attribute of expansion",
      sources: ["Zohar I:15a", "Zohar II:162b"],
      year: 1300,
    },
    {
      id: "chesed_hasidut",
      term: "חסד",
      era: "Hasidut",
      meaning: "Emotional divine service",
      sources: ["Tanya Ch. 3", "Likutei Torah"],
      year: 1800,
    },
  ] as SemanticNode[],
  links: [
    { source: "chesed_tanakh", target: "chesed_mishnah", type: "evolution", strength: 0.9 },
    { source: "chesed_mishnah", target: "chesed_talmud", type: "evolution", strength: 0.8 },
    { source: "chesed_talmud", target: "chesed_zohar", type: "contrast", strength: 0.6 },
    { source: "chesed_zohar", target: "chesed_hasidut", type: "evolution", strength: 0.7 },
  ] as SemanticLink[],
}

export default function LexicalHypergraph({ searchTerm, onNodeClick }: LexicalHypergraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<SemanticNode | null>(null)

  // Filter nodes by searchTerm
  const filteredNodes = searchTerm
    ? sampleSemanticData.nodes.filter((node) =>
        node.term.includes(searchTerm) ||
        node.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.era.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sampleSemanticData.nodes;

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 800
    const height = 400
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    // Color mapping for eras
    const eraColors = {
      Tanakh: "#dc2626",
      Mishnah: "#ea580c",
      Talmud: "#ca8a04",
      Zohar: "#16a34a",
      Hasidut: "#2563eb",
    }

    // Create timeline scale
    const xScale = d3
      .scaleLinear()
      .domain([-600, 1900])
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top])

    // Create container
    const container = svg.append("g")

    // Add timeline axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"))
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)

    // Position nodes along timeline
    const positionedNodes = filteredNodes.map((node, i) => ({
      ...node,
      x: xScale(node.year),
      y: yScale(0.5) + (i % 2 === 0 ? -50 : 50),
    }))

    // Add connection lines
    sampleSemanticData.links.forEach((link) => {
      const sourceNode = positionedNodes.find((n) => n.id === link.source)
      const targetNode = positionedNodes.find((n) => n.id === link.target)

      if (sourceNode && targetNode) {
        container
          .append("line")
          .attr("x1", sourceNode.x)
          .attr("y1", sourceNode.y)
          .attr("x2", targetNode.x)
          .attr("y2", targetNode.y)
          .attr("stroke", link.type === "evolution" ? "#3b82f6" : link.type === "contrast" ? "#ef4444" : "#6b7280")
          .attr("stroke-width", link.strength * 3)
          .attr("stroke-opacity", 0.6)
          .attr("stroke-dasharray", link.type === "contrast" ? "5,5" : "none")
      }
    })

    // Add nodes
    const nodes = container
      .selectAll(".semantic-node")
      .data(positionedNodes)
      .enter()
      .append("g")
      .attr("class", "semantic-node")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")

    // Add circles
    nodes
      .append("circle")
      .attr("r", 25)
      .attr("fill", (d) => eraColors[d.era as keyof typeof eraColors])
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)

    // Add era labels
    nodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d) => d.era)

    // Add term labels below
    nodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "45px")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .attr("font-family", "var(--font-hebrew)")
      .text((d) => d.term)

    // Add click handlers
    nodes.on("click", (event, d) => {
      setSelectedNode(d)
      onNodeClick(d)
    })

    // Add hover effects
    nodes
      .on("mouseover", function (event, d) {
        d3.select(this).select("circle").attr("r", 30).attr("stroke", "#fbbf24")
      })
      .on("mouseout", function (event, d) {
        d3.select(this).select("circle").attr("r", 25).attr("stroke", "#fff")
      })
  }, [searchTerm, onNodeClick])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-slate-900">Lexical Hypergraph</h3>
        </div>
      </div>
      <div className="flex flex-1">
        {/* Graph Visualization */}
        <div className="flex-1 p-4">
          <svg ref={svgRef} width="100%" height="400" className="border border-slate-200 rounded-lg bg-white" />
          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-500" />
              <span className="text-xs">Evolution</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-red-500 border-dashed" />
              <span className="text-xs">Contrast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-gray-500" />
              <span className="text-xs">Parallel</span>
            </div>
          </div>
        </div>
        {/* Node Details Panel */}
        {selectedNode && (
          <div className="w-80 border-l border-slate-200 bg-slate-50">
            <div className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="font-hebrew text-xl">{selectedNode.term}</div>
                    <Badge variant="secondary">{selectedNode.era}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Meaning</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedNode.meaning}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Key Sources</h4>
                    <div className="space-y-1">
                      {selectedNode.sources.map((source) => (
                        <Badge key={source} variant="outline" className="mr-1 mb-1 cursor-pointer hover:bg-blue-50" onClick={() => onNodeClick({ id: source })}>
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Semantic Evolution</h4>
                    <p className="text-xs text-slate-600">
                      Click on connected nodes to trace the semantic development of this term across different periods
                      of Jewish literature.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
