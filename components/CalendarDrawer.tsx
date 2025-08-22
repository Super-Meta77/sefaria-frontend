"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  // Provide fallback if todaysLearning is undefined
  const safeLearning = todaysLearning || {
    parasha: "-",
    dafYomi: "-",
    mishnahYomi: "-",
    date: "-",
    hebrewDate: "-"
  };

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

              {/* Today's Learning Highlight */}
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-900 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Today's Learning
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">{safeLearning.date}</span>
                        <span className="font-hebrew text-blue-800">{safeLearning.hebrewDate}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Parasha:</span>
                        <Badge variant="secondary">{safeLearning.parasha}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Daf Yomi:</span>
                        <Badge variant="secondary">{safeLearning.dafYomi}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Mishnah:</span>
                        <Badge variant="secondary">{safeLearning.mishnahYomi}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calendar Navigation */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h4 className="font-medium text-slate-900">November 2024 • Cheshvan 5785</h4>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Weekly Readings */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 mb-3">This Week's Readings</h4>
                  {weeklyReadings.map((reading, index) => (
                    <Card
                      key={reading.date}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedDate === reading.date
                          ? "border-blue-300 bg-blue-50"
                          : "hover:border-slate-300 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedDate(reading.date)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-slate-900">{reading.date}</div>
                          <div className="text-xs font-hebrew text-slate-600">{reading.hebrewDate}</div>
                        </div>

                        {reading.specialDay && (
                          <div className="mb-2">
                            <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-300 text-yellow-800">
                              {reading.specialDay}
                            </Badge>
                          </div>
                        )}

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">📖 Parasha:</span>
                            <span className="font-medium">{reading.parasha}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">📜 Haftara:</span>
                            <span className="font-medium text-xs">{reading.haftara}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">📚 Daf Yomi:</span>
                            <span className="font-medium">{reading.dafYomi}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">📋 Mishnah:</span>
                            <span className="font-medium">{reading.mishnahYomi}</span>
                          </div>
                        </div>

                        {selectedDate === reading.date && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                <BookOpen className="w-3 h-3 mr-1" />
                                Study
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                <Clock className="w-3 h-3 mr-1" />
                                Schedule
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Upcoming Holidays */}
                <div className="mt-6">
                  <h4 className="font-medium text-slate-900 mb-3">Upcoming Holidays</h4>
                  <div className="space-y-2">
                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-purple-900">Chanukah</div>
                            <div className="text-xs text-purple-700">8 days of celebration</div>
                          </div>
                          <Badge variant="outline" className="border-purple-300 text-purple-800">
                            Dec 25
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-green-900">Tu BiShvat</div>
                            <div className="text-xs text-green-700">New Year of the Trees</div>
                          </div>
                          <Badge variant="outline" className="border-green-300 text-green-800">
                            Feb 13
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
