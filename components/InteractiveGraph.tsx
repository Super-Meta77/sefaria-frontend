"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Node extends d3.SimulationNodeDatum {
  id: string
  title: string
  type: string
  snippet?: string
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
  type: string
  strength: number
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface InteractiveGraphProps {
  data: GraphData
  onNodeClick: (node: Node) => void
  onClose: () => void
}

export default function InteractiveGraph({ data, onNodeClick, onClose }: InteractiveGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [filters, setFilters] = useState({
    genre: "all",
    author: "all",
    timePeriod: "all",
  })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null)

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes || !data.links) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 800
    const height = 600
    const centerX = width / 2
    const centerY = height / 2

    // Color mapping for edge types
    const edgeColors = {
      halakhic: "#3b82f6", // blue
      aggadic: "#ef4444", // red
      lexical: "#6b7280", // gray
      responsa: "#10b981", // green
    }

    // Node type colors
    const nodeColors = {
      talmud: "#1e40af",
      mishnah: "#7c3aed",
      halakhah: "#059669",
      kabbalah: "#dc2626",
      commentary: "#ea580c",
      current: "#f59e0b", // special color for current text
    }

    // Create deep copies of the data to avoid mutation
    const nodes = data.nodes.map((d) => ({ ...d }))
    const links = data.links.map((d) => ({ ...d }))

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(150),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(centerX, centerY))
      .force("collision", d3.forceCollide().radius(40))

    // Create container group
    const container = svg.append("g")

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Create links
    const linkElements = container
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke", (d: any) => edgeColors[d.type as keyof typeof edgeColors] || "#999")
      .attr("stroke-width", (d: any) => Math.sqrt(d.strength * 10))
      .attr("stroke-opacity", 0.6)

    // Create node groups
    const nodeElements = container
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")

    // Add circles to nodes
    nodeElements
      .append("circle")
      .attr("r", (d: any) => (d.id === "current" ? 25 : 20))
      .attr("fill", (d: any) => nodeColors[d.type as keyof typeof nodeColors] || "#999")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)

    // Add labels to nodes
    nodeElements
      .append("text")
      .text((d: any) => d.title)
      .attr("dy", -30)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")

    // Add node interactions
    nodeElements
      .on("mouseover", function (event, d: any) {
        setHoveredNode(d)
        d3.select(this).select("circle").attr("stroke-width", 4).attr("stroke", "#fbbf24")
      })
      .on("mouseout", function (event, d: any) {
        setHoveredNode(null)
        d3.select(this).select("circle").attr("stroke-width", 2).attr("stroke", "#fff")
      })
      .on("click", (event, d: any) => {
        setSelectedNode(d)
        onNodeClick(d)
      })

    // Add drag behavior
    const drag = d3
      .drag<SVGGElement, Node>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on("drag", (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    nodeElements.call(drag)

    // Update positions on simulation tick
    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      nodeElements.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [data, onNodeClick])

  return (
    <div className="flex flex-col h-full">
      {/* Filter Controls */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <Select value={filters.genre} onValueChange={(value) => setFilters({ ...filters, genre: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="halakhic">Halakhic</SelectItem>
              <SelectItem value="aggadic">Aggadic</SelectItem>
              <SelectItem value="lexical">Lexical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.timePeriod} onValueChange={(value) => setFilters({ ...filters, timePeriod: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="tannaitic">Tannaitic</SelectItem>
              <SelectItem value="amoraic">Amoraic</SelectItem>
              <SelectItem value="medieval">Medieval</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="flex flex-1">
        {/* Graph Visualization */}
        <div className="flex-1 relative">
          <svg ref={svgRef} width="100%" height="500" className="border border-slate-200 rounded-lg bg-white" />

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h4 className="font-medium text-sm mb-2">Connection Types</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-500" />
                <span className="text-xs">Halakhic</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-red-500" />
                <span className="text-xs">Aggadic</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-gray-500" />
                <span className="text-xs">Lexical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-green-500" />
                <span className="text-xs">Responsa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node Details Panel */}
        {(hoveredNode || selectedNode) && (
          <div className="w-80 border-l border-slate-200 bg-slate-50">
            <div className="p-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{(hoveredNode || selectedNode)?.title}</CardTitle>
                  <Badge variant="secondary">{(hoveredNode || selectedNode)?.type}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    {(hoveredNode || selectedNode)?.snippet ||
                      "This text discusses the timing of evening prayers and connects to broader themes of ritual obligation."}
                  </p>
                  {selectedNode && (
                    <Button size="sm" className="w-full" onClick={() => onNodeClick(selectedNode)}>
                      Open in Main View
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
