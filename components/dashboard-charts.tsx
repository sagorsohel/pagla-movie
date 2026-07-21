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
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold font-mono">
              <SparklesIcon className="w-3.5 h-3.5 text-cyan-600" />
              <span>Admin Telemetry Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, Administrator
            </h1>
            <p className="text-xs md:text-sm text-slate-500 max-w-xl leading-relaxed">
              Overview of your streaming metrics, active movies catalog, user database, and system status telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/movies"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-xs transition-all shadow-md active:scale-95"
            >
              <FilmIcon className="w-4 h-4" />
              <span>Manage Movies</span>
            </Link>
            <Link
              href="/dashboard/ads/layout"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xs transition-all active:scale-95"
            >
              <SlidersHorizontalIcon className="w-4 h-4 text-cyan-600" />
              <span>Drag & Drop Ads</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Movies */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-cyan-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Total Movies
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 group-hover:scale-105 transition-transform">
              <FilmIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {movieCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUpIcon className="w-3 h-3" /> Live
            </span>
          </div>
        </div>

        {/* Card 2: Categories */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-cyan-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Categories
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
              <FolderOpenIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {categoryCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
        </div>

        {/* Card 3: Tags */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-cyan-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Genre Tags
            </span>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 group-hover:scale-105 transition-transform">
              <TagIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {tagCount}
            </span>
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded">
              Mapped
            </span>
          </div>
        </div>

        {/* Card 4: Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-cyan-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Registered Users
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {userCount}
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              Members
            </span>
          </div>
        </div>

        {/* Card 5: Pages */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs hover:border-cyan-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              CMS Pages
            </span>
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 group-hover:scale-105 transition-transform">
              <FileTextIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {pageCount}
            </span>
            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded">
              Published
            </span>
          </div>
        </div>
      </div>

      {/* Main Analytics Graph Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-cyan-600" />
                Traffic & Streaming Telemetry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time daily page views vs video playback sessions.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveTab("7d")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === "7d"
                      ? "bg-white text-cyan-700 shadow-2xs border border-slate-200 font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setActiveTab("30d")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === "30d"
                      ? "bg-white text-cyan-700 shadow-2xs border border-slate-200 font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>

          {/* Bar / Area Visual Chart */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-end gap-6 text-xs font-mono font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-cyan-500" />
                <span className="text-slate-600">Page Views</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-600">Video Streams</span>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-slate-100">
              {chartData.map((d, idx) => {
                const viewsPct = Math.round((d.views / maxVal) * 100)
                const streamsPct = Math.round((d.streams / maxVal) * 100)

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Views bar */}
                      <div
                        className="w-1/2 max-w-[20px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:brightness-110 relative"
                        style={{ height: `${viewsPct}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-20">
                          {d.views.toLocaleString()}
                        </div>
                      </div>

                      {/* Streams bar */}
                      <div
                        className="w-1/2 max-w-[20px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 group-hover:brightness-110 relative"
                        style={{ height: `${streamsPct}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-20">
                          {d.streams.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold tracking-tight">
                      {d.day}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: System Telemetry (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono flex items-center gap-2">
              <ServerIcon className="w-4 h-4 text-cyan-600" />
              System Status Telemetry
            </h3>

            <div className="space-y-3 pt-2">
              {/* MySQL Status */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Database Engine</div>
                    <div className="text-[10px] text-slate-500 font-mono">MySQL / Drizzle ORM</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded">
                  {dbStatus === "connected" ? "Connected" : "Error"}
                </span>
              </div>

              {/* CDN & Edge */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">CDN & Asset Storage</div>
                    <div className="text-[10px] text-slate-500 font-mono">TMDB API & Local Uploads</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded">
                  Operational
                </span>
              </div>

              {/* Server Response Latency */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Next.js App Router</div>
                    <div className="text-[10px] text-slate-500 font-mono">Latency ~ 18ms</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-cyan-50 border border-cyan-200 text-cyan-700 px-2 py-0.5 rounded">
                  Fast
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">
              Recently Uploaded Movies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest movies added to your database catalog.</p>
          </div>
          <Link
            href="/dashboard/movies"
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Poster & Movie Title</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Release Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-12 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {movie.posterPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold">
                            No Poster
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">{movie.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-500">
                    ★ {movie.voteAverage || "N/A"}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {movie.releaseDate || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/dashboard/movies/${movie.id}`}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-all inline-flex items-center gap-1"
                    >
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
