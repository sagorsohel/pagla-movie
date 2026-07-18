"use server"

import { db } from "@/db"
import { tags } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export async function createTagAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const referralUrl = formData.get("referralUrl") as string
  const modalImage = formData.get("modalImage") as string

  if (!name) {
    return { error: "Tag name is required" }
  }

  const slug = slugify(name)

  try {
    await db.insert(tags).values({
      name,
      slug,
      referralUrl: referralUrl || null,
      modalImage: modalImage || null,
    })
    revalidatePath("/dashboard/tags")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to create tag:", error)
    if (error.code === "ER_DUP_ENTRY") {
      return { error: "A tag with this name/slug already exists" }
    }
    return { error: error.message || "Failed to create tag." }
  }
}

export async function updateTagAction(prevState: any, formData: FormData) {
  const idStr = formData.get("id") as string
  const referralUrl = formData.get("referralUrl") as string
  const modalImage = formData.get("modalImage") as string

  if (!idStr) {
    return { error: "Tag ID is required" }
  }

  const id = parseInt(idStr)

  try {
    await db
      .update(tags)
      .set({
        referralUrl: referralUrl || null,
        modalImage: modalImage || null,
      })
      .where(eq(tags.id, id))

    revalidatePath("/dashboard/tags")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update tag:", error)
    return { error: error.message || "Failed to update tag details." }
  }
}

export async function deleteTagAction(id: number) {
  try {
    await db.delete(tags).where(eq(tags.id, id))
    revalidatePath("/dashboard/tags")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete tag:", error)
    return { error: error.message || "Failed to delete tag." }
  }
}
