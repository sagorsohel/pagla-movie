import * as React from "react"
import { db } from "@/db"
import { categories } from "@/db/schema"
import { sql } from "drizzle-orm"
import { CategoriesClient } from "./categories-client"
import { desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = params.page ? parseInt(params.page) : 1
  const limit = 10
  const offset = (currentPage - 1) * limit

  // Get total count
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(categories)
  const totalCount = countResult[0]?.count || 0

  // Fetch categories with pagination
  const paginatedCategories = await db
    .select()
    .from(categories)
    .orderBy(desc(categories.createdAt))
    .limit(limit)
    .offset(offset)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Categories (Genres)</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage movie genres, custom affiliate referral URLs, and modal advertisements.
        </p>
      </div>

      <CategoriesClient
        initialCategories={paginatedCategories}
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  )
}
