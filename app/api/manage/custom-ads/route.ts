import { NextResponse } from "next/server"
import { db } from "@/db"
import { customAds } from "@/db/schema"
import { eq, sql, desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

// Ensure table exists on first query
async function ensureTable() {
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS custom_ads (
      id VARCHAR(191) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)
  } catch (e) {
    // Ignore if table exists or mysql execute error
  }
}

export async function GET() {
  try {
    await ensureTable()
    const adsList = await db.select().from(customAds).orderBy(desc(customAds.createdAt))
    return NextResponse.json({ success: true, ads: adsList })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable()
    let { id, name, code, is_encoded } = await request.json()

    if (!id || !name) {
      return NextResponse.json({ error: "Missing id or name" }, { status: 400 })
    }

    if (is_encoded && code) {
      try {
        code = Buffer.from(code, "base64").toString("utf-8")
      } catch {
        // Keep as is
      }
    }

    // Check if exists
    const existing = await db.select().from(customAds).where(eq(customAds.id, id)).then((r: any) => r[0])

    if (existing) {
      await db.update(customAds)
        .set({
          name: name,
          code: code || ""
        })
        .where(eq(customAds.id, id))
    } else {
      await db.insert(customAds).values({
        id: id,
        name: name,
        code: code || ""
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureTable()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing ad id" }, { status: 400 })
    }

    await db.delete(customAds).where(eq(customAds.id, id))
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
