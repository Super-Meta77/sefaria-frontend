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
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command"
import AuthorMap from "@/components/AuthorMap"
import LexicalHypergraph from "@/components/LexicalHypergraph"
import CalendarDrawer from "@/components/CalendarDrawer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as d3 from "d3"
import SugyaLogicTree from "./SugyaLogicTree"
import PsakLineageTimeline from "./PsakLineageTimeline"
import { fetchConnectionsForVerse } from "@/lib/neo4j"

// Graph interfaces
interface GraphNode extends d3.SimulationNodeDatum {
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

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
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
  chapterNumber: number | string;
}

interface ChapterPageProps {
  params: {
    book: string
    chapter: string
    verse: string
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
  const { book, chapter, verse } = params
  const router = useRouter()

  // Helper function to separate Hebrew and English from bilingual commentary text
  const separateHebrewAndEnglish = (text: string): [string, string] => {
    // Look for pattern: Hebrew text, then comma or dash, then English text
    // This matches formats like: "ויברך אלוקים את יום השביעי , when the seventh day arrived..."
    const match = text.match(/^([\u0590-\u05FF\uFB1D-\uFB4F\s]+)[\s,]*([\s\-–—]*)(.+)$/);
    
    if (match) {
      const [, hebrewPart, separator, englishPart] = match;
      const hebrew = hebrewPart.trim();
      const english = englishPart.trim();
      
      // Verify the first part contains Hebrew characters
      if (/[\u0590-\u05FF\uFB1D-\uFB4F]/.test(hebrew)) {
        return [hebrew, english];
      }
    }
    
    // Fallback: try basic comma/hyphen separation for any comma-separated text
    const basicMatch = text.match(/^([^,\-–—]+?)[\s]*[,,\-–—]+[\s]*(.+)$/);
    if (basicMatch) {
      const [, firstPart, secondPart] = basicMatch;
      const first = firstPart.trim();
      const second = secondPart.trim();
      
      // Check if first part contains mostly English (Latin alphabet)
      const hasHebrew = /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(first);
      const hasEnglish = /[a-zA-Z]/.test(first);
      
      if (hasHebrew && !hasEnglish) {
        return [first, second];
      } else if (hasHebrew && hasEnglish) {
        // Mixed content - use simpler approach
        return [first, second];
      }
    }
    
    // Last resort: return the whole text as Hebrew
    return [text.trim(), ""];
  };

  // State for chapter data
  const [chaptersData, setChaptersData] = useState<{ [key: number | string]: ChapterData }>({});
  const [displayMode, setDisplayMode] = useState<"hebrew" | "english" | "bilingual">("bilingual");
  // Refs for intersection observer
  const topTriggerRef = useRef<HTMLDivElement>(null);
  const bottomTriggerRef = useRef<HTMLDivElement>(null);
  
  // Utility function to parse chapter and verse from URL
  const parseChapterAndVerseFromUrl = () => {
    if (typeof window === 'undefined') return { chapter: null, verse: null };
    
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    
    // Check for short format URLs like /Book.Chapter.Verse (supports mixed chapter formats)
    const shortFormatMatch = pathname.match(/\/([^\/]+)\.([^\/.]+)\.(\d+)\/?$/);
    if (shortFormatMatch) {
      return {
        chapter: shortFormatMatch[2], // Keep as string to preserve mixed formats
        verse: parseInt(shortFormatMatch[3])
      };
    }
    
    // Check for short format URLs like /Book.Chapter (supports mixed chapter formats)
    const shortChapterMatch = pathname.match(/\/([^\/]+)\.([^\/.]+)\/?$/);
    if (shortChapterMatch) {
      const verseFromHash = hash ? parseInt(hash.replace('#', '')) : null;
      return {
        chapter: shortChapterMatch[2], // Keep as string to preserve mixed formats
        verse: verseFromHash
      };
    }
    
    // For standard format URLs like /texts/category/book/chapter
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length >= 4 && pathParts[0] === 'texts') {
      const chapterParam = pathParts[3];
      const verseFromHash = hash ? parseInt(hash.replace('#', '')) : null;
      return {
        chapter: chapterParam, // Keep as string to preserve mixed formats
        verse: verseFromHash
      };
    }
    
    return { chapter: null, verse: null };
  };

  // Parse chapter and verse from URL - support formats like "chapter" or "chapter.verse"
  const parseChapterAndVerse = (chapterParam: string, verseParam: string) => {
    const parts = chapterParam.split('.');
    // For mixed formats like "1:1", "1:2", "1a", "2b", keep as string
    // For pure numbers, convert to number for backward compatibility
    const chapterValue = /^\d+$/.test(parts[0]) ? parseInt(parts[0]) : parts[0];
    const verseNum = verseParam ? parseInt(verseParam) : null;
    return { chapter: chapterValue, verse: verseNum };
  };

  // Helper function to get numeric chapter for arithmetic operations
  const getNumericChapter = (chapter: number | string): number | null => {
    if (typeof chapter === 'number') return chapter;
    const match = chapter.match(/^(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // State to hold URL-parsed values
  const [urlParsedData, setUrlParsedData] = useState<{ chapter: number | string | null; verse: number | null }>({ chapter: null, verse: null });
  // Track if we've completed the initial scroll to target verse
  const [hasScrolledToTarget, setHasScrolledToTarget] = useState(false);

  // Parse from URL on client side when component mounts
  useEffect(() => {
    const urlData = parseChapterAndVerseFromUrl();
    setUrlParsedData(urlData);
  }, []);


  // Use URL-parsed data if available, otherwise fall back to route params
  const { chapter: routeChapter, verse: routeVerse } = parseChapterAndVerse(chapter, verse);
  const currentChapter = urlParsedData.chapter || routeChapter;
  const targetVerseFromUrl = urlParsedData.verse || routeVerse;
  // Active verse and chapter derived from viewport detection
  const [activeVerse, setActiveVerse] = useState<{ chapter: number | string; verse: number } | null>(null)
  const [activeChapter, setActiveChapter] = useState<number | string>(currentChapter)

  // Update activeChapter when URL-parsed data changes
  useEffect(() => {
    if (urlParsedData.chapter) {
      setActiveChapter(urlParsedData.chapter);
    }
  }, [urlParsedData.chapter]);

  // Function to fetch a single chapter
  const fetchChapter = async (chapterNum: number | string) => {
    // Skip invalid chapter numbers
    if (typeof chapterNum === 'number' && chapterNum <= 0) {
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
      let combinedVerses: VerseData[] = [];
      
      // Check if this is commentary data (has text array) or regular text (has versions array)
      if (data.text && Array.isArray(data.text)) {
        // Commentary data: text array contains bilingual entries
        combinedVerses = data.text
          .map((textEntry: string | string[], index: number) => {
            // Skip empty entries
            if (!textEntry || (Array.isArray(textEntry) && textEntry.length === 0)) {
              return null;
            }
            
            // Extract verse number from index (0-based) + 1
            const verseNumber = index + 1;
            
            if (Array.isArray(textEntry) && textEntry.length > 0) {
              // Multiple strings in the entry
              const allText = textEntry.join(' ');
              const [hebrew, english] = separateHebrewAndEnglish(allText);
              return {
                hebrew: hebrew || "",
                english: english || "",
                hebrewHtml: hebrew || "",
                englishHtml: english || "",
                verseNumber,
                chapterNumber: chapterNum
              };
            } else if (typeof textEntry === 'string' && textEntry.trim()) {
              // Single string entry (bilingual)
              const [hebrew, english] = separateHebrewAndEnglish(textEntry);
              return {
                hebrew: hebrew || "",
                english: english || "",
                hebrewHtml: hebrew || "",
                englishHtml: english || "",
                verseNumber,
                chapterNumber: chapterNum
              };
            }
            return null;
          })
          .filter((verse: VerseData | null) => verse !== null) as VerseData[];
      } else {
        // Regular text data: versions array with separate Hebrew/English
        const hebrewVerses = data.versions?.find((v: any) => v.language === "he")?.text || [];
        const englishVerses = data.versions?.find((v: any) => v.language === "en")?.text || [];

        console.log("7fetchChapter---->");
        
        combinedVerses = hebrewVerses.map((hebrewVerse: string, index: number) => ({
          hebrew: hebrewVerse,
          english: englishVerses[index] || "",
          hebrewHtml: hebrewVerse,
          englishHtml: englishVerses[index] || "",
          verseNumber: index + 1,
          chapterNumber: chapterNum
        }));
      }

      // If we're prepending content above the current view, preserve scroll position anchored to an element
      const scroller = scrollerRef.current
      const shouldAdjustScroll = !!scroller && chapterNum < activeChapter
      let anchorEl: HTMLElement | null = null
      let anchorOffset = 0
      if (shouldAdjustScroll && scroller) {
        if (activeVerse && Number.isFinite(activeVerse.chapter) && Number.isFinite(activeVerse.verse)) {
          anchorEl = verseRefs.current[`${activeVerse.chapter}-${activeVerse.verse}`] || null
        }
        if (!anchorEl) {
          const rect = scroller.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          let el = document.elementFromPoint(x, y) as HTMLElement | null
          while (el && el !== scroller && !el.dataset?.verse && !el.dataset?.paragraphId) {
            el = el.parentElement
          }
          anchorEl = el
        }
        if (!anchorEl) {
          // Fallbacks to ensure we have a stable anchor when prepending
          anchorEl = verseRefs.current[`${activeChapter}-1`] || scroller.firstElementChild as HTMLElement | null
        }
        if (anchorEl) {
          anchorOffset = anchorEl.offsetTop - scroller.scrollTop
        }
      }

      setChaptersData(prev => ({
        ...prev,
        [chapterNum]: {
          verses: combinedVerses,
          loading: false,
          error: null,
          chapterNumber: chapterNum
        }
      }));

      if (shouldAdjustScroll && scroller && anchorEl) {
        requestAnimationFrame(() => {
          const sc = scrollerRef.current
          if (!sc || !anchorEl) return
          isProgrammaticScrollRef.current = true
          sc.scrollTop = anchorEl.offsetTop - anchorOffset
          requestAnimationFrame(() => {
            isProgrammaticScrollRef.current = false
          })
        })
      }
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

  // Effect to fetch initial chapters sequentially (current, then adjacents)
  useEffect(() => {
    let cancelled = false
    let preloading = true
    const run = async () => {
      await fetchChapter(currentChapter)
      
      // After chapter loads, scroll to target verse (from URL or hash) or chapter start
      if (!cancelled) {
        const targetVerse = initialTargetVerseRef.current
        
        if (targetVerse != null) {
          // If there is a target verse, first jump to top of chapter (instant), then smooth scroll to verse
          requestAnimationFrame(() => {
            const sc = scrollerRef.current
            const topEl = verseRefs.current[`${currentChapter}-1`]
            if (sc && topEl) {
              isProgrammaticScrollRef.current = true
              sc.scrollTo({ top: topEl.offsetTop, behavior: "auto" })
              
              // Then smooth scroll to the target verse
              requestAnimationFrame(() => {
                const verseEl = verseRefs.current[`${currentChapter}-${targetVerse}`]
                if (verseEl) {
                  verseEl.scrollIntoView({ behavior: "smooth", block: "center" })
                  setTimeout(() => {
                    isProgrammaticScrollRef.current = false
                  }, 900)
                } else {
                  isProgrammaticScrollRef.current = false
                }
              })
            }
          })
        } else {
          // No target verse - just scroll to beginning of chapter
          requestAnimationFrame(() => {
            const sc = scrollerRef.current
            const topEl = verseRefs.current[`${currentChapter}-1`]
            if (sc && topEl) {
              isProgrammaticScrollRef.current = true
              sc.scrollTo({ top: topEl.offsetTop, behavior: "smooth" })
              setTimeout(() => {
                isProgrammaticScrollRef.current = false
              }, 500)
            }
          })
        }
      }
      
      if (cancelled) return
      // Do not preload previous chapter on initial mount to avoid prepending content shifting the viewport
      if (cancelled) return
      const numericChapter = getNumericChapter(currentChapter);
      if (numericChapter) {
        await fetchChapter(numericChapter + 1)
      }
      preloading = false
    }
    void run()
    return () => { cancelled = true }
  }, [book, currentChapter])

  // Fallback scroll effect - ensures scroll happens even if main effect doesn't work
  useEffect(() => {
    if (hasDoneInitialScrollRef.current) return
    const targetVerse = initialTargetVerseRef.current
    const chapterData = chaptersData[currentChapter]
    if (!chapterData || !chapterData.verses || chapterData.verses.length === 0) return

    let attempts = 0
    const maxAttempts = 10

    const tryScroll = () => {
      attempts++
      const sc = scrollerRef.current
      const topEl = verseRefs.current[`${currentChapter}-1`]
      
      if (!sc || !topEl) {
        if (attempts < maxAttempts) {
          requestAnimationFrame(tryScroll)
        }
        return
      }

      if (targetVerse != null) {
        // Try to scroll to specific verse
        const verseEl = verseRefs.current[`${currentChapter}-${targetVerse}`]
        if (!verseEl) {
          if (attempts < maxAttempts) {
            requestAnimationFrame(tryScroll)
          }
          return
        }
        
        isProgrammaticScrollRef.current = true
        // Step 1: immediately jump to top of chapter
        sc.scrollTo({ top: topEl.offsetTop, behavior: "auto" })
        // Step 2: smooth scroll to target verse on next frame
        requestAnimationFrame(() => {
          verseEl.scrollIntoView({ behavior: "smooth", block: "center" })
          setTimeout(() => {
            isProgrammaticScrollRef.current = false
            hasDoneInitialScrollRef.current = true
          }, 900)
        })
      } else {
        // No target verse - just scroll to beginning of chapter
        isProgrammaticScrollRef.current = true
        sc.scrollTo({ top: topEl.offsetTop, behavior: "smooth" })
        setTimeout(() => {
          isProgrammaticScrollRef.current = false
          hasDoneInitialScrollRef.current = true
        }, 500)
      }
    }

    requestAnimationFrame(tryScroll)
  }, [chaptersData, currentChapter])

  // Detect user scrolling to enable safe prepend of previous chapter later
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const onScroll = () => {
      if (isProgrammaticScrollRef.current) return
      if (scroller.scrollTop > 0) {
        hasUserScrolledRef.current = true
      }
    }
    scroller.addEventListener('scroll', onScroll, { passive: true } as any)
    return () => {
      scroller.removeEventListener('scroll', onScroll as any)
    }
  }, [])

  // When the currently displayed chapter changes, fetch its adjacents and prune state
  useEffect(() => {
    const run = async () => {
      // Skip preloading on the very first run (initial mount) to avoid shifting content
      if (!hasRunActiveChapterEffectOnceRef.current) {
        hasRunActiveChapterEffectOnceRef.current = true
        return
      }
      if (!Number.isFinite(activeChapter)) return
      // Ensure active chapter is present (if navigated across boundary quickly)
      if (!chaptersData[activeChapter]?.verses?.length && !chaptersData[activeChapter]?.loading) {
        await fetchChapter(activeChapter)
      }
      // Fetch previous and next in background as needed
      // Only fetch previous once the user has scrolled to avoid initial prepend jumps
      const numericActiveChapter = getNumericChapter(activeChapter);
      if (numericActiveChapter && numericActiveChapter > 1 && hasUserScrolledRef.current) {
        await fetchChapter(numericActiveChapter - 1)
      }
      if (numericActiveChapter) {
        await fetchChapter(numericActiveChapter + 1)
      }

      // Delay pruning slightly to avoid visible drift after correction
      setTimeout(() => {
        if (numericActiveChapter) {
          const allowed = new Set([numericActiveChapter - 1, numericActiveChapter, numericActiveChapter + 1].filter(n => n > 0))
          setChaptersData(prev => {
            const next: typeof prev = {}
            for (const k of Object.keys(prev)) {
              const num = parseInt(k)
              if (allowed.has(num)) next[num] = prev[num]
            }
            return next
          })
        }
      }, 120)
    }
    void run()
  }, [activeChapter])

  // Removed scroll-triggered top/bottom fetch observers per new requirements

  // Mock data for the study interface - in real app, this would be fetched based on params
  const currentText = {
    title: `${book.charAt(0).toUpperCase() + book.slice(1)} ${activeChapter}`,
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
	const [originalGraphData, setOriginalGraphData] = useState<GraphData>(emptyGraphData)
  const [connectionsLoading, setConnectionsLoading] = useState<boolean>(false)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState({
    genre: [] as string[],
    author: [] as string[],
    timePeriod: [] as string[]
  })
	const currentYear = new Date().getFullYear()
	const [yearRange, setYearRange] = useState<[number, number]>([0, currentYear])
	const [defaultYearRange, setDefaultYearRange] = useState<[number, number]>([0, currentYear])

	const authorOptions = (() => {
		const set = new Set<string>()
		for (const n of originalGraphData.nodes || []) {
			if (n.metadata.author) set.add(n.metadata.author)
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b))
	})()

	const genreOptions = (() => {
		const set = new Set<string>()
		for (const n of originalGraphData.nodes || []) {
			if (n.metadata.genre) set.add(n.metadata.genre)
		}
		return Array.from(set).sort((a, b) => a.localeCompare(b))
	})()
  // Time Period filter chips state
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<string[]>(["Biblical","Tannaitic","Amoraic"]) // default selected
  const toggleTimePeriod = (value: string) => {
    setSelectedTimePeriods((prev: string[]) => {
      const next = prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      setActiveFilters((f: { genre: string[]; author: string[]; timePeriod: string[] }) => ({ ...f, timePeriod: next }))
      return next
    })
  }

  // Reset all filter states to default values
  const resetFilterStates = () => {
    setActiveFilters({
      genre: [],
      author: [],
      timePeriod: []
    })
    setYearRange(defaultYearRange)
    setSelectedTimePeriods(["Biblical","Tannaitic","Amoraic"])
    setSelectedNodePreview(null)
    setFilterDrawerOpen(true) // Keep filter drawer open by default
  }

  // Parse node title and convert to URL path
  const parseNodeTitleToPath = (title: string): string | null => {
    if (!title) return null
    
    // Handle different title formats
    // Examples: "Genesis 5:7" -> "/Genesis.5.7"
    // "Targum Jonathan on Genesis 19:18" -> "/Targum_Jonathan_on_Genesis.19.18"
    
    // Split by space to separate book name from chapter:verse
    console.log("Title:", title)
    const parts = title.trim().split(' ')
    console.log("Parts:", parts)
    if (parts.length < 2) return null
    console.log("Parts length:", parts.length)
    // Get the last part (chapter:verse) and the rest (book name)
    const chapterVerse = parts[parts.length - 1]
    console.log("Chapter verse:", chapterVerse)
    const bookName = parts.slice(0, -1).join(' ')
    console.log("Book name:", bookName)
    // Check if the last part contains chapter:verse format
    // Supports formats: "1:2", "1:2:3", "1a:2", etc.
    // Chapter can be alphanumeric, verse must be numeric
    const chapterVerseMatch = chapterVerse.match(/^([a-zA-Z0-9]+(?::[a-zA-Z0-9]+)*)(?::(\d+))$/)
    console.log("Chapter verse match:", chapterVerseMatch)
    if (!chapterVerseMatch) return null
    
    const [, chapterWithColons, verse] = chapterVerseMatch
    
    // Convert all colons in chapter to dots for consistent URL formatting
    const chapterWithDots = chapterWithColons.replace(/:/g, '.')
    
    // Convert book name: capitalize each word and replace spaces with underscores
    const bookPath = bookName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_')
    console.log("Book path:", bookPath)
    return `/${bookPath}.${chapterWithDots}.${verse}`
  }
  const graphRef = useRef<HTMLDivElement>(null)
  const svgSelectionRef = useRef<any>(null)
  const zoomLayerRef = useRef<any>(null)
  const zoomBehaviorRef = useRef<any>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const verseRefs = useRef<Record<string, HTMLElement | null>>({})
  const isProgrammaticScrollRef = useRef<boolean>(false)
  const hasRunActiveChapterEffectOnceRef = useRef<boolean>(false)
  const hasUserScrolledRef = useRef<boolean>(false)
  const initialTargetVerseRef = useRef<number | null>(null)
  const hasDoneInitialScrollRef = useRef<boolean>(false)

  // Read verse target from URL or hash if present (e.g., chapter.21 or #21)
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Priority 1: Verse from URL path (e.g., /texts/category/book/chapter.verse)
    if (targetVerseFromUrl && Number.isFinite(targetVerseFromUrl) && targetVerseFromUrl > 0) {
      initialTargetVerseRef.current = targetVerseFromUrl
      return
    }
    
    // Priority 2: Verse from hash fragment (e.g., #21)
    const hash = (window.location.hash || "").replace(/^#/, "").trim()
    const maybeVerse = parseInt(hash, 10)
    if (Number.isFinite(maybeVerse) && maybeVerse > 0) {
      initialTargetVerseRef.current = maybeVerse
    }
  }, [targetVerseFromUrl])

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
    const nodeColors: Record<GraphNode["type"], string> = {
      current: "#3b82f6", // blue
      halakhic: "#2563eb", // blue per spec
      aggadic: "#dc2626", // red
      lexical: "#6b7280", // gray
      responsa: "#10b981", // green
      commentary: "#8b5cf6",
      mishnah: "#f59e0b",
      talmud: "#1e40af", // dark blue
      kabbalah: "#dc2626" // red
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

    // Find the current node and position it at center initially
    const currentNode = centeredGraphData.nodes.find(n => n.type === "current")
    const otherNodes = centeredGraphData.nodes.filter(n => n.type !== "current")
    
    // Position current node at center initially, but allow it to be dragged
    if (currentNode) {
      currentNode.x = width / 2
      currentNode.y = height / 2
      // Don't set fx/fy to allow dragging
    }

    // Create force simulation
    const simulation = d3.forceSimulation(centeredGraphData.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(centeredGraphData.links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("collision", d3.forceCollide().radius(35))

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
      .attr("stroke", (d: GraphLink) => linkColors[d.type as keyof typeof linkColors] || "#64748b")
      .attr("stroke-width", (d: GraphLink) => Math.max(1, d.strength * 1.5))
      .attr("opacity", 0.75)
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
        .style("max-width", "300px")
        .style("white-space", "normal")
        .style("overflow", "hidden")
      
      tooltip.html(`
        <div><strong>${d.title}</strong></div>
        <div>${d.snippet}</div>
        ${d.content && typeof d.content === 'string' ? `<div style="margin-top: 8px; font-size: 11px; color: #e5e7eb; max-height: 60px; overflow: hidden;">${d.content.substring(0, 150)}${d.content.length > 150 ? '...' : ''}</div>` : ''}
        ${d.metadata.author ? `<div><em>Author: ${d.metadata.author}</em></div>` : ''}
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
        const verseId = `${normalizedBook} ${activeChapter}:${selectedCardId}`
        console.log("🔗 [Connections] Fetching connections for verse:", verseId);
        const data = await fetchConnectionsForVerse(verseId)
        
        // ===== NEO4J CONNECTIONS DATA LOGGING =====
        console.log("🔗 [Connections] ===== NEO4J CONNECTIONS DATA =====");
        console.log("🔗 [Connections] Raw Neo4j data:", data);
        console.log("🔗 [Connections] Number of nodes:", data.nodes?.length || 0);
        console.log("🔗 [Connections] Number of links:", data.links?.length || 0);
        
        
        setOriginalGraphData(data as any)
        
        // Compute dynamic year range from node metadata
        let allYears: number[] = []
        if (data.nodes && data.nodes.length > 0) {
          data.nodes.forEach(node => {
            allYears.push(...extractAllYears(node.metadata?.timePeriod))
          })
        }
        const minYear = allYears.length > 0 ? Math.min(...allYears) : Infinity
        const maxYear = allYears.length > 0 ? Math.max(...allYears) : -Infinity
        // Set computed year range as default (only if valid years were found)
        if (minYear !== Infinity && maxYear !== -Infinity) {
          const computedRange: [number, number] = [minYear, maxYear]
          console.log("🔗 [Connections] Computed year range from nodes:", computedRange)
          setDefaultYearRange(computedRange)
          // Only set yearRange if it's the first load or out of bounds
          setYearRange(prev => {
            if (
              prev[0] < computedRange[0] ||
              prev[1] > computedRange[1] ||
              (prev[0] === 0 && prev[1] === new Date().getFullYear()) // first load
            ) {
              return computedRange
            }
            return prev
          })
        }
        
        // initialize with current filters
        const filtered = (() => {
          const genres = activeFilters.genre
          const authors = activeFilters.author
          const [startYear, endYear] = minYear !== Infinity && maxYear !== -Infinity 
            ? [minYear, maxYear] 
            : yearRange
          const prelimNodes = data.nodes.filter(n => {
            if (n.type === "current") return true
            const genrePass = genres.length === 0 || (n.metadata.genre && genres.includes(n.metadata.genre))
            const authorPass = authors.length === 0 || (n.metadata.author && authors.includes(n.metadata.author))
            const year = parseNumericYear(n.metadata.timePeriod)
            const timePass = year == null || (year >= startYear && year <= endYear)
            return genrePass && authorPass && timePass
          })
          
          // Keep all filtered nodes
          const nodes = prelimNodes
          
          // Show only links between center node and filtered nodes
          const currentNodeIds = new Set(nodes.filter(n => n.type === "current").map(n => n.id))
          const filteredNodeIds = new Set(nodes.map(n => n.id))

          
          const links = data.links.filter(l => {
            const sourceId = l.source as string
            const targetId = l.target as string
            const isSourceCenter = currentNodeIds.has(sourceId)
            const isTargetCenter = currentNodeIds.has(targetId)
            const isSourceFiltered = filteredNodeIds.has(sourceId)
            const isTargetFiltered = filteredNodeIds.has(targetId)
            return (isSourceCenter && isTargetFiltered) || (isTargetCenter && isSourceFiltered)
          })
          
          return { nodes, links }
        })()
        
        // ===== FILTERED GRAPH DATA LOGGING =====
        console.log("🔗 [Connections] ===== FILTERED GRAPH DATA =====");
        console.log("🔗 [Connections] Filtered nodes count:", filtered.nodes.length);
        console.log("🔗 [Connections] Filtered links count:", filtered.links.length);
        console.log("🔗 [Connections] Active filters:", {
          genre: activeFilters.genre,
          author: activeFilters.author,
          yearRange: yearRange
        });
        
        setFilteredGraphData(filtered as any)
      } catch (e: any) {
        setConnectionsError(e?.message || "Failed to load connections")
        // Keep empty on error
        setFilteredGraphData(emptyGraphData)
      } finally {
        setConnectionsLoading(false)
      }
    }
    loadConnections()
  }, [connectionsModalOpen, selectedCardId, book, activeChapter])

  // Apply filters whenever filters or original data change
  useEffect(() => {
    const data = originalGraphData
    if (!data || !data.nodes || data.nodes.length === 0) return
    const genres = activeFilters.genre
    const authors = activeFilters.author
    const [startYear, endYear] = yearRange
    const prelimNodes = data.nodes.filter(n => {
      if (n.type === "current") return true
      const genrePass = genres.length === 0 || (n.metadata.genre && genres.includes(n.metadata.genre))
      const authorPass = authors.length === 0 || (n.metadata.author && authors.includes(n.metadata.author))
      const year = parseNumericYear(n.metadata.timePeriod)
      const timePass = year == null || (year >= startYear && year <= endYear)
      return genrePass && authorPass && timePass
    })
    
    // Keep all filtered nodes
    const nodes = prelimNodes
    
    // Show only links between center node and filtered nodes
    const currentNodeIds = new Set(nodes.filter(n => n.type === "current").map(n => n.id))
    const filteredNodeIds = new Set(nodes.map(n => n.id))
    
    
    const links = data.links.filter(l => {
      const sourceId = l.source as string
      const targetId = l.target as string
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId)
    })
    
    
    setFilteredGraphData({ nodes, links })
  }, [originalGraphData, activeFilters, yearRange])

  function parseNumericYear(period?: any): number | null {
    if (period == null) return null
    if (typeof period === "number" && Number.isFinite(period)) return period
    if (Array.isArray(period)) {
      for (const item of period) {
        const y = parseNumericYear(item)
        if (y != null) return y
      }
      return null
    }
    const str = String(period)
    // Try to parse direct year in string, e.g., "1200" or ranges like "1200-1300"
    const m = str.match(/-?\d{1,4}/g)
    if (!m || m.length === 0) return null
    const nums = m.map(v => parseInt(v, 10)).filter(v => Number.isFinite(v))
    if (nums.length === 0) return null
    // if range, take midpoint
    if (nums.length >= 2) return Math.round((nums[0] + nums[1]) / 2)
    return nums[0]
  }

  function capitalize(s?: string): string {
    if (!s) return ""
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

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

  // After chapters load, center requested chapter or verse only once,
  // and only after current, previous (if any), and next are loaded
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (!path) return

    // Determine the chapter we should be on from activeChapter (driven by detection)
    const current = activeChapter
    const numericCurrent = getNumericChapter(current)
    if (!numericCurrent) return

    // Require prev (if >1), current, and next to be present
    const needPrev = numericCurrent > 1
    const prevReady = needPrev ? !!chaptersData[numericCurrent - 1]?.verses?.length : true
    const currReady = !!chaptersData[current]?.verses?.length
    const nextReady = !!chaptersData[numericCurrent + 1]?.verses?.length
    if (!(prevReady && currReady && nextReady)) return

    // Compute target - prioritize URL verse, then hash verse, then first verse
    let targetEl: HTMLElement | null = null
    
    // Priority 1: Verse from URL (e.g., chapter.verse)
    if (targetVerseFromUrl && Number.isFinite(targetVerseFromUrl)) {
      targetEl = verseRefs.current[`${current}-${targetVerseFromUrl}`] || null
    }
    
    // Priority 2: Verse from hash fragment (e.g., #21)
    if (!targetEl) {
      const verseNum = hash.startsWith('#') ? parseInt(hash.slice(1)) : NaN
      if (Number.isFinite(verseNum)) {
        targetEl = verseRefs.current[`${current}-${verseNum}`] || null
      }
    }
    
    // Priority 3: First verse of chapter
    if (!targetEl) {
      const first = chaptersData[current]?.verses?.[0]?.verseNumber
      if (Number.isFinite(first)) {
        targetEl = verseRefs.current[`${current}-${first}`] || null
      }
    }
    
    if (!targetEl) return

    // Only scroll once per load
    let did = (scroller as any).__didInitialCenter
    if (did) return
    ;(scroller as any).__didInitialCenter = true

    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [chaptersData, activeChapter, targetVerseFromUrl])

  // Helper function to capitalize each word in book name
  const capitalizeBookName = (bookName: string): string => {
    return bookName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_')
  }

  // Update URL when the detected active verse changes (debounced by rAF in observer)
  useEffect(() => {
    if (!activeVerse) return
    const capitalizedBook = capitalizeBookName(book)
    const target = `/${capitalizedBook}.${activeVerse.chapter}.${activeVerse.verse}`
    try {
      if (typeof window !== 'undefined') {
        // If we're already at this path, replace instead of push to avoid history spam
        if (window.location.pathname + window.location.hash !== target) {
          const method = (window.history.state && window.history.state.idx > 0) ? 'replaceState' : 'pushState'
          window.history[method as 'replaceState' | 'pushState']({}, '', target)
        }
      }
    } catch {}
  }, [activeVerse, book])

  // Sync selected card for Dynamic Intertextual Graph with the scroll-detected active verse
  useEffect(() => {
    if (!activeVerse) return
    setSelectedCardId(activeVerse.verse)
  }, [activeVerse])

  // Detect active verse centered in the scroll container
  useEffect(() => {
    const scroller = scrollerRef.current
    const elements = Object.values(verseRefs.current).filter(Boolean) as HTMLElement[]
    if (!scroller || elements.length === 0) return

    const pickClosestToCenter = () => {
      const rect = scroller.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const viewportTop = rect.top
      const viewportBottom = rect.bottom
      
      // First, check if target verse is visible and should take priority (only before initial scroll is complete)
      if (!hasScrolledToTarget && targetVerseFromUrl && Number.isFinite(targetVerseFromUrl)) {
        const targetEl = verseRefs.current[`${currentChapter}-${targetVerseFromUrl}`]
        if (targetEl) {
          const targetRect = targetEl.getBoundingClientRect()
          // If target verse is at least partially visible in viewport
          if (targetRect.bottom > viewportTop && targetRect.top < viewportBottom) {
            const c = Number(targetEl.dataset?.chapter)
            const v = Number(targetEl.dataset?.verse || targetEl.dataset?.paragraphId)
            if (Number.isFinite(c) && Number.isFinite(v)) {
              setActiveVerse(prev => (prev && prev.chapter === c && prev.verse === v) ? prev : { chapter: c, verse: v })
              setActiveChapter(prevC => (prevC === c ? prevC : c))
              setHasScrolledToTarget(true) // Mark that we've found the target verse
              return // Exit early, target verse takes priority
            }
          } else {
          }
        } else {
        }
      }
      
      // Fallback to closest-to-center logic if target verse is not visible
      let best: { el: HTMLElement; dist: number } | null = null
      for (const el of elements) {
        const r = el.getBoundingClientRect()
        const mid = r.top + r.height / 2
        const dist = Math.abs(mid - centerY)
        if (!best || dist < best.dist) best = { el, dist }
      }
      if (best) {
        const c = Number(best.el.dataset?.chapter)
        const v = Number(best.el.dataset?.verse || best.el.dataset?.paragraphId)
        if (Number.isFinite(c) && Number.isFinite(v)) {
          setActiveVerse(prev => (prev && prev.chapter === c && prev.verse === v) ? prev : { chapter: c, verse: v })
          // If chapter changed, update activeChapter to drive adjacent preloading and pruning
          setActiveChapter(prevC => (prevC === c ? prevC : c))
        }
      }
    }

    // Debounce via rAF to avoid too-frequent computations
    let raf = 0
    const observer = new IntersectionObserver(() => {
      if (isProgrammaticScrollRef.current) return
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        pickClosestToCenter()
      })
    }, { root: scroller, rootMargin: "-50% 0px -50% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] })

    elements.forEach(el => observer.observe(el))

    // Initial computation
    pickClosestToCenter()

    return () => {
      observer.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [chaptersData, targetVerseFromUrl, currentChapter, hasScrolledToTarget])

  // Add this helper near parseNumericYear
  function extractAllYears(period?: any): number[] {
    if (period == null) return []
    if (typeof period === "number" && Number.isFinite(period)) return [period]
    if (Array.isArray(period)) {
      return period.flatMap(item => extractAllYears(item))
    }
    const str = String(period)
    const m = str.match(/-?\d{1,4}/g)
    if (!m || m.length === 0) return []
    return m.map(v => parseInt(v, 10)).filter(v => Number.isFinite(v))
  }

  return (
    <div className="h-[calc(100vh-65px)] bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col overflow-hidden">
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
          <div ref={scrollerRef} className="flex-1 overflow-auto">
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
                        ref={(el: HTMLDivElement | null) => { verseRefs.current[`${verse.chapterNumber}-${verse.verseNumber}`] = el as HTMLElement | null }}
                        data-chapter={verse.chapterNumber}
                        data-verse={verse.verseNumber}
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
                            Selected: {book.charAt(0).toUpperCase() + book.slice(1)} {activeChapter}:{selectedCardId}
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
              resetFilterStates() // Reset all filter settings
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
                        resetFilterStates() // Reset all filter settings
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
                    className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto shadow-xl"
                  >
                    <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>
                    
                    {/* Genre Filter */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">Genre</h4>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => setActiveFilters(prev => ({ ...prev, genre: [] }))}
                        >
                          All
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {genreOptions.map((genre) => {
                          const checked = activeFilters.genre.length === 0 || activeFilters.genre.includes(genre)
                          return (
                            <label key={genre} className={`flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm transition ${checked ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-slate-50 border-slate-200"}`}>
                            <Checkbox
                              id={`genre-${genre}`}
                              checked={activeFilters.genre.includes(genre)}
                                onCheckedChange={(isOn) => {
                                  setActiveFilters(prev => {
                                    if (isOn) return { ...prev, genre: Array.from(new Set([...prev.genre, genre])) }
                                    return { ...prev, genre: prev.genre.filter(g => g !== genre) }
                                  })
                                }}
                              />
                              <span>{genre}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Author Filter */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">Author</h4>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => setActiveFilters(prev => ({ ...prev, author: [] }))}
                        >
                          All
                        </button>
                          </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {activeFilters.author.length === 0
                              ? "All Authors"
                              : activeFilters.author.slice(0, 2).join(", ") + (activeFilters.author.length > 2 ? ` +${activeFilters.author.length - 2}` : "")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search authors…" />
                            <CommandList>
                              <CommandEmpty>No authors found.</CommandEmpty>
                              <CommandGroup heading="Authors">
                                <CommandItem
                                  onSelect={() => setActiveFilters(prev => ({ ...prev, author: [] }))}
                                >
                                  All
                                </CommandItem>
                                <CommandSeparator />
                                {authorOptions.map(author => (
                                  <CommandItem
                                    key={author}
                                    onSelect={() => setActiveFilters(prev => {
                                      const exists = prev.author.includes(author)
                                      return { ...prev, author: exists ? prev.author.filter(a => a !== author) : [...prev.author, author] }
                                    })}
                                  >
                                    <Checkbox className="mr-2" checked={activeFilters.author.includes(author)} />
                                    {author}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time Period Filter */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">Time Period</h4>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => setYearRange(defaultYearRange)}
                        >
                          Reset
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-600 mb-1">Start Year</label>
                            <Input
                              type="number"
                              value={yearRange[0]}
                              onChange={(e) => {
                                const v = Number(e.target.value || 0)
                                const clampedV = Math.max(defaultYearRange[0], Math.min(v, defaultYearRange[1]))
                                setYearRange(([_, end]) => [Math.min(clampedV, end), end])
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-600 mb-1">End Year</label>
                            <Input
                              type="number"
                              value={yearRange[1]}
                              onChange={(e) => {
                                const v = Number(e.target.value || 0)
                                const clampedV = Math.max(defaultYearRange[0], Math.min(v, defaultYearRange[1]))
                                setYearRange(([start, _]) => [start, Math.max(clampedV, start)])
                              }}
                            />
                          </div>
                        </div>
                        <div className="px-1">
                          <Slider
                            min={defaultYearRange[0]}
                            max={defaultYearRange[1]}
                            step={1}
                            value={yearRange}
                            onValueChange={(val: number[]) => {
                              if (Array.isArray(val) && val.length === 2) {
                                // Ensure values are within the computed bounds
                                const clampedStart = Math.max(defaultYearRange[0], Math.min(val[0], defaultYearRange[1]))
                                const clampedEnd = Math.max(defaultYearRange[0], Math.min(val[1], defaultYearRange[1]))
                                setYearRange([clampedStart, clampedEnd] as [number, number])
                                }
                              }}
                            />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{yearRange[0]}</span>
                            <span>{yearRange[1]}</span>
                          </div>
                      </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 mt-6 flex justify-between">
                      <Button variant="ghost" onClick={() => {
                        setActiveFilters({ genre: [], author: [], timePeriod: [] })
                        setYearRange(defaultYearRange)
                      }}>Clear All</Button>
                      <Button onClick={() => setFilterDrawerOpen(false)}>Apply</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Node Preview Pane - always visible */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="w-96 bg-white border-r border-slate-200 p-4 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Preview</h3>
                  {selectedNodePreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNodePreview(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {selectedNodePreview ? (
                    <>
                      <div>
                        <h3 className="font-large text-slate-900">{selectedNodePreview.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{selectedNodePreview.snippet}</p>
                      {selectedNodePreview.metadata.genre && (
                        <div>
                          <span className="text-xs text-slate-500">Genre: </span>
                          <span className="text-sm text-slate-700">{selectedNodePreview.metadata.genre}</span>
                        </div>
                      )}
                      {selectedNodePreview.metadata.author && (
                        <div>
                          <span className="text-xs text-slate-500">Author: </span>
                          <span className="text-sm text-slate-700">{selectedNodePreview.metadata.author}</span>
                        </div>
                      )}
                      {selectedNodePreview.metadata.timePeriod && (
                        <div>
                          <span className="text-xs text-slate-500">Period: </span>
                          <span className="text-sm text-slate-700">[ {selectedNodePreview.metadata.timePeriod[0]}, {selectedNodePreview.metadata.timePeriod[1]}]</span>
                        </div>
                      )}
                      {selectedNodePreview.content && (
                        <div>
                          <span className="text-xs text-slate-500">Content: </span>
                          <span className="text-sm text-slate-700"
                            dir="ltr"
                            dangerouslySetInnerHTML={{ __html: selectedNodePreview.content }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-medium text-slate-900">No node selected</h4>
                        <p className="text-sm text-slate-600 mt-1">Select a node in the graph to see details here.</p>
                      </div>
                    </>
                  )}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!selectedNodePreview}
                    onClick={() => {
                      if (!selectedNodePreview) return
                      
                      // Parse the node title to get the URL path
                      console.log("Selected node preview title:", selectedNodePreview.title)
                      const targetPath = parseNodeTitleToPath(selectedNodePreview.title)
                      console.log("Target path:", targetPath)

                      if (targetPath) {
                        // Navigate to the parsed path
                        router.push(targetPath)
                      } else {
                        // Fallback: log error and show alert for debugging
                        console.error("Could not parse node title:", selectedNodePreview.title)
                        alert(`Could not navigate to: ${selectedNodePreview.title}`)
                      }
                      
                      // Close modal and reset states
                      setSelectedNodePreview(null)
                      setConnectionsModalOpen(false)
                      setSelectedCardId(null) // Clear selection when modal closes
                      resetFilterStates() // Reset all filter settings
                    }}
                  >
                    Open in Main View
                  </Button>
                </div>
              </motion.div>
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
