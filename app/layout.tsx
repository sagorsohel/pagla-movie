import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { headers } from "next/headers"
import { db } from "@/db"
import { ads } from "@/db/schema"
import { eq } from "drizzle-orm"
import FloatingMobileAd from "@/components/floating-mobile-ad"
import FloatingDesktopAd from "@/components/floating-desktop-ad"
import DisableInspect from "@/components/disable-inspect"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CineMovies - Watch Unlimited Movies & TV Shows in 4K UHD",
  description: "Your portal to movies, shows and streaming news. CineMovies is your ultimate destination for celebrity interviews, movie trailers, on Netflix, Prime Video, and more.",
  openGraph: {
    title: "CineMovies - Watch Unlimited Movies & TV Shows in 4K UHD",
    description: "Your portal to movies, shows and streaming news. CineMovies is your ultimate destination for celebrity interviews, movie trailers, on Netflix, Prime Video, and more.",
    type: "website",
  },
}

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { cache } from "react"

const getAds = cache(async () => {
  try {
    const adsData = await db.select().from(ads).where(eq(ads.id, "global")).then((r: any) => r[0])
    return {
      headerAds: adsData?.headerAds || "",
      modalAds: adsData?.modalAds || "",
      heroAds: adsData?.heroAds || "",
      hero2Ads: adsData?.hero2Ads || "",
      floatingAds: adsData?.floatingAds || "",
      floatingAdsStatus: adsData?.floatingAdsStatus || "on",
      floatingDesktopAds: adsData?.floatingDesktopAds || "",
      floatingDesktopAdsStatus: adsData?.floatingDesktopAdsStatus || "on",
      footerAds: adsData?.footerAds || ""
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
      floatingDesktopAdsStatus: "on",
      footerAds: ""
    }
  }
})

function parseScriptTags(html: string) {
  const scripts: Array<{ src?: string; content?: string; async?: boolean; defer?: boolean }> = []
  if (!html) return scripts

  // 1. Convert any document.write(atob("...")) to decoded script string
  let processedHtml = html.replace(/document\.write\(\s*atob\(\s*["']([^"']+)["']\s*\)\s*\);?/gi, (_, b64) => {
    try {
      return Buffer.from(b64, "base64").toString("utf-8")
    } catch {
      return _
    }
  })

  // 2. Convert any document.write('<script ...>') to script string
  processedHtml = processedHtml.replace(/document\.write\(\s*["'](<script[\s\S]*?>[\s\S]*?<\/script>|<script[\s\S]*?>)["']\s*\);?/gi, "$1")

  // 3. Match standard <script>...</script>, self-closing, and unclosed script tags
  const scriptRegex = /<script([^>]*)>(?:([\s\S]*?)<\/script>)?/gi
  let match
  while ((match = scriptRegex.exec(processedHtml)) !== null) {
    const attrsStr = match[1] || ""
    const content = (match[2] || "").trim()
    const srcMatch = attrsStr.match(/src=["']([^"']+)["']/i)
    const asyncMatch = /\basync\b/i.test(attrsStr)
    const deferMatch = /\bdefer\b/i.test(attrsStr)
    
    if (!srcMatch && content.includes("<script")) {
      const innerScripts = parseScriptTags(content)
      scripts.push(...innerScripts)
    } else {
      const srcUrl = srcMatch ? srcMatch[1] : undefined
      if (srcUrl || content) {
        scripts.push({
          src: srcUrl,
          content: srcUrl ? undefined : (content || undefined),
          async: srcUrl ? true : asyncMatch,
          defer: deferMatch
        })
      }
    }
  }
  return scripts
}

function getNonScriptHtml(html: string) {
  return html.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, "").trim()
}

function isNoAdsPath(pathname: string): boolean {
  if (!pathname) return false
  const p = pathname.toLowerCase()
  return (
    p.startsWith("/dashboard") ||
    p === "/login" ||
    p.endsWith("/login") ||
    p.includes("/login/") ||
    p === "/signup" ||
    p.endsWith("/signup") ||
    p.includes("/signup/")
  )
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const pathname = headersList.get("x-url") || ""
  const isNoAds = isNoAdsPath(pathname)

  const adsData = await getAds()

  const {
    headerAds,
    modalAds,
    heroAds,
    hero2Ads,
    floatingAds,
    floatingAdsStatus,
    floatingDesktopAds,
    floatingDesktopAdsStatus,
    footerAds
  } = isNoAds
      ? {
        headerAds: adsData.headerAds,
        modalAds: "",
        heroAds: "",
        hero2Ads: "",
        floatingAds: "",
        floatingAdsStatus: "off",
        floatingDesktopAds: "",
        floatingDesktopAdsStatus: "off",
        footerAds: adsData.footerAds
      }
      : adsData

  const headerScripts = parseScriptTags(headerAds)
  const headerNonScriptHtml = getNonScriptHtml(headerAds)

  const bodyEndScripts = parseScriptTags(modalAds)
  const bodyEndNonScriptHtml = getNonScriptHtml(modalAds)

  const footerScripts = parseScriptTags(footerAds)
  const footerNonScriptHtml = getNonScriptHtml(footerAds)

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("dark antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
                document.addEventListener('keydown', function(e) {
                  if (e.keyCode === 123 || e.key === 'F12') { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I','i','J','j','C','c','K','k'].indexOf(e.key) !== -1) { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return false; }
                });
              })();
            `
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                if (window.location.pathname.startsWith('/dashboard')) return;

                 const pathname = window.location.pathname;
                 const locales = [
                   '/en', '/ar', '/az', '/bn', '/cs', '/da', '/de', '/el', '/es', '/fr',
                   '/hi', '/hr', '/hu', '/id', '/it', '/nl', '/no', '/pl', '/pt', '/ro',
                   '/ru', '/sk', '/sl', '/sr', '/sv', '/tr', '/zh', '/jp', '/kr', '/vn',
                   '/he', '/th'
                 ];
                
                let pathLocale = '';
                for (const loc of locales) {
                  if (pathname.startsWith(loc + '/') || pathname === loc) {
                    pathLocale = loc.substring(1);
                    break;
                  }
                }

                 if (!pathLocale) return;

                 let translateLocale = pathLocale;
                 if (pathLocale === 'jp') translateLocale = 'ja';
                 else if (pathLocale === 'kr') translateLocale = 'ko';
                 else if (pathLocale === 'vn') translateLocale = 'vi';

                 if (translateLocale && translateLocale !== 'en') {
                   document.cookie = 'googtrans=/en/' + translateLocale + '; path=/;';
                 } else {
                   document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                 }

                if (!pref) {
                  let detectedLocale = 'en';
                  localStorage.setItem('user_lang_pref', detectedLocale);

                  if (detectedLocale !== pathLocale) {
                    const newPath = pathname.replace('/' + pathLocale, '/' + detectedLocale);
                    window.location.replace(newPath + window.location.search);
                  }
                } else {
                  if (pref !== pathLocale) {
                    localStorage.setItem('user_lang_pref', pathLocale);
                  }
                }
              })();
            `
          }}
        />
        {headerScripts.map((s, idx) => {
          if (s.src) {
            return (
              <script
                key={`head-scr-${idx}`}
                src={s.src}
                async={s.async}
                defer={s.defer}
                suppressHydrationWarning
              />
            )
          }
          if (s.content) {
            return (
              <script
                key={`head-scr-inline-${idx}`}
                dangerouslySetInnerHTML={{ __html: s.content }}
                suppressHydrationWarning
              />
            )
          }
          return null
        })}
        {headerNonScriptHtml && (
          <script
            id="header-ads-non-script"
            dangerouslySetInnerHTML={{
              __html: `if (typeof document !== 'undefined') { document.head.insertAdjacentHTML('beforeend', ${JSON.stringify(headerNonScriptHtml)}); }`
            }}
          />
        )}
      </head>
      <body suppressHydrationWarning>
        <DisableInspect />
        <div id="google_translate_element" style={{ display: "none" }} className="hidden" suppressHydrationWarning />
        <ThemeProvider>
          {children}
          {floatingAdsStatus !== "off" && (
            <FloatingMobileAd floatingAds={floatingAds} heroAds={heroAds} hero2Ads={hero2Ads} />
          )}
          {floatingDesktopAdsStatus !== "off" && (
            <FloatingDesktopAd floatingDesktopAds={floatingDesktopAds} />
          )}
        </ThemeProvider>
        {bodyEndNonScriptHtml && (
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: bodyEndNonScriptHtml }} />
        )}
        {bodyEndScripts.map((s, idx) => {
          if (s.src) {
            return (
              <script
                key={`body-end-scr-${idx}`}
                src={s.src}
                async={s.async}
                defer={s.defer}
                suppressHydrationWarning
              />
            )
          }
          if (s.content) {
            return (
              <script
                key={`body-end-scr-inline-${idx}`}
                dangerouslySetInnerHTML={{ __html: s.content }}
                suppressHydrationWarning
              />
            )
          }
          return null
        })}

        {footerNonScriptHtml && (
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: footerNonScriptHtml }} />
        )}
        {footerScripts.map((s, idx) => {
          if (s.src) {
            return (
              <script
                key={`footer-scr-${idx}`}
                src={s.src}
                async={s.async}
                defer={s.defer}
                suppressHydrationWarning
              />
            )
          }
          if (s.content) {
            return (
              <script
                key={`footer-scr-inline-${idx}`}
                dangerouslySetInnerHTML={{ __html: s.content }}
                suppressHydrationWarning
              />
            )
          }
          return null
        })}
      </body>
    </html>
  )
}
