"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import {
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  XIcon,
  PlayIcon,
  InfoIcon,
  SparklesIcon,
  FilmIcon,
  FolderIcon,
  ExternalLinkIcon,
} from "lucide-react"

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
}: {
  movies: Movie[]
  categories: Category[]
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Select a hero movie (highest rated or first one)
  const heroMovie = useMemo(() => {
    if (movies.length === 0) return null
    return movies.reduce((max, m) => {
      const currentVal = parseFloat(m.voteAverage || "0")
      const maxVal = parseFloat(max.voteAverage || "0")
      return currentVal > maxVal ? m : max
    })
  }, [movies])

  // Filter movies based on search and selected category
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategoryId
        ? movie.categories.some((c) => c.id === selectedCategoryId)
        : true
      return matchesSearch && matchesCategory
    })
  }, [movies, searchQuery, selectedCategoryId])

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return ""
    return categories.find((c) => c.id === selectedCategoryId)?.name || ""
  }, [selectedCategoryId, categories])

  const handlePlayMovie = (movie: Movie) => {
    // If redirectUrl is configured, redirect after redirectTime
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

  return (
    <div className="min-h-screen text-slate-100 bg-background relative font-sans antialiased pb-20 selection:bg-red-600 selection:text-white">
      
      {/* Netflix-style Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-linear-to-b from-black/80 via-black/40 to-transparent backdrop-blur-xs transition-colors duration-300 py-3 px-4 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          {/* Logo */}
          <Link href="/" className="text-red-600 font-black text-2xl tracking-tighter uppercase font-heading hover:scale-105 transition-transform">
            PAGLA MOVIE
          </Link>
          
          {/* Main Links */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
            <Link href="/" className="text-white font-semibold hover:text-white transition">Home</Link>
            <span className="hover:text-white cursor-pointer transition">Series</span>
            <span className="hover:text-white cursor-pointer transition">Films</span>
            <span className="hover:text-white cursor-pointer transition">Games</span>
            <span className="hover:text-white cursor-pointer transition">New & Popular</span>
            <span className="hover:text-white cursor-pointer transition">My List</span>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition"
            >
              Browse by Category <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Mobile Browse Dropdown */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-slate-900/80 border border-slate-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-850"
            >
              Browse Categories <ChevronDownIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search bar */}
          <div className="relative flex items-center">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs w-36 sm:w-48 focus:outline-hidden focus:w-60 focus:border-red-600 focus:bg-slate-900 transition-all text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <button className="text-slate-300 hover:text-white transition relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-[#0f0f0f]">
              3
            </span>
          </button>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1 focus:outline-hidden group"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                alt="Profile"
                className="w-8 h-8 rounded-md object-cover border border-slate-800 group-hover:border-slate-500 transition"
              />
              <ChevronDownIcon className="w-3 h-3 text-slate-400 group-hover:text-white" />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-popover p-2 shadow-2xl animate-in fade-in duration-200">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/login"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition border-t border-slate-900"
                >
                  Log Out
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Billboard Banner */}
      {heroMovie && !selectedCategoryId && !searchQuery && (
        <div className="relative w-full h-[70vh] md:h-[85vh] flex items-end">
          {/* Backdrop Image */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie.backdropPath})` }}>
            <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-[#0f0f0f]/30 to-black/60" />
            <div className="absolute inset-0 bg-linear-to-r from-[#0f0f0f] via-transparent to-transparent" />
          </div>

          {/* Billboard Info */}
          <div className="relative z-10 max-w-2xl px-4 md:px-12 pb-16 md:pb-24 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <SparklesIcon className="w-3 h-3" /> Billboard Hit
              </span>
              <span className="text-xs text-slate-300 font-semibold font-mono">Rating: {heroMovie.voteAverage}/10</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg leading-tight uppercase font-heading">
              {heroMovie.title}
            </h1>
            
            <p className="text-sm md:text-base text-slate-300 line-clamp-3 md:line-clamp-4 drop-shadow-md font-medium max-w-xl leading-relaxed">
              {heroMovie.overview}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handlePlayMovie(heroMovie)}
                className="flex items-center gap-2 bg-white hover:bg-slate-200 text-black font-bold px-6 py-2.5 rounded-lg shadow-lg hover:scale-102 active:scale-98 transition cursor-pointer text-sm"
              >
                <PlayIcon className="w-4 h-4 fill-current" /> Watch Trailer
              </button>
              <button
                onClick={() => setActiveMovie(heroMovie)}
                className="flex items-center gap-2 bg-slate-500/30 hover:bg-slate-500/40 text-white font-bold px-5 py-2.5 rounded-lg backdrop-blur-xs hover:scale-102 transition cursor-pointer text-sm"
              >
                <InfoIcon className="w-4 h-4" /> More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Movies Grid */}
      <div className={`px-4 md:px-12 ${heroMovie && !selectedCategoryId && !searchQuery ? "pt-10" : "pt-24"} space-y-8`}>
        
        {/* Active Filters */}
        {(selectedCategoryId || searchQuery) && (
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-900 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <FilmIcon className="w-6 h-6 text-red-500" />
                {selectedCategoryId ? `Category: ${selectedCategoryName}` : "Search Results"}
              </h2>
              <p className="text-xs text-slate-500">
                Found {filteredMovies.length} movies matching your parameters.
              </p>
            </div>
            
            <button
              onClick={() => {
                setSelectedCategoryId(null)
                setSearchQuery("")
              }}
              className="text-xs bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 hover:bg-slate-850 px-3 py-1.5 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Movie cards list */}
        {filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-500 rounded-2xl border border-dashed border-slate-900">
            <FilmIcon className="w-12 h-12 mb-2 text-slate-700 animate-pulse" />
            <p className="text-sm font-semibold">No movies found match those filters.</p>
            <p className="text-xs text-slate-650 mt-1">Try resetting the tags/category filter or searching a different term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => setActiveMovie(movie)}
                className="group relative bg-card border border-slate-900/60 rounded-xl overflow-hidden shadow-lg hover:shadow-red-600/10 cursor-pointer transform hover:-translate-y-2 hover:scale-103 transition-all duration-300"
              >
                {/* Poster image */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                  {movie.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 font-bold p-4 text-center">
                      No Poster Available
                    </div>
                  )}
                  {/* Rating Badge */}
                  <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-[10px] font-bold text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">
                    ★ {movie.voteAverage || "0.0"}
                  </span>
                </div>

                {/* Card footer details */}
                <div className="p-3.5 space-y-1 bg-card">
                  <h3 className="font-bold text-xs text-slate-200 group-hover:text-white truncate transition-colors leading-tight">
                    {movie.title}
                  </h3>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{movie.releaseDate ? movie.releaseDate.split("-")[0] : "N/A"}</span>
                    <div className="flex gap-1 max-w-[80px] truncate">
                      {movie.categories.slice(0, 1).map((c) => (
                        <span key={c.id} className="text-red-400 font-medium">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browse by Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-900 bg-popover p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition focus:outline-hidden"
            >
              <XIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-extrabold text-white pr-8 tracking-tight flex items-center gap-2">
              <FolderIcon className="w-6 h-6 text-violet-400" /> Browse by Category
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Select a category to view matching movies and custom media content.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Category card options */}
              <button
                onClick={() => {
                  setSelectedCategoryId(null)
                  setIsCategoryModalOpen(false)
                }}
                className={`p-4 rounded-xl text-left border font-semibold transition ${
                  selectedCategoryId === null
                    ? "border-red-600 bg-red-600/10 text-white"
                    : "border-slate-900 bg-slate-950/60 text-slate-300 hover:border-slate-800 hover:text-white"
                }`}
              >
                <div className="text-sm">All Genres</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Show all ({movies.length})</div>
              </button>

              {categories.map((cat) => {
                const count = movies.filter((m) => m.categories.some((c) => c.id === cat.id)).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id)
                      setIsCategoryModalOpen(false)
                    }}
                    className={`p-4 rounded-xl text-left border font-semibold transition ${
                      selectedCategoryId === cat.id
                        ? "border-violet-600 bg-violet-600/10 text-white"
                        : "border-slate-900 bg-slate-950/60 text-slate-300 hover:border-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="text-sm truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Movies: {count}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Movie Details Modal Overlay */}
      {activeMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-900 bg-popover overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveMovie(null)}
              className="absolute right-4 top-4 z-10 bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white transition p-2 rounded-full focus:outline-hidden"
            >
              <XIcon className="w-5 h-5" />
            </button>

            {/* Poster / Backdrop Header */}
            <div className="relative w-full h-[220px] sm:h-[320px] bg-slate-950 flex items-end">
              {activeMovie.backdropPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${activeMovie.backdropPath}`}
                  alt={activeMovie.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-655 font-bold">
                  No Backdrop
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-popover via-popover/45 to-transparent" />
              <div className="relative z-10 p-6 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {activeMovie.categories.map((c) => (
                    <span
                      key={c.id}
                      className="px-2 py-0.5 rounded bg-red-650/80 border border-red-500/20 text-white text-[9px] font-bold uppercase tracking-wider"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md leading-tight uppercase font-heading">
                  {activeMovie.title}
                </h2>
              </div>
            </div>

            {/* Info details */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Top Ads Slot */}
              {activeMovie.topAds && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-mono text-center text-slate-400 overflow-x-auto select-all max-h-16">
                  {/* Dangerously inject the ads script code safely if user loads banner */}
                  <div dangerouslySetInnerHTML={{ __html: activeMovie.topAds }} />
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="text-yellow-500 font-bold text-sm">★ {activeMovie.voteAverage}/10</span>
                    <span className="font-mono">{activeMovie.releaseDate || "Release Date N/A"}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {activeMovie.overview || "No overview descriptions available for this title."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Watch Options</span>
                    <button
                      onClick={() => handlePlayMovie(activeMovie)}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer shadow-lg shadow-red-600/10 transition"
                    >
                      <PlayIcon className="w-3.5 h-3.5 fill-current" /> Watch Link
                    </button>
                  </div>

                  {activeMovie.referralUrl && (
                    <div className="space-y-1 pt-1 border-t border-slate-900">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Referral/Sponsored Link</span>
                      <a
                        href={activeMovie.referralUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 bg-[#181818] hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 border border-slate-800 font-bold py-2.5 rounded-lg text-xs cursor-pointer transition"
                      >
                        Visit Offer <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Banner Ad Image */}
              {activeMovie.modalImage && (
                <div className="pt-4 border-t border-slate-900">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Promotional Banner</span>
                  <div className="rounded-xl overflow-hidden border border-slate-900 bg-slate-950 aspect-[21/9] flex items-center justify-center p-1">
                    <img src={activeMovie.modalImage} alt="Promotion" className="max-h-full max-w-full object-contain rounded-lg" />
                  </div>
                </div>
              )}

              {/* Modal Ads Script Code */}
              {activeMovie.modalAds && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-500 overflow-x-auto select-all max-h-16">
                  <div dangerouslySetInnerHTML={{ __html: activeMovie.modalAds }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
