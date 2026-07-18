"use client"

import { useState, useEffect } from "react"
import {
  SlidersHorizontal,
  CheckCircle,
  AlertTriangle,
  Upload,
  X
} from "lucide-react"
import { getImageUrl } from "@/lib/utils"

export default function AdsControlPage() {
  const [heroAds, setHeroAds] = useState("")
  const [hero2Ads, setHero2Ads] = useState("")
  const [modalAds, setModalAds] = useState("")
  const [headerAds, setHeaderAds] = useState("")
  const [membershipRefLink, setMembershipRefLink] = useState("")
  const [signinRefLink, setSigninRefLink] = useState("")
  const [globalBg, setGlobalBg] = useState("")
  const [floatingAds, setFloatingAds] = useState("")
  const [floatingAdsStatus, setFloatingAdsStatus] = useState("on")
  const [floatingDesktopAds, setFloatingDesktopAds] = useState("")
  const [floatingDesktopAdsStatus, setFloatingDesktopAdsStatus] = useState("on")
  
  const [adsSaving, setAdsSaving] = useState(false)
  const [adsMessage, setAdsMessage] = useState({ text: "", type: "success" })

  // Fetch Ads settings on load
  useEffect(() => {
    fetch("/api/manage/ads")
      .then(res => res.json())
      .then(data => {
        if (data && data.ads) {
          setHeroAds(data.ads.heroAds || "")
          setHero2Ads(data.ads.hero2Ads || "")
          setModalAds(data.ads.modalAds || "")
          setHeaderAds(data.ads.headerAds || "")
          setMembershipRefLink(data.ads.membershipRefLink || "")
          setSigninRefLink(data.ads.signinRefLink || "")
          setGlobalBg(data.ads.globalBg || "")
          setFloatingAds(data.ads.floatingAds || "")
          setFloatingAdsStatus(data.ads.floatingAdsStatus || "on")
          setFloatingDesktopAds(data.ads.floatingDesktopAds || "")
          setFloatingDesktopAdsStatus(data.ads.floatingDesktopAdsStatus || "on")
        }
      })
      .catch(() => { })
  }, [])

  // Handle local file upload for global background
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAdsSaving(true)
    setAdsMessage({ text: "", type: "success" })

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/manage/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setGlobalBg(data.url)
        setAdsMessage({ text: "Global background image uploaded successfully!", type: "success" })
      } else {
        setAdsMessage({ text: data.error || "Failed to upload image.", type: "error" })
      }
    } catch (err: any) {
      setAdsMessage({ text: err.message || "Network error during upload.", type: "error" })
    } finally {
      setAdsSaving(false)
    }
  }

  const handleSaveAds = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdsSaving(true)
    setAdsMessage({ text: "", type: "success" })

    const safeBtoa = (str: string) => {
      try {
        return btoa(unescape(encodeURIComponent(str || "")))
      } catch (err) {
        return str || ""
      }
    }

    try {
      const res = await fetch("/api/manage/ads", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-encoded-payload": "base64"
        },
        body: JSON.stringify({
          heroAds: safeBtoa(heroAds),
          hero2Ads: safeBtoa(hero2Ads),
          modalAds: safeBtoa(modalAds),
          headerAds: safeBtoa(headerAds),
          membershipRefLink: safeBtoa(membershipRefLink),
          signinRefLink: safeBtoa(signinRefLink),
          globalBg: safeBtoa(globalBg),
          floatingAds: safeBtoa(floatingAds),
          floatingAdsStatus: safeBtoa(floatingAdsStatus),
          floatingDesktopAds: safeBtoa(floatingDesktopAds),
          floatingDesktopAdsStatus: safeBtoa(floatingDesktopAdsStatus)
        })
      })
      if (res.ok) {
        setAdsMessage({ text: "Ads & Global BG configurations saved successfully!", type: "success" })
      } else {
        setAdsMessage({ text: "Failed to save configurations.", type: "error" })
      }
    } catch (err: any) {
      setAdsMessage({ text: err.message || "Network error.", type: "error" })
    } finally {
      setAdsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in font-sans">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <SlidersHorizontal className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100">Global Settings & Ads Configuration</h3>
            <p className="text-xs text-slate-400 font-medium">Configure global website settings and inject advertisement or tracking scripts dynamically.</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSaveAds} className="bg-[#050b14] border border-slate-900 rounded-3xl p-6 space-y-6 shadow-xl">
        {adsMessage.text && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
              adsMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {adsMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{adsMessage.text}</span>
          </div>
        )}

        {/* Global Background Image Input */}
        <div className="space-y-2 pb-6 border-b border-slate-900/60">
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
            Global Background Image (URL or Upload)
          </label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={globalBg}
                onChange={(e) => setGlobalBg(e.target.value)}
                placeholder="/uploads/global-bg.jpg or https://example.com/bg.jpg"
                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
              />
            </div>
            <label className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-350 transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="hidden"
              />
            </label>
          </div>
          {globalBg && (
            <div className="relative w-full max-w-md h-32 rounded-xl overflow-hidden border border-slate-900 mt-2 bg-slate-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(globalBg)}
                alt="Global Background Preview"
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => setGlobalBg("")}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all shadow-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-[9px] text-slate-500 leading-relaxed">
            Configure a default global background image. If a movie has no specific background uploaded, this global image will be displayed on the movie details page. It is also shown as the default website background on the homepage.
          </p>
        </div>

        {/* Header Ads Input */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
            Header Ads (Script / HTML Code)
          </label>
          <textarea
            value={headerAds}
            onChange={(e) => setHeaderAds(e.target.value)}
            placeholder="<!-- Paste Google AdSense or other header ad scripts here -->"
            rows={6}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
          />
          <p className="text-[9px] text-slate-500 leading-relaxed">
            This script renders at the very top of the website (header section).
          </p>
        </div>

        {/* Hero Ads Input */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
            Hero Ads (Script / HTML Code)
          </label>
          <textarea
            value={heroAds}
            onChange={(e) => setHeroAds(e.target.value)}
            placeholder="<!-- Paste banner script or custom HTML here -->"
            rows={6}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
          />
          <p className="text-[9px] text-slate-500 leading-relaxed">
            This script renders in the primary hero slot, directly below/above the home slider.
          </p>
        </div>

        {/* Hero2 Ads Input */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
            Hero2 Ads (Script / HTML Code)
          </label>
          <textarea
            value={hero2Ads}
            onChange={(e) => setHero2Ads(e.target.value)}
            placeholder="<!-- Paste second banner script or custom HTML here -->"
            rows={6}
            className="w-full bg-slate-955 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
          />
          <p className="text-[9px] text-slate-500 leading-relaxed">
            This script renders in the secondary hero slot, below the first Hero Ads slot.
          </p>
        </div>

        {/* Modal Ads Input */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
            Modal / Player Ads (Script / HTML Code)
          </label>
          <textarea
            value={modalAds}
            onChange={(e) => setModalAds(e.target.value)}
            placeholder="<!-- Paste modal or player ad scripts here -->"
            rows={6}
            className="w-full bg-slate-955 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
          />
          <p className="text-[9px] text-slate-500 leading-relaxed">
            This script is injected inside the Stream Player box inline signup container.
          </p>
        </div>

        {/* Floating Mobile Ads Input */}
        <div className="space-y-4 border-t border-slate-900/60 pt-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
              Floating Mobile Ads Status
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                floatingAdsStatus === "on"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}>
                <input
                  type="radio"
                  name="floatingAdsStatus"
                  value="on"
                  checked={floatingAdsStatus === "on"}
                  onChange={() => setFloatingAdsStatus("on")}
                  className="sr-only"
                />
                <span>ON (Enabled)</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                floatingAdsStatus === "off"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}>
                <input
                  type="radio"
                  name="floatingAdsStatus"
                  value="off"
                  checked={floatingAdsStatus === "off"}
                  onChange={() => setFloatingAdsStatus("off")}
                  className="sr-only"
                />
                <span>OFF (Disabled)</span>
              </label>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              Enable or disable the floating mobile overlay ads application-wide.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
              Floating Mobile Ads (Script / HTML Code)
            </label>
            <textarea
              value={floatingAds}
              onChange={(e) => setFloatingAds(e.target.value)}
              placeholder="<!-- Paste floating mobile overlay banner scripts here -->"
              rows={6}
              className="w-full bg-slate-955 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
            />
            <p className="text-[9px] text-slate-500 leading-relaxed">
              This script renders as a floating overlay banner at the bottom of mobile screens.
            </p>
          </div>
        </div>

        {/* Floating Desktop Ads Input */}
        <div className="space-y-4 border-t border-slate-900/60 pt-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
              Floating Desktop Ads Status (Desktop Only)
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                floatingDesktopAdsStatus === "on"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}>
                <input
                  type="radio"
                  name="floatingDesktopAdsStatus"
                  value="on"
                  checked={floatingDesktopAdsStatus === "on"}
                  onChange={() => setFloatingDesktopAdsStatus("on")}
                  className="sr-only"
                />
                <span>ON (Enabled)</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                floatingDesktopAdsStatus === "off"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
              }`}>
                <input
                  type="radio"
                  name="floatingDesktopAdsStatus"
                  value="off"
                  checked={floatingDesktopAdsStatus === "off"}
                  onChange={() => setFloatingDesktopAdsStatus("off")}
                  className="sr-only"
                />
                <span>OFF (Disabled)</span>
              </label>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              Enable or disable the floating desktop overlay ads.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 font-mono">
              Floating Desktop Ads (Script / HTML Code)
            </label>
            <textarea
              value={floatingDesktopAds}
              onChange={(e) => setFloatingDesktopAds(e.target.value)}
              placeholder="<!-- Paste floating desktop overlay banner scripts here -->"
              rows={6}
              className="w-full bg-slate-955 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono transition-all"
            />
            <p className="text-[9px] text-slate-500 leading-relaxed">
              This script renders as a floating overlay banner (e.g. left/right sidebar, or bottom sticky bar) on desktop viewports only.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 border-t border-slate-900/60 flex items-center justify-end">
          <button
            type="submit"
            disabled={adsSaving}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-955 font-extrabold rounded-xl text-xs tracking-wider transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {adsSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  )
}
