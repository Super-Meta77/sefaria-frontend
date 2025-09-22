"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CalendarDrawerProps {
  open: boolean
  onClose: () => void
  todaysLearning: {
    parasha: string
    dafYomi: string
    mishnahYomi: string
    date: string
    hebrewDate: string
  }
}

const weeklyReadings = [
  {
    date: "Nov 16, 2024",
    hebrewDate: "ט״ו חשון תשפ״ה",
    parasha: "Vayera",
    haftara: "II Kings 4:1-37",
    dafYomi: "Berakhot 15a",
    mishnahYomi: "Berakhot 2:3",
    specialDay: null,
  },
  {
    date: "Nov 17, 2024",
    hebrewDate: "ט״ז חשון תשפ״ה",
    parasha: "Vayera",
    haftara: "II Kings 4:1-37",
    dafYomi: "Berakhot 15b",
    mishnahYomi: "Berakhot 2:4",
    specialDay: null,
  },
  {
    date: "Nov 18, 2024",
    hebrewDate: "י״ז חשון תשפ״ה",
    parasha: "Vayera",
    haftara: "II Kings 4:1-37",
    dafYomi: "Berakhot 16a",
    mishnahYomi: "Berakhot 2:5",
    specialDay: "Rosh Chodesh Kislev",
  },
]

export default function CalendarDrawer({ open, onClose, todaysLearning }: CalendarDrawerProps) {
  const router = useRouter()

  // Calendar view state
  const today = new Date()
  const [viewYear, setViewYear] = useState<number>(today.getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()) // 0-11
  const [selected, setSelected] = useState<Date | null>(today)

  // API state
  const [calendarItems, setCalendarItems] = useState<any[]>([])
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [apiDate, setApiDate] = useState<string>(todaysLearning?.date || "-")
  const [apiHebDate, setApiHebDate] = useState<string>(todaysLearning?.hebrewDate || "-")

  const pad2 = (n: number) => String(n).padStart(2, "0")
  const monthLabel = useMemo(() => new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: "long", year: "numeric" }), [viewYear, viewMonth])

  const fetchCalendars = async (d: Date) => {
    try {
      setCalendarLoading(true)
      setCalendarError(null)
      const y = d.getFullYear()
      const m = pad2(d.getMonth() + 1)
      const day = pad2(d.getDate())
      const res = await fetch(`https://www.sefaria.org/api/calendars?year=${y}&month=${m}&day=${day}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`Calendars request failed: ${res.status}`)
      const data = await res.json()
      setCalendarItems(Array.isArray(data?.calendar_items) ? data.calendar_items : [])
      if (typeof data?.date === "string") setApiDate(data.date)
      if (typeof data?.hebDate === "string") setApiHebDate(data.hebDate)
    } catch (e: any) {
      setCalendarError(e?.message || "Failed to load calendars")
      setCalendarItems([])
    } finally {
      setCalendarLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      // Default to today on open
      const base = selected ?? today
      setViewYear(base.getFullYear())
      setViewMonth(base.getMonth())
      fetchCalendars(base)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }
  const onNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const onSelectDate = (dayNum: number) => {
    const d = new Date(viewYear, viewMonth, dayNum)
    setSelected(d)
    fetchCalendars(d)
  }

  // Mapping to preview labels
  const findItem = (en: string) => calendarItems.find((i: any) => i?.title?.en === en)
  const parashat = findItem("Parashat Hashavua")
  const haftarah = findItem("Haftarah")
  const dafYomi = findItem("Daf Yomi")

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 border-l border-slate-200"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Liturgical Calendar</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ✕
                </Button>
              </div>

              {/* Selected Day's Learning Highlight */}
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-blue-900 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Selected Day ({apiDate})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-md text-slate-600">Parashat:</span>
                        <Badge variant="secondary">
                          <Link href={`/${parashat?.url}`} className="text-sm text-blue-700 hover:underline">
                            {parashat?.displayValue?.en || '-'}
                          </Link>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-md text-slate-600">Haftarah:</span>
                        <Badge variant="secondary">
                          <Link href={`/${haftarah?.url}`} className="text-sm text-blue-700 hover:underline">
                            {haftarah?.displayValue?.en || '-'}
                          </Link>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-md text-slate-600">Daf Yomi:</span>
                        <Badge variant="secondary">
                          <Link href={`/${dafYomi?.url}`} className="text-sm text-blue-700 hover:underline">
                            {dafYomi?.displayValue?.en || '-'}
                          </Link>
                        </Badge>
                      </div>
                      {calendarError && (
                        <div className="text-md text-red-600">{calendarError}</div>
                      )}
                    </div>
                    <div className="pt-2 text-left">
                      {(() => {
                        const d = selected ?? today
                        const y = d.getFullYear()
                        const m = pad2(d.getMonth() + 1)
                        const day = pad2(d.getDate())
                        const href = `/calendars?year=${y}&month=${m}&day=${day}`
                        return (
                          <Link href={href} className="text-sm text-blue-700 hover:underline">All Learning Schedules -&gt;</Link>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Navigation */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <Button variant="ghost" size="sm" onClick={onPrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h4 className="font-medium text-slate-900">{monthLabel}</h4>
                  <Button variant="ghost" size="sm" onClick={onNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {/* Month grid */}
                {(() => {
                  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
                  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
                  const cells: Array<{ label: string; day?: number }> = []
                  for (let i = 0; i < firstDay; i++) cells.push({ label: "" })
                  for (let d = 1; d <= daysInMonth; d++) cells.push({ label: String(d), day: d })
                  const sel = selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth ? selected.getDate() : -1
                  return (
                    <div className="grid grid-cols-7 gap-2 text-sm">
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((w) => (
                        <div key={w} className="text-center text-xs text-slate-500">{w}</div>
                      ))}
                      {cells.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!c.day}
                          onClick={() => c.day && onSelectDate(c.day)}
                          className={`h-[42px] w-[42px] rounded-sm border text-center ${
                            c.day ? (c.day === sel ? "bg-blue-600 text-white border-blue-600" : "hover:bg-slate-100 border-slate-200") : "border-transparent"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Results area (kept scrollable for long content) */}
              <ScrollArea className="flex-1 p-4">
                {!calendarLoading && !calendarError && calendarItems.length === 0 && (
                  <div className="text-sm text-slate-600">No schedule data for this date.</div>
                )}
                {calendarLoading && (
                  <div className="text-sm text-slate-600">Loading schedule…</div>
                )}
                {calendarError && (
                  <div className="text-sm text-red-600">{calendarError}</div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
