import * as React from "react"
import { db } from "@/db"
import { users, pages, movies, categories, tags } from "@/db/schema"
import { sql, desc } from "drizzle-orm"
import { DashboardCharts } from "@/components/dashboard-charts"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  let userCount = 0
  let pageCount = 0
  let movieCount = 0
  let categoryCount = 0
  let tagCount = 0
  let dbStatus = "Connected"
  let dbError = ""
  let recentMoviesList: any[] = []

  try {
    const userRes = await db.select({ count: sql<number>`count(*)` }).from(users)
    userCount = Number(userRes[0]?.count || 0)

    const pageRes = await db.select({ count: sql<number>`count(*)` }).from(pages)
    pageCount = Number(pageRes[0]?.count || 0)

    const movieRes = await db.select({ count: sql<number>`count(*)` }).from(movies)
    movieCount = Number(movieRes[0]?.count || 0)

    const catRes = await db.select({ count: sql<number>`count(*)` }).from(categories)
    categoryCount = Number(catRes[0]?.count || 0)

    const tagRes = await db.select({ count: sql<number>`count(*)` }).from(tags)
    tagCount = Number(tagRes[0]?.count || 0)

    recentMoviesList = await db
      .select({
        id: movies.id,
        title: movies.title,
        posterPath: movies.posterPath,
        releaseDate: movies.releaseDate,
        voteAverage: movies.voteAverage,
        createdAt: movies.createdAt,
      })
      .from(movies)
      .orderBy(desc(movies.createdAt))
      .limit(5)
  } catch (error: any) {
    dbStatus = "Error"
    dbError = error.message || "Failed to query database"
  }

  return (
    <DashboardCharts
      movieCount={movieCount}
      categoryCount={categoryCount}
      tagCount={tagCount}
      userCount={userCount}
      pageCount={pageCount}
      dbStatus={dbStatus}
      dbError={dbError}
      recentMovies={recentMoviesList}
    />
  )
}
