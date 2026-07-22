"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
import { MobileHeroSlider } from "@/components/mobile-hero-slider"
import { MovieRow } from "@/components/movie-row"
import AdCard from "@/components/ad-card"
import { CineMoviesLogo } from "@/components/logo"
import { getTranslation, type Locale } from "@/lib/translations"
import { LanguageSelector } from "@/components/language-selector"
import { CineNavbar } from "@/components/cine-navbar"
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  XIcon,
  FilmIcon,
  FolderIcon,
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

type Category = {
  id: number
  name: string
  slug: string
  referralUrl: string | null
  modalImage: string | null
}

const getCategoryGradient = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes("action") || n.includes("adventure")) {
    return "from-[#08203e]/80 via-[#0e1627] to-[#080a10]"
  }
  if (n.includes("comedy")) {
    return "from-[#30210f]/80 via-[#191410] to-[#080a10]"
  }
  if (n.includes("documentary") || n.includes("history")) {
    return "from-[#0d2a24]/80 via-[#091715] to-[#080a10]"
  }
  if (n.includes("drama") || n.includes("war")) {
    return "from-[#3e0d12]/80 via-[#1f0e10] to-[#080a10]"
  }
  if (n.includes("fantasy") || n.includes("animation")) {
    return "from-[#220d3e]/80 via-[#160d24] to-[#080a10]"
  }
  if (n.includes("horror") || n.includes("thriller")) {
    return "from-[#0a2f1d]/80 via-[#0a1811] to-[#080a10]"
  }
  if (n.includes("family") || n.includes("kids")) {
    return "from-[#3a1d0f]/80 via-[#1b120f] to-[#080a10]"
  }
  if (n.includes("mystery") || n.includes("crime")) {
    return "from-[#0c2448]/80 via-[#0a1226] to-[#080a10]"
  }
  if (n.includes("romance")) {
    return "from-[#3a0d1f]/80 via-[#1e0a13] to-[#080a10]"
  }
  if (n.includes("science fiction") || n.includes("sci-fi")) {
    return "from-[#242c38]/70 via-[#11141b] to-[#080a10]"
  }
  return "from-[#1f2937]/50 via-slate-950 to-[#080a10]"
}

export function HomeClient({
  movies,
  categories,
  locale = "en",
}: {
  movies: Movie[]
  categories: Category[]
  locale?: Locale
}) {
  const t = getTranslation(locale)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [adsConfig, setAdsConfig] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

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

  // Redirect to standalone single movie detail page
  const handleMovieClick = (movie: Movie) => {
    router.push(`/${locale}/movie/${movie.slug || movie.id}`)
  }

  // Select a hero movie (highest rated or first one)
  const heroMovie = useMemo(() => {
    if (movies.length === 0) return null
    return movies.reduce((max, m) => {
      const currentVal = parseFloat(m.voteAverage || "0")
      const maxVal = parseFloat(max.voteAverage || "0")
      return currentVal > maxVal ? m : max
    })
  }, [movies])

  // today's top list
  const todaysTopMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => {
        const ratingA = parseFloat(a.voteAverage || "0")
        const ratingB = parseFloat(b.voteAverage || "0")
        return ratingB - ratingA
      })
      .slice(0, 15)
  }, [movies])

  // top rated list
  const topRatedMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => parseFloat(b.voteAverage || "0") - parseFloat(a.voteAverage || "0"))
      .slice(0, 15)
  }, [movies])

  // upcoming releases list
  const upcomingMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => {
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 15)
  }, [movies])

  // Filter movies based on search, category selection or virtual rows
  const filteredMovies = useMemo(() => {
    if (searchQuery) {
      return movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (selectedCategoryId) {
      return movies.filter((movie) =>
        movie.categories.some((c) => c.id === selectedCategoryId)
      )
    }
    if (filterType === "todays-top") {
      return todaysTopMovies
    }
    if (filterType === "top-rated") {
      return topRatedMovies
    }
    if (filterType === "upcoming") {
      return upcomingMovies
    }
    if (filterType === "series") {
      return movies.filter((movie) =>
        movie.categories.some((c) => c.name === "TV Movie" || c.name === "Drama" || c.name === "Mystery")
      )
    }
    if (filterType === "films") {
      return movies
    }
    if (filterType === "games") {
      return movies.filter((movie) =>
        movie.categories.some((c) => c.name === "Action" || c.name === "Adventure" || c.name === "Science Fiction")
      )
    }
    if (filterType === "new-popular") {
      return [...movies].sort((a, b) => parseFloat(b.voteAverage || "0") - parseFloat(a.voteAverage || "0"))
    }
    if (filterType === "my-list") {
      return movies.filter((movie) => parseFloat(movie.voteAverage || "0") >= 7.0)
    }
    return movies
  }, [movies, searchQuery, selectedCategoryId, filterType, todaysTopMovies, topRatedMovies, upcomingMovies])

  const selectedFilterName = useMemo(() => {
    if (selectedCategoryId) {
      return categories.find((c) => c.id === selectedCategoryId)?.name || ""
    }
    if (filterType === "todays-top") return "Today's Top Hits"
    if (filterType === "top-rated") return "Top Rated Movies"
    if (filterType === "upcoming") return "Upcoming Releases"
    if (filterType === "series") return "Series & Shows"
    if (filterType === "films") return "All Films"
    if (filterType === "games") return "Games & Action"
    if (filterType === "new-popular") return "New & Popular"
    if (filterType === "my-list") return "My Watchlist"
    return ""
  }, [selectedCategoryId, filterType, categories])

  const handlePlayMovie = (movie: Movie) => {
    if (movie.redirectUrl) {
      const delay = (movie.redirectTime || 5) * 1000
      alert(`Redirecting to movie player in ${movie.redirectTime || 5} seconds...`)
      setTimeout(() => {
        window.open(movie.redirectUrl!, "_blank")
      }, delay)
    } else if (movie.referralUrl) {
      window.open(movie.referralUrl, "_blank")
    } else {
      alert(`Playing: ${movie.title} (No external stream link configured)`)
    }
  }

  const resetAllFilters = () => {
    setSelectedCategoryId(null)
    setFilterType(null)
    setSearchQuery("")
  }

  const isFilterActive = searchQuery || selectedCategoryId || filterType

  return (
    <div className="min-h-screen text-slate-100 bg-background relative font-sans antialiased pb-20 selection:bg-red-600 selection:text-white">
      
      {/* Netflix-style Navbar */}
      <CineNavbar
        locale={locale}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        onBrowseCategoryClick={() => setIsCategoryModalOpen(true)}
      />

      {/* Hero Billboard Banner (Carousel) */}
      {!isFilterActive && (
        <>
          {/* Desktop Banner Carousel */}
          <div className="hidden md:block">
            <HeroCarousel
              movies={movies}
              onPlay={handlePlayMovie}
              onInfo={handleMovieClick}
            />
          </div>
          {/* Mobile Card Swipe Carousel */}
          <MobileHeroSlider
            movies={movies}
            onPlay={handlePlayMovie}
            onInfo={handleMovieClick}
          />
        </>
      )}

      {/* Content Section */}
      <div className={`px-4 md:px-12 ${!isFilterActive ? "pt-10" : "pt-24"} space-y-12`}>
        
        {/* If any filter (search/category/virtual row) is active, show flat grid view */}
        {isFilterActive ? (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-900 pb-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <FilmIcon className="w-6 h-6 text-red-500" />
                  {searchQuery ? "Search Results" : selectedFilterName}
                </h2>
                <p className="text-xs text-slate-500">
                  Found {filteredMovies.length} movies matching your parameters.
                </p>
              </div>
              
              <button
                onClick={resetAllFilters}
                className="text-xs bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 hover:bg-slate-850 px-3 py-1.5 rounded-lg cursor-pointer transition"
              >
                Reset Filters
              </button>
            </div>

            {filteredMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-500 rounded-2xl border border-dashed border-slate-900">
                <FilmIcon className="w-12 h-12 mb-2 text-slate-700 animate-pulse" />
                <p className="text-sm font-semibold">{t.noMovies}</p>
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-red-500 hover:text-red-400 font-semibold mt-2"
                >
                  {t.clearFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleMovieClick(movie)}
                    className="group relative bg-card border border-slate-900/60 rounded-xl overflow-hidden shadow-lg hover:shadow-red-600/10 cursor-pointer transform hover:-translate-y-2 hover:scale-103 transition-all duration-300"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                      {movie.posterPath ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-655 font-bold p-4 text-center">
                          No Poster
                        </div>
                      )}
                      <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-[10px] font-bold text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                        ★ {movie.voteAverage || "0.0"}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="p-3.5 space-y-1 bg-card">
                      <h3 className="font-bold text-xs text-slate-200 group-hover:text-white truncate transition-colors leading-tight">
                        {movie.title}
                      </h3>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>{movie.releaseDate ? movie.releaseDate.split("-")[0] : "N/A"}</span>
                        <span className="text-red-400 font-medium truncate max-w-[80px]">
                          {movie.categories[0]?.name || ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default state: Horizontal categories scrolling lists */
          <div className="space-y-10">
            {/* 1. Today's Top Row */}
            <MovieRow
              title={t.topHits}
              movies={todaysTopMovies}
              onMovieClick={handleMovieClick}
              onSeeMore={() => setFilterType("todays-top")}
            />

            {/* Ad Card 1 */}
            <div className="w-full max-w-[1400px] mx-auto py-2">
              <AdCard scriptHtml={adsConfig?.heroAds} scriptHtml2={adsConfig?.hero2Ads} />
            </div>

            {/* 2. Top Rated Row */}
            <MovieRow
              title={t.topRated}
              movies={topRatedMovies}
              onMovieClick={handleMovieClick}
              onSeeMore={() => setFilterType("top-rated")}
            />

            {/* Ad Card after Top Rated */}
            <div className="w-full max-w-[1400px] mx-auto py-2">
              <AdCard scriptHtml={adsConfig?.heroAds} scriptHtml2={adsConfig?.hero2Ads} />
            </div>

            {/* 3. Upcoming Row */}
            <MovieRow
              title={t.upcoming}
              movies={upcomingMovies}
              onMovieClick={handleMovieClick}
              onSeeMore={() => setFilterType("upcoming")}
            />

            {/* Ad Card after Upcoming */}
            <div className="w-full max-w-[1400px] mx-auto py-2">
              <AdCard scriptHtml={adsConfig?.heroAds} scriptHtml2={adsConfig?.hero2Ads} />
            </div>

            {/* 4. Category-Wise Rows dynamically rendered with AdCard after each row */}
            {categories.map((cat) => {
              const catMovies = movies.filter((m) =>
                m.categories.some((c) => c.id === cat.id)
              )
              return (
                <React.Fragment key={cat.id}>
                  <MovieRow
                    title={cat.name}
                    movies={catMovies}
                    onMovieClick={handleMovieClick}
                    onSeeMore={() => setSelectedCategoryId(cat.id)}
                  />
                  <div className="w-full max-w-[1400px] mx-auto py-2">
                    <AdCard scriptHtml={adsConfig?.heroAds} scriptHtml2={adsConfig?.hero2Ads} />
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>

      {/* Browse by Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-3xl border border-slate-900 bg-[#090b10] p-8 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-8 select-none">
            
            {/* Header & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Categories
              </h2>
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Genres
              </h3>
            </div>

            {/* Grid of Prime-style Category cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              
              {/* All Genres Card */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null)
                  setFilterType(null)
                  setIsCategoryModalOpen(false)
                }}
                className={`group relative h-20 sm:h-24 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 hover:scale-102 hover:border-slate-600/40 hover:shadow-2xl overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-950 to-[#080a10] ${
                  selectedCategoryId === null && filterType === null
                    ? "border-red-600"
                    : "border-slate-900/60"
                }`}
              >
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight relative z-10 transition-colors group-hover:text-red-400">
                  {t.allGenres}
                </span>
                <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>

              {/* Dynamic Category Cards */}
              {categories.map((cat) => {
                const gradientClasses = getCategoryGradient(cat.name)
                const isSelected = selectedCategoryId === cat.id

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id)
                      setFilterType(null)
                      setIsCategoryModalOpen(false)
                    }}
                    className={`group relative h-20 sm:h-24 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 hover:scale-102 hover:border-slate-600/40 hover:shadow-2xl overflow-hidden bg-gradient-to-tr ${gradientClasses} ${
                      isSelected ? "border-violet-600" : "border-slate-900/60"
                    }`}
                  >
                    <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug block relative z-10 transition-colors group-hover:text-violet-300">
                      {cat.name}
                    </span>
                    <div className="absolute inset-0 bg-white/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </button>
                )
              })}

            </div>

            {/* Close button */}
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
