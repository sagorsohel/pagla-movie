import * as React from "react"
import { db } from "@/db"
import { pages } from "@/db/schema"
import { PagesClient } from "./pages-client"
import { desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function PagesManagementPage() {
  const allPages = await db.select().from(pages).orderBy(desc(pages.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Pages Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create and manage landing pages or custom redirect routes linked in the system.
        </p>
      </div>

      <PagesClient initialPages={allPages} />
    </div>
  )
}
