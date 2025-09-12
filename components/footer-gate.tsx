"use client"

import { usePathname } from "next/navigation"
import Footer from "./footer"

export default function FooterGate() {
	const pathname = usePathname()
	const excludeChapter = /^\/texts\/[^/]+\/[^/]+\/[^/]+$/
	const excludeVerse = /^\/texts\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/
	const excludeShortChapter = /^\/[^\/.]+\.\d+\/?$/
	const excludeShortVerse = /^\/[^\/.]+\.\d+\.\d+\/?$/
	if (
		excludeChapter.test(pathname) ||
		excludeVerse.test(pathname) ||
		excludeShortChapter.test(pathname) ||
		excludeShortVerse.test(pathname)
	) return null
	return <Footer />
}



