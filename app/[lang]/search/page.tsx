import * as React from "react"
import { db } from "@/db"
import { movies, categories, movieCategories } from "@/db/schema"
import { eq, desc, like, or, inArray } from "drizzle-orm"
import { SearchResultsClient } from "./search-client"
import { type Locale, LANGUAGES } from "@/lib/translations"

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ q?: string; query?: string; search?: string }>
}) {
  const { lang } = await params
  const resolvedSearchParams = await searchParams
  const searchQuery = resolvedSearchParams.q || resolvedSearchParams.query || resolvedSearchParams.search || ""

  const locale: Locale = LANGUAGES.some(l => l.code === lang) ? (lang as Locale) : "en"

  // 1. Fetch matching movies from the database using title or overview
  let matchedMovies: any[] = []
  if (searchQuery.trim()) {
    matchedMovies = await db
      .select()
      .from(movies)
      .where(
        or(
          like(movies.title, `%${searchQuery}%`),
          like(movies.overview, `%${searchQuery}%`)
        )
      )
      .orderBy(desc(movies.createdAt))
  } else {
    // Fallback: If no search term is entered, show the most recent 24 movies
    matchedMovies = await db
      .select()
      .from(movies)
      .orderBy(desc(movies.createdAt))
      .limit(24)
  }

  // 2. Fetch categories for matched movies in a optimized single batch query
  const matchedMovieIds = matchedMovies.map(m => m.id)
  const allMovieCats = matchedMovieIds.length > 0 ? await db
    .select({
      movieId: movieCategories.movieId,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
    .where(inArray(movieCategories.movieId, matchedMovieIds)) : []

  const categoryMap: Record<number, { id: number; name: string }[]> = {}
  allMovieCats.forEach((mc: any) => {
    if (!categoryMap[mc.movieId]) {
      categoryMap[mc.movieId] = []
    }
    categoryMap[mc.movieId].push({ id: mc.categoryId, name: mc.categoryName })
  })

  // Format movies structure with categories details
  const formattedMovies = matchedMovies.map((m: any) => ({
    ...m,
    categories: categoryMap[m.id] || [],
  }))

  return (
    <SearchResultsClient
      movies={formattedMovies as any}
      searchQuery={searchQuery}
      locale={locale}
    />
  )
}
