"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function SignupContent() {
  const searchParams = useSearchParams()
  const rawMovieSlug = searchParams.get("movies") || searchParams.get("movie") || ""
  
  // Format slug for title (replace hyphens with spaces or keep clean slug)
  const displaySlug = rawMovieSlug
    ? rawMovieSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : ""

  useEffect(() => {
    // Set dynamic browser window/tab title
    const titleText = displaySlug
      ? `${displaySlug} - Sign Up - CineMovies - Watch Unlimited Movies & TV Shows in 4K UHD`
      : "Sign Up - CineMovies - Watch Unlimited Movies & TV Shows in 4K UHD"
    document.title = titleText
  }, [displaySlug])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    async function initRedirect() {
      try {
        const res = await fetch("/api/manage/ads", { next: { revalidate: 30 } })
        const data = await res.json()
        
        if (data.success && data.ads) {
          const { signupRedirectUrl, signupRedirectTime, signupRedirectTimeUnit } = data.ads
          const rawTime = signupRedirectTime !== undefined && signupRedirectTime !== null && signupRedirectTime !== "" ? Number(signupRedirectTime) : 5
          
          // If loading time is set to 0, do NOT perform any redirect!
          if (rawTime > 0 && signupRedirectUrl) {
            const delayMs = signupRedirectTimeUnit === "ms" ? rawTime : rawTime * 1000
            timeoutId = setTimeout(() => {
              window.location.href = signupRedirectUrl
            }, delayMs)
          }
        }
      } catch (err) {
        console.error("Error fetching signup redirect config:", err)
      }
    }

    initRedirect()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="flex flex-col items-center space-y-6 max-w-md text-center">
        {/* Animated Glow Effect Background */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-red-600/20 blur-xl animate-pulse" />
          
          {/* Main Spinner */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-800 border-t-red-600 border-r-red-500 animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase font-sans text-white">
            Loading...
          </h2>
          {rawMovieSlug && (
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Preparing signup for <span className="text-red-500 font-bold">{displaySlug}</span>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
          <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-red-600 animate-spin" />
          <h2 className="text-xl font-black uppercase mt-6 text-white">Loading...</h2>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  )
}
