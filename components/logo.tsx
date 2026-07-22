import * as React from "react"

interface CineMoviesLogoProps {
  className?: string
}

export function CineMoviesLogo({ className = "" }: CineMoviesLogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none group/logo ${className}`}>
      {/* Premium play button icon wrapper */}
      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-650/30 group-hover/logo:scale-105 group-hover/logo:rotate-3 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white ml-0.5">
          <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
        </svg>
      </div>
      {/* Brand Name Typography */}
      <span className="font-sans font-extrabold text-lg sm:text-2xl tracking-tight text-white notranslate" translate="no">
        Cine<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-black">Movies</span>
      </span>
    </div>
  )
}
