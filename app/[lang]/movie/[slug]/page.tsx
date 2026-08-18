import * as React from "react"
import { cache } from "react"
import { unstable_cache } from "next/cache"
import type { Metadata } from "next"
import { db } from "@/db"
import { movies, categories, movieCategories } from "@/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import { notFound } from "next/navigation"
import { MovieDetailClient } from "../../../movie/[slug]/movie-detail-client"
import { type Locale, LANGUAGES } from "@/lib/translations"

export const revalidate = 86400 // Incremental Static Regeneration (ISR) - cache page for 24 hours

// Per-request cached & server-data-cached movie detail fetcher
const getMovieDetailData = cache(async (slug: string) => {
  if (!slug) return null

  return unstable_cache(
    async () => {
      // 1. Fetch main movie details
      let [movieData] = await db.select().from(movies).where(eq(movies.slug, slug)).limit(1)
      if (!movieData) {
        const movieId = parseInt(slug)
        if (!isNaN(movieId)) {
          ;[movieData] = await db.select().from(movies).where(eq(movies.id, movieId)).limit(1)
        }
      }

      if (!movieData) return null

      const movieId = movieData.id

      // 2. Concurrently fetch categories and recent movies (pruned to 16 for faster payload)
      const [movieCats, allMovies] = await Promise.all([
        db
          .select({
            id: categories.id,
            name: categories.name,
          })
          .from(movieCategories)
          .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
          .where(eq(movieCategories.movieId, movieId)),

        db
          .select({
            id: movies.id,
            title: movies.title,
            slug: movies.slug,
            posterPath: movies.posterPath,
            releaseDate: movies.releaseDate,
            voteAverage: movies.voteAverage,
          })
          .from(movies)
          .orderBy(desc(movies.createdAt))
          .limit(16),
      ])

      // 3. Fetch category links for the loaded recent movies
      const recentMovieIds = allMovies.map((m: any) => m.id)
      const allMovieCats =
        recentMovieIds.length > 0
          ? await db
              .select({
                movieId: movieCategories.movieId,
                categoryId: categories.id,
                categoryName: categories.name,
              })
              .from(movieCategories)
              .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
              .where(inArray(movieCategories.movieId, recentMovieIds))
          : []

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

      return {
        movieWithRelations,
        formattedMovies,
      }
    },
    ["movie-detail-data-v2", slug],
    {
      revalidate: 86400, // Cache in Next.js Data Cache for 24 hours
      tags: [`movie-${slug}`],
    }
  )()
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getMovieDetailData(slug)

  if (!data || !data.movieWithRelations) {
    return {
      title: "CineMovies - Watch Unlimited Movies & TV Shows in 4K UHD",
    }
  }

  const movieData = data.movieWithRelations
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

  const locale: Locale = LANGUAGES.some(l => l.code === lang) ? (lang as Locale) : "en"

  // Fetch movie details via cache (unstable_cache + React cache)
  const data = await getMovieDetailData(slug)

  if (!data || !data.movieWithRelations) {
    notFound()
  }

  return (
    <MovieDetailClient
      movie={data.movieWithRelations as any}
      allMovies={data.formattedMovies as any}
      locale={locale}
    />
  )
}
