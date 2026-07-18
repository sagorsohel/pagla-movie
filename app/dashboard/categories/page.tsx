import * as React from "react"
import { db } from "@/db"
import { categories, movies, movieCategories } from "@/db/schema"
import { sql, desc, eq, inArray } from "drizzle-orm"
import { CategoriesClient } from "./categories-client"

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

  const categoryIds = paginatedCategories.map((c) => c.id)
  let moviesMap: Record<number, { id: number; title: string; releaseDate: string | null }[]> = {}

  if (categoryIds.length > 0) {
    const moviesInCategories = await db
      .select({
        categoryId: movieCategories.categoryId,
        movieId: movies.id,
        movieTitle: movies.title,
        releaseDate: movies.releaseDate,
      })
      .from(movieCategories)
      .innerJoin(movies, eq(movieCategories.movieId, movies.id))
      .where(inArray(movieCategories.categoryId, categoryIds))

    moviesInCategories.forEach((m) => {
      if (!moviesMap[m.categoryId]) {
        moviesMap[m.categoryId] = []
      }
      moviesMap[m.categoryId].push({
        id: m.movieId,
        title: m.movieTitle,
        releaseDate: m.releaseDate,
      })
    })
  }

  // Combine categories with their movies
  const categoriesWithMovies = paginatedCategories.map((cat) => ({
    ...cat,
    movies: moviesMap[cat.id] || [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Categories (Genres)</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage movie genres, custom affiliate referral URLs, and modal advertisements.
        </p>
      </div>

      <CategoriesClient
        initialCategories={categoriesWithMovies as any}
        totalCount={totalCount}
        currentPage={currentPage}
      />
    </div>
  )
}
