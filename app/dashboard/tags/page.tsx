import * as React from "react"
import { db } from "@/db"
import { tags } from "@/db/schema"
import { sql } from "drizzle-orm"
import { TagsClient } from "./tags-client"
import { desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = params.page ? parseInt(params.page) : 1
  const limit = 10
  const offset = (currentPage - 1) * limit

  // Get total count
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(tags)
  const totalCount = countResult[0]?.count || 0

  // Fetch tags with pagination
  const paginatedTags = await db
    .select()
    .from(tags)
    .orderBy(desc(tags.createdAt))
    .limit(limit)
    .offset(offset)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Custom Tags</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create and manage tags for movie categorizations, affiliate referral links, and modal popups.
        </p>
      </div>

      <TagsClient
        initialTags={paginatedTags}
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  )
}
