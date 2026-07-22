import * as React from "react"
import { db } from "@/db"
import { movies, categories, tags, movieCategories, movieTags } from "@/db/schema"
import { sql, desc, eq, inArray, and, like, or } from "drizzle-orm"
import { MoviesClient } from "./movies-client"

export const dynamic = "force-dynamic"

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categoryId?: string; q?: string }>
}) {
  const params = await searchParams
  const currentPage = params.page ? parseInt(params.page) : 1
  const categoryId = params.categoryId ? parseInt(params.categoryId) : undefined
  const searchQuery = params.q || ""
  const limit = 10
  const offset = (currentPage - 1) * limit

  let totalCount = 0
  let paginatedMovies: any[] = []
  let filterCategoryName = ""

  const searchFilter = searchQuery.trim()
    ? or(
        like(movies.title, `%${searchQuery}%`),
        like(movies.overview, `%${searchQuery}%`)
      )
    : undefined

  if (categoryId) {
    // 1. Get Category Name
    const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1)
    if (cat) {
      filterCategoryName = cat.name
    }

    // 2. Get Count for Category with optional search query
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(movies)
      .innerJoin(movieCategories, eq(movieCategories.movieId, movies.id))
      .where(
        and(
          eq(movieCategories.categoryId, categoryId),
          searchFilter
        )
      )
    totalCount = countResult[0]?.count || 0

    // 3. Get Movies for Category
    if (totalCount > 0) {
      paginatedMovies = await db
        .select({
          id: movies.id,
          tmdbId: movies.tmdbId,
          title: movies.title,
          overview: movies.overview,
          posterPath: movies.posterPath,
          backdropPath: movies.backdropPath,
          releaseDate: movies.releaseDate,
          voteAverage: movies.voteAverage,
          referralUrl: movies.referralUrl,
          modalImage: movies.modalImage,
          redirectUrl: movies.redirectUrl,
          redirectTime: movies.redirectTime,
          createdAt: movies.createdAt,
        })
        .from(movies)
        .innerJoin(movieCategories, eq(movieCategories.movieId, movies.id))
        .where(
          and(
            eq(movieCategories.categoryId, categoryId),
            searchFilter
          )
        )
        .orderBy(desc(movies.createdAt))
        .limit(limit)
        .offset(offset)
    }
  } else {
    // 1. Get total count for all movies with optional search query
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(movies)
      .where(searchFilter)
    totalCount = countResult[0]?.count || 0

    // 2. Fetch movies with pagination
    if (totalCount > 0) {
      paginatedMovies = await db
        .select()
        .from(movies)
        .where(searchFilter)
        .orderBy(desc(movies.createdAt))
        .limit(limit)
        .offset(offset)
    }
  }

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

    cats.forEach((c: any) => {
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

    tg.forEach((t: any) => {
      if (!tagsMap[t.movieId]) {
        tagsMap[t.movieId] = []
      }
      tagsMap[t.movieId].push({ id: t.tagId, name: t.tagName })
    })
  }

  // Combine data to pass down
  const moviesWithRelations = paginatedMovies.map((movie: any) => ({
    ...movie,
    categories: categoriesMap[movie.id] || [],
    tags: tagsMap[movie.id] || [],
  }))

  const allTags = await db.select().from(tags)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Movies Database {filterCategoryName && <span className="text-cyan-600">({filterCategoryName})</span>}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {filterCategoryName 
            ? `Viewing movies categorized under ${filterCategoryName}.`
            : "Manage movies, custom affiliate referral URLs, redirect routes, categories, and tags."}
        </p>
      </div>

      <MoviesClient
        initialMovies={moviesWithRelations as any}
        totalCount={totalCount}
        currentPage={currentPage}
        allTags={allTags}
        filterCategoryName={filterCategoryName}
      />
    </div>
  )
}
