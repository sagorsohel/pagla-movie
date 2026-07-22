"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { PlayIcon, InfoIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Movie = {
  id: number
  tmdbId: number
  title: string
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
}

export function HeroCarousel({
  movies,
  onPlay,
  onInfo,
}: {
  movies: Movie[]
  onPlay: (movie: Movie) => void
  onInfo: (movie: Movie) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Get top 5 highest-rated movies
  const topMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => parseFloat(b.voteAverage || "0") - parseFloat(a.voteAverage || "0"))
      .slice(0, 5)
  }, [movies])

  // Reset video loading state when index changes
  useEffect(() => {
    setIsVideoLoaded(false)
    const timeout = setTimeout(() => {
      setIsVideoLoaded(true)
    }, 2000) // Fade in video after 2s for premium transitions

    return () => clearTimeout(timeout)
  }, [currentIndex])

  // Setup auto-rotate interval (5 seconds per slide)
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % topMovies.length)
    }, 5000)
  }

  useEffect(() => {
    if (topMovies.length > 0) {
      resetTimer()
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [topMovies])

  if (topMovies.length === 0) return null

  const activeMovie = topMovies[currentIndex]

  // Find trailer key
  const videosArray = activeMovie.videos
    ? typeof activeMovie.videos === "string"
      ? JSON.parse(activeMovie.videos)
      : activeMovie.videos
    : []

  const trailer =
    videosArray?.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
    videosArray?.find((v: any) => v.site === "YouTube")
  const trailerKey = trailer?.key

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + topMovies.length) % topMovies.length)
    resetTimer()
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % topMovies.length)
    resetTimer()
  }

  // Framer Motion variants for slide transition direction
  const textVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 25 : -25,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        x: { type: "tween", ease: "easeOut", duration: 0.25 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -25 : 25,
      transition: {
        opacity: { duration: 0.1 },
        x: { duration: 0.12 },
      },
    }),
  } as any

  return (
    <div className="relative w-full h-[75vh] md:h-[88vh] bg-black overflow-hidden group/carousel">
      {/* Background Media with smooth Framer Motion crossfade */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0.6, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.6, scale: 0.98 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Backdrop Cover Image (Static view / fallback) */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${activeMovie.backdropPath})`,
              }}
            />

            {/* YouTube Autoplay Background Video */}
            {trailerKey && isVideoLoaded && (
              <div className="absolute inset-0 w-full h-full overflow-hidden opacity-0 animate-in fade-in duration-800 fill-mode-forwards">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1&widget_referrer=${typeof window !== "undefined" ? window.location.origin : ""}`}
                  className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-115"
                  allow="autoplay; encrypted-media"
                  frameBorder="0"
                  style={{ border: "none" }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Netflix Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-black/60 z-10" />
        <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-transparent z-10" />
      </div>

      {/* Slide Content (Instant load without delay animations) */}
      <div className="absolute inset-0 flex items-end z-15 pointer-events-none">
        <div className="w-full max-w-2xl px-4 md:px-12 pb-16 md:pb-24 space-y-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-red-650/20">
              <SparklesIcon className="w-3 h-3 animate-pulse" /> Billboard Hit
            </span>
            <span className="text-xs text-slate-300 font-semibold font-mono">
              Rating: {activeMovie.voteAverage}/10
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-xl leading-tight uppercase font-heading select-none">
            {activeMovie.title}
          </h1>

          <p className="text-sm md:text-base text-slate-200 line-clamp-3 md:line-clamp-4 drop-shadow-md font-medium max-w-xl leading-relaxed select-none">
            {activeMovie.overview || "No synopsis available for this title."}
          </p>

          <div className="flex items-center gap-3 pt-2 relative z-25">
            <button
              onClick={() => onPlay(activeMovie)}
              className="flex items-center gap-2 bg-white hover:bg-slate-200 text-black font-bold px-6 py-2.5 rounded-lg shadow-lg hover:scale-102 active:scale-98 transition cursor-pointer text-sm"
            >
              <PlayIcon className="w-4 h-4 fill-current" /> Watch Trailer
            </button>
            <button
              onClick={() => onInfo(activeMovie)}
              className="flex items-center gap-2 bg-slate-500/30 hover:bg-slate-500/40 text-white font-bold px-5 py-2.5 rounded-lg backdrop-blur-xs hover:scale-102 transition cursor-pointer text-sm"
            >
              <InfoIcon className="w-4 h-4" /> More Info
            </button>
          </div>
        </div>
      </div>

      {/* Manual Left/Right Chevrons */}
      {topMovies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/75 cursor-pointer opacity-0 group-hover/carousel:opacity-100 transition duration-300 focus:outline-hidden z-20"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/75 cursor-pointer opacity-0 group-hover/carousel:opacity-100 transition duration-300 focus:outline-hidden z-20"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Carousel dot indicators */}
      {topMovies.length > 1 && (
        <div className="absolute bottom-6 right-12 z-20 flex gap-2">
          {topMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1)
                setCurrentIndex(idx)
                resetTimer()
              }}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-red-600" : "w-1.5 bg-slate-500/50 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
