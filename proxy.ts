import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-pagla-movie-jwt-token-2026-07"
)

const LOCALES = [
  "/en", "/ar", "/az", "/bn", "/cs", "/da", "/de", "/el", "/es", "/fr",
  "/hi", "/hr", "/hu", "/id", "/it", "/nl", "/no", "/pl", "/pt", "/ro",
  "/ru", "/sk", "/sl", "/sr", "/sv", "/tr", "/zh", "/jp", "/kr", "/vn",
  "/he", "/th"
]

const LOCALE_CODES = [
  "ar", "az", "bn", "cs", "da", "de", "el", "es", "fr", "hi", "hr", "hu",
  "id", "it", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sl", "sr", "sv",
  "tr", "zh", "jp", "kr", "vn", "he", "th"
]

const LOGIN_PATHS = new Set([
  "/login",
  ...LOCALES.map((l: string) => `${l}/login`)
])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Exclude system paths immediately for maximum speed
  const isExcludedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(mp4|mp3|png|jpg|jpeg|gif|svg|webp|ico|json|txt|xml|webmanifest)$/i.test(pathname)

  // 2. Identify if the pathname already starts with a locale
  const pathnameIsMissingLocale = LOCALES.every(
    (locale) => !pathname.startsWith(locale + "/") && pathname !== locale
  )

  // 3. Redirect to locale path if missing (Defaults to English 'en' for India, BD & all regions)
  if (pathnameIsMissingLocale && !isExcludedPath) {
    const savedLang = request.cookies.get("user_lang_pref")?.value
    let targetLang = "en"
    if (savedLang && LOCALE_CODES.includes(savedLang)) {
      targetLang = savedLang
    }

    const redirectUrl = new URL(`/${targetLang}${pathname}`, request.url)
    redirectUrl.search = request.nextUrl.search
    return NextResponse.redirect(redirectUrl)
  }

  // 4. Resolve the locale for cookie setting/routing context
  let currentLocale = "en"
  for (const loc of LOCALE_CODES) {
    if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
      currentLocale = loc
      break
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-url", pathname)

  let response: NextResponse

  // Protected paths
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url)
      response = NextResponse.redirect(loginUrl)
    } else {
      try {
        await jose.jwtVerify(token, JWT_SECRET)
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      } catch (error) {
        const loginUrl = new URL(`/${currentLocale}/login`, request.url)
        response = NextResponse.redirect(loginUrl)
        response.cookies.delete("admin_token")
      }
    }
  } else if (LOGIN_PATHS.has(pathname)) {
    const token = request.cookies.get("admin_token")?.value
    let isLoggedIn = false
    if (token) {
      try {
        await jose.jwtVerify(token, JWT_SECRET)
        isLoggedIn = true
      } catch (error) {}
    }
    if (isLoggedIn) {
      const dashboardUrl = new URL("/dashboard", request.url)
      response = NextResponse.redirect(dashboardUrl)
    } else {
      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Map custom URL codes to correct Google Translate codes
  let translateLocale = currentLocale
  if (currentLocale === "jp") translateLocale = "ja"
  else if (currentLocale === "kr") translateLocale = "ko"
  else if (currentLocale === "vn") translateLocale = "vi"

  // Set Google Translate cookie for auto-translation (ignores admin dashboard)
  if (!pathname.startsWith("/dashboard") && currentLocale !== "en") {
    response.cookies.set("googtrans", `/en/${translateLocale}`, { path: "/" })
  } else if (currentLocale === "en") {
    response.cookies.delete("googtrans")
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
