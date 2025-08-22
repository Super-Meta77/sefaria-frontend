"use client"

import type { ReactNode } from "react"

type SidebarContainerProps = {
    children: ReactNode
}

export function SidebarContainer({ children }: SidebarContainerProps) {
    return (
        <div
            className="sticky top-24 space-y-8 bg-gray-50 rounded-lg border border-gray-200"
            style={{ padding: "2.5rem 3rem 2rem 2rem" }}
        >
            {children}
        </div>
    )
}



