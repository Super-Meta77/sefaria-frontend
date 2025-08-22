"use client"

import { usePathname } from "next/navigation"
import Footer from "./footer"

export default function FooterGate() {
    const pathname = usePathname()
    const excludeChapter = /^\/texts\/[^/]+\/[^/]+\/[^/]+$/
    if (excludeChapter.test(pathname)) return null
    return <Footer />
}



