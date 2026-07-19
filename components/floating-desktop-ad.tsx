"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface FloatingDesktopAdProps {
  floatingDesktopAds?: string
}

function AdScriptContainer({ scriptHtml, className }: { scriptHtml?: string; className?: string }) {
  if (!scriptHtml) return null

  // Attempt to parse width and height from the ad configuration
  let width = "100%"
  let height = "90px"
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
        title="Floating Desktop Ad Space"
      />
    </div>
  )
}

export default function FloatingDesktopAd({ floatingDesktopAds }: FloatingDesktopAdProps) {
  const [mounted, setMounted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isDismissed || !floatingDesktopAds) {
    return null
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-transparent hidden md:flex justify-center items-center pt-2 pb-2 animate-in slide-in-from-bottom duration-300"
    >
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-1 right-3 p-1 rounded-md bg-slate-900/80 hover:bg-slate-855 text-slate-400 hover:text-slate-200 transition-all border border-slate-800 cursor-pointer z-50"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <AdScriptContainer scriptHtml={floatingDesktopAds} />
    </div>
  )
}
