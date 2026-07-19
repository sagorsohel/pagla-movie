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
  Settings
} from "lucide-react"

// Types for components
const COMPONENT_LABELS: Record<string, string> = {
  "top-ad": "Top Ad Slot (Navbar Ad)",
  "hero": "Billboard Hero Header & Video Player",
  "ad-middle": "Middle Ad Slot (Custom script ad)",
  "tabs": "Tabs Panel (Related Movies & Metadata details)",
  "ad-bottom": "Bottom Ad Slot (Promo card banners)"
}

export default function VisualLayoutBuilderPage() {
  const [selectedPage, setSelectedPage] = useState<"single">("single")
  const [previewMode, setPreviewMode] = useState<"visual" | "compact">("visual")
  const [layout, setLayout] = useState<string[]>(["top-ad", "hero", "ad-middle", "tabs", "ad-bottom"])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "success" })

  // Drag states
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null)
  const [activeDropIndicator, setActiveDropIndicator] = useState<number | null>(null)
  
  // Full ads configuration object from backend
  const [fullAdsData, setFullAdsData] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/manage/ads")
      if (res.ok) {
        const data = await res.json()
        if (data && data.ads) {
          setFullAdsData(data.ads)
          if (data.ads.layoutOrder) {
            try {
              const parsed = JSON.parse(data.ads.layoutOrder)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setLayout(parsed)
              }
            } catch {}
          }
        }
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

  // Drag and drop handlers
  const handleDragStartFromLayout = (index: number) => {
    setDraggedBlockIndex(index)
  }

  const handleDragOverIndicator = (e: DragEvent, index: number) => {
    e.preventDefault()
    setActiveDropIndicator(index)
  }

  const handleDragLeaveIndicator = () => {
    setActiveDropIndicator(null)
  }

  const handleDropOnIndicator = (index: number) => {
    if (draggedBlockIndex === null) return

    const newLayout = [...layout]
    const itemToMove = newLayout[draggedBlockIndex]
    
    // Remove from old position
    newLayout.splice(draggedBlockIndex, 1)
    
    // Calculate new insertion index
    let insertIndex = index
    if (draggedBlockIndex < index) {
      insertIndex = index - 1
    }
    
    newLayout.splice(insertIndex, 0, itemToMove)
    setLayout(newLayout)

    // Reset drag status
    setDraggedBlockIndex(null)
    setActiveDropIndicator(null)
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
        showNotification("Layout order saved successfully!", "success")
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

  const renderVisualComponent = (item: string) => {
    switch (item) {
      case "top-ad":
        return (
          <div className="w-full bg-amber-500/5 hover:bg-amber-500/10 border-2 border-dashed border-amber-500/25 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[90px]">
            <div className="flex items-center gap-2 text-amber-455">
              <Megaphone className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase font-mono tracking-widest">
                AD SLOT 1: HERO / TOP AD BANNER [40s / 20s CYCLE]
              </span>
            </div>
            <span className="text-xs font-black text-amber-250">Top Navbar Ad</span>
            <span className="text-[9px] font-semibold text-amber-500/80 font-mono">
              Displays immediately below the navigation bar. Cycles Hero Ads 1 & 2.
            </span>
          </div>
        )

      case "hero":
        return (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden font-sans select-none shadow-sm text-left">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex gap-1.5">
                  <span className="bg-red-500/10 text-red-500 text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">ACTION</span>
                  <span className="bg-red-500/10 text-red-500 text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">SCI-FI</span>
                </div>
                <h4 className="text-sm font-black uppercase text-slate-100 leading-tight">Avengers: Endgame (2019)</h4>
                
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" className="px-3.5 py-1.5 bg-white text-slate-950 rounded-full text-[9px] font-black pointer-events-none uppercase flex items-center gap-1 shadow-sm">▶ Watch Now</button>
                  <span className="w-7 h-7 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center text-[9px] text-slate-400 font-bold hover:text-white cursor-pointer transition">+</span>
                </div>
              </div>
              <div className="w-28 h-18 rounded bg-slate-950 border border-slate-850 flex items-center justify-center text-[8px] text-slate-600 font-bold shrink-0 shadow-xs">BACKDROP PREVIEW</div>
            </div>

            {/* Metadata info */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-900/60">
              <div className="col-span-2 space-y-1.5">
                <span className="text-[7px] font-black text-slate-500 uppercase block tracking-wider">Overview Description</span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more to reverse Thanos' actions...
                </p>
              </div>
              <div className="border-l border-slate-900/80 pl-3 space-y-1.5 text-[8px] text-slate-500 shrink-0">
                <div><span className="font-bold text-slate-455">Director:</span> Anthony Russo</div>
                <div><span className="font-bold text-slate-455">Cast:</span> Robert Downey Jr., Chris Evans</div>
                <div className="flex gap-1 pt-1">
                  <span className="bg-slate-950 px-1 border border-slate-800 rounded font-bold text-[5px] text-slate-400">16+</span>
                  <span className="bg-slate-950 px-1 border border-slate-800 rounded font-bold text-[5px] text-slate-400">UHD</span>
                </div>
              </div>
            </div>
          </div>
        )

      case "ad-middle":
        return (
          <div className="w-full bg-emerald-500/5 hover:bg-emerald-500/10 border-2 border-dashed border-emerald-500/25 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[90px]">
            <div className="flex items-center gap-2 text-emerald-455">
              <Megaphone className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase font-mono tracking-widest">
                AD SLOT 2: MIDDLE BANNER ADSENSE / AD SCRIPT
              </span>
            </div>
            <span className="text-xs font-black text-emerald-250">Middle Ad Slot</span>
            <span className="text-[9px] font-semibold text-emerald-500/80 font-mono">
              Injected dynamically below the video player / billboard header and above tabs navigation panel.
            </span>
          </div>
        )

      case "tabs":
        return (
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm text-left font-sans select-none">
            <div className="flex gap-4 border-b border-slate-800 pb-2 text-[8px] font-bold text-slate-500">
              <span className="text-white border-b border-white pb-2 font-extrabold uppercase">Related Content</span>
              <span className="uppercase">Details & Advisory</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Main Column (2 columns) */}
              <div className="col-span-2 space-y-2">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-wider block">Customers also watched</span>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded bg-slate-950 border border-slate-850 flex flex-col justify-end p-1.5 shrink-0">
                      <div className="w-full h-1 bg-slate-900 rounded-xs" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Column (1 column) */}
              <div className="border-l border-slate-850 pl-3 space-y-3.5">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-wider block">Cast & Info Sidebar</span>
                
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-800 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="w-12 h-1 bg-slate-400 rounded-xs" />
                        <div className="w-8 h-1 bg-slate-655 rounded-xs" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-[7.5px] text-slate-500 border-t border-slate-850 pt-2 shrink-0">
                  <div><span className="font-bold text-slate-400">Director:</span> Anthony Russo</div>
                  <div className="flex gap-1 pt-1.5">
                    <span className="bg-slate-950 px-1 border border-slate-800 rounded font-bold text-[5px] text-slate-400">16+</span>
                    <span className="bg-slate-955 px-1 border border-slate-800 rounded font-bold text-[5px] text-slate-400">SUB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "ad-bottom":
        return (
          <div className="w-full bg-purple-500/5 hover:bg-purple-500/10 border-2 border-dashed border-purple-500/25 hover:border-purple-500/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[90px]">
            <div className="flex items-center gap-2 text-purple-455">
              <Megaphone className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase font-mono tracking-widest">
                AD SLOT 3: BOTTOM ROTATING AD CARD / SPONSOR
              </span>
            </div>
            <span className="text-xs font-black text-purple-250">Bottom Ad Slot</span>
            <span className="text-[9px] font-semibold text-purple-500/80 font-mono">
              Custom advertisement script displayed at the bottom of the related list or details metadata info.
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
        <div className="w-10 h-10 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in font-sans pb-20">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <SlidersHorizontal className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100">Visual Layout Builder</h3>
            <p className="text-xs text-slate-400 font-medium">Design page structure visually. Drag components on the left and reorder them on the right details mockup.</p>
          </div>
        </div>

        <button
          onClick={handleSaveLayout}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-955 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/10 active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Layout..." : "Save Layout"}</span>
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 max-w-lg ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid: Left Draggable Panel vs Right Preview Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: AVAILABLE AD BLOCKS & DRAGGABLE SECTIONS (5 Cols - STICKY) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 self-start">
          <div className="bg-[#050b14] border border-slate-900 rounded-3xl p-5 shadow-xl space-y-5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Draggable Ads & Sections</h4>
              <p className="text-[10px] text-slate-500 mt-1">Drag the boxes from here or use them as a reference. Move items in the right mockup list to reorder them.</p>
            </div>

            <div className="space-y-2.5">
              {layout.map((sectionId, idx) => {
                let badgeColor = ""
                if (sectionId === "top-ad") {
                  badgeColor = "border-amber-500/30 bg-amber-500/5 text-amber-400"
                } else if (sectionId === "hero") {
                  badgeColor = "border-slate-800 bg-slate-900/60 text-slate-300"
                } else if (sectionId === "ad-middle") {
                  badgeColor = "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                } else if (sectionId === "tabs") {
                  badgeColor = "border-slate-800 bg-slate-900/60 text-slate-300"
                } else if (sectionId === "ad-bottom") {
                  badgeColor = "border-purple-500/30 bg-purple-500/5 text-purple-400"
                }

                return (
                  <div
                    key={`left-${sectionId}`}
                    draggable
                    onDragStart={() => handleDragStartFromLayout(idx)}
                    className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-900 hover:border-slate-700 rounded-xl transition-all cursor-grab active:cursor-grabbing hover:shadow-xs group select-none"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-slate-600 shrink-0 group-hover:text-slate-400" />
                      <span className="text-xs font-black tracking-wide text-slate-300 uppercase">
                        {COMPONENT_LABELS[sectionId] || sectionId}
                      </span>
                    </div>
                    <span className={`text-[8px] font-mono font-bold border px-1.5 py-0.5 rounded shrink-0 uppercase ${badgeColor}`}>
                      Item {idx + 1}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-2xl flex gap-3 text-slate-500">
              <HelpCircle className="w-5 h-5 shrink-0 text-cyan-400" />
              <div className="text-[10px] font-semibold leading-relaxed">
                <span className="font-bold text-slate-300 block mb-1">Layout Ordering Guide:</span>
                - Reorder items by dragging their grab handle.
                - The Right Page Preview updates instantly to match your arrangement.
                - Click the "Save Layout" button at the top to commit changes.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH FIDELITY LAYOUT PREVIEW CANVAS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#050b14] border border-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-4 gap-3">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider">Layout Canvas & Live Mockup</h4>
                <p className="text-[10px] text-slate-500 mt-1">Drag layout sections directly inside the container list below to rearrange.</p>
              </div>
              <div className="flex items-center gap-2 select-none">
                <div className="bg-slate-950 p-1 rounded-lg border border-slate-900 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("visual")}
                    className={`px-2 py-1 text-[9px] font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      previewMode === "visual"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-black"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Visual Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("compact")}
                    className={`px-2 py-1 text-[9px] font-extrabold rounded-md uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                      previewMode === "compact"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-black"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Compact Lists</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drag & Drop Visual Canvas */}
            <div className="flex flex-col relative py-2 gap-1 select-none">
              
              {/* Drop indicator at very top (Index 0) */}
              <div
                onDragOver={(e) => handleDragOverIndicator(e, 0)}
                onDragLeave={handleDragLeaveIndicator}
                onDrop={() => handleDropOnIndicator(0)}
                className={`h-3 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
                  activeDropIndicator === 0
                    ? "border-emerald-500 bg-emerald-500/10 scale-102 h-10"
                    : "border-transparent opacity-0 hover:opacity-100 hover:border-emerald-500/30 hover:h-6 hover:bg-emerald-500/2"
                }`}
              >
                <span className="text-[9px] text-emerald-450 font-black tracking-widest uppercase">
                  {activeDropIndicator === 0 ? "Drop here" : "Drag block here"}
                </span>
              </div>

              {layout.map((item, idx) => (
                <div key={`${item}-${idx}`} className="flex flex-col gap-1">
                  {previewMode === "visual" ? (
                    /* Visual Mode rendering */
                    <div
                      draggable
                      onDragStart={() => handleDragStartFromLayout(idx)}
                      className="group/item relative rounded-2xl border border-slate-900/60 bg-slate-950/20 hover:border-cyan-500/30 hover:bg-slate-950 transition-all cursor-grab active:cursor-grabbing hover:shadow-xl p-1"
                    >
                      {/* Drag & Position handle tags on hover */}
                      <div className="absolute top-2 right-2.5 z-20 flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-all pointer-events-none">
                        <span className="text-[8px] font-black font-mono bg-slate-950/95 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest shadow-xs">
                          {item === "top-ad" || item === "ad-middle" || item === "ad-bottom" ? "Ad Banner" : "Content Frame"}
                        </span>
                        <div className="bg-slate-900 border border-slate-800 rounded-md p-1 pointer-events-auto flex items-center shadow-xs">
                          <Move className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                        </div>
                      </div>

                      {/* Render Visual content */}
                      {renderVisualComponent(item)}
                    </div>
                  ) : (
                    /* Compact mode rendering */
                    <div
                      draggable
                      onDragStart={() => handleDragStartFromLayout(idx)}
                      className="flex items-center justify-between px-4 py-4 rounded-xl border border-slate-900 bg-slate-950 hover:bg-slate-900 cursor-grab active:cursor-grabbing transition-all select-none hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Move className="w-4 h-4 text-slate-655 shrink-0" />
                        <div>
                          <span className="text-[8.5px] font-black uppercase font-mono tracking-wider text-slate-500">
                            {item === "top-ad" || item === "ad-middle" || item === "ad-bottom" ? "Ad Frame" : "Main Section"}
                          </span>
                          <p className="text-xs font-bold text-slate-200 mt-0.5">{COMPONENT_LABELS[item] || item}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-550 px-1.5 py-0.5 rounded uppercase">
                        Slot {idx + 1}
                      </span>
                    </div>
                  )}

                  {/* Drop indicator below this item (Index idx + 1) */}
                  <div
                    onDragOver={(e) => handleDragOverIndicator(e, idx + 1)}
                    onDragLeave={handleDragLeaveIndicator}
                    onDrop={() => handleDropOnIndicator(idx + 1)}
                    className={`h-3 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
                      activeDropIndicator === idx + 1
                        ? "border-emerald-500 bg-emerald-500/10 scale-102 h-10 my-1"
                        : "border-transparent opacity-0 hover:opacity-100 hover:border-emerald-500/30 hover:h-6 hover:bg-emerald-500/2 my-0.5"
                    }`}
                  >
                    <span className="text-[9px] text-emerald-450 font-black tracking-widest uppercase">
                      {activeDropIndicator === idx + 1 ? "Drop here" : "Drag block here"}
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
