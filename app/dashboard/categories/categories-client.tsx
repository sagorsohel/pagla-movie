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
    <div className="space-y-6 font-sans">
      {/* Categories Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {categoriesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <FolderOpenIcon className="w-10 h-10 mb-2 text-slate-400" />
            <p className="text-sm font-medium">No categories found. Import some movies to auto-generate categories.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4">Referral Link</th>
                    <th className="px-5 py-4">Modal Banner</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categoriesList.map((cat) => (
                    <React.Fragment key={cat.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        {/* ID */}
                        <td className="px-5 py-3 font-mono text-xs text-slate-400">#{cat.id}</td>
                        {/* Name (Expander) */}
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setExpandedCategoryId(expandedCategoryId === cat.id ? null : cat.id)}
                            className="font-bold text-slate-900 hover:text-cyan-600 transition-colors flex items-center gap-1.5 cursor-pointer text-left focus:outline-hidden"
                          >
                            <span>{cat.name}</span>
                            {expandedCategoryId === cat.id ? (
                              <ChevronUpIcon className="w-3.5 h-3.5 text-cyan-600" />
                            ) : (
                              <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          {cat.tmdbGenreId && (
                            <span className="inline-block mt-0.5 text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-1 py-0.2 rounded font-mono">
                              TMDB: {cat.tmdbGenreId}
                            </span>
                          )}
                        </td>
                        {/* Slug */}
                        <td className="px-5 py-3 font-mono text-xs text-cyan-600">/{cat.slug}</td>
                        {/* Referral Link */}
                        <td className="px-5 py-3 max-w-[150px] truncate">
                          {cat.referralUrl ? (
                            <a
                              href={cat.referralUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium"
                            >
                              <span className="truncate">{cat.referralUrl}</span>
                              <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-400">Not set</span>
                          )}
                        </td>
                        {/* Modal Image */}
                        <td className="px-5 py-3">
                          {cat.modalImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cat.modalImage}
                              alt={cat.name}
                              className="w-10 h-6 object-cover rounded border border-slate-200"
                            />
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedCategory(cat)}
                            className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                          >
                            <Edit3Icon className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>

                      {/* Expanded Movies Rows */}
                      {expandedCategoryId === cat.id && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50 p-4 border-y border-slate-200">
                            <div className="space-y-3 max-w-4xl">
                              <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-700 font-mono flex items-center gap-1.5">
                                  <FilmIcon className="w-3.5 h-3.5 text-cyan-600" />
                                  <span>Associated Movies ({cat.movies?.length || 0})</span>
                                </div>
                                <a
                                  href={`/dashboard/movies?categoryId=${cat.id}`}
                                  className="text-xs text-cyan-600 hover:text-cyan-700 font-extrabold flex items-center gap-1"
                                >
                                  View all in Movies Page &rarr;
                                </a>
                              </div>

                              {cat.movies && cat.movies.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {cat.movies.slice(0, 9).map((m) => (
                                    <div
                                      key={m.id}
                                      className="p-2 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                                    >
                                      <span className="font-bold text-slate-800 truncate max-w-[180px]">{m.title}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">{m.releaseDate || "N/A"}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No movies currently linked to this category.</p>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 bg-slate-50">
                <div className="text-xs text-slate-500">
                  Page <span className="text-slate-900 font-bold font-mono">{currentPage}</span> of{" "}
                  <span className="text-slate-900 font-bold font-mono">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => navigateToPage(currentPage - 1)}
                    className="border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => navigateToPage(currentPage + 1)}
                    className="border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Category Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 pr-8">
              Edit Category: <span className="text-cyan-600">{selectedCategory.name}</span>
            </h3>

            <form action={updateAction} className="space-y-4 pt-4">
              <input type="hidden" name="id" value={selectedCategory.id} />

              {editState?.error && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-bold">
                  {editState.error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Category Name</label>
                <Input
                  name="name"
                  defaultValue={selectedCategory.name}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Referral/Affiliate URL</label>
                <Input
                  name="referralUrl"
                  defaultValue={selectedCategory.referralUrl || ""}
                  placeholder="https://referral-domain.com/category"
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block font-mono">Modal Promotional Image</label>
                <div className="flex gap-2 items-center">
                  <Input
                    name="modalImage"
                    value={modalImageUrl}
                    onChange={(e) => setModalImageUrl(e.target.value)}
                    placeholder="https://image-hosting.com/category-banner.jpg"
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500 flex-1"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer border border-slate-200 transition whitespace-nowrap h-9 flex items-center gap-1.5">
                    {isUploading ? (
                      <>
                        <Loader2Icon className="w-3.5 h-3.5 animate-spin text-cyan-600" /> Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-3.5 h-3.5 text-slate-600" /> Upload
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Category Top Ads (Script / HTML)</label>
                <textarea
                  name="topAds"
                  defaultValue={selectedCategory.topAds || ""}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Category Modal Ads (Script / HTML)</label>
                <textarea
                  name="modalAds"
                  defaultValue={selectedCategory.modalAds || ""}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                  className="border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatePending}
                  className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-xs"
                >
                  {isUpdatePending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
