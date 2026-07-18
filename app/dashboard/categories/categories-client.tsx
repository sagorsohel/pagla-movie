"use client"

import * as React from "react"
import { useActionState, useState } from "react"
import { updateCategoryAction } from "./actions"
import { uploadImageAction } from "@/lib/upload-action"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit3Icon,
  ExternalLinkIcon,
  XIcon,
  FolderOpenIcon,
  UploadIcon,
  FilmIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react"

type CategoryData = {
  id: number
  tmdbGenreId: number | null
  name: string
  slug: string
  referralUrl: string | null
  modalImage: string | null
  topAds: string | null
  modalAds: string | null
  movies?: { id: number; title: string; releaseDate: string | null }[]
}

export function CategoriesClient({
  initialCategories,
  totalCount,
  currentPage,
}: {
  initialCategories: CategoryData[]
  totalCount: number
  currentPage: number
}) {
  const [categoriesList, setCategoriesList] = useState<CategoryData[]>(initialCategories)
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null)
  const [editState, updateAction, isUpdatePending] = useActionState(updateCategoryAction, null)

  const [modalImageUrl, setModalImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null)

  const totalPages = Math.ceil(totalCount / 10)

  React.useEffect(() => {
    setCategoriesList(initialCategories)
  }, [initialCategories])

  React.useEffect(() => {
    if (selectedCategory) {
      setModalImageUrl(selectedCategory.modalImage || "")
    } else {
      setModalImageUrl("")
    }
  }, [selectedCategory])

  React.useEffect(() => {
    if (editState?.success) {
      setSelectedCategory(null)
    }
  }, [editState])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await uploadImageAction(formData)
      if (res.success && res.url) {
        setModalImageUrl(res.url)
      } else {
        alert(res.error || "Failed to upload image")
      }
    } catch (err) {
      alert("Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  const navigateToPage = (pageNum: number) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", String(pageNum))
    window.location.search = searchParams.toString()
  }

  return (
    <div className="space-y-6">
      {/* Categories Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        {categoriesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <FolderOpenIcon className="w-10 h-10 mb-2 text-slate-600" />
            <p className="text-sm font-medium">No categories found. Import some movies to auto-generate categories.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-300 border-b border-slate-900">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4">Referral Link</th>
                    <th className="px-5 py-4">Modal Banner</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {categoriesList.map((cat) => (
                    <React.Fragment key={cat.id}>
                      <tr className="hover:bg-slate-900/10">
                        {/* ID */}
                        <td className="px-5 py-3 font-mono text-xs text-slate-500">#{cat.id}</td>
                        {/* Name (Expander) */}
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setExpandedCategoryId(expandedCategoryId === cat.id ? null : cat.id)}
                            className="font-semibold text-slate-200 hover:text-violet-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left focus:outline-hidden"
                          >
                            <span>{cat.name}</span>
                            {expandedCategoryId === cat.id ? (
                              <ChevronUpIcon className="w-3.5 h-3.5 text-violet-400" />
                            ) : (
                              <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>
                          {cat.tmdbGenreId && (
                            <span className="inline-block mt-0.5 text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                              TMDB: {cat.tmdbGenreId}
                            </span>
                          )}
                        </td>
                        {/* Slug */}
                        <td className="px-5 py-3 font-mono text-xs text-cyan-400">/{cat.slug}</td>
                        {/* Referral Link */}
                        <td className="px-5 py-3 max-w-[200px] truncate">
                          {cat.referralUrl ? (
                            <a
                              href={cat.referralUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                            >
                              <span className="truncate">{cat.referralUrl}</span>
                              <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-600">Not set</span>
                          )}
                        </td>
                        {/* Modal Image */}
                        <td className="px-5 py-3 max-w-[150px] truncate">
                          {cat.modalImage ? (
                            <a
                              href={cat.modalImage}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-violet-400 hover:text-violet-300"
                            >
                              <span className="truncate">View Image</span>
                              <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-600">None</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedCategory(cat)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <Edit3Icon className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                      {/* Expanded Movie Row */}
                      {expandedCategoryId === cat.id && (
                        <tr className="bg-slate-950/45 border-b border-slate-900 animate-in slide-in-from-top-1 duration-150">
                          <td colSpan={6} className="px-8 py-5">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase text-violet-400 tracking-wider flex items-center gap-2">
                                <FilmIcon className="w-3.5 h-3.5" /> Movies in {cat.name} ({cat.movies?.length || 0})
                              </h4>
                              {cat.movies && cat.movies.length > 0 ? (
                                <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 max-h-48 overflow-y-auto pr-2">
                                  {cat.movies.map((movie) => (
                                    <div
                                      key={movie.id}
                                      className="flex justify-between items-center bg-slate-900/60 border border-slate-800/40 p-2.5 rounded-lg text-xs"
                                    >
                                      <span className="font-semibold text-slate-200 truncate pr-2">{movie.title}</span>
                                      <span className="text-slate-500 font-mono text-[10px] flex-shrink-0">
                                        {movie.releaseDate || "N/A"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-600 italic">No movies linked to this category yet.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-900 px-5 py-4">
                <div className="text-xs text-slate-500">
                  Page <span className="text-slate-300 font-medium">{currentPage}</span> of{" "}
                  <span className="text-slate-300 font-medium">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => navigateToPage(currentPage - 1)}
                    className="border-slate-800 bg-slate-900/30 hover:bg-slate-950 text-slate-300"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => navigateToPage(currentPage + 1)}
                    className="border-slate-800 bg-slate-900/30 hover:bg-slate-950 text-slate-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 pr-8">
              Edit Category: <span className="text-violet-400">{selectedCategory.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Configure parameters, referral URLs, and scripts for this category view.
            </p>

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={selectedCategory.id} />

              {editState?.error && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                  {editState.error}
                </div>
              )}

              {/* Referral Link */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Referral/Affiliate URL</label>
                <Input
                  name="referralUrl"
                  defaultValue={selectedCategory.referralUrl || ""}
                  placeholder="https://referral-domain.com/item"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-655 focus-visible:ring-violet-500"
                />
              </div>

              {/* Upload image input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Modal Promotional Image</label>
                <div className="flex gap-2 items-center">
                  <Input
                    name="modalImage"
                    value={modalImageUrl}
                    onChange={(e) => setModalImageUrl(e.target.value)}
                    placeholder="https://image-hosting.com/banner.jpg"
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-655 focus-visible:ring-violet-500 flex-1"
                  />
                  <label className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer border border-slate-800 transition whitespace-nowrap h-9 flex items-center gap-1.5">
                    {isUploading ? (
                      <>
                        <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-3.5 h-3.5" /> Upload
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
                {modalImageUrl && (
                  <div className="mt-2.5 relative w-full h-28 rounded-lg overflow-hidden border border-slate-850 bg-slate-950/80 p-1 flex items-center justify-center">
                    <img src={modalImageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                  </div>
                )}
              </div>

              {/* Top Ads Script */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Top Ads Script / HTML</label>
                <textarea
                  name="topAds"
                  defaultValue={selectedCategory.topAds || ""}
                  placeholder="<!-- Insert top banner ad script here -->"
                  rows={3}
                  className="w-full rounded-md bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-655 focus:outline-hidden focus:ring-1 focus:ring-violet-500 p-3 text-sm font-mono"
                />
              </div>

              {/* Modal Ads Script */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Modal Ads Script / HTML</label>
                <textarea
                  name="modalAds"
                  defaultValue={selectedCategory.modalAds || ""}
                  placeholder="<!-- Insert modal/popunder ad script here -->"
                  rows={3}
                  className="w-full rounded-md bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-655 focus:outline-hidden focus:ring-1 focus:ring-violet-500 p-3 text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <Button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="border-slate-800 bg-slate-900/30 hover:bg-slate-950 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatePending || isUploading}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
                >
                  {isUpdatePending ? (
                    <span className="flex items-center gap-2">
                      <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
