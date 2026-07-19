"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { loginAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FilmIcon, LockIcon, MailIcon, Loader2Icon } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(loginAction, null)

  React.useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
      router.refresh()
    }
  }, [state, router])

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-radial from-[#1e1b4b] via-[#0f172a] to-[#020617] overflow-hidden text-slate-100">
      {/* Background glowing circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300 hover:border-slate-700">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4 animate-pulse">
              <FilmIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-200 via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              CineMovies Admin
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Sign in to manage your movie application
            </p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400 font-medium">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="admin@gmail.com"
                  className="pl-10 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500 focus-visible:ring-offset-0 focus-visible:border-violet-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block">
                Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="pl-10 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500 focus-visible:ring-offset-0 focus-visible:border-violet-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium shadow-lg shadow-violet-600/20 py-2.5 rounded-lg transition-all duration-200"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2Icon className="w-4 h-4 animate-spin" /> Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Seed Admin Info Banner */}
          <div className="mt-6 pt-6 border-t border-slate-900/80 text-center">
            <div className="inline-block px-3 py-1.5 rounded-lg bg-slate-900/30 border border-slate-800/40 text-[11px] text-slate-400">
              <span className="font-semibold text-violet-400">Demo User:</span> admin@gmail.com / sohoj@sohoj
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
