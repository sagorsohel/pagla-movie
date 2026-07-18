import { Geist, Geist_Mono } from "next/font/google"
import { headers } from "next/headers"
import { db } from "@/db"
import { ads } from "@/db/schema"
import { eq } from "drizzle-orm"
import FloatingMobileAd from "@/components/floating-mobile-ad"
import FloatingDesktopAd from "@/components/floating-desktop-ad"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

async function getAds() {
  try {
    await headers()
    const adsData = await db.select().from(ads).where(eq(ads.id, "global")).then(r => r[0])
    return {
      headerAds: adsData?.headerAds || "",
      modalAds: adsData?.modalAds || "",
      heroAds: adsData?.heroAds || "",
      hero2Ads: adsData?.hero2Ads || "",
      floatingAds: adsData?.floatingAds || "",
      floatingAdsStatus: adsData?.floatingAdsStatus || "on",
      floatingDesktopAds: adsData?.floatingDesktopAds || "",
      floatingDesktopAdsStatus: adsData?.floatingDesktopAdsStatus || "on"
    }
  } catch (err) {
    console.error("Failed to fetch ads from DB directly:", err)
    return { 
      headerAds: "", 
      modalAds: "", 
      heroAds: "", 
      hero2Ads: "", 
      floatingAds: "", 
      floatingAdsStatus: "on",
      floatingDesktopAds: "",
      floatingDesktopAdsStatus: "on"
    }
  }
}

function parseScriptTags(html: string) {
  const scripts: Array<{ src?: string; content?: string; async?: boolean; defer?: boolean }> = []
  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi
  let match
  while ((match = scriptRegex.exec(html)) !== null) {
    const attrsStr = match[1]
    const content = match[2].trim()
    const srcMatch = attrsStr.match(/src=["']([^"']+)["']/i)
    const asyncMatch = /\basync\b/i.test(attrsStr)
    const deferMatch = /\bdefer\b/i.test(attrsStr)
    scripts.push({
      src: srcMatch ? srcMatch[1] : undefined,
      content: content || undefined,
      async: asyncMatch,
      defer: deferMatch
    })
  }
  return scripts
}

function getNonScriptHtml(html: string) {
  return html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, "").trim()
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-url") || ""
  const isManage = pathname.startsWith("/dashboard")

  const { 
    headerAds, 
    modalAds, 
    heroAds, 
    hero2Ads, 
    floatingAds, 
    floatingAdsStatus,
    floatingDesktopAds,
    floatingDesktopAdsStatus
  } = isManage 
    ? { 
        headerAds: "", 
        modalAds: "", 
        heroAds: "", 
        hero2Ads: "", 
        floatingAds: "", 
        floatingAdsStatus: "on",
        floatingDesktopAds: "",
        floatingDesktopAdsStatus: "on"
      } 
    : await getAds()

  const headerScripts = parseScriptTags(headerAds)
  const headerNonScriptHtml = getNonScriptHtml(headerAds)

  const bodyEndScripts = parseScriptTags(modalAds)
  const bodyEndNonScriptHtml = getNonScriptHtml(modalAds)

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <head>
        {headerScripts.map((s, idx) => {
          if (s.src) {
            return (
              <script
                key={`head-scr-${idx}`}
                src={s.src}
                async={s.async}
                defer={s.defer}
              />
            )
          }
          if (s.content) {
            return (
              <script
                key={`head-scr-inline-${idx}`}
                dangerouslySetInnerHTML={{ __html: s.content }}
              />
            )
          }
          return null
        })}
      </head>
      <body>
        <ThemeProvider>
          {headerNonScriptHtml && (
            <div dangerouslySetInnerHTML={{ __html: headerNonScriptHtml }} />
          )}
          {children}
           {floatingAdsStatus !== "off" && (
            <FloatingMobileAd floatingAds={floatingAds} heroAds={heroAds} hero2Ads={hero2Ads} />
          )}
          {floatingDesktopAdsStatus !== "off" && (
            <FloatingDesktopAd floatingDesktopAds={floatingDesktopAds} />
          )}
        </ThemeProvider>
        {bodyEndNonScriptHtml && (
          <div dangerouslySetInnerHTML={{ __html: bodyEndNonScriptHtml }} />
        )}
        {bodyEndScripts.map((s, idx) => {
          if (s.src) {
            return (
              <script
                key={`body-end-scr-${idx}`}
                src={s.src}
                async={s.async}
                defer={s.defer}
              />
            )
          }
          if (s.content) {
            return (
              <script
                key={`body-end-scr-inline-${idx}`}
                dangerouslySetInnerHTML={{ __html: s.content }}
              />
            )
          }
          return null
        })}
      </body>
    </html>
  )
}
