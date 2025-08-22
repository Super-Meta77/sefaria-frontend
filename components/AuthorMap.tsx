"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Author {
  id: string
  name: string
  hebrewName: string
  birth: number
  death: number
  location: string
  works: string[]
  influences: string[]
  influenced: string[]
  biography: string
}

interface AuthorMapProps {
  onClose: () => void
}

const sampleAuthors: Author[] = [
  {
    id: "rashi",
    name: "Rashi",
    hebrewName: "רש״י",
    birth: 1040,
    death: 1105,
    location: "Troyes, France",
    works: ["Commentary on Tanakh", "Commentary on Talmud"],
    influences: ["Geonim", "Rabbeinu Gershom"],
    influenced: ["Tosafot", "Ramban"],
    biography: "Rabbi Shlomo Yitzchaki, the foremost commentator on Tanakh and Talmud.",
  },
  {
    id: "rambam",
    name: "Rambam",
    hebrewName: "רמב״ם",
    birth: 1135,
    death: 1204,
    location: "Cordoba, Spain / Cairo, Egypt",
    works: ["Mishneh Torah", "Guide for the Perplexed", "Commentary on Mishnah"],
    influences: ["Aristotle", "Geonim"],
    influenced: ["Later Halakhists", "Jewish Philosophy"],
    biography: "Moses Maimonides, the greatest Jewish philosopher and halakhist of the medieval period.",
  },
  {
    id: "ramban",
    name: "Ramban",
    hebrewName: "רמב״ן",
    birth: 1194,
    death: 1270,
    location: "Girona, Spain / Land of Israel",
    works: ["Commentary on Torah", "Chiddushim on Talmud"],
    influences: ["Rashi", "Rambam"],
    influenced: ["Rashba", "Ritva"],
    biography: "Rabbi Moses ben Nachman, leading Spanish rabbi and kabbalist.",
  },
  {
    id: "shulchan_arukh",
    name: "Joseph Caro",
    hebrewName: "יוסף קארו",
    birth: 1488,
    death: 1575,
    location: "Spain / Safed, Israel",
    works: ["Shulchan Arukh", "Beit Yosef"],
    influences: ["Rambam", "Tur"],
    influenced: ["Modern Halakha"],
    biography: "Author of the Shulchan Arukh, the most authoritative code of Jewish law.",
  },
]

export default function AuthorMap({ onClose }: AuthorMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 800
    const height = 500
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([1000, 1600])
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleOrdinal()
      .domain(["France", "Spain", "Germany", "Israel", "Egypt"])
      .range([margin.top, height / 4, height / 2, (3 * height) / 4, height - margin.bottom])

    // Create container
    const container = svg.append("g")

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"))
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Year")

    // Add geographic regions
    const regions = ["France", "Spain", "Germany", "Israel", "Egypt"]
    regions.forEach((region) => {
      svg
        .append("text")
        .attr("x", 10)
        .attr("y", yScale(region) as number)
        .attr("font-size", "10px")
        .attr("fill", "#666")
        .text(region)
    })

    // Add influence lines
    sampleAuthors.forEach((author) => {
      author.influences.forEach((influenceId) => {
        const influence = sampleAuthors.find((a) => a.id === influenceId || a.name.includes(influenceId))
        if (influence) {
          container
            .append("line")
            .attr("x1", xScale(influence.birth + (influence.death - influence.birth) / 2))
            .attr("y1", yScale(influence.location.split(",")[1]?.trim() || influence.location.split(",")[0]) as number)
            .attr("x2", xScale(author.birth + (author.death - author.birth) / 2))
            .attr("y2", yScale(author.location.split(",")[1]?.trim() || author.location.split(",")[0]) as number)
            .attr("stroke", "#cbd5e1")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")
        }
      })
    })

    // Add author nodes
    const nodes = container
      .selectAll(".author-node")
      .data(sampleAuthors)
      .enter()
      .append("g")
      .attr("class", "author-node")
      .style("cursor", "pointer")

    // Add lifespans as rectangles
    nodes
      .append("rect")
      .attr("x", (d) => xScale(d.birth))
      .attr("y", (d) => (yScale(d.location.split(",")[1]?.trim() || d.location.split(",")[0]) as number) - 10)
      .attr("width", (d) => xScale(d.death) - xScale(d.birth))
      .attr("height", 20)
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.7)
      .attr("rx", 3)

    // Add author names
    nodes
      .append("text")
      .attr("x", (d) => xScale(d.birth + (d.death - d.birth) / 2))
      .attr("y", (d) => (yScale(d.location.split(",")[1]?.trim() || d.location.split(",")[0]) as number) + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d) => d.name)

    // Add click handlers
    nodes.on("click", (event, d) => {
      setSelectedAuthor(d)
    })

    // Add hover effects
    nodes
      .on("mouseover", function (event, d) {
        d3.select(this).select("rect").attr("fill-opacity", 1)
      })
      .on("mouseout", function (event, d) {
        d3.select(this).select("rect").attr("fill-opacity", 0.7)
      })
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Chronological-Conceptual Author Map</h3>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="flex flex-1">
        {/* Map Visualization */}
        <div className="flex-1 p-4">
          <svg ref={svgRef} width="100%" height="500" className="border border-slate-200 rounded-lg bg-white" />
        </div>

        {/* Author Details Panel */}
        {selectedAuthor && (
          <div className="w-80 border-l border-slate-200 bg-slate-50">
            <ScrollArea className="h-full p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="text-lg">{selectedAuthor.name}</div>
                      <div className="text-sm font-hebrew text-slate-600">{selectedAuthor.hebrewName}</div>
                    </div>
                    <Badge variant="secondary">
                      {selectedAuthor.birth}-{selectedAuthor.death}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Location</h4>
                    <p className="text-sm text-slate-600">{selectedAuthor.location}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Major Works</h4>
                    <div className="space-y-1">
                      {selectedAuthor.works.map((work) => (
                        <Badge key={work} variant="outline" className="mr-1 mb-1">
                          {work}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Influences</h4>
                    <div className="space-y-1">
                      {selectedAuthor.influences.map((influence) => (
                        <Badge key={influence} variant="secondary" className="mr-1 mb-1">
                          {influence}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Influenced</h4>
                    <div className="space-y-1">
                      {selectedAuthor.influenced.map((influenced) => (
                        <Badge key={influenced} variant="secondary" className="mr-1 mb-1">
                          {influenced}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Biography</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedAuthor.biography}</p>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
