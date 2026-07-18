import * as React from "react"
import { db } from "@/db"
import { movies, categories, tags, movieCategories, movieTags } from "@/db/schema"
import { sql, desc, eq, inArray } from "drizzle-orm"
import { MoviesClient } from "./movies-client"

export const dynamic = "force-dynamic"

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = params.page ? parseInt(params.page) : 1
  const limit = 10
  const offset = (currentPage - 1) * limit

  // Get total count
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(movies)
  const totalCount = countResult[0]?.count || 0

  // Fetch movies with pagination
  const paginatedMovies = await db
    .select()
    .from(movies)
    .orderBy(desc(movies.createdAt))
    .limit(limit)
    .offset(offset)

  const movieIds = paginatedMovies.map((m) => m.id)

  let categoriesMap: Record<number, { id: number; name: string }[]> = {}
  let tagsMap: Record<number, { id: number; name: string }[]> = {}

  if (movieIds.length > 0) {
    // 1. Fetch categories for the current batch of movies
    const cats = await db
      .select({
        movieId: movieCategories.movieId,
        categoryId: categories.id,
        categoryName: categories.name,
      })
      .from(movieCategories)
      .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
      .where(inArray(movieCategories.movieId, movieIds))

    cats.forEach((c) => {
      if (!categoriesMap[c.movieId]) {
        categoriesMap[c.movieId] = []
      }
      categoriesMap[c.movieId].push({ id: c.categoryId, name: c.categoryName })
    })

    // 2. Fetch tags for the current batch of movies
    const tg = await db
      .select({
        movieId: movieTags.movieId,
        tagId: tags.id,
        tagName: tags.name,
      })
      .from(movieTags)
      .innerJoin(tags, eq(movieTags.tagId, tags.id))
      .where(inArray(movieTags.movieId, movieIds))

    tg.forEach((t) => {
      if (!tagsMap[t.movieId]) {
        tagsMap[t.movieId] = []
      }
      tagsMap[t.movieId].push({ id: t.tagId, name: t.tagName })
    })
  }

  // Combine data to pass down
  const moviesWithRelations = paginatedMovies.map((movie) => ({
    ...movie,
    categories: categoriesMap[movie.id] || [],
    tags: tagsMap[movie.id] || [],
  }))

  // Fetch all tags so they can be managed/assigned in the edit modal if needed
  const allTags = await db.select().from(tags)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Movies Database</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage movies, custom affiliate referral URLs, redirect routes, categories, and tags.
        </p>
      </div>

      <MoviesClient
        initialMovies={moviesWithRelations as any}
        totalCount={totalCount}
        currentPage={currentPage}
        allTags={allTags}
      />
    </div>
  )
}
