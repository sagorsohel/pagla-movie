"use client"

import { useState, useEffect } from "react"
import { Save, ExternalLink, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react"

export default function SignupSettingsPage() {
  const [redirectUrl, setRedirectUrl] = useState("")
  const [redirectTime, setRedirectTime] = useState<number | string>(5)
  const [redirectTimeUnit, setRedirectTimeUnit] = useState<"sec" | "ms">("sec")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/manage/ads", { cache: "no-store" })
      const data = await res.json()
      if (data.success && data.ads) {
        setRedirectUrl(data.ads.signupRedirectUrl || "")
        setRedirectTime(data.ads.signupRedirectTime !== undefined ? data.ads.signupRedirectTime : 5)
        setRedirectTimeUnit(data.ads.signupRedirectTimeUnit === "ms" ? "ms" : "sec")
      }
    } catch (err: any) {
      console.error("Failed to load signup settings:", err)
      setStatusMessage({ type: "error", text: "Failed to load current settings." })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      const res = await fetch("/api/manage/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signupRedirectUrl: redirectUrl,
          signupRedirectTime: Number(redirectTime) || 0,
          signupRedirectTimeUnit: redirectTimeUnit,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setStatusMessage({ type: "success", text: "Signup redirect settings saved successfully!" })
      } else {
        setStatusMessage({ type: "error", text: data.error || "Failed to save settings." })
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An unexpected error occurred." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 rounded-2xl border border-slate-700/60 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <Sparkles className="w-4 h-4" /> Signup Button & Loading Page Config
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Signup Redirect Settings</h1>
          <p className="text-slate-300 text-xs mt-1">
            Set the destination URL and loading time delay (in seconds or milliseconds) when users click the Signup button.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="text-sm font-semibold">Loading Signup Settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-red-600" />
                Target Redirect URL
              </label>
              <p className="text-xs text-slate-500">
                The URL users will be redirected to after the loading spinner completes on <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">/signup?movies={"{slug}"}</code>.
              </p>
              <input
                type="url"
                required
                placeholder="https://example.com/signup"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-slate-800 font-mono text-sm transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  Loading Time Duration
                </label>
                <p className="text-xs text-slate-500">
                  Enter the loading duration for the spinner before performing the redirect.
                </p>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="e.g. 5 or 5000"
                  value={redirectTime}
                  onChange={(e) => setRedirectTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-slate-800 font-mono text-sm transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Duration Unit</label>
                <p className="text-xs text-slate-500">Select whether the loading time is specified in seconds or milliseconds.</p>
                <select
                  value={redirectTimeUnit}
                  onChange={(e) => setRedirectTimeUnit(e.target.value as "sec" | "ms")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-slate-800 text-sm bg-white font-medium transition cursor-pointer"
                >
                  <option value="sec">Seconds (sec)</option>
                  <option value="ms">Milliseconds (ms)</option>
                </select>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-600 text-xs space-y-1 font-mono">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Config Summary</div>
              <div>
                • Target URL: <span className="text-slate-900 font-semibold">{redirectUrl || "(Not set yet)"}</span>
              </div>
              <div>
                • Total Loading Time:{" "}
                <span className="text-red-600 font-bold">
                  {redirectTime || 0} {redirectTimeUnit}
                </span>{" "}
                ({redirectTimeUnit === "sec" ? `${(Number(redirectTime) || 0) * 1000} ms` : `${Number(redirectTime) || 0} ms`})
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
