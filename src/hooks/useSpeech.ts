import { useCallback, useEffect, useState } from 'react'
import { AUTO_CODE, DEFAULT_SOURCE } from '../constants/languages'

interface UseSpeech {
  /** Whether the browser exposes the Web Speech API. */
  supported: boolean
  /** Whether speech is currently playing. */
  speaking: boolean
  /** Speak `text` in `lang`; calling again cancels the previous utterance. */
  speak: (text: string, lang: string) => void
}

/**
 * Thin wrapper over the Web Speech API (`speechSynthesis`) for reading the
 * source and target text aloud. Safe to call when unsupported — `speak`
 * simply does nothing.
 */
export function useSpeech(): UseSpeech {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)

  // Cancel any in-flight speech if the component using this hook unmounts.
  // Capture the reference at mount so cleanup is independent of later changes.
  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    return () => synth.cancel()
  }, [supported])

  const speak = useCallback(
    (text: string, lang: string) => {
      const trimmed = text.trim()
      if (!supported || trimmed === '') return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(trimmed)
      utterance.lang = lang === AUTO_CODE ? DEFAULT_SOURCE : lang
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [supported],
  )

  return { supported, speaking, speak }
}
