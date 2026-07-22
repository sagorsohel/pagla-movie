"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
  Home,
  Tv,
  Gamepad2,
  Sparkles,
  Heart
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

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  const isFilterActive = searchQuery || selectedCategoryId || filterType

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
    if (onBrowseCategoryClick) {
      onBrowseCategoryClick()
    } else {
      router.push(`/${locale}?browse=true`)
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-md border-b border-slate-900/60 transition-all duration-300 py-3 px-4 sm:px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6 md:gap-10">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            onClick={() => handleFilterClick(null)}
            className="block shrink-0"
          >
            <CineMoviesLogo />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300 select-none">
            <button
              onClick={() => handleFilterClick(null)}
              className={`hover:text-white cursor-pointer transition ${!isFilterActive ? "text-white font-bold" : ""}`}
            >
              {t.home}
            </button>
            <button
              onClick={() => handleFilterClick("series")}
              className={`hover:text-white cursor-pointer transition ${filterType === "series" ? "text-white font-bold" : ""}`}
            >
              {t.series}
            </button>
            <button
              onClick={() => handleFilterClick("films")}
              className={`hover:text-white cursor-pointer transition ${filterType === "films" ? "text-white font-bold" : ""}`}
            >
              {t.films}
            </button>
            <button
              onClick={() => handleFilterClick("games")}
              className={`hover:text-white cursor-pointer transition ${filterType === "games" ? "text-white font-bold" : ""}`}
            >
              {t.games}
            </button>
            <button
              onClick={() => handleFilterClick("new-popular")}
              className={`hover:text-white cursor-pointer transition ${filterType === "new-popular" ? "text-white font-bold" : ""}`}
            >
              {t.newPopular}
            </button>
            <button
              onClick={() => handleFilterClick("my-list")}
              className={`hover:text-white cursor-pointer transition ${filterType === "my-list" ? "text-white font-bold" : ""}`}
            >
              {t.myList}
            </button>
            <button
              onClick={handleBrowseCategory}
              className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              {t.browseCategory} <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 rounded-full py-1.5 pl-8 pr-3 text-[10px] sm:text-xs w-24 sm:w-36 md:w-48 focus:outline-hidden focus:w-32 sm:focus:w-52 md:focus:w-60 focus:border-red-600 focus:bg-slate-900 transition-all text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Language Selector */}
          <LanguageSelector currentLocale={locale} />

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
        <div className="fixed inset-x-0 top-[57px] z-39 bg-black/95 backdrop-blur-md border-b border-slate-900/90 py-5 px-6 animate-in slide-in-from-top duration-200 lg:hidden flex flex-col gap-4 text-sm font-semibold select-none">
          <button
            onClick={() => handleFilterClick(null)}
            className={`flex items-center gap-3 py-2 text-left w-full hover:text-white transition ${!isFilterActive ? "text-red-500 font-extrabold" : "text-slate-300"}`}
          >
            <Home className="w-4 h-4" />
            <span>{t.home}</span>
          </button>
          <button
            onClick={() => handleFilterClick("series")}
            className={`flex items-center gap-3 py-2 text-left w-full hover:text-white transition ${filterType === "series" ? "text-red-500 font-extrabold" : "text-slate-300"}`}
          >
            <Tv className="w-4 h-4" />
            <span>{t.series}</span>
          </button>
          <button
            onClick={() => handleFilterClick("films")}
            className={`flex items-center gap-3 py-2 text-left w-full hover:text-white transition ${filterType === "films" ? "text-red-500 font-extrabold" : "text-slate-300"}`}
          >
            <Film className="w-4 h-4" />
            <span>{t.films}</span>
          </button>
          <button
            onClick={() => handleFilterClick("games")}
            className={`flex items-center gap-3 py-2 text-left w-full hover:text-white transition ${filterType === "games" ? "text-red-500 font-extrabold" : "text-slate-300"}`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{t.games}</span>
          </button>
          <button
            onClick={() => handleFilterClick("new-popular")}
            className={`flex items-center gap-3 py-2 text-left w-full hover:text-white transition ${filterType === "new-popular" ? "text-red-500 font-extrabold" : "text-slate-300"}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.newPopular}</span>
          </button>
          <button
            onClick={() => handleFilterClick("my-list")}
            className={`flex items-center gap-3 py-2 text-left w-full hover:text-white transition ${filterType === "my-list" ? "text-red-500 font-extrabold" : "text-slate-300"}`}
          >
            <Heart className="w-4 h-4" />
            <span>{t.myList}</span>
          </button>
          <button
            onClick={handleBrowseCategory}
            className="flex items-center gap-3 py-2.5 text-left w-full text-violet-400 hover:text-violet-300 border-t border-slate-900/60 mt-2 pt-4"
          >
            <ChevronDown className="w-4 h-4" />
            <span>{t.browseCategory}</span>
          </button>
        </div>
      )}
    </>
  )
}
