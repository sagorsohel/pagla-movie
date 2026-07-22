"use client"

import * as React from "react"
import { useRef } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

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

export function MovieRow({
  title,
  movies,
  onMovieClick,
  onSeeMore,
}: {
  title: string
  movies: Movie[]
  onMovieClick: (movie: Movie) => void
  onSeeMore: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75
      scrollRef.current.scrollTo({
        left: scrollLeft + offset,
        behavior: "smooth",
      })
    }
  }

  if (movies.length === 0) return null

  return (
    <div className="space-y-3 relative group/row">
      {/* Row Header */}
      <div className="flex justify-between items-end px-1">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-white select-none">
          {title}
        </h2>
        <button
          onClick={onSeeMore}
          className="text-xs font-semibold text-red-500 hover:text-red-400 cursor-pointer transition select-none"
        >
          See More
        </button>
      </div>

      {/* Row Wrapper */}
      <div className="relative w-full">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-0 top-0 bottom-0 w-10 bg-black/50 hover:bg-black/85 text-white flex items-center justify-center rounded-r-lg opacity-0 group-hover/row:opacity-100 transition-opacity z-20 cursor-pointer focus:outline-hidden"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth py-2 px-1 no-scrollbar overflow-y-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onMovieClick(movie)}
              className="min-w-[140px] sm:min-w-[160px] md:min-w-[180px] group/card relative bg-card border border-slate-900/60 rounded-lg overflow-hidden shadow-md hover:shadow-red-600/10 cursor-pointer transform hover:-translate-y-1 hover:scale-102 transition-all duration-300"
            >
              {/* Poster Image */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                {movie.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  />
                ) : movie.backdropPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.backdropPath}`}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 font-bold p-4 text-center">
                    No Poster
                  </div>
                )}
                {/* Rating Badge */}
                <span className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-[9px] font-bold text-yellow-500 px-1 py-0.2 rounded border border-yellow-500/20">
                  ★ {movie.voteAverage || "0.0"}
                </span>
              </div>

              {/* Card Title Details */}
              <div className="p-2.5 space-y-0.5 bg-card">
                <h3 className="font-bold text-xs text-slate-200 group-hover/card:text-white truncate transition-colors leading-tight">
                  {movie.title}
                </h3>
                <div className="flex justify-between items-center text-[9px] text-slate-500">
                  <span>{movie.releaseDate ? movie.releaseDate.split("-")[0] : "N/A"}</span>
                  <span className="text-red-400 font-medium truncate max-w-[70px]">
                    {movie.categories[0]?.name || ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-0 top-0 bottom-0 w-10 bg-black/50 hover:bg-black/85 text-white flex items-center justify-center rounded-l-lg opacity-0 group-hover/row:opacity-100 transition-opacity z-20 cursor-pointer focus:outline-hidden"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
