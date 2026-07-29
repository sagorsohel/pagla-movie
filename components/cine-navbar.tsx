"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CineMoviesLogo } from "./logo"
import { getTranslation, type Locale } from "@/lib/translations"
import { LanguageSelector } from "./language-selector"
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Film,
  Tv,
  Users,
  Grid,
  LogIn,
  UserPlus
} from "lucide-react"

interface CineNavbarProps {
  locale: Locale
  searchQuery?: string
  setSearchQuery?: (q: string) => void
  filterType?: string | null
  setFilterType?: (f: string | null) => void
  selectedCategoryId?: number | null
  setSelectedCategoryId?: (id: number | null) => void
  onBrowseCategoryClick?: () => void
}

export function CineNavbar({
  locale,
  searchQuery = "",
  setSearchQuery,
  filterType = null,
  setFilterType,
  selectedCategoryId = null,
  setSelectedCategoryId,
  onBrowseCategoryClick
}: CineNavbarProps) {
  const router = useRouter()
  const t = getTranslation(locale)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [activeDropdown, setActiveDropdown] = useState<"movies" | "tv" | "genres" | null>(null)
  const [signinUrl, setSigninUrl] = useState("/signup")
  const [registerUrl, setRegisterUrl] = useState("/signup")
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    async function loadAuthLinks() {
      try {
        const res = await fetch("/api/manage/ads", { next: { revalidate: 60 } })
        const data = await res.json()
        if (data.success && data.ads) {
          if (data.ads.signinRefLink) setSigninUrl(data.ads.signinRefLink)
          if (data.ads.membershipRefLink) setRegisterUrl(data.ads.membershipRefLink)
        }
      } catch (e) {
        console.error("Failed to load auth button links:", e)
      }
    }
    loadAuthLinks()
  }, [])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    const targetUrl = `/${locale}/search?q=${encodeURIComponent(value)}`
    if (typeof window !== "undefined" && window.location.pathname.endsWith("/search")) {
      router.replace(targetUrl)
    } else {
      router.push(targetUrl)
    }
  }

  const handleFilterClick = (type: string | null) => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
    if (setFilterType && setSelectedCategoryId && setSearchQuery) {
      setSelectedCategoryId(null)
      setSearchQuery("")
      setFilterType(type)
    } else {
      if (type) {
        router.push(`/${locale}?filter=${type}`)
      } else {
        router.push(`/${locale}`)
      }
    }
  }

  const handleBrowseCategory = () => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
    if (onBrowseCategoryClick) {
      onBrowseCategoryClick()
    } else {
      router.push(`/${locale}?browse=true`)
    }
  }

  const handleMouseEnter = (menu: "movies" | "tv" | "genres") => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
    setActiveDropdown(menu)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-900/80 transition-all duration-300 py-2.5 px-4 sm:px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            onClick={() => handleFilterClick(null)}
            className="block shrink-0"
          >
            <CineMoviesLogo />
          </Link>

          {/* Desktop Navigation Links (Matching User Screenshot) */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300 select-none">
            {/* Movies Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("movies")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleFilterClick("films")}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition py-1 text-slate-200 font-semibold"
              >
                Movies <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {activeDropdown === "movies" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-300 animate-in fade-in-50 duration-150">
                  <button
                    onClick={() => handleFilterClick("films")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
                  >
                    <Film className="w-3.5 h-3.5 text-red-500" /> Popular Movies
                  </button>
                  <button
                    onClick={() => handleFilterClick("films")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white transition"
                  >
                    Top Rated
                  </button>
                  <button
                    onClick={() => handleFilterClick("films")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white transition"
                  >
                    Now Playing
                  </button>
                </div>
              )}
            </div>

            {/* TV Shows Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("tv")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleFilterClick("series")}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition py-1 text-slate-200 font-semibold"
              >
                TV Shows <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {activeDropdown === "tv" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-300 animate-in fade-in-50 duration-150">
                  <button
                    onClick={() => handleFilterClick("series")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
                  >
                    <Tv className="w-3.5 h-3.5 text-red-500" /> Popular TV Shows
                  </button>
                  <button
                    onClick={() => handleFilterClick("series")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white transition"
                  >
                    Top Rated Series
                  </button>
                  <button
                    onClick={() => handleFilterClick("series")}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white transition"
                  >
                    Airing Today
                  </button>
                </div>
              )}
            </div>

            {/* Genres Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("genres")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={handleBrowseCategory}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition py-1 text-slate-200 font-semibold"
              >
                Genres <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {activeDropdown === "genres" && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-300 animate-in fade-in-50 duration-150">
                  <button
                    onClick={handleBrowseCategory}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
                  >
                    <Grid className="w-3.5 h-3.5 text-red-500" /> All Categories
                  </button>
                  <div className="my-1 border-t border-slate-800/80" />
                  <button onClick={handleBrowseCategory} className="w-full text-left px-4 py-1.5 hover:bg-slate-800 hover:text-white transition">Action</button>
                  <button onClick={handleBrowseCategory} className="w-full text-left px-4 py-1.5 hover:bg-slate-800 hover:text-white transition">Comedy</button>
                  <button onClick={handleBrowseCategory} className="w-full text-left px-4 py-1.5 hover:bg-slate-800 hover:text-white transition">Drama</button>
                  <button onClick={handleBrowseCategory} className="w-full text-left px-4 py-1.5 hover:bg-slate-800 hover:text-white transition">Sci-Fi & Fantasy</button>
                </div>
              )}
            </div>

            {/* Popular People */}
            <button
              onClick={() => handleFilterClick("new-popular")}
              className="hover:text-white cursor-pointer transition py-1 text-slate-200 font-semibold flex items-center gap-1.5"
            >
              Popular People
            </button>
          </div>
        </div>

        {/* Right side controls (Search, Language, Sign In, Register) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-slate-900/70 border border-slate-800 rounded-full py-1.5 pl-8 pr-3 text-[10px] sm:text-xs w-20 sm:w-32 md:w-44 focus:outline-hidden focus:w-28 sm:focus:w-48 md:focus:w-56 focus:border-red-600 focus:bg-slate-900 transition-all text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Language Selector */}
          <LanguageSelector currentLocale={locale} />

          {/* Sign In & Register buttons (Navigates in Same Tab) */}
          <div className="hidden sm:flex items-center gap-2.5 pl-1 border-l border-slate-800/80">
            <a
              href={signinUrl}
              target="_self"
              className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-white border border-red-600/90 hover:border-red-500 px-4 py-1.5 rounded-lg bg-slate-950/60 hover:bg-red-950/30 transition duration-150"
            >
              Sign In
            </a>
            <a
              href={registerUrl}
              target="_self"
              className="text-xs sm:text-sm font-extrabold bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg transition duration-150 shadow-md shadow-red-950/40"
            >
              Register
            </a>
          </div>

          {/* Mobile Hamburger Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-slate-200 hover:text-white transition p-1 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Responsive Navigation Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[55px] z-39 bg-slate-950/95 backdrop-blur-md border-b border-slate-900/90 py-5 px-6 animate-in slide-in-from-top duration-200 lg:hidden flex flex-col gap-4 text-sm font-semibold select-none">
          <button
            onClick={() => handleFilterClick("films")}
            className="flex items-center gap-3 py-2 text-left w-full text-slate-300 hover:text-white transition"
          >
            <Film className="w-4 h-4 text-red-500" />
            <span>Movies</span>
          </button>
          <button
            onClick={() => handleFilterClick("series")}
            className="flex items-center gap-3 py-2 text-left w-full text-slate-300 hover:text-white transition"
          >
            <Tv className="w-4 h-4 text-red-500" />
            <span>TV Shows</span>
          </button>
          <button
            onClick={handleBrowseCategory}
            className="flex items-center gap-3 py-2 text-left w-full text-slate-300 hover:text-white transition"
          >
            <Grid className="w-4 h-4 text-red-500" />
            <span>Genres</span>
          </button>
          <button
            onClick={() => handleFilterClick("new-popular")}
            className="flex items-center gap-3 py-2 text-left w-full text-slate-300 hover:text-white transition"
          >
            <Users className="w-4 h-4 text-red-500" />
            <span>Popular People</span>
          </button>

          <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2.5">
            <a
              href={signinUrl}
              target="_self"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 w-full bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs font-bold"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </a>
            <a
              href={registerUrl}
              target="_self"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2.5 w-full bg-red-600 text-white rounded-xl text-xs font-extrabold shadow-lg"
            >
              <UserPlus className="w-4 h-4" /> Register
            </a>
          </div>
        </div>
      )}
    </>
  )
}
