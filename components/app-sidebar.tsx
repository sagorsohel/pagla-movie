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
import { GalleryVerticalEndIcon, TerminalSquareIcon, FilmIcon, FolderOpenIcon, TagIcon, MegaphoneIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "Admin User",
    email: "admin@gmail.com",
    avatar: "",
  },
  teams: [
    {
      name: "Pagla Movie",
      logo: (
        <GalleryVerticalEndIcon />
      ),
      plan: "Admin Panel",
    }
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <TerminalSquareIcon />
      ),
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Movies",
      url: "/dashboard/movies",
      icon: (
        <FilmIcon />
      ),
      isActive: true,
      items: [
        {
          title: "Manage Movies",
          url: "/dashboard/movies",
        },
      ],
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: (
        <FolderOpenIcon />
      ),
      isActive: true,
      items: [
        {
          title: "Manage Categories",
          url: "/dashboard/categories",
        },
      ],
    },
    {
      title: "Tags",
      url: "/dashboard/tags",
      icon: (
        <TagIcon />
      ),
      isActive: true,
      items: [
        {
          title: "Manage Tags",
          url: "/dashboard/tags",
        },
      ],
    },
    {
      title: "Ads Settings",
      url: "/dashboard/ads",
      icon: (
        <MegaphoneIcon />
      ),
      isActive: true,
      items: [
        {
          title: "Configure Ads",
          url: "/dashboard/ads",
        },
      ],
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
