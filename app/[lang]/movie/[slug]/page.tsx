import * as React from "react"
import type { Metadata } from "next"
import { db } from "@/db"
import { movies, categories, movieCategories } from "@/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import { notFound } from "next/navigation"
import { MovieDetailClient } from "../../../movie/[slug]/movie-detail-client"
import { type Locale, LANGUAGES } from "@/lib/translations"

export const revalidate = 86400 // Incremental Static Regeneration (ISR) - cache page for 24 hours

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!slug) return {}

  let [movieData] = await db
    .select({ title: movies.title, overview: movies.overview, posterPath: movies.posterPath })
    .from(movies)
    .where(eq(movies.slug, slug))
    .limit(1)

  if (!movieData) {
    const movieId = parseInt(slug)
    if (!isNaN(movieId)) {
      ;[movieData] = await db
        .select({ title: movies.title, overview: movies.overview, posterPath: movies.posterPath })
        .from(movies)
        .where(eq(movies.id, movieId))
        .limit(1)
    }
  }

  if (!movieData) {
    return {
      title: "CineMovies - Watch Unlimited Movies & TV Shows in 4K UHD",
    }
  }

  const title = `${movieData.title} - CineMovies - Watch Unlimited Movies & TV Shows in 4K UHD`

  return {
    title,
    description: movieData.overview || undefined,
    openGraph: {
      title,
      description: movieData.overview || undefined,
      images: movieData.posterPath ? [movieData.posterPath] : undefined,
    },
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params

  if (!slug) {
    notFound()
  }

  // Resolve language and fallback to en if not supported
  const locale: Locale = LANGUAGES.some(l => l.code === lang) ? (lang as Locale) : "en"

  // 1. Fetch the movie details by slug (fallback to ID if not found)
  let [movieData] = await db.select().from(movies).where(eq(movies.slug, slug)).limit(1)
  if (!movieData) {
    const movieId = parseInt(slug)
    if (!isNaN(movieId)) {
      ;[movieData] = await db.select().from(movies).where(eq(movies.id, movieId)).limit(1)
    }
  }

  if (!movieData) {
    notFound()
  }

  const movieId = movieData.id

  // 2. Fetch categories for this movie
  const movieCats = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
    .where(eq(movieCategories.movieId, movieId))

  // 3. Fetch recent 30 movies to show in "Related" row (optimized database load)
  const allMovies = await db.select().from(movies).orderBy(desc(movies.createdAt)).limit(30)

  // Fetch movie category links only for the loaded recent movies
  const recentMovieIds = allMovies.map((m: any) => m.id)
  const allMovieCats = recentMovieIds.length > 0 ? await db
    .select({
      movieId: movieCategories.movieId,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
    .where(inArray(movieCategories.movieId, recentMovieIds)) : []

  const categoryMap: Record<number, { id: number; name: string }[]> = {}
  allMovieCats.forEach((mc: any) => {
    if (!categoryMap[mc.movieId]) {
      categoryMap[mc.movieId] = []
    }
    categoryMap[mc.movieId].push({ id: mc.categoryId, name: mc.categoryName })
  })

  // Format movies with their categories
  const formattedMovies = allMovies.map((m: any) => ({
    ...m,
    categories: categoryMap[m.id] || [],
  }))

  const movieWithRelations = {
    ...movieData,
    categories: movieCats,
  }

  return (
    <MovieDetailClient
      movie={movieWithRelations as any}
      allMovies={formattedMovies as any}
      locale={locale}
    />
  )
}
