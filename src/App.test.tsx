import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          responseData: { translatedText: 'Bonjour' },
          responseStatus: 200,
        }),
    }),
  )
})

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('mounts the translate application', () => {
    render(<App />)
    expect(screen.getByText('translated.io')).toBeInTheDocument()
  })
})
