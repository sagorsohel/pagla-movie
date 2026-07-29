import { scrapeLastMonthMovies } from "./tmdb-scraper"

/* eslint-disable no-var */
declare global {
  var cronStarted: boolean | undefined
}
/* eslint-enable no-var */

let isRunning = false
let lastRunDate = ""

export function startDailyCron() {
  if (globalThis.cronStarted) return
  globalThis.cronStarted = true

  console.log("⏰ Daily 3:00 AM TMDB Movie Auto-Sync Scheduler Started.")

  // Check every 30 seconds
  setInterval(async () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

    // Trigger at 3:00 AM daily (03:00) once per day
    if (hours === 3 && minutes === 0 && lastRunDate !== todayStr && !isRunning) {
      lastRunDate = todayStr
      isRunning = true
      console.log(`[DAILY CRON - 03:00 AM ${todayStr}] Fetching new movies from TMDB into DB...`)
      try {
        await scrapeLastMonthMovies(1, 5)
        console.log(`[DAILY CRON - 03:00 AM ${todayStr}] New TMDB movies successfully added to database.`)
      } catch (err) {
        console.error(`[DAILY CRON ERROR] TMDB auto-sync failed:`, err)
      } finally {
        isRunning = false
      }
    }
  }, 30000)
}

// Auto-start cron when module is loaded
startDailyCron()
