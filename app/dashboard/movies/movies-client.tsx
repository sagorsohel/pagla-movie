"use client"

import * as React from "react"
import { useActionState, useState, useTransition } from "react"
import { updateMovieAction, runMovieImportAction } from "./actions"
import { uploadImageAction } from "@/lib/upload-action"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader2Icon,
  DownloadIcon,
  Edit3Icon,
  ExternalLinkIcon,
  XIcon,
  UploadIcon,
} from "lucide-react"

type MovieData = {
  id: number
  tmdbId: number
  title: string
  overview: string | null
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string | null
  voteAverage: string | null
  referralUrl: string | null
  modalImage: string | null
  topAds: string | null
  modalAds: string | null
  redirectUrl: string | null
  redirectTime: number | null
  categories?: { id: number; name: string }[]
  tags?: { id: number; name: string }[]
}

type TagOption = {
  id: number
  name: string
  slug: string
}

export function MoviesClient({
  initialMovies,
  totalCount,
  currentPage,
  allTags = [],
  filterCategoryName = "",
}: {
  initialMovies: MovieData[]
  totalCount: number
  currentPage: number
  allTags?: TagOption[]
  filterCategoryName?: string
}) {
  const [moviesList, setMoviesList] = useState<MovieData[]>(initialMovies)
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null)
  const [editState, updateAction, isUpdatePending] = useActionState(updateMovieAction, null)
  const [isImportPending, startImportTransition] = useTransition()
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const [modalImageUrl, setModalImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Pagination states
  const totalPages = Math.ceil(totalCount / 10)

  React.useEffect(() => {
    setMoviesList(initialMovies)
  }, [initialMovies])

  React.useEffect(() => {
    if (selectedMovie) {
      setModalImageUrl(selectedMovie.modalImage || "")
    } else {
      setModalImageUrl("")
    }
  }, [selectedMovie])

  React.useEffect(() => {
    if (editState?.success) {
      setSelectedMovie(null)
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
    } catch {
      alert("Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImport = () => {
    setImportStatus("Importing past 30 days...")
    startImportTransition(async () => {
      const result: any = await runMovieImportAction()
      if (result && result.success) {
        setImportStatus(`Imported ${result.count} movies! Reloading...`)
        window.location.reload()
      } else {
        setImportStatus(`Import failed: ${result?.error || "Unknown error"}`)
      }
    })
  }

  const navigateToPage = (pageNum: number) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", String(pageNum))
    window.location.search = searchParams.toString()
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            Total Movies: <span className="font-extrabold text-slate-900 font-mono">{totalCount}</span>
          </div>
          {filterCategoryName && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search)
                searchParams.delete("categoryId")
                searchParams.delete("page")
                window.location.search = searchParams.toString()
              }}
              className="border-slate-200 bg-red-50 text-xs hover:bg-red-100 text-red-600 h-7"
            >
              Clear Category Filter
            </Button>
          )}
        </div>
        <Button
          onClick={handleImport}
          disabled={isImportPending}
          className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold flex items-center gap-2 shadow-sm text-xs rounded-xl"
        >
          {isImportPending ? (
            <>
              <Loader2Icon className="w-4 h-4 animate-spin" /> {importStatus}
            </>
          ) : (
            <>
              <DownloadIcon className="w-4 h-4" /> Import TMDB Movies (Past 30 Days)
            </>
          )}
        </Button>
      </div>

      {/* Movies Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {moviesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <DownloadIcon className="w-10 h-10 mb-2 text-slate-400 animate-bounce" />
            <p className="text-sm font-medium">No movies found. Click the button above to import movies from TMDB.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Poster</th>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Categories</th>
                    <th className="px-5 py-4">Tags</th>
                    <th className="px-5 py-4">Release Date</th>
                    <th className="px-5 py-4">Referral Link</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {moviesList.map((movie) => (
                    <tr key={movie.id} className="hover:bg-slate-50 transition-colors">
                      {/* Poster */}
                      <td className="px-5 py-3">
                        {movie.posterPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded-lg border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-[9px] text-slate-400 text-center font-bold">
                            No poster
                          </div>
                        )}
                      </td>
                      {/* Title */}
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900">{movie.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {movie.tmdbId}</div>
                      </td>
                      {/* Categories */}
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {movie.categories && movie.categories.length > 0 ? (
                            movie.categories.map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-bold"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">None</span>
                          )}
                        </div>
                      </td>
                      {/* Tags */}
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {movie.tags && movie.tags.length > 0 ? (
                            movie.tags.map((t) => (
                              <span
                                key={t.id}
                                className="px-2 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-bold"
                              >
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">None</span>
                          )}
                        </div>
                      </td>
                      {/* Release Date */}
                      <td className="px-5 py-3 text-slate-700 font-mono text-xs whitespace-nowrap">
                        {movie.releaseDate || "Unknown"}
                      </td>
                      {/* Referral Link */}
                      <td className="px-5 py-3 max-w-[150px] truncate">
                        {movie.referralUrl ? (
                          <a
                            href={movie.referralUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium"
                          >
                            <span className="truncate">{movie.referralUrl}</span>
                            <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400">Not set</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedMovie(movie)}
                          className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                        >
                          <Edit3Icon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
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

      {/* Edit Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 pr-8">
              Edit Custom Parameters: <span className="text-cyan-600">{selectedMovie.title}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add links, popups, ads, and custom tags associated with this specific film page.
            </p>

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={selectedMovie.id} />

              {editState?.error && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-bold">
                  {editState.error}
                </div>
              )}

              {/* Referral URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Referral/Affiliate URL</label>
                <Input
                  name="referralUrl"
                  defaultValue={selectedMovie.referralUrl || ""}
                  placeholder="https://referral-domain.com/item"
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              {/* Upload image input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block font-mono">Modal Promotional Image</label>
                <div className="flex gap-2 items-center">
                  <Input
                    name="modalImage"
                    value={modalImageUrl}
                    onChange={(e) => setModalImageUrl(e.target.value)}
                    placeholder="https://image-hosting.com/banner.jpg"
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

              {/* Redirect URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Redirect Target URL</label>
                <Input
                  name="redirectUrl"
                  defaultValue={selectedMovie.redirectUrl || ""}
                  placeholder="https://external-movie-link.com"
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              {/* Redirect Time */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Redirect Time Delay (seconds)</label>
                <Input
                  type="number"
                  name="redirectTime"
                  defaultValue={selectedMovie.redirectTime ?? 5}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              {/* Top Ads */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Movie Page Top Ads (Script / HTML)</label>
                <textarea
                  name="topAds"
                  defaultValue={selectedMovie.topAds || ""}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Modal Ads */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Movie Modal Ads (Script / HTML)</label>
                <textarea
                  name="modalAds"
                  defaultValue={selectedMovie.modalAds || ""}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Tags checkboxes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 font-mono block">Genre Tags Mapping</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {allTags.map((tag) => {
                    const isChecked = selectedMovie.tags?.some((t) => t.id === tag.id)
                    return (
                      <label key={tag.id} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <input
                          type="checkbox"
                          name="tagIds"
                          value={tag.id}
                          defaultChecked={isChecked}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>{tag.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedMovie(null)}
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
