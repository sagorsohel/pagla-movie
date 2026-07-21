"use client"

import * as React from "react"
import { useActionState, useState, useRef } from "react"
import { createTagAction, updateTagAction, deleteTagAction } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit3Icon,
  ExternalLinkIcon,
  XIcon,
  TagIcon,
} from "lucide-react"

type TagData = {
  id: number
  name: string
  slug: string
  referralUrl: string | null
  modalImage: string | null
}

export function TagsClient({
  initialTags,
  totalCount,
  currentPage,
}: {
  initialTags: TagData[]
  totalCount: number
  currentPage: number
}) {
  const [tagsList, setTagsList] = useState<TagData[]>(initialTags)
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null)
  const [createState, createAction, isCreatePending] = useActionState(createTagAction, null)
  const [editState, updateAction, isUpdatePending] = useActionState(updateTagAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  const totalPages = Math.ceil(totalCount / 10)

  React.useEffect(() => {
    setTagsList(initialTags)
  }, [initialTags])

  React.useEffect(() => {
    if (createState?.success) {
      formRef.current?.reset()
    }
  }, [createState])

  React.useEffect(() => {
    if (editState?.success) {
      setSelectedTag(null)
    }
  }, [editState])

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      const res = await deleteTagAction(id)
      if (res?.error) {
        alert(res.error)
      }
    }
  }

  const navigateToPage = (pageNum: number) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", String(pageNum))
    window.location.search = searchParams.toString()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 font-sans">
      {/* Create form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1 h-fit shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
          <PlusIcon className="w-4 h-4 text-cyan-600" /> Create Custom Tag
        </h2>
        <form ref={formRef} action={createAction} className="space-y-4">
          {createState?.error && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-bold">
              {createState.error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Tag Name</label>
            <Input
              name="name"
              placeholder="e.g. Action Blast"
              className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Referral/Affiliate URL</label>
            <Input
              name="referralUrl"
              placeholder="https://referral-domain.com/tag"
              className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Modal Image Banner URL</label>
            <Input
              name="modalImage"
              placeholder="https://image-hosting.com/tag-banner.jpg"
              className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isCreatePending}
            className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs"
          >
            {isCreatePending ? <Loader2Icon className="w-4 h-4 animate-spin" /> : "Save Tag"}
          </Button>
        </form>
      </div>

      {/* Tags Table */}
      <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2 overflow-hidden shadow-xs">
        {tagsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <TagIcon className="w-10 h-10 mb-2 text-slate-400" />
            <p className="text-sm font-medium">No custom tags created yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4">Referral Link</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tagsList.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-3 font-bold text-slate-900">{tag.name}</td>
                      {/* Slug */}
                      <td className="px-5 py-3 font-mono text-xs text-cyan-600">/{tag.slug}</td>
                      {/* Referral Link */}
                      <td className="px-5 py-3 max-w-[150px] truncate">
                        {tag.referralUrl ? (
                          <a
                            href={tag.referralUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium"
                          >
                            <span className="truncate">{tag.referralUrl}</span>
                            <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400">Not set</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedTag(tag)}
                            className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                          >
                            <Edit3Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tag.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </div>
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
      {selectedTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedTag(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 pr-8">
              Edit Tag: <span className="text-cyan-600">{selectedTag.name}</span>
            </h3>

            <form action={updateAction} className="space-y-4 pt-4">
              <input type="hidden" name="id" value={selectedTag.id} />

              {editState?.error && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-bold">
                  {editState.error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Tag Name</label>
                <Input
                  name="name"
                  defaultValue={selectedTag.name}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Referral/Affiliate URL</label>
                <Input
                  name="referralUrl"
                  defaultValue={selectedTag.referralUrl || ""}
                  placeholder="https://referral-domain.com/tag"
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 font-mono">Modal Image Banner URL</label>
                <Input
                  name="modalImage"
                  defaultValue={selectedTag.modalImage || ""}
                  placeholder="https://image-hosting.com/tag-banner.jpg"
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTag(null)}
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
