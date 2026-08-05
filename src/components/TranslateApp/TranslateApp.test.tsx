import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TranslateApp } from './TranslateApp'

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

describe('TranslateApp', () => {
  it('renders the header, an accessible heading, and the translator', () => {
    render(<TranslateApp />)

    expect(screen.getByText('translated.io')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Translate text between languages/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'Translate from' }),
    ).toBeInTheDocument()
  })
})
