import { NextResponse } from "next/server"
import { scrapeLastMonthMovies } from "@/lib/tmdb-scraper"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")
    
    // Optional secret token check if configured
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[CRON API] Triggering TMDB daily movie sync...")
    await scrapeLastMonthMovies(1, 5)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Daily 3:00 AM TMDB movie sync executed successfully."
    })
  } catch (err: any) {
    console.error("[CRON API ERROR]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
