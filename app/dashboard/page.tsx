import * as React from "react"
import { db } from "@/db"
import { users, pages } from "@/db/schema"
import { sql } from "drizzle-orm"
import { FilmIcon, UsersIcon, ShieldAlertIcon, CheckCircle2Icon } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  let userCount = 0
  let pageCount = 0
  let dbStatus = "Connected"
  let dbError = ""

  try {
    const userRes = await db.select({ count: sql<number>`count(*)` }).from(users)
    userCount = userRes[0]?.count || 0

    const pageRes = await db.select({ count: sql<number>`count(*)` }).from(pages)
    pageCount = pageRes[0]?.count || 0
  } catch (error: any) {
    dbStatus = "Error"
    dbError = error.message || "Failed to query database"
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-800 bg-linear-to-r from-violet-950/40 via-slate-900/40 to-cyan-950/40 p-8 shadow-md">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-200 via-slate-100 to-cyan-200 bg-clip-text text-transparent">
          Welcome back, Admin!
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
          Manage your movies app contents, custom pages, redirects, user database and view application telemetry from this control console.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stat card: Users */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 transition-all hover:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">{userCount}</span>
            <span className="text-xs text-slate-500 ml-2">registered</span>
          </div>
        </div>

        {/* Stat card: Pages */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 transition-all hover:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custom Pages</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <FilmIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">{pageCount}</span>
            <span className="text-xs text-slate-500 ml-2">active links</span>
          </div>
        </div>

        {/* Stat card: DB Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 transition-all hover:border-slate-700/60 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Database Status</span>
            <div className={`w-8 h-8 rounded-lg ${dbStatus === "Connected" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"} flex items-center justify-center`}>
              {dbStatus === "Connected" ? <CheckCircle2Icon className="w-4 h-4" /> : <ShieldAlertIcon className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-xl font-bold tracking-tight ${dbStatus === "Connected" ? "text-emerald-400" : "text-red-400"}`}>{dbStatus}</span>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {dbStatus === "Connected" ? "Successfully established connection with MySQL" : dbError}
            </p>
          </div>
        </div>
      </div>

      {/* Database Setup Check & Details */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
        <h2 className="text-lg font-bold text-slate-200">System Telemetry & Connections</h2>
        <div className="mt-4 space-y-3.5 text-sm text-slate-400">
          <div className="flex justify-between items-center py-2 border-b border-slate-900">
            <span>MySQL Host</span>
            <span className="font-mono text-slate-200 text-xs">{process.env.DB_HOST || "127.0.0.1"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-900">
            <span>Database Name</span>
            <span className="font-mono text-slate-200 text-xs">{process.env.DB_NAME || "pagla_movie"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-900">
            <span>Authentication Driver</span>
            <span className="text-slate-200 text-xs">Drizzle + Jose JWT</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>TMDB Integration Status</span>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold">Active Reference</span>
          </div>
        </div>
      </div>
    </div>
  )
}
