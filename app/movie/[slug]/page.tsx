import * as React from "react"
import { db } from "@/db"
import { movies, categories, movieCategories } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { notFound } from "next/navigation"
import { MovieDetailClient } from "@/app/movie/[slug]/movie-detail-client"

export const dynamic = "force-dynamic"

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!slug) {
    notFound()
  }

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

  // 3. Fetch all other movies to show in "Related" row
  const allMovies = await db.select().from(movies).orderBy(desc(movies.createdAt))

  // Fetch movie category links for all movies to compute related items
  const allMovieCats = await db
    .select({
      movieId: movieCategories.movieId,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))

  const categoryMap: Record<number, { id: number; name: string }[]> = {}
  allMovieCats.forEach((mc) => {
    if (!categoryMap[mc.movieId]) {
      categoryMap[mc.movieId] = []
    }
    categoryMap[mc.movieId].push({ id: mc.categoryId, name: mc.categoryName })
  })

  // Format movies with their categories
  const formattedMovies = allMovies.map((m) => ({
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
    />
  )
}
