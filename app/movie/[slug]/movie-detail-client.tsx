"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdCard from "@/components/ad-card"
import { CineMoviesLogo } from "@/components/logo"
import { getImageUrl } from "@/lib/utils"
import {
  PlayIcon,
  ChevronLeftIcon,
  ExternalLinkIcon,
  BellIcon,
  SearchIcon,
  PlusIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  Share2Icon,
  X,
} from "lucide-react"

type Movie = {
  id: number
  tmdbId: number
  title: string
  slug?: string | null
  overview: string | null
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string | null
  voteAverage: string | null
  referralUrl: string | null
  modalImage: string | null
  topAds: string | null
  modalAds: string | null
  redirectUrl: string | null
  redirectTime: number | null
  categories: { id: number; name: string }[]
  videos?: any
  cast?: any
  crew?: any
}

function AdScriptContainer({ scriptHtml, className }: { scriptHtml?: string; className?: string }) {
  if (!scriptHtml) return null

  let width = "100%"
  let height = "60px"
  if (scriptHtml.includes("atOptions")) {
    const widthMatch = scriptHtml.match(/'width'\s*:\s*(\d+)/)
    const heightMatch = scriptHtml.match(/'height'\s*:\s*(\d+)/)
    if (widthMatch && widthMatch[1]) width = `${widthMatch[1]}px`
    if (heightMatch && heightMatch[1]) height = `${heightMatch[1]}px`
  }

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html style="color-scheme: dark;">
      <head>
        <meta name="color-scheme" content="dark">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: transparent !important;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        ${scriptHtml}
      </body>
    </html>
  `

  return (
    <div className={`${className} flex justify-center items-center overflow-hidden bg-transparent w-full`}>
      <iframe
        srcDoc={iframeSrcDoc}
        width={width}
        height={height}
        style={{ border: "none", overflow: "hidden", background: "transparent" }}
        scrolling="no"
        title="Ad Space"
        allowTransparency={true}
      />
    </div>
  )
}

export function MovieDetailClient({
  movie,
  allMovies,
}: {
  movie: Movie
  allMovies: Movie[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"related" | "details">("related")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showInlineSignup, setShowInlineSignup] = useState(false)
  const [countdown, setCountdown] = useState(movie.redirectTime || 5)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalReason, setAuthModalReason] = useState<"watch" | "download">("watch")

  const handlePlayMovie = () => {
    setIsPlaying(true)
    setShowInlineSignup(false)
    setCountdown(movie.redirectTime || 5)
  }

  const handleSignUpClick = () => {
    const url = movie.redirectUrl || movie.referralUrl
    if (url) {
      window.open(url, "_blank")
    } else {
      alert("Playing: " + movie.title)
    }
  }

  useEffect(() => {
    if (!isPlaying) return

    // Show signup locker after 2 seconds
    const signupTimer = setTimeout(() => {
      setShowInlineSignup(true)
    }, 2000)

    // Countdown to redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Redirect when countdown finishes
          const url = movie.redirectUrl || movie.referralUrl
          if (url) {
            window.open(url, "_blank")
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(signupTimer)
      clearInterval(interval)
    }
  }, [isPlaying, movie])

  const [adsConfig, setAdsConfig] = useState<any>(null)

  useEffect(() => {
    fetch("/api/manage/ads")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ads) {
          setAdsConfig(data.ads)
        }
      })
      .catch(() => {})
  }, [])
  const [topAdHtml, setTopAdHtml] = useState<string>("")

  useEffect(() => {
    // If movie has topAds, use it directly (no loop)
    if (movie.topAds && movie.topAds.trim() !== "") {
      setTopAdHtml(movie.topAds)
      return
    }

    // Otherwise, check for global hero ads
    if (!adsConfig) return

    const hero = adsConfig.heroAds || ""
    const hero2 = adsConfig.hero2Ads || ""

    if (!hero && !hero2) {
      setTopAdHtml("")
      return
    }
    if (hero && !hero2) {
      setTopAdHtml(hero)
      return
    }
    if (!hero && hero2) {
      setTopAdHtml(hero2)
      return
    }

    // Both exist, run the loop: hero for 40s, hero2 for 20s
    let isHeroActive = true
    setTopAdHtml(hero)

    let timeoutId: any

    const tick = () => {
      isHeroActive = !isHeroActive
      setTopAdHtml(isHeroActive ? hero : hero2)
      const duration = isHeroActive ? 40000 : 20000
      timeoutId = setTimeout(tick, duration)
    }

    timeoutId = setTimeout(tick, 40000) // Start with 40s for hero

    return () => {
      clearTimeout(timeoutId)
    }
  }, [movie.topAds, adsConfig])

  // Find related movies
  const relatedMovies = useMemo(() => {
    const filtered = allMovies.filter(
      (m) =>
        m.id !== movie.id &&
        m.categories.some((catA) => movie.categories.some((catB) => catB.id === catA.id))
    )
    if (filtered.length === 0) {
      return allMovies.filter((m) => m.id !== movie.id).slice(0, 12)
    }
    return filtered.slice(0, 12)
  }, [movie, allMovies])

  // Cast and crew lists parsing
  const castList = useMemo(() => {
    if (!movie.cast) return []
    return typeof movie.cast === "string" ? JSON.parse(movie.cast) : movie.cast
  }, [movie])

  const crewList = useMemo(() => {
    if (!movie.crew) return []
    return typeof movie.crew === "string" ? JSON.parse(movie.crew) : movie.crew
  }, [movie])

  const directors = useMemo(() => {
    return crewList.filter((c: any) => c.job === "Director")
  }, [crewList])

  const producers = useMemo(() => {
    return crewList.filter((c: any) => c.job === "Producer" || c.job === "Executive Producer")
  }, [crewList])

  return (
    <div className="min-h-screen text-slate-100 bg-background relative font-sans antialiased pb-20 selection:bg-red-600 selection:text-white">
      
      {/* Navbar header */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-slate-900/60 py-3 px-4 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4" /> Back to Home
          </button>
          
          <Link href="/" className="hidden sm:block">
            <CineMoviesLogo />
          </Link>
        </div>

        {/* User profile option */}
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition relative">
            <BellIcon className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1 focus:outline-hidden group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                alt="Profile"
                className="w-8 h-8 rounded-md object-cover border border-slate-800 group-hover:border-slate-500 transition"
              />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-850 bg-popover p-2 shadow-2xl animate-in fade-in duration-200">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900/40 hover:text-white transition"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/login"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900/40 hover:text-white transition border-t border-slate-800/40"
                >
                  Log Out
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Billboard Header (Full Page Style / Player) */}
      <div className="relative w-full min-h-[90vh] md:min-h-screen bg-slate-950 flex items-center overflow-hidden border-b border-slate-900/50">
        
        {isPlaying ? (
          /* Video Player View */
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between bg-black z-20 select-none">
            {/* Shifting Gradient Colors (movie projection light) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-red-700 to-zinc-900 opacity-20 blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />

            {showInlineSignup ? (
              /* Inline Signup Locker Overlay */
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/95 p-6 z-25">
                {/* Background image fade */}
                {(movie.backdropPath || adsConfig?.globalBg) && (
                  <div className="absolute inset-0 select-none pointer-events-none z-0">
                    <img
                      src={movie.backdropPath ? `https://image.tmdb.org/t/p/original${movie.backdropPath}` : getImageUrl(adsConfig.globalBg)}
                      alt=""
                      className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-zinc-950/40" />
                  </div>
                )}

                {/* Locker Card */}
                <div className="relative z-10 w-full max-w-md bg-black/60 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-center">
                    <div className="p-3 bg-red-600/10 rounded-full border border-red-500/20 text-red-500 animate-bounce">
                      <PlayIcon className="w-6 h-6 fill-current" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-white tracking-tight uppercase">
                      Create a Free Account
                    </h3>
                    <p className="text-xs text-slate-455 font-semibold leading-relaxed">
                      Sign up to unlock the high-speed 4K UHD streaming server for <span className="text-red-500 font-bold">{movie.title}</span>.
                    </p>
                  </div>

                  {/* Countdown Status */}
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    {countdown > 0 ? (
                      <span>Redirecting in <span className="text-red-500 font-bold">{countdown}s</span>...</span>
                    ) : (
                      <span className="text-green-500 font-bold">Redirecting...</span>
                    )}
                  </div>

                  <button
                    onClick={handleSignUpClick}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs tracking-widest rounded-xl shadow-lg shadow-red-650/30 transition-all duration-300 hover:scale-102 cursor-pointer uppercase"
                  >
                    Sign Up and Watch Now
                  </button>

                  {/* Modal Ad in Player Locker */}
                  {(movie.modalAds || adsConfig?.modalAds) && (
                    <AdScriptContainer scriptHtml={movie.modalAds || adsConfig?.modalAds} className="w-full max-w-sm flex justify-center my-1 shrink-0" />
                  )}

                  {/* Bullet badges */}
                  <div className="grid grid-cols-2 gap-2 text-[8px] sm:text-[9px] text-left pt-2">
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/40 border border-slate-800/40 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold text-slate-350 truncate">4K UHD Quality</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/40 border border-slate-800/40 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-bold text-slate-350 truncate">No Ads Stream</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Loading secure tunnel view */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-25">
                {/* Visualizer bars */}
                <div className="flex items-end gap-1.5 h-16 pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => {
                    const heights = ["15%", "40%", "60%", "30%", "50%", "75%", "35%", "55%", "70%", "20%", "45%", "65%", "40%", "60%", "30%"]
                    return (
                      <div
                        key={i}
                        className="w-1 bg-red-600 rounded-full transition-all duration-300 animate-pulse"
                        style={{
                          height: heights[i % heights.length],
                          opacity: 0.7,
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    )
                  })}
                </div>
                <div className="text-slate-300 font-bold text-xs tracking-wider uppercase animate-pulse bg-black/50 px-5 py-2 rounded-full backdrop-blur-md border border-white/5 flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting Secure Stream Tunnel...
                </div>
              </div>
            )}

            {/* Bottom mini controls overlay inside player */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex items-center justify-between z-25 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="p-1.5 bg-red-600/90 text-white rounded-full hover:bg-red-500 shadow-md cursor-pointer transition"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </button>
                <span className="font-mono text-[10px]">LIVE STREAMING • {movie.title} (4K UHD)</span>
              </div>
              <button
                onClick={() => setIsPlaying(false)}
                className="hover:text-white transition cursor-pointer font-bold"
              >
                Close Player
              </button>
            </div>
          </div>
        ) : (
          /* Normal Backdrop and Movie Details Header view */
          <>
            {/* Navbar Ad Slot (Immediately below navbar) */}
            {topAdHtml && (
              <div className="absolute top-16 left-0 right-0 z-35 flex justify-center px-4 select-none">
                <AdScriptContainer scriptHtml={topAdHtml} className="w-full max-w-4xl" />
              </div>
            )}

            {/* Backdrop on the right */}
            <div className="absolute inset-y-0 right-0 w-full md:w-[65%] h-full opacity-55 md:opacity-90 z-0">
              {movie.backdropPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center md:object-right-top scale-102"
                />
              ) : adsConfig?.globalBg ? (
                <img
                  src={getImageUrl(adsConfig.globalBg)}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center md:object-right-top scale-102"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 font-bold">
                  No Backdrop Available
                </div>
              )}
              {/* Linear gradients to blend into background */}
              <div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
            </div>
            
            {/* Main Content inside wide container */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pt-28 pb-12 flex flex-col justify-end min-h-[80vh] md:min-h-[85vh] space-y-6">
                <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  {movie.categories.map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-0.5 rounded bg-red-600/90 text-white text-[9px] font-bold uppercase tracking-wider animate-pulse"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white drop-shadow-lg leading-tight sm:leading-tight uppercase font-heading tracking-tight">
                  {movie.title}
                </h1>
              </div>

              {/* Action Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 select-none">
                {/* Play Button */}
                <button
                  onClick={handlePlayMovie}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-slate-200 text-black font-extrabold py-2.5 px-6 sm:py-3 sm:px-8 rounded-full text-xs sm:text-sm cursor-pointer shadow-lg transition transform hover:scale-105 active:scale-95 duration-150"
                >
                  <PlayIcon className="w-4 h-4 fill-current" /> Watch Now
                </button>

                {/* Visit Offer Button (if redirect/referral available) */}
                {movie.referralUrl && (
                  <a
                    href={movie.referralUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-900/60 hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-slate-800 font-bold py-2.5 px-5 sm:py-3 sm:px-6 rounded-full text-xs sm:text-sm cursor-pointer transition backdrop-blur-xs transform hover:scale-105 active:scale-95 duration-150"
                  >
                    Visit Offer <ExternalLinkIcon className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Watch Trailer / Play Icon */}
                <button
                  onClick={handlePlayMovie}
                  title="Watch Trailer"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
                >
                  <PlayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Plus Icon */}
                <button
                  title="Add to Watchlist"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
                >
                  <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Thumbs Up Icon */}
                <button
                  title="Like"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
                >
                  <ThumbsUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Thumbs Down Icon */}
                <button
                  title="Dislike"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
                >
                  <ThumbsDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Share Icon */}
                <button
                  title="Share"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
                >
                  <Share2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Metadata Grid */}
              <div className="grid md:grid-cols-3 gap-8 pt-6 border-t border-slate-900/40 z-10">
                {/* Description & Genres */}
                <div className="md:col-span-2 space-y-4">
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans font-light max-w-4xl drop-shadow-md">
                    {movie.overview || "No overview description available for this title."}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm font-medium">
                    <span className="text-red-500 font-bold uppercase tracking-wider">
                      {movie.categories.map((c) => c.name).join(" • ")}
                    </span>
                    <span className="text-slate-750">•</span>
                    <span className="text-yellow-500 font-bold bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">★ {movie.voteAverage}/10</span>
                    <span className="text-slate-750">•</span>
                    <span className="font-mono text-slate-350 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">{movie.releaseDate || "Release Date N/A"}</span>
                    <span className="text-slate-750">•</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-slate-400 font-bold border border-slate-800">UHD</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[10px] text-slate-440 font-bold border border-slate-800">HDR</span>
                  </div>
                </div>

                {/* Cast & Advisory Info */}
                <div className="space-y-3 text-xs sm:text-sm md:border-l border-slate-900/40 pl-0 md:pl-8">
                  {directors.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-semibold mr-2">Director:</span>
                      <span className="text-slate-300 hover:text-white transition cursor-pointer">
                        {directors.map((d: any) => d.name).join(", ")}
                      </span>
                    </div>
                  )}
                  {castList.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-semibold mr-2">Cast:</span>
                      <span className="text-slate-300 hover:text-white transition cursor-pointer">
                        {castList.slice(0, 4).map((actor: any) => actor.name).join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 items-center pt-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold text-[10px]">
                      16+
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold text-[10px]">
                      Subtitles
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold text-[10px]">
                      AD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 lg:px-16 pt-6">
        
        {/* Content Box */}
        <div className="space-y-6">
          
          {/* Top Ads Slot */}
          {movie.topAds && (
            <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800/40 text-xs font-mono text-center text-slate-400 overflow-x-auto select-all max-h-16">
              <div dangerouslySetInnerHTML={{ __html: movie.topAds }} />
            </div>
          )}

          {/* Movie Details Card & Download Table */}
          <div className="space-y-6">
            {/* Movie Info Block */}
            <div className="w-full bg-[#0b0f17] border border-slate-900 rounded-3xl p-6 flex flex-col md:flex-row gap-6 relative shadow-2xl">
              {/* Movie Poster (Left) */}
              <div className="w-[130px] h-[190px] shrink-0 rounded-2xl overflow-hidden border border-slate-900 bg-slate-950 shadow-lg mx-auto md:mx-0">
                {movie.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold bg-slate-950">
                    No Poster
                  </div>
                )}
              </div>

              {/* Movie Info Details (Right) */}
              <div className="flex-1 flex flex-col justify-between gap-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-black text-white flex flex-wrap items-baseline justify-center sm:justify-start gap-2 uppercase tracking-wide">
                      {movie.title}
                      <span className="text-xs sm:text-sm font-bold text-slate-500 font-mono">
                        {movie.releaseDate ? movie.releaseDate.split("-")[0] : ""}
                      </span>
                    </h2>

                    {/* Ratings */}
                    <div className="flex flex-col items-center sm:items-start gap-1">
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const ratingValue = parseFloat(movie.voteAverage || "0")
                          const isFilled = i < Math.round(ratingValue)
                          return (
                            <span key={i} className="text-[10px] sm:text-xs">
                              {isFilled ? "★" : "☆"}
                            </span>
                          )
                        })}
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
                        {movie.voteAverage || "0.0"}/10 by {((movie.tmdbId || 0) % 4000) + 1200} users
                      </span>
                    </div>
                  </div>

                  {/* Subscribe Watch button */}
                  <button
                    onClick={() => {
                      setAuthModalReason("watch")
                      setShowAuthModal(true)
                    }}
                    className="mx-auto sm:mx-0 px-4 py-2 rounded-lg border border-red-655 text-red-500 hover:bg-red-655 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md select-none active:scale-[0.98]"
                  >
                    Subscribe to Watch | $0.00
                  </button>
                </div>

                {/* Plot overview */}
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans font-medium">
                  {movie.overview || "No overview description available for this title."}
                </p>

                {/* Grid attributes */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-950/60 border border-slate-900/60 rounded-xl text-xs gap-1 sm:gap-4">
                    <span className="text-slate-500 font-bold sm:min-w-[100px]">Released:</span>
                    <span className="text-slate-350">{movie.releaseDate || "N/A"}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-950/60 border border-slate-900/60 rounded-xl text-xs gap-1 sm:gap-4">
                    <span className="text-slate-500 font-bold sm:min-w-[100px]">Runtime:</span>
                    <span className="text-slate-350">{((movie.tmdbId || 0) % 40) + 90} minutes</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-950/60 border border-slate-900/60 rounded-xl text-xs gap-1 sm:gap-4">
                    <span className="text-slate-500 font-bold sm:min-w-[100px]">Genre:</span>
                    <span className="text-slate-355">{movie.categories.map((c) => c.name).join(", ")}</span>
                  </div>

                  {castList.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-955/60 border border-slate-900/60 rounded-xl text-xs gap-1 sm:gap-4">
                      <span className="text-slate-500 font-bold sm:min-w-[100px]">Stars:</span>
                      <span className="text-slate-355 truncate max-w-xl">
                        {castList.slice(0, 5).map((actor: any) => actor.name).join(", ")}
                      </span>
                    </div>
                  )}

                  {directors.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-955/60 border border-slate-900/60 rounded-xl text-xs gap-1 sm:gap-4">
                      <span className="text-slate-500 font-bold sm:min-w-[100px]">Director:</span>
                      <span className="text-slate-355">
                        {directors.map((d: any) => d.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Links Container */}
            <div className="w-full bg-[#0b0f17] border border-slate-900 rounded-3xl p-6 space-y-6 shadow-2xl">
              {/* MKV Row list */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-red-500 flex items-center gap-1.5 uppercase tracking-widest font-mono">
                  Download : MKV
                </h3>
                <div className="space-y-2">
                  {["360p", "480p", "720p", "1080p"].map((res) => (
                    <div key={`mkv-${res}`} className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border border-slate-900/60 rounded-xl">
                      <span className="text-[10px] font-black text-slate-300 bg-slate-950 px-3 py-1 rounded border border-slate-900 uppercase font-mono">{res}</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-red-500 font-mono">
                        {["GD2", "CU", "GD1", "ZS", "RC"].map((src, i, arr) => (
                          <React.Fragment key={src}>
                            <button
                              onClick={() => {
                                setAuthModalReason("download")
                                setShowAuthModal(true)
                              }}
                              className="hover:text-red-400 hover:underline transition cursor-pointer select-none"
                            >
                              {src}
                            </button>
                            {i < arr.length - 1 && <span className="text-slate-700">|</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MP4 Row list */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-red-500 flex items-center gap-1.5 uppercase tracking-widest font-mono">
                  Download : MP4
                </h3>
                <div className="space-y-2">
                  {["360p", "480p", "MP4HD", "FULLHD"].map((res) => (
                    <div key={`mp4-${res}`} className="flex items-center justify-between px-4 py-3 bg-slate-955/60 border border-slate-900/60 rounded-xl">
                      <span className="text-[10px] font-black text-slate-300 bg-slate-950 px-3 py-1 rounded border border-slate-900 uppercase font-mono">{res}</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-red-550 font-mono">
                        {["GD2", "CU", "GD1", "ZS", "RC"].map((src, i, arr) => (
                          <React.Fragment key={src}>
                            <button
                              onClick={() => {
                                setAuthModalReason("download")
                                setShowAuthModal(true)
                              }}
                              className="hover:text-red-400 hover:underline transition cursor-pointer select-none"
                            >
                              {src}
                            </button>
                            {i < arr.length - 1 && <span className="text-slate-700">|</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Prime Video Styled Tabs */}
          <div className="flex border-b border-slate-900/80 mt-2 select-none gap-6 pb-1.5 mb-6">
            <button
              onClick={() => setActiveTab("related")}
              className={`pb-2 font-bold text-sm tracking-wide cursor-pointer transition relative ${
                activeTab === "related" ? "text-white font-extrabold" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Related
              {activeTab === "related" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 font-bold text-sm tracking-wide cursor-pointer transition relative ${
                activeTab === "details" ? "text-white font-extrabold" : "text-slate-450 hover:text-slate-200"
              }`}
            >
              Details
              {activeTab === "details" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* Details Content */}
          {activeTab === "details" && (
            <div className="space-y-6 pt-2 animate-in fade-in duration-200">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Directors and Cast */}
                <div className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-900/60">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Creators and Cast
                  </h4>
                  
                  {directors.length > 0 && (
                    <div className="text-xs">
                      <span className="font-bold text-slate-500 mr-2">Directors:</span>
                      <span className="text-slate-300">
                        {directors.map((d: any) => d.name).join(", ")}
                      </span>
                    </div>
                  )}

                  {producers.length > 0 && (
                    <div className="text-xs">
                      <span className="font-bold text-slate-500 mr-2">Producers:</span>
                      <span className="text-slate-300">
                        {producers.slice(0, 5).map((p: any) => p.name).join(", ")}
                      </span>
                    </div>
                  )}

                  {castList.length > 0 ? (
                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cast:</span>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                        {castList.slice(0, 8).map((actor: any) => (
                          <div key={actor.id} className="flex items-center gap-2 bg-[#181818] p-1.5 rounded-lg border border-slate-800/40">
                            {actor.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`}
                                alt={actor.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-700"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-850 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                {actor.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-200 truncate">{actor.name}</p>
                              <p className="text-[8px] text-slate-500 truncate">{actor.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-655 italic">No cast information available.</p>
                  )}
                </div>

                {/* Advisory Panel */}
                <div className="space-y-4 bg-slate-950/40 p-6 rounded-xl border border-slate-900/60">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Additional Details
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Content Advisory:</span>
                      <div className="flex gap-2 items-center">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-350 font-bold text-[9px]">
                          16+
                        </span>
                        <span className="text-slate-400">Violence, substance use, smoking, foul language</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Audio Languages:</span>
                      <p className="text-slate-300 leading-relaxed">
                        English [Audio Description], Bengali, Hindi, Español, Deutsch
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block mb-1">Subtitles:</span>
                      <p className="text-slate-400">
                        English, Bengali, Hindi, Español [CC]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Related Content */}
          {activeTab === "related" && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-200">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Customers also watched
              </h4>
              {relatedMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {relatedMovies.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => router.push(`/movie/${m.slug || m.id}`)}
                      className="group relative bg-card border border-slate-900/65 rounded-lg overflow-hidden cursor-pointer transform hover:scale-102 transition duration-200"
                    >
                      <div className="aspect-[2/3] w-full bg-slate-950">
                        {m.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${m.posterPath}`}
                            alt={m.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold p-2 text-center">
                            No Poster
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-card">
                        <h5 className="font-bold text-[10px] text-slate-200 group-hover:text-white truncate">
                          {m.title}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-655 italic">No related movies available.</p>
              )}

              {/* Ad Card inside related view at the bottom of the list */}
              <div className="w-full pt-4">
                <AdCard scriptHtml={adsConfig?.heroAds} scriptHtml2={adsConfig?.hero2Ads} />
              </div>
            </div>
          )}

          {/* Promotional Ads slots */}
          <div className="pt-6 space-y-6">
            {/* Modal Banner Ad Image */}
            {movie.modalImage && (
              <div className="pt-4 border-t border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Promotional Banner</span>
                <div className="rounded-xl overflow-hidden border border-slate-900 bg-slate-950 aspect-[21/9] flex items-center justify-center p-1">
                  <img src={movie.modalImage} alt="Promotion" className="max-h-full max-w-full object-contain rounded-lg" />
                </div>
              </div>
            )}

            {/* Modal Ads Script Code */}
            {movie.modalAds && (
              <div className="p-3 bg-slate-955/80 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-500 overflow-x-auto select-all max-h-16">
                <AdScriptContainer scriptHtml={movie.modalAds} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Exclamation Activation Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 select-none">
          <div className="w-full max-w-md bg-[#0b0f17] border border-slate-900 rounded-3xl p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 space-y-5">
            
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 animate-pulse">
                <span className="text-3xl font-black font-sans leading-none">!</span>
              </div>
            </div>

            {/* Alert Header */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Activate your FREE Account!
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {authModalReason === "watch" 
                  ? "You must create an account to continue watching"
                  : "You must create an account to start downloading"
                }
              </p>
            </div>

            {/* Button link */}
            <button
              onClick={() => {
                const url = movie.redirectUrl || movie.referralUrl
                if (url) {
                  window.open(url, "_blank")
                }
                setShowAuthModal(false)
              }}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs tracking-wider rounded-xl transition duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/10"
            >
              <span>Continue to watch for FREE</span>
              <span className="font-sans font-black">&rarr;</span>
            </button>

            {/* Subtext info */}
            <div className="border-t border-slate-900/60 pt-4 text-left">
              <div className="flex gap-2 items-start text-[10px] text-slate-500 leading-relaxed font-sans">
                <span className="text-slate-400 font-bold shrink-0">🕒 Quick Sign Up!</span>
                <p className="font-semibold">
                  It takes less than 1 minute to Sign Up, then you can enjoy Unlimited Movies & TV titles.
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
