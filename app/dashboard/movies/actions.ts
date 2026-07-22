"use server"

import { db } from "@/db"
import { movies, movieTags } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { scrapeLastMonthMovies } from "@/lib/tmdb-scraper"

export async function updateMovieAction(prevState: any, formData: FormData) {
  const idStr = formData.get("id") as string
  const referralUrl = formData.get("referralUrl") as string
  const modalImage = formData.get("modalImage") as string
  const redirectUrl = formData.get("redirectUrl") as string
  const redirectTimeStr = formData.get("redirectTime") as string
  const topAds = formData.get("topAds") as string
  const modalAds = formData.get("modalAds") as string
  
  // Get all checked tag IDs from the form
  const selectedTagIds = formData.getAll("tagIds").map(Number)

  if (!idStr) {
    return { error: "Movie ID is required" }
  }

  const id = parseInt(idStr)
  const redirectTime = redirectTimeStr ? parseInt(redirectTimeStr) : 5

  try {
    // 1. Update basic movie fields
    await db
      .update(movies)
      .set({
        referralUrl: referralUrl || null,
        modalImage: modalImage || null,
        topAds: topAds || null,
        modalAds: modalAds || null,
        redirectUrl: redirectUrl || null,
        redirectTime: isNaN(redirectTime) ? 5 : redirectTime,
      })
      .where(eq(movies.id, id))

    // 2. Clear existing tags and link new ones
    await db.delete(movieTags).where(eq(movieTags.movieId, id))
    for (const tagId of selectedTagIds) {
      if (!isNaN(tagId)) {
        await db.insert(movieTags).values({
          movieId: id,
          tagId,
        })
      }
    }

    revalidatePath("/dashboard/movies")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update movie:", error)
    return { error: error.message || "Failed to update movie details." }
  }
}

export async function runMovieImportAction(pages: number = 10) {
  try {
    const result = await scrapeLastMonthMovies(pages)
    revalidatePath("/dashboard/movies")
    return result
  } catch (error: any) {
    console.error("Scraper run failed:", error)
    return { error: error.message || "Scraper failed to execute." }
  }
}
