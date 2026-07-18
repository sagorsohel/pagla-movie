import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return ""
  const cleaned = url.trim()
  if (cleaned.startsWith("/uploads/")) {
    const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || process.env.image_link || ""
    const trimmedBase = base.replace(/\/$/, "")
    return trimmedBase ? `${trimmedBase}${cleaned}` : cleaned
  }
  return cleaned
}

