"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { CalendarsSidebar } from "@/components/calendars-sidebar";
import { useSearchParams } from "next/navigation";

type CalendarItem = {
  title?: { en?: string; he?: string };
  displayValue?: { en?: string; he?: string };
  url?: string;
};

export default function CalendarsPage() {
  const params = useSearchParams();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [date, setDate] = useState<string>("-");
  const [hebDate, setHebDate] = useState<string>("-");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const y = params.get("year");
        const m = params.get("month");
        const d = params.get("day");
        const qs = y && m && d ? `?year=${y}&month=${m}&day=${d}` : "";
        const res = await fetch(`https://www.sefaria.org/api/calendars${qs}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load calendars: ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data?.calendar_items) ? data.calendar_items : []);
        if (typeof data?.date === "string") setDate(data.date);
        if (typeof data?.hebDate === "string") setHebDate(data.hebDate);
      } catch (e: any) {
        setError(e?.message || "Failed to load calendars");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params]);

  const descriptionByTitle: Record<string, string> = useMemo(() => ({
    "Parashat Hashavua": "The weekly Torah portion, read on Shabbat with traditional aliyot.",
    Haftarah: "A selection from Prophets traditionally read after the weekly Torah portion.",
    "Daf Yomi": "A learning program that covers a page of Talmud a day, completing the Talmud in about seven and a half years.",
    "929": "A Tanakh learning program to complete the Bible, one chapter a day, five days a week.",
    "Daily Mishnah": "A daily Mishnah study cycle covering all six orders over time.",
    "Daily Rambam": "A Maimonides (Rambam) daily study cycle, completed in one or three years.",
    "Halakhah Yomit": "A daily halakhah learning program from classic legal works.",
    "Arukh HaShulchan Yomi": "A daily program learning Arukh HaShulchan with practical halakhah.",
    "Tanakh Yomi": "A daily Tanakh cycle covering Torah, Prophets, and Writings.",
    "Chok LeYisrael": "A daily learning regimen combining Torah, Prophets, Writings, Mishnah, Talmud, and Zohar.",
    "Tanya Yomi": "A daily Tanya study, completing the classic Chabad work each year.",
    "Yerushalmi Yomi": "A daily study cycle of the Jerusalem Talmud.",
    "Daf a Week (Talmud)": "A weekly study covering one folio of Talmud, paced for deeper mastery.",
  }), []);

  const weeklyKeys = useMemo(() => ["Parashat Hashavua", "Haftarah"], []);
  const weeklyItems = useMemo(
    () => items.filter((i) => weeklyKeys.includes(i?.title?.en || "")),
    [items, weeklyKeys]
  );
  const dailyItems = useMemo(
    () => items.filter((i) => !weeklyKeys.includes(i?.title?.en || "")),
    [items, weeklyKeys]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <PageHeader title="Learning Schedules" movable={false} />

            {loading && (
              <div className="text-slate-600">Loading…</div>
            )}
            {error && !loading && (
              <div className="text-red-600">{error}</div>
            )}

            {!loading && !error && (
              <div className="space-y-10">
                {weeklyItems.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-1 mb-3">Weekly Torah Portion</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {weeklyItems.map((item, i) => {
                        const title = item?.title?.en || "Untitled";
                        const display = item?.displayValue?.en || "-";
                        const desc = descriptionByTitle[title] || "A daily or weekly learning cycle.";
                        const card = (
                          <Link key={`weekly-card-${i}`} href={item.url ?? ""}>
                            <Card className="border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer h-full">
                              <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center text-sm text-gray-700 mb-3">
                                  <img src="/icons/book.svg" className="size-[20px] inline-block mr-2" alt="book icon" />
                                  <span className="font-medium">{display}</span>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                        return item?.url ? (
                          <Link key={`weekly-card-${i}`} href={item.url}>{card}</Link>
                        ) : (
                          <div key={`weekly-card-${i}`}>{card}</div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {dailyItems.length > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-1 mb-3">Daily Learning</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dailyItems.map((item, i) => {
                        const title = item?.title?.en || "Untitled";
                        const display = item?.displayValue?.en || "-";
                        const desc = descriptionByTitle[title] || "A daily or weekly learning cycle.";
                        const card = (
                          <Card className="border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer h-full">
                            <CardHeader>
                              <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center text-sm text-gray-700 mb-3">
                                <img src="/icons/book.svg" className="size-[20px] inline-block mr-2" alt="book icon" />
                                <span className="font-medium">{display}</span>
                              </div>
                              <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
                            </CardContent>
                          </Card>
                        );
                        return item?.url ? (
                          <Link key={`daily-card-${i}`} href={item.url}>{card}</Link>
                        ) : (
                          <div key={`daily-card-${i}`}>{card}</div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CalendarsSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}


