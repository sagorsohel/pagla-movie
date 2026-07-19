"use client"

import { useEffect, useState } from "react"

function AdScriptContainer({ scriptHtml, className }: { scriptHtml?: string; className?: string }) {
  if (!scriptHtml) return null

  // Attempt to parse width and height from the ad configuration (e.g. from atOptions)
  let width = "100%"
  let height = "60px"
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
    <div className={`${className} flex justify-center items-center overflow-hidden w-full bg-transparent`}>
      <iframe
        srcDoc={iframeSrcDoc}
        width={width}
        height={height}
        style={{ border: "none", overflow: "hidden", background: "transparent" }}
        scrolling="no"
        title="Ad Space"
        allowTransparency={true}
      />
    </div>
  )
}

export default function AdCard({ scriptHtml, scriptHtml2 }: { scriptHtml?: string; scriptHtml2?: string }) {
  const [currentAd, setCurrentAd] = useState<"ad1" | "ad2">(() => {
    const cycleMs = 180000 // 3 minutes total cycle (2 min + 1 min)
    const currentMs = Date.now() % cycleMs
    return currentMs < 120000 ? "ad1" : "ad2"
  })

  useEffect(() => {
    if (!scriptHtml || !scriptHtml2) return

    const interval = setInterval(() => {
      const cycleMs = 180000
      const currentMs = Date.now() % cycleMs
      const nextAd = currentMs < 120000 ? "ad1" : "ad2"
      setCurrentAd(nextAd)
    }, 1000)

    return () => clearInterval(interval)
  }, [scriptHtml, scriptHtml2])

  const activeHtml = (() => {
    if (currentAd === "ad1" && scriptHtml) return scriptHtml
    if (currentAd === "ad2" && scriptHtml2) return scriptHtml2
    return scriptHtml || scriptHtml2 || ""
  })()

  return (
    <div className={activeHtml ? "w-full flex justify-center items-center bg-transparent py-0" : "bg-slate-900/30 border-slate-700/60 border rounded-2xl p-1 flex flex-col justify-center items-center h-full min-h-[60px] shadow-xs relative overflow-hidden"}>
      {activeHtml ? (
        <AdScriptContainer scriptHtml={activeHtml} className="w-full flex justify-center items-center bg-transparent" />
      ) : (
        <div className="text-center text-slate-600 font-bold uppercase tracking-wider text-[10px]">
          <span className="block text-xl mb-1">📢</span>
          ADVERTISEMENT
        </div>
      )}
    </div>
  )
}
