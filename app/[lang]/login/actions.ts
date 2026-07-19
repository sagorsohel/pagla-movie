"use server"

import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { verifyPassword, signJWT, setAuthCookie } from "@/lib/auth"

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    // Fetch user from DB
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return { error: "Invalid email or password" }
    }

    // Check role (only admin can login to dashboard)
    if (user.role !== "admin") {
      return { error: "Access denied. Admins only." }
    }

    // Generate JWT
    const token = await signJWT({ id: user.id, email: user.email, role: user.role })

    // Set Cookie
    await setAuthCookie(token)

    return { success: true }
  } catch (error) {
    console.error("Login action error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
