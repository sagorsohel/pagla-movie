"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdCard from "@/components/ad-card"
import { CineMoviesLogo } from "@/components/logo"
import { getTranslation, type Locale } from "@/lib/translations"
import { getImageUrl } from "@/lib/utils"
import { LanguageSelector } from "@/components/language-selector"
import { CineNavbar } from "@/components/cine-navbar"
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
  let height = "55px"
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
      />
    </div>
  )
}

export function MovieDetailClient({
  movie,
  allMovies,
  locale = "en",
}: {
  movie: Movie
  allMovies: Movie[]
  locale?: Locale
}) {
  const t = getTranslation(locale)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"related" | "details">("related")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showInlineSignup, setShowInlineSignup] = useState(false)
  const [playerTime, setPlayerTime] = useState(0)
  const [countdown, setCountdown] = useState(movie.redirectTime || 5)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalReason, setAuthModalReason] = useState<"watch" | "download">("watch")

  const [originUrl, setOriginUrl] = useState("")
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [currentHeroAdIndex, setCurrentHeroAdIndex] = useState(1)

  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const runtimeMinutes = useMemo(() => {
    return ((movie.tmdbId || 0) % 40) + 90
  }, [movie.tmdbId])

  const totalMovieDuration = useMemo(() => {
    if (videoRef.current?.duration && !isNaN(videoRef.current.duration) && videoRef.current.duration > 300) {
      return videoRef.current.duration
    }
    return runtimeMinutes * 60
  }, [runtimeMinutes])

  const progressPercentage = useMemo(() => {
    if (!totalMovieDuration || totalMovieDuration <= 0) return 0
    return Math.min(100, Math.max(0, (playerTime / totalMovieDuration) * 100))
  }, [playerTime, totalMovieDuration])

  const remainingTimeStr = useMemo(() => {
    const remaining = Math.max(0, totalMovieDuration - Math.floor(playerTime))
    const h = Math.floor(remaining / 3600)
    const m = Math.floor((remaining % 3600) / 60)
    const s = remaining % 60
    return `-${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }, [totalMovieDuration, playerTime])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin)
    }
  }, [])

  useEffect(() => {
    const handleYTMessage = (event: MessageEvent) => {
      try {
        if (!event.origin.includes("youtube.com")) return
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data
        if (data.event === "infoDelivery" && data.info && data.info.playerState === 1) {
          setIsVideoPlaying(true)
        } else if (data.event === "onStateChange" && data.info === 1) {
          setIsVideoPlaying(true)
        }
      } catch (e) {
        // Ignore json errors
      }
    }
    window.addEventListener("message", handleYTMessage)
    return () => window.removeEventListener("message", handleYTMessage)
  }, [])

  const trailerKey = useMemo(() => {
    try {
      if (!movie.videos) return null
      const videoList = typeof movie.videos === "string" ? JSON.parse(movie.videos) : movie.videos
      if (Array.isArray(videoList) && videoList.length > 0) {
        return videoList[0].key
      }
    } catch (e) {
      console.error("Error parsing movie videos", e)
    }
    return null
  }, [movie.videos])

  const handlePlayMovie = () => {
    setIsPlaying(true)
    setShowInlineSignup(false)
    setIsVideoPlaying(true)
    setPlayerTime(0)
    setShowAuthModal(false)
    setCountdown(movie.redirectTime || 5)

    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.muted = false
      videoRef.current.play().catch((e) => {
        console.log("Direct video playback failed, trying muted play", e)
        if (videoRef.current) {
          videoRef.current.muted = true
          videoRef.current.play().catch((err) => console.error("Muted play failed:", err))
        }
      })
    }

    const timer = setTimeout(() => {
      setIsVideoPlaying(true)
    }, 3000);
    (window as any)._ytPlayTimeout = timer
  }

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(console.error)
      } else {
        videoRef.current.pause()
        setIsVideoPlaying(false)
      }
    }
  }

  const handleToggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error)
      } else {
        videoRef.current.requestFullscreen().catch(console.error)
      }
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.get("play") === "true") {
        const timer = setTimeout(() => {
          handlePlayMovie()
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [movie])

  const handleClosePlayer = () => {
    setIsPlaying(false)
    setIsVideoPlaying(false)

    if ((window as any)._ytPlayTimeout) {
      clearTimeout((window as any)._ytPlayTimeout)
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const handleSignUpClick = () => {
    const url = movie.redirectUrl || movie.referralUrl
    if (url) {
      window.open(url, "_blank")
    } else {
      alert("Playing: " + movie.title)
    }
  }

  const showAuthModalRef = React.useRef(showAuthModal)
  useEffect(() => {
    showAuthModalRef.current = showAuthModal
  }, [showAuthModal])

  // Effect to handle 10-second video preview play time (Modal opens at 7s animated from top; video plays till 10s and pauses without closing player)
  useEffect(() => {
    if (!isPlaying || !isVideoPlaying) return

    const interval = setInterval(() => {
      setPlayerTime((prev) => {
        const nextTime = prev + 0.1

        // At 7 seconds, trigger top-to-bottom animated auth modal
        if (nextTime >= 7 && !showAuthModalRef.current) {
          setAuthModalReason("watch")
          setShowAuthModal(true)
        }

        // At 10 seconds, pause background video without removing player container
        if (nextTime >= 10) {
          clearInterval(interval)
          if (videoRef.current) {
            videoRef.current.pause()
          }
          return 10
        }

        return nextTime
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, isVideoPlaying, movie])

  // Effect to handle the redirect countdown AFTER the popup modal is shown
  useEffect(() => {
    if (!showAuthModal || authModalReason !== "watch") return

    // Set initial countdown
    setCountdown(movie.redirectTime || 5)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          const url = movie.redirectUrl || movie.referralUrl
          if (url) {
            window.open(url, "_blank")
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showAuthModal, authModalReason, movie])

  useEffect(() => {
    if (!showAuthModal) return

    const interval = setInterval(() => {
      setCurrentHeroAdIndex((prev) => (prev === 1 ? 2 : 1))
    }, 40000) // 40 seconds

    return () => clearInterval(interval)
  }, [showAuthModal])

  const [adsConfig, setAdsConfig] = useState<any>(null)

  useEffect(() => {
    fetch("/api/manage/ads")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ads) {
          setAdsConfig(data.ads)
        }
      })
      .catch(() => { })
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

  const layoutOrder = useMemo(() => {
    if (!adsConfig?.layoutOrder) {
      return ["top-ad", "hero", "ad-middle", "movie-info", "download-links", "tabs", "ad-bottom"]
    }
    try {
      const parsed = JSON.parse(adsConfig.layoutOrder)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const result = [...parsed]
          ;["top-ad", "hero", "ad-middle", "movie-info", "download-links", "tabs", "ad-bottom"].forEach((s) => {
            if (!result.includes(s)) result.push(s)
          })
        return result
      }
    } catch (e) { }
    return ["top-ad", "hero", "ad-middle", "movie-info", "download-links", "tabs", "ad-bottom"]
  }, [adsConfig?.layoutOrder])

  return (
    <div className="min-h-screen text-slate-100 bg-background relative font-sans antialiased pb-20 selection:bg-red-600 selection:text-white">

      {/* Navbar header */}
      <CineNavbar locale={locale} />

      {/* Top Ad Container (Positioned sequentially below fixed navbar) */}
      {topAdHtml && (
        <div className="w-full pt-[57px] bg-slate-950 flex justify-center px-4  border-b border-slate-900/40 select-none">
          <AdScriptContainer scriptHtml={topAdHtml} className="w-full max-w-4xl" />
        </div>
      )}

      {/* Billboard Header (Full Page Style / Player) */}
      <div className={`relative w-full ${isPlaying ? " " : "py-4 md:py-2"} bg-slate-950 flex flex-col items-center justify-center border-b px-3 sm:px-0 border-slate-900/50 transition-all duration-300 ${topAdHtml ? "" : "pt-[65px] md:pt-5"}`}>

        {/* Breadcrumb Navigation */}

        {/* Unified 1076px * 605px Player Box */}
        <div className="relative w-full max-w-[1076px] aspect-[1076/605] bg-black flex flex-col justify-between shadow-2xl rounded-lg sm:rounded-xl overflow-hidden border border-slate-800/80 group">
          {/* Custom Video Player view (ALWAYS MOUNTED IN DOM) */}
          <div className="absolute inset-0 w-full h-full bg-black select-none overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              src="/video.mp4"
              className="w-full h-full object-cover object-center scale-[1.18] transition-transform duration-300"
              onPlay={() => setIsVideoPlaying(true)}
              onPlaying={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onTimeUpdate={(e) => {
                setPlayerTime(e.currentTarget.currentTime)
              }}
              loop
              playsInline
              {...({
                "webkit-playsinline": "true"
              } as any)}
              preload="auto"
              width="100%"
              height="100%"
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />

            {/* Loading Stream Badge */}
            {isPlaying && playerTime < 0.5 && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="px-5 py-2.5 rounded-full bg-black/85 border border-slate-700/80 backdrop-blur-md flex items-center gap-3 shadow-2xl">
                  <div className="w-4 h-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                  <span className="text-xs font-black text-white uppercase tracking-wider font-mono">LOADING STREAM...</span>
                </div>
              </div>
            )}

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />

            {/* Custom Video Controls Panel (Shown when isPlaying is true) */}
            <div className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3 flex flex-col gap-2.5 z-25 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
              {/* Progress Bar Slider */}
              <div
                className="relative w-full h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  const targetTime = clickRatio * totalMovieDuration
                  setPlayerTime(targetTime)
                  if (videoRef.current && videoRef.current.duration) {
                    videoRef.current.currentTime = clickRatio * videoRef.current.duration
                  }
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-75"
                  style={{
                    width: `${progressPercentage}%`
                  }}
                />
              </div>

              {/* Controls Buttons Bar matching screenshot 2 */}
              <div className="flex items-center justify-between text-slate-200 px-1">
                <div className="flex items-center gap-3">
                  {/* Play/Pause Button */}
                  <button onClick={handleTogglePlay} className="text-white hover:text-red-500 transition cursor-pointer p-1">
                    {isVideoPlaying ? (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Volume Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (videoRef.current) {
                        videoRef.current.muted = !videoRef.current.muted
                      }
                    }}
                    className="text-white hover:text-red-500 transition cursor-pointer p-1"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  </button>

                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300 font-mono tracking-wide">
                    {remainingTimeStr}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Fullscreen Button */}
                  <button onClick={handleToggleFullscreen} className="text-white hover:text-red-500 transition cursor-pointer p-1">
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Poster Preview Overlay View (Shown when !isPlaying) */}
          <div className={`absolute inset-0 w-full h-full bg-black select-none flex items-center justify-center cursor-pointer transition-opacity duration-300 z-30 ${!isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={handlePlayMovie}>
            {movie.backdropPath ? (
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
                alt={movie.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
              />
            ) : adsConfig?.globalBg ? (
              <img
                src={getImageUrl(adsConfig.globalBg)}
                alt={movie.title}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
              />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 font-bold">
                No Backdrop Available
              </div>
            )}

            {/* Dark subtle overlay on hover */}
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-all duration-300" />

            {/* Centered Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayMovie()
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-950/80 border-2 border-white/90 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details & Actions Container */}
      <div className="w-full max-w-[1076px] mx-auto px-4 pt-4 pb-8 space-y-6">
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
            title={t.watchTrailer}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
          >
            <PlayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Plus Icon */}
          <button
            title={t.addToWatchlist}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
          >
            <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Thumbs Up Icon */}
          <button
            title={t.like}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
          >
            <ThumbsUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Thumbs Down Icon */}
          <button
            title={t.dislike}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-700/60 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-500 text-white cursor-pointer transition transform hover:scale-105 active:scale-95"
          >
            <ThumbsDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Share Icon */}
          <button
            title={t.share}
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
                <span className="text-slate-500 font-semibold mr-2">{t.director}:</span>
                <span className="text-slate-300 hover:text-white transition cursor-pointer">
                  {directors.map((d: any) => d.name).join(", ")}
                </span>
              </div>
            )}
            {castList.length > 0 && (
              <div>
                <span className="text-slate-500 font-semibold mr-2">{t.cast}:</span>
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

      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 md:px-12 pt-6">

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
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6 relative shadow-2xl">
              {/* Movie Poster (Left) */}
              <div className="w-[130px] h-[190px] shrink-0 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg mx-auto md:mx-0">
                {movie.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.posterPath}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : movie.backdropPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.backdropPath}`}
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
                  <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-900/40 border border-slate-800/40 rounded-xl text-xs gap-1 sm:gap-4">
                    <span className="text-slate-500 font-bold sm:min-w-[100px]">Released:</span>
                    <span className="text-slate-350">{movie.releaseDate || "N/A"}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-900/40 border border-slate-800/40 rounded-xl text-xs gap-1 sm:gap-4">
                    <span className="text-slate-500 font-bold sm:min-w-[100px]">Runtime:</span>
                    <span className="text-slate-350">{runtimeMinutes} minutes</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-900/40 border border-slate-800/40 rounded-xl text-xs gap-1 sm:gap-4">
                    <span className="text-slate-500 font-bold sm:min-w-[100px]">Genre:</span>
                    <span className="text-slate-350">{movie.categories.map((c) => c.name).join(", ")}</span>
                  </div>

                  {castList.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-900/40 border border-slate-800/40 rounded-xl text-xs gap-1 sm:gap-4">
                      <span className="text-slate-500 font-bold sm:min-w-[100px]">Stars:</span>
                      <span className="text-slate-350 truncate max-w-xl">
                        {castList.slice(0, 5).map((actor: any) => actor.name).join(", ")}
                      </span>
                    </div>
                  )}

                  {directors.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center px-4 py-2 bg-slate-900/40 border border-slate-800/40 rounded-xl text-xs gap-1 sm:gap-4">
                      <span className="text-slate-500 font-bold sm:min-w-[100px]">Director:</span>
                      <span className="text-slate-350">
                        {directors.map((d: any) => d.name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Links Container */}
            <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
              {/* MKV Row list */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-red-500 flex items-center gap-1.5 uppercase tracking-widest font-mono">
                  Download : MKV
                </h3>
                <div className="space-y-2.5">
                  {["360p", "480p", "720p", "1080p"].map((res) => (
                    <div key={`mkv-${res}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/60 border border-slate-800/40 rounded-2xl hover:border-slate-700/50 transition duration-205">
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className="text-[11px] font-black text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-850 uppercase font-mono tracking-wider">
                          {res}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold sm:hidden uppercase tracking-wider">Select Server:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold font-mono">
                        {["GD2", "CU", "GD1", "ZS", "RC"].map((src) => (
                          <button
                            key={src}
                            onClick={() => {
                              setAuthModalReason("download")
                              setShowAuthModal(true)
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 active:scale-95 text-red-400 hover:text-red-300 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-150 cursor-pointer select-none text-[10px] uppercase font-black tracking-wider shadow-xs"
                          >
                            <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {src}
                          </button>
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
                <div className="space-y-2.5">
                  {["360p", "480p", "MP4HD", "FULLHD"].map((res) => (
                    <div key={`mp4-${res}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/60 border border-slate-800/40 rounded-2xl hover:border-slate-700/50 transition duration-205">
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className="text-[11px] font-black text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-850 uppercase font-mono tracking-wider">
                          {res}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold sm:hidden uppercase tracking-wider">Select Server:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold font-mono">
                        {["GD2", "CU", "GD1", "ZS", "RC"].map((src) => (
                          <button
                            key={src}
                            onClick={() => {
                              setAuthModalReason("download")
                              setShowAuthModal(true)
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 active:scale-95 text-red-400 hover:text-red-300 border border-slate-800 hover:border-slate-700 rounded-xl transition duration-150 cursor-pointer select-none text-[10px] uppercase font-black tracking-wider shadow-xs"
                          >
                            <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {src}
                          </button>
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
              className={`pb-2 font-bold text-sm tracking-wide cursor-pointer transition relative ${activeTab === "related" ? "text-white font-extrabold" : "text-slate-450 hover:text-slate-200"
                }`}
            >
              {t.relatedMovies}
              {activeTab === "related" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 font-bold text-sm tracking-wide cursor-pointer transition relative ${activeTab === "details" ? "text-white font-extrabold" : "text-slate-450 hover:text-slate-200"
                }`}
            >
              {t.details}
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
                      <span className="font-bold text-slate-500 block mb-1">{t.audioLanguages}</span>
                      <p className="text-slate-300 leading-relaxed">
                        English [Audio Description], Bengali, Hindi, Español, Deutsch
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-500 block mb-1">{t.subtitles}</span>
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
                {t.relatedMovies}
              </h4>
              {relatedMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {relatedMovies.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => router.push(`/${locale}/movie/${m.slug || m.id}`)}
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
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-500 overflow-x-auto select-all max-h-16">
                <AdScriptContainer scriptHtml={movie.modalAds} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Exclamation Activation Modal */}
      <div className={`fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none transition-all duration-300 ${showAuthModal
        ? "opacity-100 pointer-events-auto visible"
        : "opacity-0 pointer-events-none invisible"
        }`}>
        <div className={`w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative transition-all duration-500 ease-out space-y-5 ${showAuthModal ? "translate-y-0 opacity-100 scale-100" : "-translate-y-36 opacity-0 scale-90 pointer-events-none"
          }`}>

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
            {/* {authModalReason === "watch" && (
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pt-1.5">
                  {countdown > 0 ? (
                    <span>Redirecting in <span className="text-red-500 font-bold">{countdown}s</span>...</span>
                  ) : (
                    <span className="text-red-500 font-bold">Redirecting...</span>
                  )}
                </div>
              )} */}
          </div>

          {/* Button link */}
          <button
            onClick={() => {
              setShowAuthModal(false)
              const slugVal = movie.slug || String(movie.id) || ""
              window.location.href = `/signup?movies=${encodeURIComponent(slugVal)}`
            }}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs tracking-wider rounded-xl transition duration-200 hover:scale-[1.01] active:scale-[0.98] cursor-pointer uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/10"
          >
            <span>Continue to watch for FREE</span>
            <span className="font-sans font-black">&rarr;</span>
          </button>

          {/* Modal Ads under the action button */}
          {(movie.modalAds || adsConfig?.heroAds || adsConfig?.hero2Ads) && (
            <div className="w-full pt-4 border-t border-slate-900/60 mt-4 flex justify-center">
              {movie.modalAds ? (
                <AdScriptContainer scriptHtml={movie.modalAds} />
              ) : (
                <>
                  {currentHeroAdIndex === 1 && adsConfig?.heroAds && (
                    <AdScriptContainer scriptHtml={adsConfig.heroAds} />
                  )}
                  {currentHeroAdIndex === 2 && adsConfig?.hero2Ads && (
                    <AdScriptContainer scriptHtml={adsConfig.hero2Ads} />
                  )}
                </>
              )}
            </div>
          )}

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
            onClick={() => {
              setShowAuthModal(false)
              handleClosePlayer()
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  )
}
