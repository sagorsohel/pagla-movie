"use client"

import * as React from "react"
import { useMemo, useRef, useEffect, useState } from "react"
import { Play, Sparkles } from "lucide-react"

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
}

export function MobileHeroSlider({
  movies,
  onPlay,
  onInfo
}: {
  movies: Movie[]
  onPlay: (movie: Movie) => void
  onInfo: (movie: Movie) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Get top 6 highest-rated movies for the featured mobile carousel
  const featuredMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => parseFloat(b.voteAverage || "0") - parseFloat(a.voteAverage || "0"))
      .slice(0, 6)
  }, [movies])

  // Track active slide based on scroll position for pagination indicators
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    if (clientWidth === 0) return
    const index = Math.round(scrollLeft / (clientWidth * 0.85))
    setActiveIndex(Math.min(Math.max(0, index), featuredMovies.length - 1))
  }

  if (featuredMovies.length === 0) return null

  return (
    <div className="md:hidden w-full bg-background pt-20 pb-4 flex flex-col gap-3.5 select-none font-sans overflow-hidden">
      {/* Visual Header */}
      <div className="px-[9vw] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 font-mono">
            Featured Spotlight
          </span>
        </div>
        <div className="text-[10px] font-bold text-slate-500 font-mono">
          Swipe to explore
        </div>
      </div>

      {/* Swipeable Card Viewport */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 px-[9vw] snap-x snap-mandatory scroll-smooth scrollbar-none py-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {featuredMovies.map((movie, idx) => {
          const categoryName = movie.categories[0]?.name || "Featured"

          return (
            <div
              key={`mobile-hero-${movie.id}`}
              onClick={() => onInfo(movie)}
              className="snap-center shrink-0 w-[82vw] sm:w-[85vw] aspect-[16/9.5] rounded-2xl overflow-hidden relative border border-slate-900 shadow-xl bg-slate-950 cursor-pointer active:scale-98 transition transform duration-150"
            >
              {/* Card Image Backdrop */}
              {movie.backdropPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://image.tmdb.org/t/p/w780${movie.backdropPath}`}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-xs">
                  NO BACKDROP
                </div>
              )}

              {/* Gradient Bottom Tint matching the reference card style */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />

              {/* Card Contents */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-extrabold text-[8px] uppercase tracking-wider">
                    {categoryName}
                  </span>
                  <span className="text-[10px] text-yellow-400 font-extrabold font-mono">
                    ★ {movie.voteAverage}/10
                  </span>
                </div>

                <h3 className="text-sm font-black uppercase text-white tracking-wide drop-shadow-md truncate">
                  {movie.title}
                </h3>

                <p className="text-[10px] text-slate-350 line-clamp-1 leading-normal font-medium pr-6">
                  {movie.overview || "See details and download links."}
                </p>
              </div>

              {/* Play floating action button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlay(movie)
                }}
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer z-20"
                aria-label="Play trailer"
              >
                <Play className="w-4.5 h-4.5 fill-current pl-0.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Pagination indicators / dot bars */}
      <div className="flex justify-center gap-1.5 pt-1">
        {featuredMovies.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === activeIndex ? "w-4.5 bg-red-600" : "w-1.5 bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
