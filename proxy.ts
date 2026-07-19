import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-pagla-movie-jwt-token-2026-07"
)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-url", pathname)

  // Protected paths
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jose.jwtVerify(token, JWT_SECRET)
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      const loginUrl = new URL("/login", request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("admin_token")
      return response
    }
  }

  // Redirect to dashboard if logged in and trying to access login page
  if (pathname === "/login") {
    const token = request.cookies.get("admin_token")?.value
    if (token) {
      try {
        await jose.jwtVerify(token, JWT_SECRET)
        const dashboardUrl = new URL("/dashboard", request.url)
        return NextResponse.redirect(dashboardUrl)
      } catch (error) {
        // Continue to login if token invalid
      }
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
