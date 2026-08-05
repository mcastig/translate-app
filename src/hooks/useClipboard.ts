import { useCallback, useEffect, useRef, useState } from 'react'

interface UseClipboard {
  /** True briefly after a successful copy, for transient UI feedback. */
  copied: boolean
  /** Copy `text` to the clipboard; no-op for empty strings. */
  copy: (text: string) => Promise<void>
}

/**
 * Wraps the async Clipboard API and exposes a short-lived `copied` flag so the
 * UI can confirm the action without managing its own timer.
 */
export function useClipboard(resetMs = 2000): UseClipboard {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      if (text.trim() === '') return
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetMs)
    },
    [resetMs],
  )

  return { copied, copy }
}
