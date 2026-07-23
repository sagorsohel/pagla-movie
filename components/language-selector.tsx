"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Globe as GlobeIcon, ChevronDown as ChevronDownIcon } from "lucide-react"
import { type Locale, LANGUAGES } from "@/lib/translations"

export function LanguageSelector({ currentLocale }: { currentLocale: Locale }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (currentLocale === "en") {
      document.cookie = "user_lang_pref=en; path=/; max-age=31536000; SameSite=Lax"
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname
      return;
    }

    // 1. Define the global translate callback if it doesn't exist
    if (!(window as any).googleTranslateElementInit) {
      (window as any).googleTranslateElementInit = function () {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ar,az,bn,cs,da,de,el,es,fr,hi,hr,hu,id,it,nl,no,pl,pt,ro,ru,sk,sl,sr,sv,tr,zh,ja,ko,vi,he,th",
            layout: 0,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };
    }

    // 2. Load the google translate script if it hasn't been loaded already
    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [currentLocale])

  const handleLanguageChange = (langCode: string) => {
    localStorage.setItem("user_lang_pref", langCode)
    document.cookie = `user_lang_pref=${langCode}; path=/; max-age=31536000; SameSite=Lax`
    setIsOpen(false)

    // Set the google translate cookie client-side
    let translateLocale = langCode
    if (langCode === "jp") translateLocale = "ja"
    else if (langCode === "kr") translateLocale = "ko"
    else if (langCode === "vn") translateLocale = "vi"

    if (translateLocale !== "en") {
      document.cookie = "googtrans=/en/" + translateLocale + "; path=/;"
    } else {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname
    }

    // Replace the locale segment in the URL pathname
    const locales = LANGUAGES.map(l => `/${l.code}`)
    let newPathname = pathname
    let matched = false
    
    for (const loc of locales) {
      if (pathname.startsWith(loc + "/") || pathname === loc) {
        newPathname = pathname.replace(loc, `/${langCode}`)
        matched = true
        break
      }
    }

    if (!matched) {
      newPathname = `/${langCode}${pathname}`
    }

    // Preserve query search parameters
    const query = searchParams.toString()
    const url = query ? `${newPathname}?${query}` : newPathname

    // Force full page reload so Google Translate immediately translates with the new cookie
    window.location.href = url
  }

  return (
    <div className="relative notranslate" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 transition cursor-pointer select-none notranslate"
      >
        <GlobeIcon className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">{activeLang.name}</span>
        <span className="sm:hidden">{activeLang.flag}</span>
        <ChevronDownIcon className="w-3 h-3 text-slate-450 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur-md p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 z-50 scrollbar-thin notranslate">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold transition cursor-pointer notranslate ${
                lang.code === currentLocale
                  ? "bg-red-600/10 text-red-500"
                  : "text-slate-300 hover:bg-slate-900/50 hover:text-white"
              }`}
            >
              <span className="text-sm shrink-0">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
