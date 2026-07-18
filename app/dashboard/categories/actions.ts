"use server"

import { db } from "@/db"
import { categories } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateCategoryAction(prevState: any, formData: FormData) {
  const idStr = formData.get("id") as string
  const referralUrl = formData.get("referralUrl") as string
  const modalImage = formData.get("modalImage") as string
  const topAds = formData.get("topAds") as string
  const modalAds = formData.get("modalAds") as string

  if (!idStr) {
    return { error: "Category ID is required" }
  }

  const id = parseInt(idStr)

  try {
    await db
      .update(categories)
      .set({
        referralUrl: referralUrl || null,
        modalImage: modalImage || null,
        topAds: topAds || null,
        modalAds: modalAds || null,
      })
      .where(eq(categories.id, id))

    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update category:", error)
    return { error: error.message || "Failed to update category details." }
  }
}
