"use client"

import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { X } from "lucide-react"

interface FloatingMobileAdProps {
  floatingAds?: string
  heroAds?: string
  hero2Ads?: string
}

function AdScriptContainer({ scriptHtml, className }: { scriptHtml?: string; className?: string }) {
  if (!scriptHtml) return null

  // Attempt to parse width and height from the ad configuration (e.g. from atOptions)
  let width = "100%"
  let height = "50px" // Default mobile banner height is typically 50px
  if (scriptHtml.includes("atOptions")) {
    const widthMatch = scriptHtml.match(/'width'\s*:\s*(\d+)/)
    const heightMatch = scriptHtml.match(/'height'\s*:\s*(\d+)/)
    if (widthMatch && widthMatch[1]) width = `${widthMatch[1]}px`
    if (heightMatch && heightMatch[1]) height = `${heightMatch[1]}px`
  }

  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html style="color-scheme: dark;">
      <head>
        <meta name="color-scheme" content="dark">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: transparent !important;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        ${scriptHtml}
      </body>
    </html>
  `

  return (
    <div className={`${className} flex justify-center items-center overflow-hidden bg-transparent w-full`}>
      <iframe
        srcDoc={iframeSrcDoc}
        width={width}
        height={height}
        style={{ border: "none", overflow: "hidden", background: "transparent" }}
        scrolling="no"
        title="Floating Ad Space"
        allowTransparency={true}
      />
    </div>
  )
}

export default function FloatingMobileAd({ floatingAds, heroAds, hero2Ads }: FloatingMobileAdProps) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const [currentAd, setCurrentAd] = useState<"hero" | "hero2">(() => {
    const cycleMs = 60000 // 60 seconds total cycle (40 sec hero + 20 sec hero2)
    const currentMs = Date.now() % cycleMs
    return currentMs < 40000 ? "hero" : "hero2"
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!heroAds || !hero2Ads) return

    const interval = setInterval(() => {
      const cycleMs = 60000
      const currentMs = Date.now() % cycleMs
      const nextAd = currentMs < 40000 ? "hero" : "hero2"
      setCurrentAd(nextAd)
    }, 1000)

    return () => clearInterval(interval)
  }, [heroAds, hero2Ads])

  if (!mounted || !isMobile || isDismissed) {
    return null
  }

  const activeAdHtml = (() => {
    if (floatingAds) {
      return floatingAds
    }
    if (heroAds && hero2Ads) {
      return currentAd === "hero" ? heroAds : hero2Ads
    }
    return heroAds || hero2Ads || ""
  })()

  if (!activeAdHtml) {
    return null
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-md border-t border-slate-800/80 shadow-[0_-8px_30px_rgb(0,0,0,0.4)] flex justify-center items-center pt-[5px] pb-[calc(5px+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300 md:hidden"
    >
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-1 right-2 p-1 rounded-md bg-slate-900/80 hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-all border border-slate-800 cursor-pointer z-50"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <AdScriptContainer scriptHtml={activeAdHtml} />
    </div>
  )
}
