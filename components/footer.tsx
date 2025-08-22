"use client"

import Link from "next/link"
import { useLanguage } from "./language-context"
import { getTranslation } from "@/lib/translations"

export default function Footer() {
    const { language } = useLanguage()
    
    return (
        <footer className="border-t bg-white text-slate-700">
            <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* About */}
                    <div>
                        <div className="text-base font-semibold text-slate-800 mb-3">About</div>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">What is Sefaria?</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Help</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Team</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Products</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">AI on Sefaria</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Testimonials</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Metrics</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Annual Report</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Terms of Use</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Tools */}
                    <div>
                        <div className="text-base font-semibold text-slate-800 mb-3">Tools</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Teach with Sefaria</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Learning Schedules</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Source Sheets</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Visualizations</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Mobile Apps</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Daf Yomi</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Torah Tab</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Authors</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Collections</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">New Additions</Link></li>
                        </ul>
                    </div>

                    {/* Developers */}
                    <div>
                        <div className="text-base font-semibold text-slate-800 mb-3">Developers</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Get Involved</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">API Docs</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Fork us on GitHub</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Download our Data</Link></li>
                        </ul>
                    </div>

                    {/* Join Us */}
                    <div>
                        <div className="text-base font-semibold text-slate-800 mb-3">Join Us</div>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Donate</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Ways to Give</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Supporters</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Jobs</Link></li>
                            <li><Link href="#" className="hover:text-blue-700 hover:underline">Shop</Link></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <div className="text-base font-semibold text-slate-800 mb-3">Connect</div>
                        <div className="mb-4">
                            <Link href="#" className="inline-flex items-center text-sm text-slate-700 border rounded-full px-4 py-2 hover:bg-slate-50">
                                Sign up for Newsletter
                            </Link>
                        </div>
                        <div className="text-sm space-y-2">
                            <div>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Instagram</Link>
                                <span className="mx-1 text-slate-400">•</span>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Facebook</Link>
                            </div>
                            <div>
                                <Link href="#" className="hover:text-blue-700 hover:underline">YouTube</Link>
                                <span className="mx-1 text-slate-400">•</span>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Blog</Link>
                            </div>
                            <div>
                                <Link href="#" className="hover:text-blue-700 hover:underline">LinkedIn</Link>
                                <span className="mx-1 text-slate-400">•</span>
                                <Link href="#" className="hover:text-blue-700 hover:underline">Email</Link>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                                {getTranslation(language, "siteLanguageFooter")}
                            </div>
                            <div className="text-sm text-slate-600">
                                Use the language switcher in the header to change the site language
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}



