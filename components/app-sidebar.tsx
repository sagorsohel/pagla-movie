"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  TerminalSquareIcon,
  FilmIcon,
  FolderOpenIcon,
  TagIcon,
  FileTextIcon,
  SlidersHorizontalIcon,
  LayoutGridIcon,
} from "lucide-react"

// Dashboard Navigation Data (Flat structure, no dropdowns)
const data = {
  user: {
    name: "Admin User",
    email: "admin@gmail.com",
    avatar: "",
  },
  teams: [
    {
      name: "CineMovies",
      logo: <GalleryVerticalEndIcon />,
      plan: "Admin Panel",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      exact: true,
      icon: <TerminalSquareIcon className="w-5 h-5" />,
    },
    {
      title: "Manage Movies",
      url: "/dashboard/movies",
      icon: <FilmIcon className="w-5 h-5" />,
    },
    {
      title: "Manage Categories",
      url: "/dashboard/categories",
      icon: <FolderOpenIcon className="w-5 h-5" />,
    },
    {
      title: "Manage Tags",
      url: "/dashboard/tags",
      icon: <TagIcon className="w-5 h-5" />,
    },
    {
      title: "Manage Pages",
      url: "/dashboard/pages",
      icon: <FileTextIcon className="w-5 h-5" />,
    },
    {
      title: "Ads Control",
      url: "/dashboard/ads",
      exact: true,
      icon: <SlidersHorizontalIcon className="w-5 h-5" />,
    },
    {
      title: "Drag & Drop Ads",
      url: "/dashboard/ads/layout",
      icon: <LayoutGridIcon className="w-5 h-5" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="bg-white border-r border-slate-200 text-slate-900" {...props}>
      <SidebarHeader className="bg-white border-b border-slate-100">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-white border-t border-slate-100">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
