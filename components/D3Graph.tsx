"use client"

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface GraphNode {
  id: string;
  title: string;
  type: "current" | "halakhic" | "aggadic" | "lexical" | "responsa" | "commentary" | "mishnah" | "talmud" | "kabbalah";
  snippet: string;
  content?: string;
  url?: string;
  color?: string;
  metadata: {
    genre?: string;
    author?: string;
    timePeriod?: string;
  };
  simulation?: {
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
  };
}

interface GraphLink {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: "explicit";
  strength: number;
  weight?: number;
  simulation?: {
    index?: number;
    distance?: number;
  };
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface D3GraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  onLinkHover: (link: GraphLink | null) => void;
}

export default function D3Graph({ data, onNodeClick, onLinkHover }: D3GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Color scale for node types
    const nodeColors: Record<GraphNode["type"], string> = {
      current: "#3b82f6",
      halakhic: "#059669",
      aggadic: "#dc2626",
      lexical: "#6b7280",
      responsa: "#10b981",
      commentary: "#8b5cf6",
      mishnah: "#f59e0b",
      talmud: "#1e40af",
      kabbalah: "#dc2626"
    }

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#6b7280")
      .attr("stroke-width", (d: any) => d.strength * 3)
      .attr("opacity", 0.6)
      .on("mouseover", function(event, d: any) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", (d.strength * 3) + 2)
        onLinkHover(d)
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this).attr("opacity", 0.6).attr("stroke-width", d.strength * 3)
        onLinkHover(null)
      })

    // Create nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      .call(d3.drag<any, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

    // Add circles to nodes
    node.append("circle")
      .attr("r", (d: GraphNode) => d.type === "current" ? 20 : 15)
      .attr("fill", (d: GraphNode) => nodeColors[d.type])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)

    // Add labels to nodes
    node.append("text")
      .text((d: GraphNode) => d.title.length > 15 ? d.title.substring(0, 15) + "..." : d.title)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")

    // Add click handlers
    node.on("click", (event, d: GraphNode) => {
      onNodeClick(d)
    })

    // Add hover effects
    node.on("mouseover", function(event, d: GraphNode) {
      d3.select(this).select("circle").attr("r", (d.type === "current" ? 20 : 15) + 3)
    })
    .on("mouseout", function(event, d: GraphNode) {
      d3.select(this).select("circle").attr("r", d.type === "current" ? 20 : 15)
    })

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [data, onNodeClick, onLinkHover])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{ background: '#f8fafc' }}
    />
  )
}










