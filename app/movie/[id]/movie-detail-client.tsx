"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  videos?: any
  cast?: any
  crew?: any
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

  const handlePlayMovie = () => {
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
          
          <Link href="/" className="text-red-600 font-black text-xl tracking-tighter uppercase font-heading hidden sm:block">
            PAGLA MOVIE
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

      {/* Billboard Header (Full Page Style) */}
      <div className="relative w-full min-h-[90vh] md:min-h-screen bg-slate-950 flex items-center overflow-hidden border-b border-slate-900/50">
        {/* Backdrop on the right */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[65%] h-full opacity-55 md:opacity-90 z-0">
          {movie.backdropPath ? (
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
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
                      onClick={() => router.push(`/movie/${m.id}`)}
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
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-900 text-[10px] font-mono text-slate-500 overflow-x-auto select-all max-h-16">
                <div dangerouslySetInnerHTML={{ __html: movie.modalAds }} />
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
