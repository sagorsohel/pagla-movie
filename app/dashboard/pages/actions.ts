"use server"

import { db } from "@/db"
import { pages } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

export async function createPageAction(prevState: any, formData: FormData) {
  const title = formData.get("title") as string
  const slug = formData.get("slug") as string
  const redirectUrl = formData.get("redirectUrl") as string
  const redirectTimeStr = formData.get("redirectTime") as string

  if (!title || !slug) {
    return { error: "Title and slug are required" }
  }

  const redirectTime = redirectTimeStr ? parseInt(redirectTimeStr) : 5

  try {
    await db.insert(pages).values({
      title,
      slug,
      redirectUrl,
      redirectTime,
    })
    revalidatePath("/dashboard/pages")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to create page:", error)
    if (error.code === "ER_DUP_ENTRY") {
      return { error: "A page with this slug already exists" }
    }
    return { error: error.message || "Failed to create page in database" }
  }
}

export async function deletePageAction(id: number) {
  try {
    await db.delete(pages).where(eq(pages.id, id))
    revalidatePath("/dashboard/pages")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete page:", error)
    return { error: error.message || "Failed to delete page" }
  }
}
