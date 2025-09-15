"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Search, ChevronLeft, ChevronRight, Network, GitBranch, Brain, Clock, MessageSquare, Map, Tag, Hash, Plus, X, Filter, Star, Calendar, Check, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentLanguageProvider, useOptionalContentLanguage } from "@/components/content-language-context"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import AuthorMap from "@/components/AuthorMap"
import LexicalHypergraph from "@/components/LexicalHypergraph"
import CalendarDrawer from "@/components/CalendarDrawer"
import Link from "next/link"
import * as d3 from "d3"
import SugyaLogicTree from "./SugyaLogicTree"
import PsakLineageTimeline from "./PsakLineageTimeline"
import { fetchConnectionsForVerse } from "@/lib/neo4j"

// Graph interfaces
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: "current" | "halakhic" | "aggadic" | "lexical" | "responsa" | "commentary" | "mishnah";
  snippet: string;
  author?: string;
  timePeriod?: string;
  genre?: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: "halakhic" | "aggadic" | "lexical" | "responsa";
  strength: number;
  snippet?: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const emptyGraphData: GraphData = { nodes: [], links: [] }

const safeLearning = {
  parasha: "-",
  dafYomi: "-",
  mishnahYomi: "-",
  date: "-",
  hebrewDate: "-"
};

// Enhanced manuscript data for Textual Topology Engine
const manuscriptVersions = {
  Vilna: {
    name: "Vilna Edition",
    year: 1880,
    description: "Standard printed edition",
    segments: [
      {
        id: 1,
        text: "תנו רבנן: מאימתי קורין את שמע בערבית? משעה שהכהנים נכנסים לאכול בתרומתן",
        translation: "The Sages taught: From when do we recite the Shema in the evening? From the time when the priests enter to eat their terumah.",
        footnotes: [
          {
            id: "fn1",
            text: "This refers to the time when stars appear and priests who were ritually impure during the day become pure.",
            type: "critical"
          },
        ],
      },
      {
        id: 2,
        text: "עד סוף האשמורה הראשונה, דברי רבי אליעזר",
        translation: "Until the end of the first watch, these are the words of Rabbi Eliezer.",
        footnotes: [
          { 
            id: "fn2", 
            text: "The first watch is the first third of the night, approximately 4 hours after sunset.",
            type: "explanatory"
          },
        ],
      },
      {
        id: 3,
        text: "וחכמים אומרים: עד חצות",
        translation: "And the Sages say: Until midnight.",
        footnotes: [],
      },
    ],
  },
  Munich: {
    name: "Munich Manuscript",
    year: 1342,
    description: "Medieval Ashkenazi manuscript",
    segments: [
      {
        id: 1,
        text: "תנו רבנן: מאימתי קורין את שמע בערבית? משעה שהכהנים נכנסים לאכול בתרומתן",
        translation: "The Sages taught: From when do we recite the Shema in the evening? From the time when the priests enter to eat their terumah.",
        footnotes: [
          {
            id: "fn1",
            text: "Munich variant: 'משעה שהכהנים נכנסים לאכול בתרומתן' - note the spelling variation",
            type: "critical"
          },
        ],
      },
      {
        id: 2,
        text: "עד סוף האשמורה הראשונה, דברי רבי אליעזר",
        translation: "Until the end of the first watch, these are the words of Rabbi Eliezer.",
        footnotes: [
          { 
            id: "fn2", 
            text: "Munich reads 'האשמורה' with different vocalization than Vilna",
            type: "critical"
          },
        ],
      },
      {
        id: 3,
        text: "וחכמים אומרים: עד חצות הלילה",
        translation: "And the Sages say: Until midnight of the night.",
        footnotes: [
          {
            id: "fn3",
            text: "Munich adds 'הלילה' (of the night) - this is a significant variant",
            type: "critical"
          },
        ],
      },
    ],
  },
  Vatican: {
    name: "Vatican Manuscript",
    year: 1200,
    description: "Early Italian manuscript",
    segments: [
      {
        id: 1,
        text: "תנו רבנן: מאימתי קורין את שמע בערבית? משעה שהכהנים נכנסים לאכול בתרומתן",
        translation: "The Sages taught: From when do we recite the Shema in the evening? From the time when the priests enter to eat their terumah.",
        footnotes: [],
      },
      {
        id: 2,
        text: "עד סוף האשמורה הראשונה, דברי רבי אליעזר",
        translation: "Until the end of the first watch, these are the words of Rabbi Eliezer.",
        footnotes: [],
      },
      {
        id: 3,
        text: "וחכמים אומרים: עד חצות",
        translation: "And the Sages say: Until midnight.",
        footnotes: [],
      },
    ],
  }
}


// Text comparison function for computing differences
const computeTextDifferences = (text1: string, text2: string) => {
  const differences: Array<{
    type: 'insertion' | 'deletion' | 'substitution';
    text: string;
    position: number;
    note?: string;
  }> = [];
  
  // Simple word-by-word comparison
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  let i = 0, j = 0;
  let position = 0;
  
  while (i < words1.length || j < words2.length) {
    if (i < words1.length && j < words2.length && words1[i] === words2[j]) {
      // Words match, move both pointers
      position += words1[i].length + 1; // +1 for space
      i++;
      j++;
    } else if (i < words1.length && j < words2.length && words1[i] !== words2[j]) {
      // Substitution
      differences.push({
        type: 'substitution',
        text: words1[i] + ' → ' + words2[j],
        position,
        note: `Word substitution: "${words1[i]}" becomes "${words2[j]}"`
      });
      position += Math.max(words1[i].length, words2[j].length) + 1;
      i++;
      j++;
    } else if (i < words1.length) {
      // Deletion in text1
      differences.push({
        type: 'deletion',
        text: words1[i],
        position,
        note: `Word deleted: "${words1[i]}"`
      });
      position += words1[i].length + 1;
      i++;
    } else if (j < words2.length) {
      // Insertion in text2
      differences.push({
        type: 'insertion',
        text: words2[j],
        position,
        note: `Word added: "${words2[j]}"`
      });
      position += words2[j].length + 1;
      j++;
    }
  }
  
  return differences;
}

interface VerseData {
  hebrew: string;
  english: string;
  verseNumber: number;
  hebrewHtml: string;
  englishHtml: string;
  chapterNumber: number;
}

interface ChapterData {
  verses: VerseData[];
  loading: boolean;
  error: string | null;
  chapterNumber: number;
}

interface ChapterPageProps {
  params: {
    category: string
    book: string
    chapter: string
  }
}

export default function ChapterPage({ params }: ChapterPageProps) {
  return (
    <ContentLanguageProvider>
      <ChapterPageInner params={params} />
    </ContentLanguageProvider>
  )
}

function ChapterPageInner({ params }: ChapterPageProps) {
  const { category, book, chapter } = params

  // State for chapter data
  const [chaptersData, setChaptersData] = useState<{ [key: number]: ChapterData }>({});
  const [displayMode, setDisplayMode] = useState<"hebrew" | "english" | "bilingual">("bilingual");
  // Refs for intersection observer
  const topTriggerRef = useRef<HTMLDivElement>(null);
  const bottomTriggerRef = useRef<HTMLDivElement>(null);
  
  // Current chapter number
  const currentChapter = parseInt(chapter);

  // Function to fetch a single chapter
  const fetchChapter = async (chapterNum: number) => {
    // Skip invalid chapter numbers
    if (chapterNum <= 0) {
      return;
    }

    // Skip if already loading or loaded
    if (chaptersData[chapterNum]?.loading || chaptersData[chapterNum]?.verses?.length > 0) {
      return;
    }

    try {
      setChaptersData(prev => ({
        ...prev,
        [chapterNum]: {
          ...prev[chapterNum],
          loading: true,
          error: null,
          chapterNumber: chapterNum,
          verses: prev[chapterNum]?.verses || []
        }
      }));

      const response = await fetch(
        `https://www.sefaria.org/api/v3/texts/${book}.${chapterNum}?version=hebrew%7CMiqra%20according%20to%20the%20Masorah&version=translation&fill_in_missing_segments=1&return_format=wrap_all_entities`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch verse data: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract Hebrew and English verses from the versions
      const hebrewVerses = data.versions?.find((v: any) => v.language === "he")?.text || [];
      const englishVerses = data.versions?.find((v: any) => v.language === "en")?.text || [];
      
      // Combine Hebrew and English verses with HTML content
      const combinedVerses: VerseData[] = hebrewVerses.map((hebrewVerse: string, index: number) => ({
        hebrew: hebrewVerse,
        english: englishVerses[index] || "",
        hebrewHtml: hebrewVerse,
        englishHtml: englishVerses[index] || "",
        verseNumber: index + 1,
        chapterNumber: chapterNum
      }));

      setChaptersData(prev => ({
        ...prev,
        [chapterNum]: {
          verses: combinedVerses,
          loading: false,
          error: null,
          chapterNumber: chapterNum
        }
      }));
    } catch (err) {
      console.error(`Error fetching chapter ${chapterNum}:`, err);
      setChaptersData(prev => ({
        ...prev,
        [chapterNum]: {
          ...prev[chapterNum],
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load verse data",
        }
      }));
    }
  };

  // Effect to fetch initial chapters
  useEffect(() => {
    // Fetch current chapter and adjacent chapters
    fetchChapter(currentChapter);
    if (currentChapter > 1) {
      fetchChapter(currentChapter - 1);
    }
    fetchChapter(currentChapter + 1);
  }, [book, currentChapter]);

  // Set up intersection observers for infinite scroll
  useEffect(() => {
    const topObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentChapter > 1) {
          // Load previous chapter when top trigger is visible
          fetchChapter(currentChapter - 1);
        }
      },
      { threshold: 0.1 }
    );

    const bottomObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Load next chapter when bottom trigger is visible
          fetchChapter(currentChapter + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (topTriggerRef.current) {
      topObserver.observe(topTriggerRef.current);
    }

    if (bottomTriggerRef.current) {
      bottomObserver.observe(bottomTriggerRef.current);
    }

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [currentChapter]);

  // Mock data for the study interface - in real app, this would be fetched based on params
  const currentText = {
    title: `${book.charAt(0).toUpperCase() + book.slice(1)} ${chapter}`,
    hebrew: "מאימתי קורין את שמע בערבית",
    translation: "From when do we recite the Shema in the evening?",
    content: [
      {
        id: 1,
        hebrew: "תנו רבנן: מאימתי קורין את שמע בערבית? משעה שהכהנים נכנסים לאכול בתרומתן",
        english:
          "The Sages taught: From when do we recite the Shema in the evening? From the time when the priests enter to eat their terumah.",
        type: "mishnah",
        aiInsights: {
          pshat: "The literal meaning refers to the time when priests become ritually pure to eat terumah.",
          halakhic: "This establishes the earliest time for evening Shema recitation.",
          mystical: "The Zohar connects this to the cosmic transition from day to night.",
        },
        annotations: [
          {
            id: "ann1",
            type: "halakhic",
            author: "Rabbi Cohen",
            text: "This timing connects to broader questions of when mitzvot begin and end.",
            votes: 5,
            timestamp: "2 hours ago",
          },
        ],
      },
      {
        id: 2,
        hebrew: "עד סוף האשמורה הראשונה, דברי רבי אליעזר",
        english: "Until the end of the first watch, these are the words of Rabbi Eliezer.",
        type: "mishnah",
        aiInsights: {
          pshat: "The first watch is the first third of the night.",
          halakhic: "Rabbi Eliezer's position on the latest time for Shema.",
          mystical: "The watches correspond to different spiritual realms.",
        },
        annotations: [],
      },
      {
        id: 3,
        hebrew: "וחכמים אומרים: עד חצות",
        english: "And the Sages say: Until midnight.",
        type: "mishnah",
        aiInsights: {
          pshat: "Midnight is the midpoint of the night.",
          halakhic: "The majority opinion extends the time until midnight.",
          mystical: "Midnight represents the deepest point of spiritual darkness.",
        },
        annotations: [],
      },
    ],
  }

  const sugyaFlow = [
    { id: 1, type: "question", text: "When do we recite evening Shema?", position: { x: 0, y: 0 } },
    { id: 2, type: "answer", text: "From when priests eat terumah", position: { x: 1, y: 0 } },
    { id: 3, type: "kasha", text: "But when exactly is that?", position: { x: 2, y: 0 } },
    { id: 4, type: "dispute", text: "R. Eliezer vs Sages dispute", position: { x: 3, y: 0 } },
    { id: 5, type: "terutz", text: "Different interpretations of timing", position: { x: 4, y: 0 } },
    { id: 6, type: "resolution", text: "Practical halakha follows Sages", position: { x: 5, y: 0 } },
  ]

  const psakLineage = [
    { id: 1, source: "Torah", text: "וְדִבַּרְתָּ בָּם", era: "Biblical", year: -1200, type: "source" },
    { id: 2, source: "Mishnah", text: "מאימתי קורין את שמע", era: "Tannaitic", year: 200, type: "interpretation" },
    { id: 3, source: "Talmud", text: "עד חצות", era: "Amoraic", year: 500, type: "analysis" },
    { id: 4, source: "Rambam", text: "זמן קריאת שמע", era: "Rishonic", year: 1180, type: "codification" },
    { id: 5, source: "Shulchan Arukh", text: "יש לו לקרות", era: "Acharonic", year: 1565, type: "final_ruling" },
  ]


  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [activeRightTab, setActiveRightTab] = useState("connections")
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)
  const [graphView, setGraphView] = useState(false)
  const [aiLayering, setAiLayering] = useState(false)
  const [aiMode, setAiMode] = useState("pshat")
  const [authorMapView, setAuthorMapView] = useState(false)
  const [lexicalGraphView, setLexicalGraphView] = useState(false)
  const [calendarDrawerOpen, setCalendarDrawerOpen] = useState(false)
  const [annotationMode, setAnnotationMode] = useState(false)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  
  // Card selection state
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  
  // Textual Topology Engine state
  const [topologyModalOpen, setTopologyModalOpen] = useState(false)
  const [primaryVersion, setPrimaryVersion] = useState("Vilna")
  const [alternateVersion, setAlternateVersion] = useState("Munich")
  const [highlightMode, setHighlightMode] = useState<"linguistic" | "semantic">("linguistic")
  const [showDifferences, setShowDifferences] = useState(true)
  const [scrollLocked, setScrollLocked] = useState(true)
  const [footnoteTooltip, setFootnoteTooltip] = useState<{id: string, text: string, x: number, y: number} | null>(null)
  
  // Graph state
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(true)
  const [selectedNodePreview, setSelectedNodePreview] = useState<GraphNode | null>(null)
  const [filteredGraphData, setFilteredGraphData] = useState<GraphData>(emptyGraphData)
  const [connectionsLoading, setConnectionsLoading] = useState<boolean>(false)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState({
    genre: [] as string[],
    author: [] as string[],
    timePeriod: [] as string[]
  })
  // Time Period filter chips state
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<string[]>(["Biblical","Tannaitic","Amoraic"]) // default selected
  const toggleTimePeriod = (value: string) => {
    setSelectedTimePeriods((prev: string[]) => {
      const next = prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      setActiveFilters((f: { genre: string[]; author: string[]; timePeriod: string[] }) => ({ ...f, timePeriod: next }))
      return next
    })
  }
  const graphRef = useRef<HTMLDivElement>(null)
  const svgSelectionRef = useRef<any>(null)
  const zoomLayerRef = useRef<any>(null)
  const zoomBehaviorRef = useRef<any>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)

  // Add state for dropdowns and toggle
  const [aiLayeredEnabled, setAiLayeredEnabled] = useState(false);
  const [baseCommentary, setBaseCommentary] = useState("Rashi");
  const [interpretiveMode, setInterpretiveMode] = useState("pshat");

  // D3 Graph functions
  const renderGraph = () => {
    if (!graphRef.current) return
    
    // Render only when fetched data is present
    const centeredGraphData = filteredGraphData
    if (!centeredGraphData || !centeredGraphData.nodes.length) return

    // Clear previous graph
    d3.select(graphRef.current).selectAll("*").remove()

    const container = d3.select(graphRef.current)
    const width = graphRef.current.clientWidth
    const height = graphRef.current.clientHeight

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f8fafc")
    svgSelectionRef.current = svg

    // Define arrowhead marker for directed edges
    const defs = svg.append("defs")
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10) // place triangle tip exactly at line end
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#64748b")

    // Color scales
    const nodeColors = {
      current: "#3b82f6", // blue
      halakhic: "#2563eb", // blue per spec
      aggadic: "#dc2626", // red
      lexical: "#6b7280", // gray
      responsa: "#10b981", // green
      commentary: "#8b5cf6",
      mishnah: "#f59e0b"
    }

    const linkColors = {
      halakhic: "#2563eb", // blue per spec
      aggadic: "#dc2626", // red
      lexical: "#6b7280", // gray
      responsa: "#10b981" // green
    }

    // Utility: lighten a hex color by mixing towards white
    const lightenColor = (hex: string, factor: number) => {
      const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
      if (!m) return hex
      const r = parseInt(m[1], 16)
      const g = parseInt(m[2], 16)
      const b = parseInt(m[3], 16)
      const lr = Math.round(r + (255 - r) * factor)
      const lg = Math.round(g + (255 - g) * factor)
      const lb = Math.round(b + (255 - b) * factor)
      const toHex = (v: number) => v.toString(16).padStart(2, '0')
      return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`
    }

    // Create force simulation
    const simulation = d3.forceSimulation(centeredGraphData.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(centeredGraphData.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))

    // Pre-tick the simulation to settle positions before rendering (no initial animation)
    simulation.stop()
    for (let i = 0; i < 300; i++) simulation.tick()

    // Zoom wrapper layer so we can pan/zoom content
    const zoomLayer = svg.append("g").attr("class", "zoom-layer")
    zoomLayerRef.current = zoomLayer

    // Zoom behavior
    const zoomBehavior = d3.zoom<any, any>()
      .scaleExtent([0.2, 5])
      .on("zoom", (event: any) => {
        zoomLayer.attr("transform", event.transform)
      })
    svg.call(zoomBehavior as any)
    zoomBehaviorRef.current = zoomBehavior

    // Create links
    const link = zoomLayer.append("g")
      .selectAll("line")
      .data(centeredGraphData.links)
      .enter().append("line")
      .attr("stroke", (d: GraphLink) => linkColors[d.type as keyof typeof linkColors])
      .attr("stroke-width", (d: GraphLink) => d.strength * 1.5)
      .attr("opacity", 0.6)
      .attr("marker-end", "url(#arrowhead)")
      .on("mouseover", function(this: SVGLineElement, event: any, d: GraphLink) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", (d.strength * 1.5) + 1)
      })  
      .on("mouseout", function(this: SVGLineElement, event: any, d: GraphLink) {
        d3.select(this).attr("opacity", 0.6).attr("stroke-width", d.strength * 1.5)
      })

    // Create nodes
    const node = zoomLayer.append("g")
      .selectAll("g")
      .data(centeredGraphData.nodes)
      .enter().append("g")
      .style("cursor", "pointer")
      .call(d3.drag<any, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

    // Add circles to nodes
    node.append("circle")
      .attr("r", (d: GraphNode) => d.type === "current" ? 25 : 15)
      .attr("fill", (d: GraphNode) => lightenColor(nodeColors[d.type], 0.6))
      .attr("stroke", (d: GraphNode) => nodeColors[d.type])
      .attr("stroke-width", (d: GraphNode) => d.type === "current" ? 4 : 2)

    // Add labels to nodes with enhanced visibility
    node.append("text")
      .text((d: GraphNode) => d.title.length > 15 ? d.title.substring(0, 15) + "..." : d.title)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .attr("fill", "#1f2937") // Dark text for better contrast
      .attr("font-weight", "bold")
      .attr("stroke", "white") // White outline
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke") // Ensure outline is behind text

    // Add click handlers
    node.on("click", (event: any, d: GraphNode) => {
      setSelectedNodePreview(d)
      // Show node data in right sidebar
      setSelectedNode(d)
      setRightSidebarOpen(true)
      setActiveRightTab("connections")
    })

    // Add hover effects with tooltips
    node.on("mouseover", function(this: SVGGElement, event: any, d: GraphNode) {
      d3.select(this).select("circle").attr("r", (d.type === "current" ? 25 : 15) + 3)
      
      // Show tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px 12px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("max-width", "200px")
        .style("white-space", "nowrap")
        .style("overflow", "hidden")
        .style("text-overflow", "ellipsis")
      
      tooltip.html(`
        <div><strong>${d.title}</strong></div>
        <div>${d.snippet}</div>
        ${d.author ? `<div><em>Author: ${d.author}</em></div>` : ''}
      `)
      
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
    })
    .on("mouseout", function(this: SVGGElement, event: any, d: GraphNode) {
      d3.select(this).select("circle").attr("r", d.type === "current" ? 25 : 15)
      
      // Remove tooltip
      d3.selectAll(".tooltip").remove()
    })

    // Helper to get node radius based on type
    const getNodeRadius = (n: GraphNode) => (n.type === "current" ? 25 : 15)

    // Update positions helper (used for initial draw and during drag)
    const updatePositions = () => {
      link
        .attr("x1", (d: any) => {
          const s = d.source as GraphNode & { x: number; y: number }
          const t = d.target as GraphNode & { x: number; y: number }
          const dx = t.x - s.x
          const dy = t.y - s.y
          const dist = Math.max(Math.hypot(dx, dy), 0.0001)
          const nx = dx / dist
          const rS = getNodeRadius(s)
          return s.x + nx * rS
        })
        .attr("y1", (d: any) => {
          const s = d.source as GraphNode & { x: number; y: number }
          const t = d.target as GraphNode & { x: number; y: number }
          const dx = t.x - s.x
          const dy = t.y - s.y
          const dist = Math.max(Math.hypot(dx, dy), 0.0001)
          const ny = dy / dist
          const rS = getNodeRadius(s)
          return s.y + ny * rS
        })
        .attr("x2", (d: any) => {
          const s = d.source as GraphNode & { x: number; y: number }
          const t = d.target as GraphNode & { x: number; y: number }
          const dx = t.x - s.x
          const dy = t.y - s.y
          const dist = Math.max(Math.hypot(dx, dy), 0.0001)
          const nx = dx / dist
          const rT = getNodeRadius(t)
          const arrowPad = 4
          return t.x - nx * (rT + arrowPad)
        })
        .attr("y2", (d: any) => {
          const s = d.source as GraphNode & { x: number; y: number }
          const t = d.target as GraphNode & { x: number; y: number }
          const dx = t.x - s.x
          const dy = t.y - s.y
          const dist = Math.max(Math.hypot(dx, dy), 0.0001)
          const ny = dy / dist
          const rT = getNodeRadius(t)
          const arrowPad = 4
          return t.y - ny * (rT + arrowPad)
        })

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    }

    // Draw initial positions without animation
    updatePositions()

    // Zoom to fit initially (compute bounds from node positions for accuracy)
    const fitToView = () => {
      try {
        const nodes = centeredGraphData.nodes as any[]
        if (!nodes || nodes.length === 0) return
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const n of nodes) {
          const r = getNodeRadius(n as GraphNode)
          const x0 = n.x - r
          const x1 = (n.x as number) + r
          const y0 = n.y - r
          const y1 = (n.y as number) + r
          if (x0 < minX) minX = x0
          if (y0 < minY) minY = y0
          if (x1 > maxX) maxX = x1
          if (y1 > maxY) maxY = y1
        }
        // Add extra room for arrowheads and strokes
        const extra = 24
        minX -= extra
        minY -= extra
        maxX += extra
        maxY += extra

        const contentWidth = Math.max(1, maxX - minX)
        const contentHeight = Math.max(1, maxY - minY)
        const padding = 60
        const scale = Math.min(
          (width - padding) / contentWidth,
          (height - padding) / contentHeight
        ) * 0.95
        const cx = minX + contentWidth / 2
        const cy = minY + contentHeight / 2
        const translateX = width / 2 - scale * cx
        const translateY = height / 2 - scale * cy
        const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        svg.call(zoomBehavior.transform as any, transform)
      } catch {}
    }
    fitToView()

    // Drag functions with floating animation
    let floatingAnimation: any = null

    function dragstarted(event: any, d: any) {
      d.fx = d.x
      d.fy = d.y
      updatePositions()
      
      // Start floating animation for all non-dragged nodes
      floatingAnimation = d3.interval(() => {
        centeredGraphData.nodes.forEach((node: any) => {
          if (node.id !== d.id && node.fx === undefined && node.fy === undefined) {
            // Add gentle floating motion (slight shaking)
            const time = Date.now() * 0.001
            const floatX = Math.sin(time + node.id.length * 0.5) * 0.5
            const floatY = Math.cos(time + node.id.length * 0.3) * 0.4
            
            // Apply floating offset while maintaining connections
            node.originalX = node.x
            node.originalY = node.y
            node.x = node.originalX + floatX
            node.y = node.originalY + floatY
          }
        })
        updatePositions()
      }, 50) // 20 FPS for smooth animation
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
      d.x = event.x
      d.y = event.y
      updatePositions()
    }

    function dragended(event: any, d: any) {
      // Stop floating animation
      if (floatingAnimation) {
        floatingAnimation.stop()
        floatingAnimation = null
      }
      
      // Restore original positions for floating nodes
      centeredGraphData.nodes.forEach((node: any) => {
        if (node.id !== d.id && node.originalX !== undefined && node.originalY !== undefined) {
          node.x = node.originalX
          node.y = node.originalY
          delete node.originalX
          delete node.originalY
        }
      })
      
      // Keep dragged node fixed where dropped to prevent any separation/snap-back
      d.fx = d.x
      d.fy = d.y
      updatePositions()
    }
  }

  // Render graph when modal opens or data changes
  useEffect(() => {
    if (connectionsModalOpen) {
      setTimeout(renderGraph, 100) // Small delay to ensure DOM is ready
    }
  }, [connectionsModalOpen, filteredGraphData])

  // Reset data when modal opens/closes so only loading shows initially
  useEffect(() => {
    if (connectionsModalOpen) {
      setConnectionsError(null)
      setFilteredGraphData(emptyGraphData)
      setConnectionsLoading(true)
    } else {
      setFilteredGraphData(emptyGraphData)
      setConnectionsLoading(false)
      setConnectionsError(null)
    }
  }, [connectionsModalOpen])

  // Fetch Neo4j connections when modal opens
  useEffect(() => {
    const loadConnections = async () => {
      if (!connectionsModalOpen || selectedCardId == null) return
      try {
        setConnectionsError(null)
        const normalizedBook = book.charAt(0).toUpperCase() + book.slice(1)
        const verseId = `${normalizedBook} ${currentChapter}:${selectedCardId}`
        const data = await fetchConnectionsForVerse(verseId)
        setFilteredGraphData(data)
      } catch (e: any) {
        setConnectionsError(e?.message || "Failed to load connections")
        // Keep empty on error
        setFilteredGraphData(emptyGraphData)
      } finally {
        setConnectionsLoading(false)
      }
    }
    loadConnections()
  }, [connectionsModalOpen, selectedCardId, book, currentChapter])

  // Synchronized scrolling effect
  useEffect(() => {
    if (!scrollLocked || !leftPanelRef.current || !rightPanelRef.current) return;

    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;

    const handleLeftScroll = () => {
      if (scrollLocked) {
        const scrollRatio = leftPanel.scrollTop / (leftPanel.scrollHeight - leftPanel.clientHeight);
        const rightScrollTop = scrollRatio * (rightPanel.scrollHeight - rightPanel.clientHeight);
        rightPanel.scrollTop = rightScrollTop;
      }
    };

    const handleRightScroll = () => {
      if (scrollLocked) {
        const scrollRatio = rightPanel.scrollTop / (rightPanel.scrollHeight - rightPanel.clientHeight);
        const leftScrollTop = scrollRatio * (leftPanel.scrollHeight - leftPanel.clientHeight);
        leftPanel.scrollTop = leftScrollTop;
      }
    };

    leftPanel.addEventListener('scroll', handleLeftScroll);
    rightPanel.addEventListener('scroll', handleRightScroll);

    return () => {
      leftPanel.removeEventListener('scroll', handleLeftScroll);
      rightPanel.removeEventListener('scroll', handleRightScroll);
    };
  }, [scrollLocked, topologyModalOpen]);


  const handleAddAnnotation = (segmentId: number) => {
    setSelectedSegment(segmentId)
    setAnnotationMode(true)
    setActiveRightTab("annotations")
    setRightSidebarOpen(true)
  }

  // Add this handler function near the component
  const handleSugyaNodeClick = (node: { id: string; sugyaLocation: string }) => {
    const el = document.getElementById(node.sugyaLocation);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Add handler function
  const handlePsakNodeClick = (node: { id: string }) => {
    // TODO: Implement logic to load the full source in the center text pane
    setSelectedSourceId(node.id);
  };

  // Add state and handler at the top of the component:
  const [lexicalSearchTerm, setLexicalSearchTerm] = useState("");
  const handleLexicalNodeClick = (node: { id: string }) => {
    setSelectedSourceId(node.id);
  };

  // Calendars API state
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState<string>(safeLearning.date);
  const [calendarHebrewDate, setCalendarHebrewDate] = useState<string>(safeLearning.hebrewDate);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        setCalendarLoading(true);
        setCalendarError(null);
        const res = await fetch("https://www.sefaria.org/api/calendars", { cache: "no-store" });
        if (!res.ok) throw new Error(`Calendars request failed: ${res.status}`);
        const data = await res.json();
        setCalendarItems(Array.isArray(data?.calendar_items) ? data.calendar_items : []);
        if (typeof data?.date === "string") setCalendarDate(data.date);
        if (typeof data?.hebDate === "string") setCalendarHebrewDate(data.hebDate);
      } catch (e: any) {
        setCalendarError(e?.message || "Failed to load calendars");
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchCalendars();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Top sub-header under global header to show breadcrumb and controls */}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation, Filters, Tools */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white border-r border-slate-200 flex flex-col"
            >
              <div className="flex items-center justify-between h-[80px] p-4 border-slate-200">
                <div className="w-full flex items-center justify-between">
                  <h1 className="font-semibold text-slate-900 text-2xl">Navigation & Tools</h1>
                  <Button variant="ghost" size="sm" onClick={() => setLeftSidebarOpen(false)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>

                
              <div className="mb-4">
                <Card className="border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md text-blue-900 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Today's Learning ({calendarDate})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-md">
                      {calendarLoading && (
                        <div className="text-xs text-slate-500 mt-1">Loading calendars…</div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {(() => {
                        const findItem = (en: string) => calendarItems.find((i: any) => i?.title?.en === en);
                        const parashat = findItem("Parashat Hashavua");
                        const haftarah = findItem("Haftarah");
                        const dafYomi = findItem("Daf Yomi");
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Parashat:</span>
                              <Badge variant="secondary">
                                <Link href={`/${parashat?.url}`} className="text-sm text-blue-700 hover:underline">
                                  {parashat?.displayValue?.en || '-'}
                                </Link>
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Haftarah:</span>
                              <Badge variant="secondary">
                                <Link href={`/${haftarah?.url}`} className="text-sm text-blue-700 hover:underline">
                                  {haftarah?.displayValue?.en || '-'}
                                </Link>
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Daf Yomi:</span>
                              <Badge variant="secondary">
                                <Link href={`/${dafYomi?.url}`} className="text-sm text-blue-700 hover:underline">
                                  {dafYomi?.displayValue?.en || '-'}
                                </Link>
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <Link href="/calendars" className="text-sm text-blue-700 hover:underline">All Learning Schedules -&gt;</Link>
                            </div>
                          </>
                        );
                      })()}
                      {calendarError && (
                        <div className="text-xs text-red-600">{calendarError}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

                {/* Search */}
              <div className="pt-8 pl-6 pr-6 border-t border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input placeholder="Search texts..." className="pl-10" />
                </div>
              
                {/* Time Period Filter */}
                <div className="pt-8 pl-2 pr-2">
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center text-lg">
                    <Clock className="w-4 h-4 mr-2" />
                    Time Period
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { key: "Biblical", label: "Biblical (-1200 to 0)" },
                      { key: "Tannaitic", label: "Tannaitic (0-220)" },
                      { key: "Amoraic", label: "Amoraic (220-500)" },
                      { key: "Medieval", label: "Medieval (500-1500)" },
                    ].map(({ key, label }) => {
                      const active = selectedTimePeriods.includes(key)
                      return (
                        <motion.button
                          key={key}
                          type="button"
                          onClick={() => toggleTimePeriod(key)}
                          initial={false}
                          animate={{ scale: active ? 1.02 : 1, opacity: 1 }}
                          whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          transition={{ duration: 0.2 }}
                          className={`group relative w-full text-left px-3 py-2 rounded-md border backdrop-blur-sm transition-colors ${
                            active ? "bg-blue-50/70 border-blue-400" : "bg-white/60 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {/* Animated check container */}
                          <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 align-middle rounded-sm border ${active ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}>
                            <motion.span
                              initial={false}
                              animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
                              transition={{ duration: 0.15 }}
                              className="text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </motion.span>
                          </span>
                          <span className="text-sm text-slate-800 align-middle">{label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Panel - Primary Text */}
        <div className="flex-1 flex flex-col bg-white center-pane">
          {/* Text Header */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!leftSidebarOpen && (
                  <Button variant="ghost" size="sm" onClick={() => setLeftSidebarOpen(true)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{currentText.title}</h1>
                  <p className="text-sm text-slate-600 font-hebrew">{currentText.hebrew}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {/* Display Mode Controls - Segmented Control */}
                <div className="relative inline-grid grid-cols-3 rounded-full border shadow-sm bg-gray-100 overflow-hidden">
                  {/* Sliding highlight */}
                  {(() => {
                    const index = displayMode === "hebrew" ? 0 : displayMode === "bilingual" ? 1 : 2;
                    return (
                      <motion.div
                        aria-hidden
                        className="absolute inset-y-0 w-1/3 bg-blue-500 rounded-full z-0"
                        animate={{ left: `${index * 33.3333}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    );
                  })()}

                  {/* Hebrew */}
                  <button
                    type="button"
                    onClick={() => setDisplayMode("hebrew")}
                    className={`relative z-10 px-4 py-1.5 text-md font-bold transition-all duration-300 ease-in-out focus:outline-none ${
                      displayMode === "hebrew"
                        ? "text-white transform scale-105"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Hebrew
                  </button>

                  {/* Both */}
                  <button
                    type="button"
                    onClick={() => setDisplayMode("bilingual")}
                    className={`relative z-10 px-4 py-1.5 text-md font-bold transition-all duration-300 ease-in-out focus:outline-none ${
                      displayMode === "bilingual"
                        ? "text-white transform scale-105"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Both
                  </button>

                  {/* English */}
                  <button
                    type="button"
                    onClick={() => setDisplayMode("english")}
                    className={`relative z-10 px-4 py-1.5 text-md font-bold transition-all duration-300 ease-in-out focus:outline-none ${
                      displayMode === "english"
                        ? "text-white transform scale-105"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    English
                  </button>
                </div>
                {/* Feature 2: Compare Versions */}
                <Button
                  className="text-md font-bold"
                  variant="outline"
                  size="sm"
                  onClick={() => setTopologyModalOpen(true)}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Compare Versions
                </Button>
              </div>
            </div>
          </div>

          {/* Main Text Area */}
          <div className="flex-1 overflow-auto">
            {/* Standard Text View */}
            <div className="max-w-5xl mx-auto p-6">
                {/* Top loading trigger */}
                <div ref={topTriggerRef} className="h-4" />

                {/* Render all loaded chapters */}
                <h1 className="text-5xl font-bold mb-4 text-slate-900 text-center mt-4">{book.charAt(0).toUpperCase() + book.slice(1)}</h1>
                {Object.entries(chaptersData)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([chapterNum, chapterData]) => (
                    <div key={chapterNum} className="mb-8">
                      <h1 className="text-3xl font-bold mb-4 text-slate-900 text-center mt-16 mb-8">Chapter {chapterNum}</h1>
                      <hr/>
                      {chapterData.loading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Loading verses...</span>
                        </div>
                      ) : chapterData.error ? (
                        <div className="text-center text-red-600">
                          <p>Error loading verses: {chapterData.error}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chapterData.verses.map((verse) => (
                      <motion.div
                        key={`${verse.chapterNumber}-${verse.verseNumber}`}
                        className="group cursor-pointer transition-all duration-200 relative"
                        onClick={() => {
                          setSelectedCardId(verse.verseNumber)
                          setSelectedSegment(verse.verseNumber)
                          setRightSidebarOpen(true)
                        }}
                        whileHover={{ scale: 1.01 }}
                      >
                        {/* Add Note Button - now outside the card, top-right */}
                        {/* {annotationMode && ( */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 -right-24 z-10 font-bold text-md"
                            onClick={e => {
                              e.stopPropagation();
                              handleAddAnnotation(verse.verseNumber);
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Note
                          </Button>
                        {/* )} */}
                        <div 
                          data-paragraph-id={verse.verseNumber}
                          className={`mb-4 shadow-md rounded-xl p-4 pt-0 border-2 transition-all duration-200 relative ${
                            selectedCardId === verse.verseNumber
                              ? 'bg-blue-100 border-blue-500'
                              : 'bg-white border-transparent hover:bg-gray-100 hover:border-blue-200'
                          }`}
                        >
                          {/* Verse Number - Upper Left Inside Card */}
                          <span className="absolute top-2 -left-8 text-sm font-bold rounded px-2 py-1 bg-blue-500 text-white z-10">
                            {verse.verseNumber}
                          </span>
                          <CardContent className="p-0 mt-6">
                            <div className="space-y-4">
                              {/* Hebrew Text */}
                              {(displayMode === "hebrew" || displayMode === "bilingual") && (
                                <div 
                                  className="text-right font-hebrew text-xl leading-relaxed text-slate-800" 
                                  dir="rtl"
                                  dangerouslySetInnerHTML={{ __html: verse.hebrewHtml }}
                                />
                              )}
                              {/* English Text */}
                              {(displayMode === "english" || displayMode === "bilingual") && (
                                <div 
                                  className="text-left text-lg leading-relaxed text-slate-700 font-times" 
                                  dir="ltr"
                                  dangerouslySetInnerHTML={{ __html: verse.englishHtml }}
                                />
                              )}
                            </div>
                            {/* AI Insights - Feature 5 */}
                            {aiLayering && (
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-4">
                                <p className="text-sm text-blue-800">
                                  <strong>AI Insight ({aiMode}):</strong>{' '}
                                  AI commentary would appear here for verse {verse.verseNumber}.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </div>
                      </motion.div>
                    ))}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Bottom loading trigger */}
                <div ref={bottomTriggerRef} className="h-4" />
              </div>
          </div>
        </div>

        {/* Right Sidebar - Dynamic Tools & Context */}
        <AnimatePresence>
          {rightSidebarOpen && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-96 bg-white border-l border-slate-200 flex flex-col"
            >
              <div className="border-b border-slate-200 pl-4 pr-4">
                <div className="h-[80px] flex items-center justify-between pt-4 pb-4">
                  <h1 className="font-semibold text-slate-900 text-2xl">Context Tools</h1>
                  <Button variant="ghost" size="sm" onClick={() => setRightSidebarOpen(false)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>


                {/* Tab Navigation */}
                <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="w-full p-0">
                  {/* Square tab list that stacks on small screens */}
                  <TabsList className="grid grid-cols-1 sm:grid-cols-6 gap-1 relative mb-4 rounded-md border bg-white/40 backdrop-blur-md shadow-sm overflow-hidden">
                    {/* Sliding indicator and animated gradient border */}
                    {(() => {
                      const order = ["connections","sugyaMap","psakLineage","layeredAI","annotations","wordMaps"] as const;
                      const index = Math.max(0, order.indexOf(activeRightTab as typeof order[number]));
                      const left = index * (100 / 6);
                      const top = index * (100 / 6);
                      return (
                        <>
                          {/* Horizontal indicator for >= sm */}
                          <motion.div
                            aria-hidden
                            className="hidden sm:block absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-md"
                            style={{ width: `calc(100% / 6)` }}
                            animate={{ left: `${left}%` }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          />
                          {/* Vertical indicator for < sm */}
                          <motion.div
                            aria-hidden
                            className="block sm:hidden absolute left-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-500 rounded-md"
                            style={{ height: `calc(100% / 6)` }}
                            animate={{ top: `${top}%` }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          />
                          {/* Gradient border + glass background overlay aligned to active cell */}
                          <motion.div
                            aria-hidden
                            className="pointer-events-none absolute hidden sm:block p-[1px] rounded-md bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"
                            style={{ width: `calc(100% / 6)`, height: "100%" }}
                            animate={{ left: `${left}%` }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            <div className="w-full h-full rounded-md bg-white/50 backdrop-blur-sm" />
                          </motion.div>
                          <motion.div
                            aria-hidden
                            className="pointer-events-none absolute sm:hidden p-[1px] rounded-md bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-500"
                            style={{ height: `calc(100% / 6)`, width: "100%" }}
                            animate={{ top: `${top}%` }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          >
                            <div className="w-full h-full rounded-md bg-white/50 backdrop-blur-sm" />
                          </motion.div>
                        </>
                      );
                    })()}

                    <TabsTrigger value="connections"
                      className={`relative z-10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out flex items-center justify-center cursor-pointer border ${
                        activeRightTab === "connections" ? "text-blue-900 font-semibold scale-105 bg-white/80 border-blue-500 ring-1 ring-blue-400/60 shadow-[0_6px_18px_rgba(37,99,235,0.25)] backdrop-blur" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 hover:-translate-y-0.5 border-transparent"
                      }`}
                    >
                      <span className="sr-only">Connections</span>
                      <span title="Connections">
                        <Network className="w-5 h-5" />
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="sugyaMap"
                      className={`relative z-10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out flex items-center justify-center cursor-pointer border ${
                        activeRightTab === "sugyaMap" ? "text-blue-900 font-semibold scale-105 bg-white/80 border-blue-500 ring-1 ring-blue-400/60 shadow-[0_6px_18px_rgba(37,99,235,0.25)] backdrop-blur" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 hover:-translate-y-0.5 border-transparent"
                      }`}
                    >
                      <span className="sr-only">Sugya Map</span>
                      <span title="Sugya Map">
                        <Map className="w-5 h-5" />
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="psakLineage"
                      className={`relative z-10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out flex items-center justify-center cursor-pointer border ${
                        activeRightTab === "psakLineage" ? "text-blue-900 font-semibold scale-105 bg-white/80 border-blue-500 ring-1 ring-blue-400/60 shadow-[0_6px_18px_rgba(37,99,235,0.25)] backdrop-blur" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 hover:-translate-y-0.5 border-transparent"
                      }`}
                    >
                      <span className="sr-only">Psak Lineage</span>
                      <span title="Psak Lineage">
                        <GitBranch className="w-5 h-5" />
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="layeredAI"
                      className={`relative z-10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out flex items-center justify-center cursor-pointer border ${
                        activeRightTab === "layeredAI" ? "text-blue-900 font-semibold scale-105 bg-white/80 border-blue-500 ring-1 ring-blue-400/60 shadow-[0_6px_18px_rgba(37,99,235,0.25)] backdrop-blur" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 hover:-translate-y-0.5 border-transparent"
                      }`}
                    >
                      <span className="sr-only">Layered AI View</span>
                      <span title="Layered AI View">
                        <Brain className="w-5 h-5" />
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="annotations"
                      className={`relative z-10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out flex items-center justify-center cursor-pointer border ${
                        activeRightTab === "annotations" ? "text-blue-900 font-semibold scale-105 bg-white/80 border-blue-500 ring-1 ring-blue-400/60 shadow-[0_6px_18px_rgba(37,99,235,0.25)] backdrop-blur" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 hover:-translate-y-0.5 border-transparent"
                      }`}
                    >
                      <span className="sr-only">Annotations</span>
                      <span title="Annotations">
                        <MessageSquare className="w-5 h-5" />
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="wordMaps"
                      className={`relative z-10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out flex items-center justify-center cursor-pointer border ${
                        activeRightTab === "wordMaps" ? "text-blue-900 font-semibold scale-105 bg-white/80 border-blue-500 ring-1 ring-blue-400/60 shadow-[0_6px_18px_rgba(37,99,235,0.25)] backdrop-blur" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 hover:-translate-y-0.5 border-transparent"
                      }`}
                    >
                      <span className="sr-only">Word Maps</span>
                      <span title="Word Maps">
                        <Hash className="w-4 h-4" />
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Content */}
                  <TabsContent value="connections" className="mt-0">
                    <motion.div key="connections-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="p-4">
                      {selectedCardId !== null && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-md text-blue-800 font-medium">
                            Selected: {book.charAt(0).toUpperCase() + book.slice(1)} {currentChapter}:{selectedCardId}
                          </p>
                          <p className="text-sm text-blue-600 mt-1">
                            Click "Connections" to view relationships
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() => setConnectionsModalOpen(true)}
                        disabled={selectedCardId === null}
                        className={`w-full ${
                          selectedCardId === null
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Network className="w-4 h-4 mr-2" />
                        Connections
                      </Button>
                      {selectedCardId === null && (
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Select a card to enable connections
                        </p>
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="sugyaMap" className="mt-0">
                    <motion.div key="sugyaMap-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="p-4">
                      {/* Auto-generated flow summary */}
                      <p className="text-sm text-gray-600 mb-4">
                        {/* TODO: Replace with actual summary generation logic */}
                        This sugya explores a central question, presents answers, challenges (kashas), and resolutions (terutzim), ending with teiku if unresolved.
                      </p>
                      {/* Dialectic Logic Tree */}
                      <SugyaLogicTree onNodeClick={handleSugyaNodeClick} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="psakLineage" className="mt-0">
                    <motion.div key="psakLineage-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="p-4">
                      <PsakLineageTimeline onNodeClick={handlePsakNodeClick} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="layeredAI" className="mt-0">
                    <motion.div key="layeredAI-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="p-4 space-y-4">
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Base Commentary Layer</label>
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={baseCommentary}
                            onChange={e => setBaseCommentary(e.target.value)}
                          >
                            <option value="Rashi">Rashi</option>
                            <option value="Ramban">Ramban</option>
                            <option value="Maharal">Maharal</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Interpretive Mode</label>
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={interpretiveMode}
                            onChange={e => setInterpretiveMode(e.target.value)}
                          >
                            <option value="pshat">Pshat</option>
                            <option value="halakhah">Halakhah</option>
                            <option value="mystical">Mystical</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="annotations" className="mt-0">
                    <motion.div key="annotations-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="p-4">
                      <div className="flex items-center mb-4">
                        <Switch checked={aiLayeredEnabled} onCheckedChange={setAiLayeredEnabled} id="ai-layered-toggle" />
                        <label htmlFor="ai-layered-toggle" className="ml-2 text-sm font-medium">Layered AI View</label>
                      </div>
                      <p className="text-sm text-gray-600">View and manage annotations for this text.</p>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="wordMaps" className="mt-0">
                    <motion.div key="wordMaps-content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="p-4">
                      <div className="mb-4">
                        <label htmlFor="word-search" className="block text-xs font-medium text-slate-700 mb-1">Search for a word</label>
                        <Input
                          id="word-search"
                          placeholder="e.g. chesed"
                          value={lexicalSearchTerm}
                          onChange={e => setLexicalSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <LexicalHypergraph
                        searchTerm={lexicalSearchTerm}
                        onNodeClick={handleLexicalNodeClick}
                      />
                    </motion.div>
                  </TabsContent>
                </Tabs>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feature 6: Author Map Modal */}
      <AnimatePresence>
        {authorMapView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setAuthorMapView(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <AuthorMap onClose={() => setAuthorMapView(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature 8: Word Maps (Lexical Hypergraph) */}
      <AnimatePresence>
        {lexicalGraphView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setLexicalGraphView(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-hidden w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <LexicalHypergraph searchTerm={lexicalSearchTerm} onNodeClick={handleLexicalNodeClick} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature 10: Calendar Drawer */}
      <AnimatePresence>
        {calendarDrawerOpen && (
          <CalendarDrawer
            open={calendarDrawerOpen}
            onClose={() => setCalendarDrawerOpen(false)}
            todaysLearning={{
              parasha: "-",
              dafYomi: "-",
              mishnahYomi: "-",
              date: "-",
              hebrewDate: "-"
            }}
          />
        )}
      </AnimatePresence>

      {/* Connections Modal */}
      <AnimatePresence>
        {connectionsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => {
              setConnectionsModalOpen(false)
              setSelectedCardId(null) // Clear selection when modal closes
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg w-[90vw] h-[90vh] overflow-hidden flex"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Graph Area */}
              <div className="flex-1 relative">
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Intertextual Connections</h2>
                  <div className="flex items-center space-x-2">
                    {/* Zoom Toolbar */}
                    <div className="hidden sm:flex items-center space-x-1 mr-2">
                      <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); if (svgSelectionRef.current && zoomBehaviorRef.current) svgSelectionRef.current.transition().duration(0).call(zoomBehaviorRef.current.scaleBy, 1.2) }}>
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); if (svgSelectionRef.current && zoomBehaviorRef.current) svgSelectionRef.current.transition().duration(0).call(zoomBehaviorRef.current.scaleBy, 1/1.2) }}>
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); if (svgSelectionRef.current && zoomBehaviorRef.current && graphRef.current && filteredGraphData?.nodes?.length) { const svgSel = svgSelectionRef.current; const nodes = filteredGraphData.nodes as any[]; const width = graphRef.current.clientWidth; const height = graphRef.current.clientHeight; let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity; for (const n of nodes) { const r = (n.type === "current" ? 25 : 15); const x0 = n.x - r; const x1 = n.x + r; const y0 = n.y - r; const y1 = n.y + r; if (x0 < minX) minX = x0; if (y0 < minY) minY = y0; if (x1 > maxX) maxX = x1; if (y1 > maxY) maxY = y1; } const extra = 24; minX -= extra; minY -= extra; maxX += extra; maxY += extra; const contentWidth = Math.max(1, maxX - minX); const contentHeight = Math.max(1, maxY - minY); const padding = 60; const scale = Math.min((width - padding) / contentWidth, (height - padding) / contentHeight) * 0.95; const cx = minX + contentWidth / 2; const cy = minY + contentHeight / 2; const translateX = width / 2 - scale * cx; const translateY = height / 2 - scale * cy; const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale); svgSel.transition().duration(0).call(zoomBehaviorRef.current.transform, transform); } }}>
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setConnectionsModalOpen(false)
                        setSelectedCardId(null) // Clear selection when modal closes
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Graph Container */}
                <div 
                  ref={graphRef}
                  className="w-full h-full"
                  style={{ marginTop: '60px' }}
                />
                {connectionsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center text-slate-600 bg-white/80 rounded-md px-4 py-2 shadow">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm">Loading connections…</span>
                    </div>
                  </div>
                )}
                {connectionsError && (
                  <div className="absolute top-16 left-4 right-4">
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
                      {connectionsError}
                    </div>
                  </div>
                )}
                
                {/* Connection Type Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Connection Types</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-xs text-slate-700">Halakhic</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                      <span className="text-xs text-slate-700">Aggadic</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                      <span className="text-xs text-slate-700">Lexical</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-2 rounded-full bg-emerald-600"></div>
                      <span className="text-xs text-slate-700">Responsa</span>
                    </div>
                  </div>
                </div>

                {/* Highlight Legend */}
                {showDifferences && (
                  <div className="flex items-center space-x-4 text-xs text-slate-600">
                    <span>Legend:</span>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-200 rounded"></span>
                      <span>Insertions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-red-200 rounded"></span>
                      <span>Deletions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-yellow-200 rounded"></span>
                      <span>Substitutions</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Drawer */}
              <AnimatePresence>
                {filterDrawerOpen && (
                  <motion.div
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: 300 }}
                    className="w-80 bg-slate-50 border-l border-slate-200 p-4 overflow-y-auto"
                  >
                    <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
                    
                    {/* Genre Filter */}
                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 mb-3">Genre</h4>
                      <div className="space-y-2">
                        {["Halakhic", "Aggadic", "Lexical", "Responsa", "Commentary", "Mishnah"].map((genre) => (
                          <div key={genre} className="flex items-center space-x-2">
                            <Checkbox
                              id={`genre-${genre}`}
                              checked={activeFilters.genre.includes(genre)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setActiveFilters(prev => ({
                                    ...prev,
                                    genre: [...prev.genre, genre]
                                  }))
                                } else {
                                  setActiveFilters(prev => ({
                                    ...prev,
                                    genre: prev.genre.filter(g => g !== genre)
                                  }))
                                }
                              }}
                            />
                            <label htmlFor={`genre-${genre}`} className="text-sm text-slate-700">
                              {genre}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Author Filter */}
                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 mb-3">Author</h4>
                      <div className="space-y-2">
                        {["Rashi", "Rambam", "Tosafot", "R. Yosef Karo", "R. Shimon bar Yochai", "Tannaim"].map((author) => (
                          <div key={author} className="flex items-center space-x-2">
                            <Checkbox
                              id={`author-${author}`}
                              checked={activeFilters.author.includes(author)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setActiveFilters(prev => ({
                                    ...prev,
                                    author: [...prev.author, author]
                                  }))
                                } else {
                                  setActiveFilters(prev => ({
                                    ...prev,
                                    author: prev.author.filter(a => a !== author)
                                  }))
                                }
                              }}
                            />
                            <label htmlFor={`author-${author}`} className="text-sm text-slate-700">
                              {author}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Time Period Filter */}
                    <div className="mb-6">
                      <h4 className="font-medium text-slate-900 mb-3">Time Period</h4>
                      <div className="space-y-2">
                        {["Tannaitic", "Medieval", "Early Modern"].map((period) => (
                          <div key={period} className="flex items-center space-x-2">
                            <Checkbox
                              id={`period-${period}`}
                              checked={activeFilters.timePeriod.includes(period)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setActiveFilters(prev => ({
                                    ...prev,
                                    timePeriod: [...prev.timePeriod, period]
                                  }))
                                } else {
                                  setActiveFilters(prev => ({
                                    ...prev,
                                    timePeriod: prev.timePeriod.filter(p => p !== period)
                                  }))
                                }
                              }}
                            />
                            <label htmlFor={`period-${period}`} className="text-sm text-slate-700">
                              {period}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Node Preview Pane */}
              <AnimatePresence>
                {selectedNodePreview && (
                  <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    className="w-80 bg-white border-r border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Preview</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNodePreview(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-slate-900">{selectedNodePreview.title}</h4>
                        <Badge variant="secondary" className="mt-1">
                          {selectedNodePreview.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600">{selectedNodePreview.snippet}</p>
                      
                      {selectedNodePreview.author && (
                        <div>
                          <span className="text-xs text-slate-500">Author: </span>
                          <span className="text-sm text-slate-700">{selectedNodePreview.author}</span>
                        </div>
                      )}
                      
                      {selectedNodePreview.timePeriod && (
                        <div>
                          <span className="text-xs text-slate-500">Period: </span>
                          <span className="text-sm text-slate-700">{selectedNodePreview.timePeriod}</span>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          // TODO: Load selected text into main view
                          setSelectedNodePreview(null)
                          setConnectionsModalOpen(false)
                          setSelectedCardId(null) // Clear selection when modal closes
                        }}
                      >
                        Open in Main View
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textual Topology Engine Modal */}
      <AnimatePresence>
        {topologyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setTopologyModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg w-[95vw] h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Textual Topology Engine</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTopologyModalOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Toolbar Controls */}
                <div className="flex items-center space-x-4">
                  {/* Version Selection */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-700">Primary:</label>
                    <Select value={primaryVersion} onValueChange={setPrimaryVersion}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(manuscriptVersions).map((version) => (
                          <SelectItem key={version} value={version}>
                            {manuscriptVersions[version as keyof typeof manuscriptVersions].name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-700">Alternate:</label>
                    <Select value={alternateVersion} onValueChange={setAlternateVersion}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(manuscriptVersions).map((version) => (
                          <SelectItem key={version} value={version}>
                            {manuscriptVersions[version as keyof typeof manuscriptVersions].name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Highlight Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-slate-700">Mode:</label>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <Button
                        variant={highlightMode === "linguistic" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setHighlightMode("linguistic")}
                        className="text-xs"
                      >
                        Linguistic
                      </Button>
                      <Button
                        variant={highlightMode === "semantic" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setHighlightMode("semantic")}
                        className="text-xs"
                      >
                        Semantic
                      </Button>
                    </div>
                  </div>

                  {/* Toggle Controls */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-differences"
                        checked={showDifferences}
                        onCheckedChange={setShowDifferences}
                      />
                      <label htmlFor="show-differences" className="text-sm text-slate-700">
                        Show Differences
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scroll-locked"
                        checked={scrollLocked}
                        onCheckedChange={setScrollLocked}
                      />
                      <label htmlFor="scroll-locked" className="text-sm text-slate-700">
                        Lock Scroll
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Split Screen Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Primary Version */}
                <div ref={leftPanelRef} className="flex-1 border-r border-slate-200 overflow-y-auto p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {manuscriptVersions[primaryVersion as keyof typeof manuscriptVersions]?.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {manuscriptVersions[primaryVersion as keyof typeof manuscriptVersions]?.description} ({manuscriptVersions[primaryVersion as keyof typeof manuscriptVersions]?.year})
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {manuscriptVersions[primaryVersion as keyof typeof manuscriptVersions]?.segments.map((segment) => (
                      <div key={segment.id} className="bg-slate-50 p-4 rounded-lg">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-slate-700">Verse {segment.id}</span>
                        </div>
                        <div className="text-right font-hebrew text-lg leading-relaxed text-slate-800 mb-3" dir="rtl">
                          {segment.text}
                        </div>
                        <div className="text-sm text-slate-600 mb-3">
                          {segment.translation}
                        </div>
                        {segment.footnotes.length > 0 && (
                          <div className="space-y-1">
                            {segment.footnotes.map((footnote) => (
                              <div key={footnote.id} className="flex items-start space-x-2">
                                <span 
                                  className="text-xs text-blue-600 font-medium cursor-pointer hover:underline"
                                  onMouseEnter={(e) => setFootnoteTooltip({
                                    id: footnote.id,
                                    text: footnote.text,
                                    x: e.clientX,
                                    y: e.clientY
                                  })}
                                  onMouseLeave={() => setFootnoteTooltip(null)}
                                >
                                  [{footnote.id}]
                                </span>
                                <span className="text-xs text-slate-600">{footnote.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel - Alternate Version */}
                <div ref={rightPanelRef} className="flex-1 overflow-y-auto p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {manuscriptVersions[alternateVersion as keyof typeof manuscriptVersions]?.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {manuscriptVersions[alternateVersion as keyof typeof manuscriptVersions]?.description} ({manuscriptVersions[alternateVersion as keyof typeof manuscriptVersions]?.year})
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {manuscriptVersions[alternateVersion as keyof typeof manuscriptVersions]?.segments.map((segment) => {
                      const primarySegment = manuscriptVersions[primaryVersion as keyof typeof manuscriptVersions]?.segments.find(s => s.id === segment.id);
                      const differences = primarySegment ? computeTextDifferences(primarySegment.text, segment.text) : [];
                      
                      return (
                        <div key={segment.id} className="bg-slate-50 p-4 rounded-lg">
                          <div className="mb-2">
                            <span className="text-sm font-medium text-slate-700">Verse {segment.id}</span>
                          </div>
                          <div className="text-right font-hebrew text-lg leading-relaxed text-slate-800 mb-3" dir="rtl">
                            {showDifferences && differences.length > 0 ? (
                              <span>
                                {differences.map((diff, index) => {
                                  if (diff.type === 'insertion') {
                                    return (
                                      <span key={index} className="bg-green-200 text-green-800 px-1 rounded">
                                        {diff.text}
                                      </span>
                                    );
                                  } else if (diff.type === 'deletion') {
                                    return (
                                      <span key={index} className="line-through bg-red-200 text-red-800 px-1 rounded">
                                        {diff.text}
                                      </span>
                                    );
                                  } else if (diff.type === 'substitution') {
                                    return (
                                      <span key={index} className="bg-yellow-200 text-yellow-800 px-1 rounded">
                                        {diff.text}
                                      </span>
                                      );
                                  }
                                  return null;
                                })}
                                {segment.text}
                              </span>
                            ) : (
                              segment.text
                            )}
                          </div>
                          <div className="text-sm text-slate-600 mb-3">
                            {segment.translation}
                          </div>
                          {segment.footnotes.length > 0 && (
                            <div className="space-y-1">
                              {segment.footnotes.map((footnote) => (
                                <div key={footnote.id} className="flex items-start space-x-2">
                                  <span 
                                    className="text-xs text-blue-600 font-medium cursor-pointer hover:underline"
                                    onMouseEnter={(e) => setFootnoteTooltip({
                                      id: footnote.id,
                                      text: footnote.text,
                                      x: e.clientX,
                                      y: e.clientY
                                    })}
                                    onMouseLeave={() => setFootnoteTooltip(null)}
                                  >
                                    [{footnote.id}]
                                  </span>
                                  <span className="text-xs text-slate-600">{footnote.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footnote Tooltip */}
              {footnoteTooltip && (
                <div 
                  className="fixed z-[60] bg-slate-900 text-white p-3 rounded-lg shadow-lg max-w-xs"
                  style={{
                    left: footnoteTooltip.x + 10,
                    top: footnoteTooltip.y - 10,
                    pointerEvents: 'none'
                  }}
                >
                  <div className="text-xs font-medium mb-1">Footnote {footnoteTooltip.id}</div>
                  <div className="text-xs text-slate-200">{footnoteTooltip.text}</div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
