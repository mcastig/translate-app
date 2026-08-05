import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSpeech } from './useSpeech'

class FakeUtterance {
  text: string
  lang = ''
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) {
    this.text = text
  }
}

let lastUtterance: FakeUtterance | undefined
let speakMock: ReturnType<typeof vi.fn>
let cancelMock: ReturnType<typeof vi.fn>

function installSpeech() {
  speakMock = vi.fn((u: FakeUtterance) => {
    lastUtterance = u
  })
  cancelMock = vi.fn()
  vi.stubGlobal('speechSynthesis', { speak: speakMock, cancel: cancelMock })
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
}

beforeEach(() => {
  lastUtterance = undefined
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useSpeech', () => {
  it('reports supported and speaks the text with the given language', () => {
    installSpeech()
    const { result } = renderHook(() => useSpeech())

    expect(result.current.supported).toBe(true)

    act(() => result.current.speak('Hello', 'en'))

    expect(cancelMock).toHaveBeenCalled()
    expect(speakMock).toHaveBeenCalledTimes(1)
    expect(lastUtterance?.text).toBe('Hello')
    expect(lastUtterance?.lang).toBe('en')
  })

  it('maps the auto language to the default source', () => {
    installSpeech()
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('Hello', 'auto'))

    expect(lastUtterance?.lang).toBe('en')
  })

  it('tracks the speaking state across start, end, and error', () => {
    installSpeech()
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('Hello', 'en'))
    act(() => lastUtterance?.onstart?.())
    expect(result.current.speaking).toBe(true)

    act(() => lastUtterance?.onend?.())
    expect(result.current.speaking).toBe(false)

    act(() => result.current.speak('Again', 'en'))
    act(() => lastUtterance?.onstart?.())
    act(() => lastUtterance?.onerror?.())
    expect(result.current.speaking).toBe(false)
  })

  it('ignores blank text', () => {
    installSpeech()
    const { result } = renderHook(() => useSpeech())

    act(() => result.current.speak('   ', 'en'))

    expect(speakMock).not.toHaveBeenCalled()
  })

  it('is a no-op when the Web Speech API is unavailable', () => {
    // No installSpeech(): speechSynthesis is absent from the jsdom window.
    const { result, unmount } = renderHook(() => useSpeech())

    expect(result.current.supported).toBe(false)
    expect(() => act(() => result.current.speak('Hello', 'en'))).not.toThrow()
    expect(() => unmount()).not.toThrow()
  })

  it('cancels in-flight speech on unmount', () => {
    installSpeech()
    const { unmount } = renderHook(() => useSpeech())

    unmount()

    expect(cancelMock).toHaveBeenCalled()
  })
})
