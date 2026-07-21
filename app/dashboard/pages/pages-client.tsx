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
    <div className="grid gap-6 lg:grid-cols-3 font-sans">
      {/* Create Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1 h-fit shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
          <PlusIcon className="w-4 h-4 text-cyan-600" /> Create Custom Page
        </h2>
        <form ref={formRef} action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-bold">
              {state.error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Page Title</label>
            <Input
              name="title"
              placeholder="e.g. Action Movies Special"
              className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Page Slug</label>
            <Input
              name="slug"
              placeholder="e.g. action-special"
              className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Redirect URL (Optional)</label>
            <Input
              name="redirectUrl"
              placeholder="https://example.com/target"
              className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 font-mono">Redirect Delay (Seconds)</label>
            <Input
              name="redirectTime"
              type="number"
              defaultValue={5}
              placeholder="5"
              className="bg-slate-50 border-slate-200 text-slate-900 text-xs focus-visible:ring-cyan-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> Creating...
              </span>
            ) : (
              "Save Page"
            )}
          </Button>
        </form>
      </div>

      {/* Pages List */}
      <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2 overflow-hidden shadow-xs">
        {initialPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <LinkIcon className="w-10 h-10 mb-2 text-slate-400" />
            <p className="text-sm font-medium">No custom pages created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Route / Slug</th>
                  <th className="px-5 py-4">Redirect URL</th>
                  <th className="px-5 py-4">Delay</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-900">{page.title}</td>
                    <td className="px-5 py-3 font-mono text-xs text-cyan-600">/{page.slug}</td>
                    <td className="px-5 py-3 max-w-[180px] truncate">
                      {page.redirectUrl ? (
                        <a
                          href={page.redirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          <span className="truncate">{page.redirectUrl}</span>
                          <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500">{page.redirectTime}s</td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
