"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  exact?: boolean
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="py-4 px-2">
      <SidebarMenu className="space-y-1.5">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.url
            : pathname === item.url || pathname.startsWith(item.url + "/")

          return (
            <SidebarMenuItem key={item.title}>
              <Link
                href={item.url}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm font-bold group cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-xs shadow-cyan-500/10 font-extrabold"
                    : "text-slate-300 hover:text-slate-100 hover:bg-slate-900/60 font-semibold"
                }`}
              >
                <span
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate flex-1 text-[13.5px] tracking-tight">{item.title}</span>
                {isActive && (
                  <ChevronRightIcon className="w-4 h-4 ml-auto text-cyan-400 shrink-0 stroke-[2.5]" />
                )}
              </Link>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

