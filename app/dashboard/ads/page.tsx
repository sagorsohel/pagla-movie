"use client"

import { useState, useEffect } from "react"
import {
  SlidersHorizontal,
  CheckCircle,
  AlertTriangle,
  Upload,
  X,
  Plus,
  Trash2,
  Edit2,
  FileCode,
  Save,
  Globe,
  Sliders
} from "lucide-react"
import { getImageUrl } from "@/lib/utils"

interface CustomAd {
  id: string
  name: string
  code: string
}

export default function AdsControlPage() {
  const [activeTab, setActiveTab] = useState<"globals" | "customized">("globals")

  // Global Ads States
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
  const [footerAds, setFooterAds] = useState("")
  const [layoutOrder, setLayoutOrder] = useState<string[]>(["top-ad", "hero", "ad-middle", "tabs", "ad-bottom"])

  const [adsSaving, setAdsSaving] = useState(false)
  const [adsMessage, setAdsMessage] = useState({ text: "", type: "success" })

  // Customized Ads States
  const [customAdsList, setCustomAdsList] = useState<CustomAd[]>([])
  const [editingAd, setEditingAd] = useState<CustomAd | null>(null)
  const [adIdInput, setAdIdInput] = useState("")
  const [adNameInput, setAdNameInput] = useState("")
  const [adCodeInput, setAdCodeInput] = useState("")
  const [customAdsLoading, setCustomAdsLoading] = useState(false)

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
          setFooterAds(data.ads.footerAds || "")
          if (data.ads.layoutOrder) {
            try {
              const parsed = JSON.parse(data.ads.layoutOrder)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setLayoutOrder(parsed)
              }
            } catch { }
          }
        }
      })
      .catch(() => { })

    fetchCustomAds()
  }, [])

  // Refetch customized ads list when tab changes
  useEffect(() => {
    if (activeTab === "customized") {
      fetchCustomAds()
    }
  }, [activeTab])

  const fetchCustomAds = async () => {
    setCustomAdsLoading(true)
    try {
      const res = await fetch("/api/manage/custom-ads")
      if (res.ok) {
        const data = await res.json()
        setCustomAdsList(data.ads || [])
      }
    } catch (err) {
      console.error("Failed to fetch custom ads:", err)
    } finally {
      setCustomAdsLoading(false)
    }
  }

  const safeBtoa = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str || "")))
    } catch (err) {
      return str || ""
    }
  }

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
      setAdsMessage({ text: err.message || "Network error during upload.", type: "error font-semibold" })
    } finally {
      setAdsSaving(false)
    }
  }

  const handleSaveAds = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdsSaving(true)
    setAdsMessage({ text: "", type: "success" })

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
          floatingDesktopAdsStatus: safeBtoa(floatingDesktopAdsStatus),
          layoutOrder: safeBtoa(JSON.stringify(layoutOrder)),
          footerAds: safeBtoa(footerAds)
        })
      })
      if (res.ok) {
        setAdsMessage({ text: "Global Ads & BG configurations saved successfully!", type: "success" })
      } else {
        setAdsMessage({ text: "Failed to save configurations.", type: "error" })
      }
    } catch (err: any) {
      setAdsMessage({ text: err.message || "Network error.", type: "error" })
    } finally {
      setAdsSaving(false)
    }
  }

  // Create / Update Custom Ads
  const handleSaveCustomAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adNameInput || !adCodeInput || (!editingAd && !adIdInput)) {
      setAdsMessage({ text: "Please fill in all custom ad fields.", type: "error" })
      return
    }

    let finalId = ""
    if (editingAd) {
      finalId = editingAd.id
    } else {
      const sanitized = adIdInput.toLowerCase().replace(/[^a-z0-9]/g, "")
      if (!sanitized) {
        setAdsMessage({ text: "Invalid ad tag ID.", type: "error" })
        return
      }
      finalId = `ads_${sanitized}`
    }

    try {
      const res = await fetch("/api/manage/custom-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: finalId,
          name: adNameInput,
          code: safeBtoa(adCodeInput),
          is_encoded: true
        })
      })

      if (res.ok) {
        setAdsMessage({ text: `Custom Ad "${adNameInput}" saved successfully! Available in Drag & Drop layout.`, type: "success" })
        setEditingAd(null)
        setAdIdInput("")
        setAdNameInput("")
        setAdCodeInput("")
        fetchCustomAds()
      } else {
        setAdsMessage({ text: "Failed to save custom ad.", type: "error" })
      }
    } catch (err: any) {
      setAdsMessage({ text: err.message || "Error saving ad.", type: "error" })
    }
  }

  // Delete Custom Ad
  const handleDeleteCustomAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this custom ad slot?")) return

    try {
      const res = await fetch(`/api/manage/custom-ads?id=${adId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setAdsMessage({ text: "Custom ad deleted successfully.", type: "success" })
        fetchCustomAds()
      } else {
        setAdsMessage({ text: "Failed to delete custom ad.", type: "error" })
      }
    } catch (err: any) {
      setAdsMessage({ text: err.message || "Error deleting ad.", type: "error" })
    }
  }

  const handleEditCustomAd = (ad: CustomAd) => {
    setEditingAd(ad)
    setAdIdInput(ad.id.replace("ads_", ""))
    setAdNameInput(ad.name)
    setAdCodeInput(ad.code || "")
  }

  const cancelEdit = () => {
    setEditingAd(null)
    setAdIdInput("")
    setAdNameInput("")
    setAdCodeInput("")
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in font-sans">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Ads & Telemetry Control Center</h3>
              <p className="text-xs text-slate-500 font-medium">Configure global ad scripts or create custom dynamic ad slots available in Drag & Drop layout.</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("globals")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "globals"
                  ? "bg-white text-cyan-600 shadow-xs border border-slate-200 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global Settings</span>
            </button>
            <button
              onClick={() => setActiveTab("customized")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "customized"
                  ? "bg-white text-cyan-600 shadow-xs border border-slate-200 font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Customized Ads ({customAdsList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {adsMessage.text && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between gap-2.5 ${
            adsMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {adsMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{adsMessage.text}</span>
          </div>
          <button onClick={() => setAdsMessage({ text: "", type: "success" })} className="p-1 hover:bg-black/5 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: GLOBAL SETTINGS & ADS */}
      {activeTab === "globals" && (
        <form onSubmit={handleSaveAds} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          
          {/* Global Background Image Input */}
          <div className="space-y-2 pb-6 border-b border-slate-100">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
              Global Background Image (URL or Upload)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={globalBg}
                  onChange={(e) => setGlobalBg(e.target.value)}
                  placeholder="/uploads/global-bg.jpg or https://example.com/bg.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
                />
              </div>
              <label className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-slate-600" />
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
              <div className="relative w-full max-w-md h-32 rounded-xl overflow-hidden border border-slate-200 mt-2 bg-slate-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(globalBg)}
                  alt="Global Background Preview"
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => setGlobalBg("")}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Header Ads Input */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
              Header Ads (Script / HTML Code)
            </label>
            <textarea
              value={headerAds}
              onChange={(e) => setHeaderAds(e.target.value)}
              placeholder="<!-- Paste Google AdSense or other header ad scripts here -->"
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
            />
          </div>

          {/* Global Footer Ads Input */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
              Global Footer Ads (Script / HTML Code)
            </label>
            <textarea
              value={footerAds}
              onChange={(e) => setFooterAds(e.target.value)}
              placeholder="<!-- Paste Google AdSense, Popunder, or other footer tracking scripts here -->"
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
            />
          </div>

          {/* Hero Ads Input */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
              Hero Ads 1 (Primary Banner Script)
            </label>
            <textarea
              value={heroAds}
              onChange={(e) => setHeroAds(e.target.value)}
              placeholder="<!-- Paste primary banner script HTML here -->"
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
            />
          </div>

          {/* Hero2 Ads Input */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
              Hero Ads 2 (Secondary Banner Script)
            </label>
            <textarea
              value={hero2Ads}
              onChange={(e) => setHero2Ads(e.target.value)}
              placeholder="<!-- Paste secondary banner script HTML here -->"
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
            />
          </div>

          {/* Sticky Mobile Ads Status */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                Sticky Bottom / Footer Ads Status (Mobile)
              </label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                  floatingAdsStatus === "on"
                    ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                Sticky Bottom / Footer Ads (Mobile - Script / HTML)
              </label>
              <textarea
                value={floatingAds}
                onChange={(e) => setFloatingAds(e.target.value)}
                placeholder="<!-- Paste sticky bottom mobile overlay banner scripts here -->"
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
              />
            </div>
          </div>

          {/* Sticky Desktop Ads Status */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                Sticky Bottom / Footer Ads Status (Desktop)
              </label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-xs font-bold ${
                  floatingDesktopAdsStatus === "on"
                    ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
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
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                Sticky Bottom / Footer Ads (Desktop - Script / HTML)
              </label>
              <textarea
                value={floatingDesktopAds}
                onChange={(e) => setFloatingDesktopAds(e.target.value)}
                placeholder="<!-- Paste sticky bottom desktop overlay banner scripts here -->"
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={adsSaving}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {adsSaving ? "Saving..." : "Save Global Configuration"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CUSTOMIZED ADS CREATION & LIST */}
      {activeTab === "customized" && (
        <div className="space-y-6">
          {/* Create / Edit Form Card */}
          <form onSubmit={handleSaveCustomAd} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2 font-mono">
                <Plus className="w-4 h-4 text-cyan-600" />
                {editingAd ? `Edit Custom Ad: ${editingAd.name}` : "Create New Custom Ad Slot"}
              </h4>
              {editingAd && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
                >
                  Cancel Editing
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600 font-mono">
                  Ad Slot Name
                </label>
                <input
                  type="text"
                  value={adNameInput}
                  onChange={(e) => setAdNameInput(e.target.value)}
                  placeholder="e.g. Sidebar Movie Ad 300x250"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-sans"
                />
              </div>

              {!editingAd && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600 font-mono">
                    Ad Tag ID (Identifier)
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-500">
                    <span className="text-slate-400">ads_</span>
                    <input
                      type="text"
                      value={adIdInput}
                      onChange={(e) => setAdIdInput(e.target.value)}
                      placeholder="sidebar_1"
                      className="w-full bg-transparent text-slate-900 focus:outline-hidden font-mono text-xs pl-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600 font-mono">
                Script / HTML Code
              </label>
              <textarea
                value={adCodeInput}
                onChange={(e) => setAdCodeInput(e.target.value)}
                placeholder="<!-- Paste Google AdSense script, iframe code, or direct image link -->"
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 font-mono transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingAd ? "Update Custom Ad" : "Save & Add to Drag & Drop"}</span>
              </button>
            </div>
          </form>

          {/* List of Created Custom Ads */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider font-mono">
                  Saved Customized Ads ({customAdsList.length})
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">These custom ad slots automatically appear in the Drag & Drop layout palette.</p>
              </div>
            </div>

            {customAdsLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading custom ads...</div>
            ) : customAdsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Ad Tag ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Script Preview</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {customAdsList.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 text-xs">
                          {ad.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {ad.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                          {ad.code || "Empty script"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditCustomAd(ad)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomAd(ad.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500">No custom ads created yet. Fill the form above to add custom ad slots.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
