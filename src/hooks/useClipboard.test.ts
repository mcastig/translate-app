import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useClipboard } from './useClipboard'

beforeEach(() => {
  vi.stubGlobal('navigator', {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useClipboard', () => {
  it('writes text and flips copied true, then resets after the timeout', async () => {
    const { result } = renderHook(() => useClipboard(1000))

    await act(async () => {
      await result.current.copy('hello')
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello')
    expect(result.current.copied).toBe(true)

    await waitFor(() => expect(result.current.copied).toBe(false), {
      timeout: 2000,
    })
  })

  it('does nothing for blank text', async () => {
    const { result } = renderHook(() => useClipboard())

    await act(async () => {
      await result.current.copy('   ')
    })
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    expect(result.current.copied).toBe(false)
  })

  it('clears the pending reset timer on unmount', async () => {
    vi.useFakeTimers()
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { result, unmount } = renderHook(() => useClipboard())

    await act(async () => {
      await result.current.copy('hello')
    })
    unmount()

    expect(clearSpy).toHaveBeenCalled()
  })
})
