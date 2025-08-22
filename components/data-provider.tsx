"use client"

import type React from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type SefariaItem = {
  order: number
  category: string
  enShortDesc?: string
  heShortDesc?: string
  heCategory?: string
  contents?: any[]
}

type Status = "idle" | "loading" | "ready" | "error"

type LibraryContextValue = {
  data: SefariaItem[]
  status: Status
  error: string | null
  refresh: () => Promise<void>
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined)

const STORAGE_KEY = "sefaria:index:v1"

async function fetchSefariaIndex(): Promise<SefariaItem[]> {
  const res = await fetch("https://www.sefaria.org/api/index")
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const raw: any[] = await res.json()
  const mapped: SefariaItem[] = raw.map((item: any) => ({
    order: item.order,
    category: item.category,
    enShortDesc: item.enShortDesc,
    heShortDesc: item.heShortDesc,
    heCategory: item.heCategory,
    contents: item.contents ?? [],
  }))
  mapped.sort((a, b) => {
    const ao = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER
    const bo = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER
    return ao - bo
  })
  return mapped
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SefariaItem[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const loadFromStorage = (): SefariaItem[] | null => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY)
      if (!cached) return null
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) return parsed as SefariaItem[]
      return null
    } catch {
      return null
    }
  }

  const saveToStorage = (items: SefariaItem[]) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore storage errors
    }
  }

  const initialize = async () => {
    setStatus("loading")
    setError(null)
    const cached = loadFromStorage()
    if (cached && cached.length > 0) {
      setData(cached)
      setStatus("ready")
      return
    }
    try {
      const fresh = await fetchSefariaIndex()
      setData(fresh)
      saveToStorage(fresh)
      setStatus("ready")
    } catch (e: any) {
      setError("Failed to load categories. Please try again later.")
      setStatus("error")
    }
  }

  useEffect(() => {
    void initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = async () => {
    setStatus("loading")
    setError(null)
    try {
      const fresh = await fetchSefariaIndex()
      setData(fresh)
      saveToStorage(fresh)
      setStatus("ready")
    } catch {
      setError("Failed to refresh categories. Please try again later.")
      setStatus("error")
    }
  }

  const value = useMemo<LibraryContextValue>(() => ({ data, status, error, refresh }), [data, status, error])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibraryData() {
  const ctx = useContext(LibraryContext)
  if (!ctx) {
    throw new Error("useLibraryData must be used within a DataProvider")
  }
  return ctx
}
