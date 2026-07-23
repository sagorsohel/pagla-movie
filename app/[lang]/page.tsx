import * as React from "react"
import { db } from "@/db"
import { movies, categories, movieCategories } from "@/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import { HomeClient } from "../home-client"
import { type Locale, LANGUAGES } from "@/lib/translations"

export const revalidate = 3600 // Incremental Static Regeneration (ISR) - cache page for 1 hour

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  
  // Resolve language and fallback to en if not supported
  const locale: Locale = LANGUAGES.some(l => l.code === lang) ? (lang as Locale) : "en"

  // 1. Fetch categories & top 60 recent movies concurrently for super fast render
  const [allCategories, allMovies] = await Promise.all([
    db.select().from(categories).orderBy(categories.name),
    db.select().from(movies).orderBy(desc(movies.createdAt)).limit(60),
  ])

  // 3. Fetch category links for the loaded movies
  const movieIds = allMovies.map((m: any) => m.id)
  const movieCats = movieIds.length > 0 ? await db
    .select({
      movieId: movieCategories.movieId,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))
    .where(inArray(movieCategories.movieId, movieIds)) : []

  // Group category links by movie ID
  const categoryMap: Record<number, { id: number; name: string }[]> = {}
  movieCats.forEach((mc: any) => {
    if (!categoryMap[mc.movieId]) {
      categoryMap[mc.movieId] = []
    }
    categoryMap[mc.movieId].push({ id: mc.categoryId, name: mc.categoryName })
  })

  // Format movies with their category list
  const moviesWithCategories = allMovies.map((m: any) => ({
    ...m,
    categories: categoryMap[m.id] || [],
  }))

  return (
    <HomeClient
      movies={moviesWithCategories as any}
      categories={allCategories}
      locale={locale}
    />
  )
}
