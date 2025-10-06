import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function normalizeBookParam(raw: string): string {
  // Keep incoming slug as-is; Sefaria API expects title, so try to de-slug for fetching only
  // Only decode URI encoding and convert dashes to spaces, but keep original casing
  return decodeURIComponent(raw).replace(/-/g, ' ')
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Ignore Next internals and assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || pathname.startsWith('/icons/')) {
    return NextResponse.next()
  }

  // Reserved top-level routes that should never be treated as book slugs
  const RESERVED_TOP_LEVEL = new Set([
    '/texts',
    '/community',
    '/donate',
    '/help',
    '/login',
    '/signup',
    '/calendars',
  ])
  if (RESERVED_TOP_LEVEL.has(pathname.toLowerCase())) {
    return NextResponse.next()
  }

  // Redirect old long URLs to new short ones
  const oldChapterMatch = pathname.match(/^\/texts\/([^\/]+)\/([^\/]+)\/(\d+)/i)
  if (oldChapterMatch) {
    const [, , book, chapter] = oldChapterMatch
    const url = req.nextUrl.clone()
    url.pathname = `/${book}.${chapter}`
    return NextResponse.redirect(url, 308)
  }

  const oldBookMatch = pathname.match(/^\/texts\/([^\/]+)\/([^\/]+)\/?$/i)
  if (oldBookMatch) {
    const [, , book] = oldBookMatch
    const url = req.nextUrl.clone()
    url.pathname = `/${book}`
    return NextResponse.redirect(url, 308)
  }

  // Rewrite short URLs to existing pages (URL stays short)
  // Pattern: /Book
  const bookOnlyMatch = pathname.match(/^\/([^\/.]+)\/?$/)
  if (bookOnlyMatch) {
    const bookSlug = bookOnlyMatch[1]
    if (RESERVED_TOP_LEVEL.has('/' + bookSlug)) {
      return NextResponse.next()
    }
    try {
      const title = normalizeBookParam(bookSlug)
      const res = await fetch(`https://www.sefaria.org/api/v2/index/${encodeURIComponent(title)}`)
      if (res.ok) {
        const data = await res.json()
        const category = (Array.isArray(data?.categories) ? data.categories[0] : data?.category) || 'texts'
        const rewriteUrl = req.nextUrl.clone()
        rewriteUrl.pathname = `/texts/${encodeURIComponent(String(category))}/${bookSlug}`
        return NextResponse.rewrite(rewriteUrl)
      }
    } catch {}
    return NextResponse.next()
  }

  // Pattern: /Book.Chapter (supports mixed formats like 1:1, 1:2, 1a, 2b, etc.)
  const bookChapterMatch = pathname.match(/^\/([^\/.]+)\.([^\/.]+)\/?$/)
  if (bookChapterMatch) {
    const bookSlug = bookChapterMatch[1]
    const chapter = bookChapterMatch[2]
    if (RESERVED_TOP_LEVEL.has('/' + bookSlug)) {
      return NextResponse.next()
    }
    try {
      const title = normalizeBookParam(bookSlug)
      const res = await fetch(`https://www.sefaria.org/api/v2/index/${encodeURIComponent(title)}`)
      if (res.ok) {
        const data = await res.json()
        const category = (Array.isArray(data?.categories) ? data.categories[0] : data?.category) || 'texts'
        const rewriteUrl = req.nextUrl.clone()
        rewriteUrl.pathname = `/texts/${encodeURIComponent(String(category))}/${bookSlug}/${chapter}`
        return NextResponse.rewrite(rewriteUrl)
      }
    } catch {}
    return NextResponse.next()
  }

  // Pattern: /Book.Chapter.Verse (supports mixed chapter formats like 1:1, 1:2, 1a, 2b, etc.)
  const bookChapterVerseMatch = pathname.match(/^\/([^\/.]+)\.([^\/.]+)\.(\d+)\/?$/)
  if (bookChapterVerseMatch) {
    const bookSlug = bookChapterVerseMatch[1]
    const chapter = bookChapterVerseMatch[2]
    const verse = bookChapterVerseMatch[3]
    if (RESERVED_TOP_LEVEL.has('/' + bookSlug)) {
      return NextResponse.next()
    }
    try {
      const title = normalizeBookParam(bookSlug)
      const res = await fetch(`https://www.sefaria.org/api/v2/index/${encodeURIComponent(title)}`)
      if (res.ok) {
        const data = await res.json()
        const category = (Array.isArray(data?.categories) ? data.categories[0] : data?.category) || 'texts'
        const rewriteUrl = req.nextUrl.clone()
        rewriteUrl.pathname = `/texts/${encodeURIComponent(String(category))}/${bookSlug}/${chapter}/${verse}`
        return NextResponse.rewrite(rewriteUrl)
      }
    } catch {}
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|static|.*\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js)).*)'],
}


