"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CineNavbar } from "@/components/cine-navbar"
import { getTranslation, type Locale } from "@/lib/translations"

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
  categories: { id: number; name: string }[]
}

export function SearchResultsClient({
  movies,
  searchQuery,
  locale = "en",
}: {
  movies: Movie[]
  searchQuery: string
  locale: Locale
}) {
  const t = getTranslation(locale)
  const router = useRouter()
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

  const handleMovieClick = (movie: Movie) => {
    router.push(`/${locale}/movie/${movie.slug || movie.id}`)
  }

  return (
    <div className="min-h-screen text-slate-100 bg-background relative font-sans antialiased pb-20">
      <CineNavbar locale={locale} searchQuery={searchQuery} />

      {/* Top Ad */}
      {adsConfig?.topAds && (
        <div className="w-full pt-[57px] bg-slate-950 flex justify-center px-4 py-2 border-b border-slate-900/40 select-none">
          <div className="w-full max-w-4xl flex justify-center">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      html, body { margin: 0; padding: 0; overflow: hidden; background: transparent !important; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; }
                    </style>
                  </head>
                  <body>
                    ${adsConfig.topAds}
                  </body>
                </html>
              `}
              width="100%"
              height="60px"
              style={{ border: "none", overflow: "hidden", background: "transparent" }}
              scrolling="no"
              title="Top Banner Ad"
            />
          </div>
        </div>
      )}

      {/* Search Content */}
      <div className={`max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pb-12 ${adsConfig?.topAds ? "pt-8" : "pt-24"} space-y-8`}>
        {/* Header */}
        <div className="border-b border-slate-900/60 pb-4">
          <h1 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider">
            {searchQuery.trim() ? (
              <span>Search Results for: <span className="text-red-500">{searchQuery}</span></span>
            ) : (
              <span>Explore All Titles</span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold font-mono">
            Found {movies.length} {movies.length === 1 ? "title" : "titles"}
          </p>
        </div>

        {/* Movies Grid */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleMovieClick(movie)}
                className="group/card relative bg-card border border-slate-900/60 rounded-xl overflow-hidden shadow-lg hover:shadow-red-650/15 cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 select-none"
              >
                {/* Poster Aspect Ratio Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover/card:scale-104 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold p-4 text-center">
                      No Poster Available
                    </div>
                  )}
                  {/* Rating Badge */}
                  <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-[10px] font-black text-yellow-500 px-1.5 py-0.5 rounded-lg border border-yellow-500/20 shadow-md">
                    ★ {movie.voteAverage || "0.0"}
                  </span>
                </div>

                {/* Title Card details */}
                <div className="p-3.5 space-y-1 bg-slate-950/80">
                  <h3 className="font-extrabold text-xs text-slate-200 group-hover/card:text-red-500 truncate transition-colors leading-tight uppercase tracking-wide">
                    {movie.title}
                  </h3>
                  <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-500 font-mono">
                    <span>{movie.releaseDate ? movie.releaseDate.split("-")[0] : "N/A"}</span>
                    <span className="text-red-500 truncate max-w-[80px]">
                      {movie.categories[0]?.name || ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <span className="text-2xl font-black">?</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">No results found</h3>
              <p className="text-xs text-slate-500 max-w-sm font-semibold">
                We couldn't find any titles matching "{searchQuery}". Try checking the spelling or searching for another keyword.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
