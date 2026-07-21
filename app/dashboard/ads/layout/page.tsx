"use client"

import { useState, useEffect, DragEvent } from "react"
import Link from "next/link"
import {
  SlidersHorizontal,
  Save,
  CheckCircle,
  AlertTriangle,
  GripVertical,
  ArrowLeft,
  Megaphone,
  Eye,
  Move,
  Play,
  HelpCircle,
  Plus,
  PlusCircle,
  Maximize2,
  Volume2,
  Settings,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Film,
  Download,
  FolderOpen,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Star,
  Trash2,
  Layers,
  FileCode
} from "lucide-react"

// Standard Component Labels
const COMPONENT_LABELS: Record<string, string> = {
  "top-ad": "Top Ad Slot (Navbar Ad)",
  "hero": "Billboard Hero Header & Video Player",
  "ad-middle": "Middle Ad Slot (Custom Script Ad)",
  "movie-info": "Movie Info Card & Plot Details",
  "download-links": "Download Links Container (MKV / MP4)",
  "tabs": "Tabs Panel (Related Movies & Cast Info)",
  "ad-bottom": "Bottom Ad Slot (Promo Card Banner)"
}

const DEFAULT_LAYOUT = [
  "top-ad",
  "hero",
  "ad-middle",
  "movie-info",
  "download-links",
  "tabs",
  "ad-bottom"
]

const STANDARD_PALETTE = [
  { id: "top-ad", name: "Top Ad Slot (Navbar Ad)", desc: "Cycles Hero Ads 1 & 2 at top of page" },
  { id: "ad-middle", name: "Middle Ad Slot (Script Ad)", desc: "Inline banner below header player" },
  { id: "ad-bottom", name: "Bottom Ad Slot (Footer Banner)", desc: "Banner below related movies recommendations" }
]

export default function VisualLayoutBuilderPage() {
  const [previewMode, setPreviewMode] = useState<"visual" | "compact">("visual")
  const [layout, setLayout] = useState<string[]>(DEFAULT_LAYOUT)
  const [customAdsList, setCustomAdsList] = useState<Array<{ id: string; name: string; code: string }>>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "success" })

  // Drag states
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null)
  const [draggedPaletteAd, setDraggedPaletteAd] = useState<string | null>(null)
  const [activeDropIndicator, setActiveDropIndicator] = useState<number | null>(null)
  
  // Backend ads configuration
  const [fullAdsData, setFullAdsData] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch layout configs
      const res = await fetch("/api/manage/ads")
      if (res.ok) {
        const data = await res.json()
        if (data && data.ads) {
          setFullAdsData(data.ads)
          if (data.ads.layoutOrder) {
            try {
              const parsed = JSON.parse(data.ads.layoutOrder)
              if (Array.isArray(parsed) && parsed.length > 0) {
                const merged = [...parsed]
                DEFAULT_LAYOUT.forEach(item => {
                  if (!merged.includes(item)) {
                    merged.push(item)
                  }
                })
                setLayout(merged)
              }
            } catch {}
          }
        }
      }

      // Fetch customized ads
      const cRes = await fetch("/api/manage/custom-ads")
      if (cRes.ok) {
        const cData = await cRes.json()
        setCustomAdsList(cData.ads || [])
      }
    } catch (err) {
      console.error("Failed to load settings:", err)
      showNotification("Failed to load settings from server", "error")
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (text: string, type: "success" | "error") => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: "", type: "success" }), 4000)
  }

  const safeBtoa = (str: string) => {
    try {
      return btoa(unescape(encodeURIComponent(str || "")))
    } catch {
      return str || ""
    }
  }

  // Combine standard and custom ads into palette list
  const fullPalette = [
    ...STANDARD_PALETTE,
    ...customAdsList.map(ca => ({
      id: ca.id,
      name: ca.name,
      desc: `Custom Ad Slot (${ca.id})`
    }))
  ]

  const getItemLabel = (id: string) => {
    if (COMPONENT_LABELS[id]) return COMPONENT_LABELS[id]
    const custom = customAdsList.find(c => c.id === id)
    if (custom) return custom.name
    return id
  }

  // Move item up/down manually
  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= layout.length) return
    const newLayout = [...layout]
    const [movedItem] = newLayout.splice(index, 1)
    newLayout.splice(newIndex, 0, movedItem)
    setLayout(newLayout)
  }

  // Remove item from layout
  const removeItem = (index: number) => {
    const itemToRemove = layout[index]
    const newLayout = layout.filter((_, i) => i !== index)
    setLayout(newLayout)
    showNotification(`Removed ${getItemLabel(itemToRemove)} from layout`, "success")
  }

  // Add item back to layout
  const addItem = (sectionId: string, insertIndex?: number) => {
    const newLayout = [...layout]
    const existingIdx = newLayout.indexOf(sectionId)
    if (existingIdx !== -1) {
      newLayout.splice(existingIdx, 1)
    }
    const idx = insertIndex !== undefined ? insertIndex : newLayout.length
    newLayout.splice(idx, 0, sectionId)
    setLayout(newLayout)
    showNotification(`Placed ${getItemLabel(sectionId)} into layout`, "success")
  }

  const removedSections = DEFAULT_LAYOUT.filter(id => !layout.includes(id))

  // Drag and drop handlers
  const handleDragStartFromLayout = (index: number) => {
    setDraggedBlockIndex(index)
    setDraggedPaletteAd(null)
  }

  const handleDragStartFromPalette = (adId: string) => {
    setDraggedPaletteAd(adId)
    setDraggedBlockIndex(null)
  }

  const handleDragOverIndicator = (e: DragEvent, index: number) => {
    e.preventDefault()
    setActiveDropIndicator(index)
  }

  const handleDragLeaveIndicator = () => {
    setActiveDropIndicator(null)
  }

  const handleDropOnIndicator = (index: number) => {
    if (draggedPaletteAd) {
      addItem(draggedPaletteAd, index)
      setDraggedPaletteAd(null)
      setActiveDropIndicator(null)
      return
    }

    if (draggedBlockIndex === null) return

    const newLayout = [...layout]
    const itemToMove = newLayout[draggedBlockIndex]
    
    newLayout.splice(draggedBlockIndex, 1)
    
    let insertIndex = index
    if (draggedBlockIndex < index) {
      insertIndex = index - 1
    }
    
    newLayout.splice(insertIndex, 0, itemToMove)
    setLayout(newLayout)

    setDraggedBlockIndex(null)
    setActiveDropIndicator(null)
  }

  const handleResetDefault = () => {
    setLayout([...DEFAULT_LAYOUT])
    showNotification("Reset layout to default structure.", "success")
  }

  const handleSaveLayout = async () => {
    if (!fullAdsData) return
    setSaving(true)
    try {
      const payload = {
        heroAds: safeBtoa(fullAdsData.heroAds || ""),
        hero2Ads: safeBtoa(fullAdsData.hero2Ads || ""),
        modalAds: safeBtoa(fullAdsData.modalAds || ""),
        headerAds: safeBtoa(fullAdsData.headerAds || ""),
        membershipRefLink: safeBtoa(fullAdsData.membershipRefLink || ""),
        signinRefLink: safeBtoa(fullAdsData.signinRefLink || ""),
        globalBg: safeBtoa(fullAdsData.globalBg || ""),
        floatingAds: safeBtoa(fullAdsData.floatingAds || ""),
        floatingAdsStatus: safeBtoa(fullAdsData.floatingAdsStatus || "on"),
        floatingDesktopAds: safeBtoa(fullAdsData.floatingDesktopAds || ""),
        floatingDesktopAdsStatus: safeBtoa(fullAdsData.floatingDesktopAdsStatus || "on"),
        layoutOrder: safeBtoa(JSON.stringify(layout))
      }

      const res = await fetch("/api/manage/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-encoded-payload": "base64"
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        showNotification("Layout order saved successfully! Applied live to movie details page.", "success")
        fetchData()
      } else {
        showNotification("Failed to save layout order.", "error")
      }
    } catch (err: any) {
      showNotification(err.message || "Error saving layout.", "error")
    } finally {
      setSaving(false)
    }
  }

  // Render Section Component matching movie-detail-client.tsx
  const renderVisualComponent = (item: string) => {
    if (item.startsWith("ads_")) {
      const custom = customAdsList.find(c => c.id === item)
      return (
        <div className="w-full bg-cyan-50 border-2 border-dashed border-cyan-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[90px] shadow-2xs select-none">
          <div className="flex items-center gap-2 text-cyan-700 font-bold">
            <Megaphone className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase font-mono tracking-widest">
              CUSTOM AD: {custom?.name || item}
            </span>
          </div>
          <span className="text-xs font-bold text-cyan-600">Dynamic Custom Ad Tag #{item}</span>
          <span className="text-[10px] font-semibold text-slate-500 font-mono">
            Script code dynamically loaded from customized ads library.
          </span>
        </div>
      )
    }

    switch (item) {
      case "top-ad":
        return (
          <div className="w-full bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[90px] shadow-2xs select-none">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <Megaphone className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase font-mono tracking-widest">
                AD SLOT 1: TOP BANNER AD (40s / 20s CYCLE)
              </span>
            </div>
            <span className="text-xs font-bold text-amber-600">Top Navbar Ad Banner</span>
            <span className="text-[10px] font-semibold text-slate-500 font-mono">
              Rendered directly below the site header bar.
            </span>
          </div>
        )

      case "hero":
        return (
          <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl relative font-sans select-none text-left">
            {/* Backdrop preview */}
            <div className="relative min-h-[280px] flex flex-col justify-end p-6 md:p-8 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent">
              <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mSYzF8W2Q.jpg"
                  alt="Hero Backdrop"
                  className="w-full h-full object-cover object-top opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              </div>

              <div className="relative z-10 space-y-3 max-w-2xl">
                <div className="flex gap-2">
                  <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">ACTION</span>
                  <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">SCI-FI</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight drop-shadow-md">
                  Avengers: Endgame (2019)
                </h2>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button type="button" className="px-5 py-2 bg-white text-black rounded-full text-xs font-black uppercase flex items-center gap-2 shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch Now
                  </button>
                  <button type="button" className="px-4 py-2 bg-slate-900/80 border border-slate-800 text-cyan-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                    Visit Offer <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case "ad-middle":
        return (
          <div className="w-full bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[90px] shadow-2xs select-none">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <Megaphone className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase font-mono tracking-widest">
                AD SLOT 2: MIDDLE BANNER AD
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600">Middle Ad Banner Slot</span>
            <span className="text-[10px] font-semibold text-slate-500 font-mono">
              Injected between the main hero player header and the movie overview card.
            </span>
          </div>
        )

      case "movie-info":
        return (
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row gap-6 relative shadow-sm text-left select-none">
            <div className="w-[120px] h-[175px] shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs mx-auto md:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://image.tmdb.org/t/p/w300/or06FN3Dka5tukKFAvgMOHW2fl5.jpg"
                alt="Movie Poster"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    Avengers: Endgame <span className="text-xs text-slate-400 font-mono font-normal">(2019)</span>
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    ★★★★★★★★☆☆ <span className="text-[10px] text-slate-500 font-mono ml-1">8.4/10 by 18,450 users</span>
                  </div>
                </div>

                <button type="button" className="px-3.5 py-1.5 rounded-lg border border-red-600 text-red-600 bg-red-50 font-bold text-xs uppercase tracking-wider">
                  Subscribe to Watch | $0.00
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions...
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium pt-1">
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
                  <span className="text-slate-500 font-bold">Released:</span>
                  <span className="text-slate-800 font-mono">2019-04-24</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
                  <span className="text-slate-500 font-bold">Runtime:</span>
                  <span className="text-slate-800 font-mono">181 minutes</span>
                </div>
              </div>
            </div>
          </div>
        )

      case "download-links":
        return (
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left select-none">
            <h3 className="text-xs font-black text-red-600 flex items-center gap-1.5 uppercase tracking-widest font-mono">
              <Download className="w-3.5 h-3.5" /> Download Links : MKV
            </h3>
            <div className="space-y-2">
              {["480p - 450MB", "720p - 1.2GB", "1080p - 2.8GB"].map((res, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-black text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200 uppercase font-mono">
                    {res}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 font-mono">
                    <span>GD2</span>
                    <span className="text-slate-300">|</span>
                    <span>CU</span>
                    <span className="text-slate-300">|</span>
                    <span>GD1</span>
                    <span className="text-slate-300">|</span>
                    <span>ZS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "tabs":
        return (
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-left select-none font-sans">
            <div className="flex gap-4 border-b border-slate-200 pb-2 text-xs font-bold text-slate-500">
              <span className="text-slate-900 border-b-2 border-red-600 pb-2 font-black uppercase">Related Movies</span>
              <span className="uppercase">Cast & Info</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col justify-end p-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                    MOVIE PREVIEW
                  </div>
                  <div className="relative z-10 space-y-1 bg-white/95 p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold text-slate-900 truncate">Related Movie #{i + 1}</div>
                    <div className="text-[8px] text-amber-500 font-bold">★ 8.{i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "ad-bottom":
        return (
          <div className="w-full bg-purple-50 border-2 border-dashed border-purple-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[90px] shadow-2xs select-none">
            <div className="flex items-center gap-2 text-purple-700 font-bold">
              <Megaphone className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase font-mono tracking-widest">
                AD SLOT 3: BOTTOM BANNER AD / SPONSOR
              </span>
            </div>
            <span className="text-xs font-black text-purple-600">Bottom Ad Banner Slot</span>
            <span className="text-[10px] font-semibold text-slate-500 font-mono">
              Renders at the bottom of the page below related content recommendations.
            </span>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-cyan-600 border-r-transparent border-b-cyan-600 border-l-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in font-sans pb-20">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Visual Layout & Drag Ads Builder</h3>
            <p className="text-xs text-slate-500 font-medium">
              Drag Ad Blocks directly from the left palette onto the page preview canvas to place them anywhere!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ads"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Create Custom Ads</span>
          </Link>

          <button
            onClick={handleResetDefault}
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          <button
            onClick={handleSaveLayout}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Layout"}</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 max-w-lg ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid: Left Draggable Controls & Ad Palette vs Right Real Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: AD BLOCKS PALETTE & REORDER CONTROL (5 Cols - STICKY) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 self-start">
          
          {/* STANDALONE AD BLOCKS PALETTE */}
          <div className="bg-white border border-cyan-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-cyan-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">Available Ad Blocks</h4>
              </div>
              <span className="text-[9px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full">
                Drag to Canvas
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Drag any of these Ad blocks onto the right page mockup to insert ads before/after any content section.
            </p>

            {/* List of Draggable Standalone Ads */}
            <div className="space-y-2">
              {fullPalette.map((ad) => {
                const isAlreadyInLayout = layout.includes(ad.id)

                return (
                  <div
                    key={`palette-${ad.id}`}
                    draggable
                    onDragStart={() => handleDragStartFromPalette(ad.id)}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-cyan-200 hover:border-cyan-400 rounded-xl transition-all cursor-grab active:cursor-grabbing hover:shadow-xs group select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GripVertical className="w-4 h-4 text-cyan-600 shrink-0 group-hover:text-cyan-700" />
                      <div className="min-w-0">
                        <h5 className="text-xs font-extrabold text-slate-900 truncate">{ad.name}</h5>
                        <p className="text-[9px] text-slate-500 font-mono truncate">{ad.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addItem(ad.id)}
                      className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer transition active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAlreadyInLayout ? "Re-insert" : "Insert"}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PAGE SECTIONS REORDER LIST */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">Reorder Page Layout</h4>
              </div>
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                {layout.length} Sections
              </span>
            </div>

            <div className="space-y-2">
              {layout.map((sectionId, idx) => {
                const isAd = sectionId.includes("ad") || sectionId.startsWith("ads_")
                let badgeColor = isAd ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-100 text-slate-700"

                return (
                  <div
                    key={`left-${sectionId}`}
                    draggable
                    onDragStart={() => handleDragStartFromLayout(idx)}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-grab active:cursor-grabbing hover:shadow-2xs group select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GripVertical className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-slate-600" />
                      <span className="text-xs font-extrabold tracking-wide text-slate-900 truncate">
                        {getItemLabel(sectionId)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, "down")}
                        disabled={idx === layout.length - 1}
                        className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer"
                        title="Remove section from layout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-[8px] font-mono font-bold border px-1.5 py-0.5 rounded uppercase ${badgeColor}`}>
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Removed Sections Palette */}
            {removedSections.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center justify-between font-mono">
                  <span>Hidden / Removed ({removedSections.length})</span>
                </h5>
                <div className="space-y-1.5">
                  {removedSections.map((sectionId) => (
                    <div
                      key={`removed-${sectionId}`}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <span className="text-xs font-semibold text-slate-600">
                        {getItemLabel(sectionId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem(sectionId)}
                        className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Back</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH FIDELITY REAL MOVIE DETAIL MOCKUP (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Movie Details Page Canvas</h4>
                <p className="text-[10px] text-slate-500 mt-1">Drag and drop ads onto the drop indicators below.</p>
              </div>
              <div className="flex items-center gap-2 select-none">
                <div className="bg-white p-1 rounded-lg border border-slate-200 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("visual")}
                    className={`px-2.5 py-1 text-[9px] font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      previewMode === "visual"
                        ? "bg-cyan-50 text-cyan-700 border border-cyan-200 font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Visual Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("compact")}
                    className={`px-2.5 py-1 text-[9px] font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      previewMode === "compact"
                        ? "bg-cyan-50 text-cyan-700 border border-cyan-200 font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Compact Mode</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drag & Drop Visual Canvas */}
            <div className="flex flex-col relative py-2 gap-2 select-none">
              
              {/* Drop indicator at top */}
              <div
                onDragOver={(e) => handleDragOverIndicator(e, 0)}
                onDragLeave={handleDragLeaveIndicator}
                onDrop={() => handleDropOnIndicator(0)}
                className={`h-4 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                  activeDropIndicator === 0
                    ? "border-cyan-500 bg-cyan-100 scale-102 h-12 shadow-sm"
                    : "border-slate-300 opacity-60 hover:opacity-100 hover:border-cyan-400 hover:h-8 hover:bg-cyan-50"
                }`}
              >
                <span className="text-[10px] text-cyan-700 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  {activeDropIndicator === 0 ? "Drop Ad Block Here" : "Drag Ad / Section Here (Position #1)"}
                </span>
              </div>

              {layout.map((item, idx) => (
                <div key={`${item}-${idx}`} className="flex flex-col gap-2">
                  {previewMode === "visual" ? (
                    <div
                      draggable
                      onDragStart={() => handleDragStartFromLayout(idx)}
                      className="group/item relative rounded-2xl border border-slate-200 hover:border-cyan-400 transition-all cursor-grab active:cursor-grabbing p-1 bg-white shadow-2xs"
                    >
                      {/* Section Badge Header */}
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 rounded-t-xl text-[9px] font-mono text-slate-600">
                        <span className="font-extrabold uppercase text-slate-800 flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3 text-slate-400" />
                          <span>{getItemLabel(item)}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(idx, "up")}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, "down")}
                            disabled={idx === layout.length - 1}
                            className="p-0.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-0.5 rounded hover:bg-red-100 text-red-600 cursor-pointer"
                            title="Remove Section"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <span className="font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] text-cyan-700 ml-1">
                            Position #{idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Render Visual component */}
                      <div className="pt-2">
                        {renderVisualComponent(item)}
                      </div>
                    </div>
                  ) : (
                    <div
                      draggable
                      onDragStart={() => handleDragStartFromLayout(idx)}
                      className="flex items-center justify-between px-4 py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-grab active:cursor-grabbing transition-all select-none shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-[9px] font-black uppercase font-mono tracking-wider text-slate-400">
                            {item.includes("ad") ? "Ad Frame" : "Movie Section"}
                          </span>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{getItemLabel(item)}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-slate-100 border border-slate-200 text-cyan-700 px-2 py-0.5 rounded uppercase">
                        Position #{idx + 1}
                      </span>
                    </div>
                  )}

                  {/* Drop indicator below */}
                  <div
                    onDragOver={(e) => handleDragOverIndicator(e, idx + 1)}
                    onDragLeave={handleDragLeaveIndicator}
                    onDrop={() => handleDropOnIndicator(idx + 1)}
                    className={`h-4 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                      activeDropIndicator === idx + 1
                        ? "border-cyan-500 bg-cyan-100 scale-102 h-12 shadow-sm"
                        : "border-slate-300 opacity-40 hover:opacity-100 hover:border-cyan-400 hover:h-8 hover:bg-cyan-50"
                    }`}
                  >
                    <span className="text-[10px] text-cyan-700 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      {activeDropIndicator === idx + 1 ? "Drop Ad Block Here" : `Drag Ad / Section Here (Position #${idx + 2})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
