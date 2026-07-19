"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
import { MovieRow } from "@/components/movie-row"
import AdCard from "@/components/ad-card"
import { CineMoviesLogo } from "@/components/logo"
import { getTranslation, type Locale } from "@/lib/translations"
import { LanguageSelector } from "@/components/language-selector"
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
  const [filterType, setFilterType] = useState<"todays-top" | "top-rated" | "upcoming" | null>(null)
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
    return movies
  }, [movies, searchQuery, selectedCategoryId, filterType, todaysTopMovies, topRatedMovies, upcomingMovies])

  const selectedFilterName = useMemo(() => {
    if (selectedCategoryId) {
      return categories.find((c) => c.id === selectedCategoryId)?.name || ""
    }
    if (filterType === "todays-top") return "Today's Top Hits"
    if (filterType === "top-rated") return "Top Rated Movies"
    if (filterType === "upcoming") return "Upcoming Releases"
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
      <nav className="fixed top-0 left-0 right-0 z-40 bg-linear-to-b from-black/80 via-black/40 to-transparent backdrop-blur-xs transition-colors duration-300 py-3 px-3 sm:px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6 md:gap-10">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            onClick={resetAllFilters}
          >
            <CineMoviesLogo />
          </Link>
          
          {/* Main Links */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
            <button onClick={resetAllFilters} className="text-white font-semibold hover:text-white transition cursor-pointer">
              {t.home}
            </button>
            <span className="hover:text-white cursor-pointer transition">{t.series}</span>
            <span className="hover:text-white cursor-pointer transition">{t.films}</span>
            <span className="hover:text-white cursor-pointer transition">{t.games}</span>
            <span className="hover:text-white cursor-pointer transition">{t.newPopular}</span>
            <span className="hover:text-white cursor-pointer transition">{t.myList}</span>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              {t.browseCategory} <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Mobile Browse Dropdown */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-slate-900/80 border border-slate-800 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-850 text-slate-200"
            >
              <span className="hidden sm:inline">{t.browseCategory}</span>
              <span className="sm:hidden">{t.genres.replace(':', '')}</span>
              <ChevronDownIcon className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Search bar */}
          <div className="relative flex items-center">
            <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedCategoryId(null)
                setFilterType(null)
              }}
              className="bg-slate-900/60 border border-slate-800 rounded-full py-1.5 pl-8 pr-3 text-[11px] w-24 sm:w-36 md:w-48 focus:outline-hidden focus:w-32 sm:focus:w-52 md:focus:w-60 focus:border-red-600 focus:bg-slate-900 transition-all text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <button className="text-slate-350 hover:text-white transition relative">
            <BellIcon className="w-4.5 h-4.5 sm:w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full border border-slate-950">
              3
            </span>
          </button>

          {/* Language Selector */}
          <LanguageSelector currentLocale={locale} />

          {/* User Profile Avatar */}
          <div className="relative flex items-center">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-0.5 focus:outline-hidden group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                alt="Profile"
                className="w-7 h-7 sm:w-8 h-8 rounded-md object-cover border border-slate-800 group-hover:border-slate-500 transition"
              />
              <ChevronDownIcon className="w-2.5 h-2.5 text-slate-400 group-hover:text-white hidden sm:block" />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-800 bg-popover p-2 shadow-2xl animate-in fade-in duration-200">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900/40 hover:text-white transition"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href={`/${locale}/login`}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900/40 hover:text-white transition border-t border-slate-800/40"
                >
                  Log Out
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Billboard Banner (Carousel) */}
      {!isFilterActive && (
        <HeroCarousel
          movies={movies}
          onPlay={handlePlayMovie}
          onInfo={handleMovieClick}
        />
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

            {/* 3. Upcoming Row */}
            <MovieRow
              title={t.upcoming}
              movies={upcomingMovies}
              onMovieClick={handleMovieClick}
              onSeeMore={() => setFilterType("upcoming")}
            />

            {/* Ad Card 2 */}
            <div className="w-full max-w-[1400px] mx-auto py-2">
              <AdCard scriptHtml={adsConfig?.hero2Ads} scriptHtml2={adsConfig?.heroAds} />
            </div>

            {/* 4. Category-Wise Rows dynamically rendered */}
            {categories.map((cat) => {
              const catMovies = movies.filter((m) =>
                m.categories.some((c) => c.id === cat.id)
              )
              return (
                <MovieRow
                  key={cat.id}
                  title={cat.name}
                  movies={catMovies}
                  onMovieClick={handleMovieClick}
                  onSeeMore={() => setSelectedCategoryId(cat.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Browse by Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-900 bg-popover p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition focus:outline-hidden cursor-pointer"
            >
              <XIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-extrabold text-white pr-8 tracking-tight flex items-center gap-2">
              <FolderIcon className="w-6 h-6 text-violet-400" /> {t.browseCategory}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Select a category to view matching movies and custom media content.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setSelectedCategoryId(null)
                  setFilterType(null)
                  setIsCategoryModalOpen(false)
                }}
                className={`p-4 rounded-xl text-left border font-semibold cursor-pointer transition ${
                  selectedCategoryId === null && filterType === null
                    ? "border-red-600 bg-red-600/10 text-white"
                    : "border-slate-900 bg-slate-950/60 text-slate-300 hover:border-slate-800 hover:text-white"
                }`}
              >
                <div className="text-sm">{t.allGenres}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{t.showAll} ({movies.length})</div>
              </button>

              {categories.map((cat) => {
                const count = movies.filter((m) => m.categories.some((c) => c.id === cat.id)).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id)
                      setFilterType(null)
                      setIsCategoryModalOpen(false)
                    }}
                    className={`p-4 rounded-xl text-left border font-semibold cursor-pointer transition ${
                      selectedCategoryId === cat.id
                        ? "border-violet-600 bg-violet-600/10 text-white"
                        : "border-slate-900 bg-slate-950/60 text-slate-300 hover:border-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="text-sm truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{t.moviesCount} {count}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
