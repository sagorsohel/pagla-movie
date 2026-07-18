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
    } catch (err) {
      alert("Error uploading image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImport = () => {
    if (confirm("Import movies from the last 30 days from TMDB? This may take a few seconds.")) {
      setImportStatus("Importing...")
      startImportTransition(async () => {
        const res = await runMovieImportAction()
        if ("error" in res) {
          alert(res.error)
          setImportStatus(null)
        } else {
          alert(`Successfully imported ${res.count} movies!`)
          setImportStatus(null)
          window.location.reload()
        }
      })
    }
  }

  const navigateToPage = (pageNum: number) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", String(pageNum))
    window.location.search = searchParams.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20 border border-slate-900 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400">
            Total Movies: <span className="font-semibold text-slate-100">{totalCount}</span>
          </div>
          {filterCategoryName && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search)
                searchParams.delete("categoryId")
                searchParams.delete("page") // Reset page
                window.location.search = searchParams.toString()
              }}
              className="border-slate-800 bg-slate-900/40 text-xs hover:bg-slate-900 text-red-400 hover:text-red-300 h-7"
            >
              Clear Category Filter
            </Button>
          )}
        </div>
        <Button
          onClick={handleImport}
          disabled={isImportPending}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/10"
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
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        {moviesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <DownloadIcon className="w-10 h-10 mb-2 text-slate-600 animate-bounce" />
            <p className="text-sm font-medium">No movies found. Click the button above to import movies from TMDB.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-300 border-b border-slate-900">
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
                <tbody className="divide-y divide-slate-850">
                  {moviesList.map((movie) => (
                    <tr key={movie.id} className="hover:bg-slate-900/10">
                      {/* Poster */}
                      <td className="px-5 py-3">
                        {movie.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded-lg border border-slate-800 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-600 text-center font-bold">
                            No poster
                          </div>
                        )}
                      </td>
                      {/* Title */}
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-200">{movie.title}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {movie.tmdbId}</div>
                      </td>
                      {/* Categories */}
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {movie.categories && movie.categories.length > 0 ? (
                            movie.categories.map((c) => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-400 text-[10px] font-semibold"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 text-xs">None</span>
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
                                className="px-2 py-0.5 rounded bg-violet-950/80 border border-violet-850/40 text-violet-400 text-[10px] font-semibold"
                              >
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 text-xs">None</span>
                          )}
                        </div>
                      </td>
                      {/* Release Date */}
                      <td className="px-5 py-3 text-slate-300 font-medium whitespace-nowrap">
                        {movie.releaseDate || "Unknown"}
                      </td>
                      {/* Referral Link */}
                      <td className="px-5 py-3 max-w-[150px] truncate">
                        {movie.referralUrl ? (
                          <a
                            href={movie.referralUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                          >
                            <span className="truncate">{movie.referralUrl}</span>
                            <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-600">Not set</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedMovie(movie)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
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

      {/* Edit Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 pr-8">
              Edit Custom Parameters: <span className="text-violet-400">{selectedMovie.title}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add links, popups, ads, and custom tags associated with this specific film page.
            </p>

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={selectedMovie.id} />

              {editState?.error && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                  {editState.error}
                </div>
              )}

              {/* Referral URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Referral/Affiliate URL</label>
                <Input
                  name="referralUrl"
                  defaultValue={selectedMovie.referralUrl || ""}
                  placeholder="https://referral-domain.com/item"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
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
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500 flex-1"
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
                  defaultValue={selectedMovie.topAds || ""}
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
                  defaultValue={selectedMovie.modalAds || ""}
                  placeholder="<!-- Insert modal/popunder ad script here -->"
                  rows={3}
                  className="w-full rounded-md bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-655 focus:outline-hidden focus:ring-1 focus:ring-violet-500 p-3 text-sm font-mono"
                />
              </div>

              {/* Redirect Url */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Direct Redirect URL</label>
                <Input
                  name="redirectUrl"
                  defaultValue={selectedMovie.redirectUrl || ""}
                  placeholder="https://target-movie-player.com/watch"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
                />
              </div>

              {/* Redirect Time */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Redirect Delay (Seconds)</label>
                <Input
                  name="redirectTime"
                  type="number"
                  defaultValue={selectedMovie.redirectTime || 5}
                  placeholder="5"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
                />
              </div>

              {/* Tag selectors checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Select Custom Tags</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-slate-800 bg-slate-900/40 max-h-32 overflow-y-auto">
                  {allTags.length === 0 ? (
                    <span className="text-xs text-slate-600 col-span-2">No tags created yet. Create tags first.</span>
                  ) : (
                    allTags.map((tag) => {
                      const isChecked = selectedMovie.tags?.some((t) => t.id === tag.id) || false
                      return (
                        <label
                          key={tag.id}
                          className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white"
                        >
                          <input
                            type="checkbox"
                            name="tagIds"
                            value={tag.id}
                            defaultChecked={isChecked}
                            className="rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500"
                          />
                          {tag.name}
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <Button
                  type="button"
                  onClick={() => setSelectedMovie(null)}
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
