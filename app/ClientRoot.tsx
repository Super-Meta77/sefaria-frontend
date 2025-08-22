"use client";
import { useState } from "react";
import SiteHeader from "@/components/site-header";
import CalendarDrawer from "@/components/CalendarDrawer";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [calendarDrawerOpen, setCalendarDrawerOpen] = useState(false);
  // You can add more client-side state here as needed
  return (
    <>
      <SiteHeader onCalendarClick={() => setCalendarDrawerOpen(true)} />
      <CalendarDrawer open={calendarDrawerOpen} onClose={() => setCalendarDrawerOpen(false)} />
      {children}
    </>
  );
}

