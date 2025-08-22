"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Footnote {
  id: string
  text: string
}

interface Change {
  type: "insertion" | "deletion"
  text: string
  position: number
  note: string
}

interface Segment {
  id: number
  text: string
  translation: string
  footnotes: Footnote[]
  changes?: Change[]
}

interface Manuscript {
  name: string
  year: number
  segments: Segment[]
}

interface ManuscriptComparisonProps {
  primaryManuscript: Manuscript
  alternateManuscript: Manuscript
  onClose: () => void
}

export default function ManuscriptComparison({
  primaryManuscript,
  alternateManuscript,
  onClose,
}: ManuscriptComparisonProps) {
  const [highlightType, setHighlightType] = useState<"all" | "linguistic" | "semantic">("all")
  const [selectedFootnote, setSelectedFootnote] = useState<string | null>(null)

  const renderTextWithChanges = (segment: Segment, isPrimary = true) => {
    if (isPrimary || !segment.changes) {
      return (
        <span className="font-hebrew text-lg leading-relaxed">
          {segment.text}
          {segment.footnotes.map((footnote) => (
            <TooltipProvider key={footnote.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <sup
                    className="text-blue-600 cursor-pointer hover:text-blue-800 ml-1"
                    onClick={() => setSelectedFootnote(footnote.id)}
                  >
                    [{footnote.id.slice(-1)}]
                  </sup>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{footnote.text}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </span>
      )
    }

    // Render text with changes for alternate manuscript
    let result = segment.text
    const changes = [...(segment.changes || [])].sort((a, b) => b.position - a.position) // Sort by position descending

    changes.forEach((change) => {
      if (change.type === "insertion") {
        const before = result.slice(0, change.position)
        const after = result.slice(change.position)
        result = before + change.text + after
      } else if (change.type === "deletion") {
        const before = result.slice(0, change.position)
        const after = result.slice(change.position + change.text.length)
        result = before + after
      }
    })

    // Now add the visual markers
    const parts: JSX.Element[] = []
    let currentIndex = 0

    changes
      .sort((a, b) => a.position - b.position)
      .forEach((change, idx) => {
        // Add text before change
        if (change.position > currentIndex) {
          parts.push(<span key={`text-${idx}`}>{segment.text.slice(currentIndex, change.position)}</span>)
        }

        if (change.type === "insertion") {
          parts.push(
            <TooltipProvider key={`insertion-${idx}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="bg-green-100 text-green-800 px-1 rounded cursor-pointer hover:bg-green-200">
                    {change.text}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{change.note}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>,
          )
          currentIndex = change.position
        } else if (change.type === "deletion") {
          parts.push(
            <TooltipProvider key={`deletion-${idx}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="bg-red-100 text-red-800 px-1 rounded line-through cursor-pointer hover:bg-red-200">
                    {change.text}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{change.note}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>,
          )
          currentIndex = change.position + change.text.length
        }
      })

    // Add remaining text
    if (currentIndex < segment.text.length) {
      parts.push(<span key="remaining">{segment.text.slice(currentIndex)}</span>)
    }

    return (
      <span className="font-hebrew text-lg leading-relaxed">
        {parts}
        {segment.footnotes.map((footnote) => (
          <TooltipProvider key={footnote.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <sup
                  className="text-blue-600 cursor-pointer hover:text-blue-800 ml-1"
                  onClick={() => setSelectedFootnote(footnote.id)}
                >
                  [{footnote.id.slice(-1)}]
                </sup>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{footnote.text}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </span>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-slate-900">Manuscript Comparison</h3>
          <Separator orientation="vertical" className="h-6" />
          <Select value={highlightType} onValueChange={(value: any) => setHighlightType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Changes</SelectItem>
              <SelectItem value="linguistic">Linguistic Only</SelectItem>
              <SelectItem value="semantic">Semantic Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* Comparison View */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-6 overflow-auto">
        {/* Primary Manuscript */}
        <div className="border-r border-slate-200 pr-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">{primaryManuscript.name}</h4>
              <Badge variant="secondary">{primaryManuscript.year}</Badge>
            </div>
            <Badge variant="outline">Primary</Badge>
          </div>
          <div className="space-y-6">
            {primaryManuscript.segments.map((segment) => (
              <div key={segment.id} className="space-y-3">
                <div className="text-right">{renderTextWithChanges(segment, true)}</div>
                <div className="text-left text-slate-700 leading-relaxed">{segment.translation}</div>
                <Separator className="opacity-30" />
              </div>
            ))}
          </div>
        </div>

        {/* Alternate Manuscript */}
        <div className="pl-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">{alternateManuscript.name}</h4>
              <Badge variant="secondary">{alternateManuscript.year}</Badge>
            </div>
            <Badge variant="outline">Alternate</Badge>
          </div>
          <div className="space-y-6">
            {alternateManuscript.segments.map((segment) => (
              <div key={segment.id} className="space-y-3">
                <div className="text-right">{renderTextWithChanges(segment, false)}</div>
                <div className="text-left text-slate-700 leading-relaxed">{segment.translation}</div>
                <Separator className="opacity-30" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Sample Addition</span>
            <span className="text-sm text-slate-600">Insertions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded line-through text-sm">Sample Deletion</span>
            <span className="text-sm text-slate-600">Deletions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 text-sm">[1]</span>
            <span className="text-sm text-slate-600">Clickable Footnotes</span>
          </div>
        </div>
      </div>

      {/* Selected Footnote Display */}
      {selectedFootnote && (
        <Card className="m-4 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  Footnote {selectedFootnote.slice(-1)}
                </Badge>
                <p className="text-sm text-slate-700">
                  {
                    primaryManuscript.segments
                      .flatMap((s) => s.footnotes)
                      .concat(alternateManuscript.segments.flatMap((s) => s.footnotes))
                      .find((f) => f.id === selectedFootnote)?.text
                  }
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFootnote(null)}>
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
