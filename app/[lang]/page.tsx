import * as React from "react"
import { db } from "@/db"
import { movies, categories, movieCategories } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { HomeClient } from "../home-client"
import { type Locale } from "@/lib/translations"

export const dynamic = "force-dynamic"

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  
  // Resolve language and fallback to en if not supported
  const locale: Locale = (lang === "bn" || lang === "hi") ? lang : "en"

  // 1. Fetch categories
  const allCategories = await db.select().from(categories).orderBy(categories.name)

  // 2. Fetch movies
  const allMovies = await db.select().from(movies).orderBy(desc(movies.createdAt))

  // 3. Fetch movie category links
  const movieCats = await db
    .select({
      movieId: movieCategories.movieId,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(movieCategories)
    .innerJoin(categories, eq(movieCategories.categoryId, categories.id))

  // Group category links by movie ID
  const categoryMap: Record<number, { id: number; name: string }[]> = {}
  movieCats.forEach((mc) => {
    if (!categoryMap[mc.movieId]) {
      categoryMap[mc.movieId] = []
    }
    categoryMap[mc.movieId].push({ id: mc.categoryId, name: mc.categoryName })
  })

  // Format movies with their category list
  const moviesWithCategories = allMovies.map((m) => ({
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
