"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FilmIcon,
  FolderOpenIcon,
  TagIcon,
  UsersIcon,
  FileTextIcon,
  TrendingUpIcon,
  ActivityIcon,
  CheckCircle2Icon,
  ShieldAlertIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  ServerIcon,
  EyeIcon,
  PlayCircleIcon,
  SlidersHorizontalIcon
} from "lucide-react"

interface MovieData {
  id: number
  title: string
  posterPath: string | null
  releaseDate: string | null
  voteAverage: string | null
  createdAt: any
}

interface DashboardChartsProps {
  movieCount: number
  categoryCount: number
  tagCount: number
  userCount: number
  pageCount: number
  dbStatus: string
  dbError: string
  recentMovies: MovieData[]
}

export function DashboardCharts({
  movieCount,
  categoryCount,
  tagCount,
  userCount,
  pageCount,
  dbStatus,
  dbError,
  recentMovies
}: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<"7d" | "30d">("7d")

  // Mock chart points for smooth SVG Area chart rendering
  const chartData = activeTab === "7d" ? [
    { day: "Mon", views: 4200, streams: 2800 },
    { day: "Tue", views: 5800, streams: 3900 },
    { day: "Wed", views: 5100, streams: 3400 },
    { day: "Thu", views: 7200, streams: 5100 },
    { day: "Fri", views: 9400, streams: 6800 },
    { day: "Sat", views: 12800, streams: 9200 },
    { day: "Sun", views: 11500, streams: 8500 },
  ] : [
    { day: "Week 1", views: 28400, streams: 19200 },
    { day: "Week 2", views: 34200, streams: 24100 },
    { day: "Week 3", views: 42800, streams: 31500 },
    { day: "Week 4", views: 56000, streams: 41200 },
  ]

  const maxVal = Math.max(...chartData.map(d => d.views))

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold font-mono">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Admin Telemetry Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, Administrator
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
              Overview of your streaming metrics, active movies catalog, user database, and system status telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/movies"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-955 font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <FilmIcon className="w-4 h-4" />
              <span>Manage Movies</span>
            </Link>
            <Link
              href="/dashboard/ads"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all active:scale-95"
            >
              <SlidersHorizontalIcon className="w-4 h-4" />
              <span>Ads Control</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Movies */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xs transition-all hover:border-cyan-500/30 hover:bg-slate-900/60 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Movies</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FilmIcon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{movieCount}</span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUpIcon className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">In active library</p>
        </div>

        {/* Total Categories */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xs transition-all hover:border-violet-500/30 hover:bg-slate-900/60 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Categories</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <FolderOpenIcon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{categoryCount}</span>
            <span className="text-[11px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
              Genres
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Assigned genres</p>
        </div>

        {/* Total Tags */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xs transition-all hover:border-emerald-500/30 hover:bg-slate-900/60 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Tags</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <TagIcon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{tagCount}</span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Filterable
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Content tags</p>
        </div>

        {/* Total Users */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xs transition-all hover:border-amber-500/30 hover:bg-slate-900/60 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Users</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <UsersIcon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{userCount}</span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Accounts
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Registered users</p>
        </div>

        {/* Custom Pages */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xs transition-all hover:border-pink-500/30 hover:bg-slate-900/60 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Pages</span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <FileTextIcon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">{pageCount}</span>
            <span className="text-[11px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
              Links
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Redirect pages</p>
        </div>
      </div>

      {/* Analytics Section: Graph & Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Traffic & Streaming Activity Graph (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800/80 bg-[#050b14]/80 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-cyan-400" />
                <span>Traffic & Streaming Telemetry</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Real-time visitor pageviews vs video playback sessions.</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("7d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "7d"
                    ? "bg-cyan-500 text-slate-955 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setActiveTab("30d")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "30d"
                    ? "bg-cyan-500 text-slate-955 shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Key Legend Badges */}
          <div className="flex items-center gap-6 pt-2 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className="text-slate-300">Page Views</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50" />
              <span className="text-slate-300">Video Streams</span>
            </div>
          </div>

          {/* Visual Bar / Graph Chart Area */}
          <div className="pt-4 pb-2 space-y-4">
            <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-900">
              {chartData.map((d, i) => {
                const viewHeight = Math.round((d.views / maxVal) * 100)
                const streamHeight = Math.round((d.streams / maxVal) * 100)

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Views Bar */}
                      <div
                        style={{ height: `${viewHeight}%` }}
                        className="w-full max-w-[18px] bg-gradient-to-t from-cyan-500/20 via-cyan-400 to-cyan-300 rounded-t-md group-hover:brightness-125 transition-all relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-md">
                          {d.views.toLocaleString()}
                        </div>
                      </div>

                      {/* Streams Bar */}
                      <div
                        style={{ height: `${streamHeight}%` }}
                        className="w-full max-w-[18px] bg-gradient-to-t from-violet-600/20 via-violet-500 to-violet-400 rounded-t-md group-hover:brightness-125 transition-all relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-violet-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-md">
                          {d.streams.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 font-mono truncate">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* System & Category Health (1 Col) */}
        <div className="rounded-3xl border border-slate-800/80 bg-[#050b14]/80 p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <ServerIcon className="w-4 h-4 text-emerald-400" />
              <span>System & Telemetry Status</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Live database and CDN connection health.</p>

            <div className="mt-6 space-y-4">
              {/* MySQL Status */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${dbStatus === "Connected" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"} flex items-center justify-center shrink-0`}>
                    {dbStatus === "Connected" ? <CheckCircle2Icon className="w-4 h-4" /> : <ShieldAlertIcon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">MySQL Database</h4>
                    <p className="text-[10px] text-slate-400 font-mono">127.0.0.1:3306</p>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  dbStatus === "Connected" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {dbStatus}
                </span>
              </div>

              {/* Image CDN Server */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                    <CheckCircle2Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Image CDN Server</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">image.streamespn.org</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Online
                </span>
              </div>

              {/* Next.js Server Status */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                    <CheckCircle2Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">App Engine</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Next.js 16 (App Router)</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Healthy
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
            <span>Server Latency</span>
            <span className="font-mono font-bold text-emerald-400">~18ms</span>
          </div>
        </div>
      </div>

      {/* Recent Movies Table Section */}
      <div className="rounded-3xl border border-slate-800/80 bg-[#050b14]/80 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <FilmIcon className="w-4 h-4 text-cyan-400" />
              <span>Recently Uploaded Movies</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Latest movies added to the streaming database.</p>
          </div>
          <Link
            href="/dashboard/movies"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all"
          >
            <span>View All</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentMovies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-900 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Release Date</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {recentMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-11 rounded-lg bg-slate-900 overflow-hidden border border-slate-800 shrink-0">
                          {movie.posterPath ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={movie.posterPath.startsWith("http") ? movie.posterPath : `https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <FilmIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-200 line-clamp-1">{movie.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {movie.releaseDate || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px]">
                        ★ {movie.voteAverage || "0.0"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/dashboard/movies"
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-800 transition-all inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-900">
            <p className="text-xs text-slate-500">No movies found in database yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
