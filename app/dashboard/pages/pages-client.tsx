"use client"

import * as React from "react"
import { useActionState } from "react"
import { createPageAction, deletePageAction } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2Icon, PlusIcon, Loader2Icon, LinkIcon, ExternalLinkIcon } from "lucide-react"

type PageData = {
  id: number
  title: string
  slug: string
  redirectUrl: string | null
  redirectTime: number
  createdAt: Date
}

export function PagesClient({ initialPages }: { initialPages: PageData[] }) {
  const [state, formAction, isPending] = useActionState(createPageAction, null)
  const formRef = React.useRef<HTMLFormElement>(null)

  React.useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this page?")) {
      const res = await deletePageAction(id)
      if (res?.error) {
        alert(res.error)
      }
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Create Form */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 lg:col-span-1 h-fit">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <PlusIcon className="w-4 h-4 text-violet-400" /> Create Custom Page
        </h2>
        <form ref={formRef} action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-400">
              {state.error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Page Title</label>
            <Input
              name="title"
              placeholder="e.g. Action Movies Special"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Page Slug</label>
            <Input
              name="slug"
              placeholder="e.g. action-special"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Redirect URL (Optional)</label>
            <Input
              name="redirectUrl"
              placeholder="https://example.com/target"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Redirect Delay (Seconds)</label>
            <Input
              name="redirectTime"
              type="number"
              defaultValue={5}
              placeholder="5"
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium shadow-md shadow-violet-600/10"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> Creating...
              </span>
            ) : (
              "Add Page"
            )}
          </Button>
        </form>
      </div>

      {/* Pages List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 lg:col-span-2">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <LinkIcon className="w-4 h-4 text-cyan-400" /> Active Custom Pages
        </h2>

        {initialPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-slate-800 text-slate-500">
            <LinkIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No custom pages created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-xs font-semibold uppercase text-slate-300">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Title</th>
                  <th className="px-4 py-3">Slug / Path</th>
                  <th className="px-4 py-3">Redirect Target</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/55">
                {initialPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-900/15">
                    <td className="px-4 py-3 font-semibold text-slate-200">{page.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-cyan-400">
                      /{page.slug}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {page.redirectUrl ? (
                        <a
                          href={page.redirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:text-white"
                        >
                          {page.redirectUrl} <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(page.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
