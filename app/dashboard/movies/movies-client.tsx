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
  const [importPages, setImportPages] = useState(20)

  const [modalImageUrl, setModalImageUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("q") || ""
    }
    return ""
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const searchParams = new URLSearchParams(window.location.search)
    if (searchQuery.trim()) {
      searchParams.set("q", searchQuery.trim())
    } else {
      searchParams.delete("q")
    }
    searchParams.delete("page") // reset to page 1 on new search
    window.location.search = searchParams.toString()
  }

  // Pagination states
  const totalPages = Math.ceil(totalCount / 10)

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)
      if (currentPage > 3) {
        pageNumbers.push("...")
      }
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }
      if (currentPage < totalPages - 2) {
        pageNumbers.push("...")
      }
      pageNumbers.push(totalPages)
    }
    return pageNumbers
  }

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
    const targetPages = Math.max(1, importPages)
    const BATCH_SIZE = 5 // Process 5 pages per request batch so requests never time out (NO 504 errors)!
    
    setImportStatus(`Starting import for ${targetPages} pages...`)

    startImportTransition(async () => {
      let totalImportedCount = 0
      let currentBatchStart = 1

      while (currentBatchStart <= targetPages) {
        const currentBatchEnd = Math.min(currentBatchStart + BATCH_SIZE - 1, targetPages)
        const progressPercent = Math.round((currentBatchStart / targetPages) * 100)
        
        setImportStatus(
          `Importing pages ${currentBatchStart}-${currentBatchEnd} of ${targetPages} (${progressPercent}%)... [${totalImportedCount} new movies]`
        )

        try {
          const result: any = await runMovieImportAction(currentBatchStart, currentBatchEnd)
          if (result && result.success) {
            totalImportedCount += (result.count || 0)
            currentBatchStart = currentBatchEnd + 1
          } else {
            setImportStatus(`Import paused at page ${currentBatchStart}: ${result?.error || "Error"}`)
            return
          }
        } catch (err: any) {
          setImportStatus(`Import paused at page ${currentBatchStart}: ${err?.message || "Network timeout"}`)
          return
        }
      }

      setImportStatus(`Successfully imported ${totalImportedCount} new movies! Reloading...`)
      setTimeout(() => {
        window.location.reload()
      }, 800)
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="text-xs text-slate-500 font-semibold whitespace-nowrap">
            Total Movies: <span className="font-extrabold text-slate-900 font-mono">{totalCount}</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full sm:w-60 md:w-72">
            <input
              type="text"
              placeholder="Search movies by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-205 rounded-xl py-1.5 pl-3.5 pr-8 text-xs focus:outline-hidden focus:border-slate-350 focus:bg-white text-slate-950 placeholder:text-slate-400 font-medium h-9"
            />
            <button type="submit" className="absolute right-3 text-slate-400 hover:text-slate-600 transition cursor-pointer">
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {(filterCategoryName || searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const searchParams = new URLSearchParams(window.location.search)
                searchParams.delete("categoryId")
                searchParams.delete("page")
                searchParams.delete("q")
                window.location.search = searchParams.toString()
              }}
              className="border-slate-200 bg-red-50 border-red-200 text-xs hover:bg-red-100 text-red-600 h-9 rounded-xl px-3 font-extrabold"
            >
              Clear Filters
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs h-9">
            <span className="text-slate-500 font-bold">Pages:</span>
            <input
              type="number"
              min={1}
              max={10000}
              value={importPages}
              disabled={isImportPending}
              onChange={(e) => setImportPages(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
              className="w-16 bg-transparent text-slate-900 font-extrabold focus:outline-hidden font-mono text-center"
            />
          </div>
          <Button
            onClick={handleImport}
            disabled={isImportPending}
            className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold flex items-center gap-2 shadow-xs text-xs rounded-xl h-9"
          >
            {isImportPending ? (
              <>
                <Loader2Icon className="w-4 h-4 animate-spin" /> {importStatus}
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" /> Import TMDB Movies
              </>
            )}
          </Button>
        </div>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 bg-slate-50">
                <div className="text-xs text-slate-500 font-semibold">
                  Page <span className="text-slate-900 font-bold font-mono">{currentPage}</span> of{" "}
                  <span className="text-slate-900 font-bold font-mono">{totalPages}</span> (Total: {totalCount} items)
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => navigateToPage(currentPage - 1)}
                    className="h-8 px-2.5 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    Previous
                  </Button>

                  {getPageNumbers().map((pageNum, idx) => (
                    <React.Fragment key={idx}>
                      {pageNum === "..." ? (
                        <span className="px-1 text-slate-400 font-mono text-sm select-none">...</span>
                      ) : (
                        <Button
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => navigateToPage(pageNum as number)}
                          className={`h-8 w-8 p-0 text-xs font-bold font-mono transition rounded-lg ${
                            currentPage === pageNum
                              ? "bg-slate-900 text-white hover:bg-slate-800 border-transparent"
                              : "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => navigateToPage(currentPage + 1)}
                    className="h-8 px-2.5 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"
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
