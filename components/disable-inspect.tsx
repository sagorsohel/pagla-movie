"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function DisableInspect() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't disable inspect on admin dashboard
    if (pathname && pathname.startsWith("/dashboard")) {
      return
    }

    // Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Disable Keyboard Shortcuts (F12, Ctrl+Shift+I/J/C/K, Ctrl+U, Ctrl+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K (or Mac Cmd+Option+...)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        ["I", "i", "J", "j", "C", "c", "K", "k"].includes(e.key)
      ) {
        e.preventDefault()
        return false
      }

      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault()
        return false
      }

      // Ctrl+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault()
        return false
      }
    }

    // Disable image & text drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("dragstart", handleDragStart)

    // Anti-DevTools debugger interval
    const interval = setInterval(() => {
      try {
        ;(function () {
          return false
        })
          // @ts-ignore
          ["constructor"]("debugger")()
      } catch (err) {}
    }, 1000)

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("dragstart", handleDragStart)
      clearInterval(interval)
    }
  }, [])

  return null
}
