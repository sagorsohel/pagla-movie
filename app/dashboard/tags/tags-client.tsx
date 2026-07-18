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
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Create form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 lg:col-span-1 h-fit">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <PlusIcon className="w-4 h-4 text-violet-400" /> Create Custom Tag
        </h2>
        <form ref={formRef} action={createAction} className="space-y-4">
          {createState?.error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
              {createState.error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Tag Name</label>
            <Input
              name="name"
              placeholder="e.g. Action Blast"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Referral URL (Optional)</label>
            <Input
              name="referralUrl"
              placeholder="https://referral-link.com"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Modal Image URL (Optional)</label>
            <Input
              name="modalImage"
              placeholder="https://image-banner.com/img.jpg"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isCreatePending}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold"
          >
            {isCreatePending ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> Creating...
              </span>
            ) : (
              "Add Tag"
            )}
          </Button>
        </form>
      </div>

      {/* Tags List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 lg:col-span-2">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <TagIcon className="w-4 h-4 text-cyan-400" /> Custom Tags
        </h2>

        {tagsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <TagIcon className="w-10 h-10 mb-2 text-slate-600" />
            <p className="text-sm font-medium">No custom tags created yet.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-300 border-b border-slate-900">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Slug</th>
                    <th className="px-5 py-4">Referral Link</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {tagsList.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-900/10">
                      <td className="px-5 py-3 font-semibold text-slate-200">{tag.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-cyan-400">/{tag.slug}</td>
                      <td className="px-5 py-3 max-w-[200px] truncate">
                        {tag.referralUrl ? (
                          <a
                            href={tag.referralUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                          >
                            <span className="truncate">{tag.referralUrl}</span>
                            <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-600">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedTag(tag)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <Edit3Icon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tag.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                    <ChevronLeftIcon className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => navigateToPage(currentPage + 1)}
                    className="border-slate-800 bg-slate-900/30 hover:bg-slate-950 text-slate-300"
                  >
                    Next <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      {selectedTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedTag(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 pr-8">
              Edit Tag: <span className="text-violet-400">{selectedTag.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add links or customized popups associated with this tag.
            </p>

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={selectedTag.id} />

              {editState?.error && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
                  {editState.error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Referral/Affiliate URL</label>
                <Input
                  name="referralUrl"
                  defaultValue={selectedTag.referralUrl || ""}
                  placeholder="https://referral-domain.com/item"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Modal Promotional Image URL</label>
                <Input
                  name="modalImage"
                  defaultValue={selectedTag.modalImage || ""}
                  placeholder="https://image-hosting.com/banner.jpg"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
                <Button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="border-slate-800 bg-slate-900/30 hover:bg-slate-950 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatePending}
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
