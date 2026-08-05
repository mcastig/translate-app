import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TranslateForm } from './TranslateForm'

/** Build a MyMemory-shaped Response. */
function ok(translatedText: string) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        responseData: { translatedText },
        responseStatus: 200,
      }),
  } as Response
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

let speakMock: ReturnType<typeof vi.fn>
let writeTextMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  speakMock = vi.fn()
  vi.stubGlobal('speechSynthesis', { speak: speakMock, cancel: vi.fn() })
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      lang = ''
      text: string
      constructor(text: string) {
        this.text = text
      }
    },
  )
  writeTextMock = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText: writeTextMock } })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TranslateForm', () => {
  it('translates the default text on mount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok('Bonjour')))
    render(<TranslateForm />)

    expect(await screen.findByText('Bonjour')).toBeInTheDocument()
  })

  it('re-translates after the user edits the text (debounced)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok('Salut'))
    vi.stubGlobal('fetch', fetchMock)
    render(<TranslateForm />)

    const field = screen.getByRole('textbox', { name: 'Translate from' })
    await userEvent.clear(field)
    await userEvent.type(field, 'Hi')

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('q=Hi')),
    )
    expect(await screen.findByText('Salut')).toBeInTheDocument()
  })

  it('translates immediately when the Translate button is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok('Bonjour'))
    vi.stubGlobal('fetch', fetchMock)
    render(<TranslateForm />)

    await screen.findByText('Bonjour')
    fetchMock.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'Translate' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  })

  it('shows a loading label while a translation is in flight', async () => {
    const d = deferred<Response>()
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(d.promise))
    render(<TranslateForm />)

    expect(
      await screen.findByRole('button', { name: 'Translating…' }),
    ).toBeDisabled()

    d.resolve(ok('Bonjour'))
    expect(await screen.findByText('Bonjour')).toBeInTheDocument()
  })

  it('shows an error message when the translation fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    render(<TranslateForm />)

    expect(
      await screen.findByText(
        'Network error. Check your connection and try again.',
      ),
    ).toBeInTheDocument()
  })

  it('falls back to a generic message for a non-Error failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject('not-an-error'),
      } as unknown as Response),
    )
    render(<TranslateForm />)

    expect(
      await screen.findByText('Could not translate this text.'),
    ).toBeInTheDocument()
  })

  it('clears the output when the input is emptied', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok('Bonjour')))
    render(<TranslateForm />)
    await screen.findByText('Bonjour')

    await userEvent.clear(
      screen.getByRole('textbox', { name: 'Translate from' }),
    )

    await waitFor(() =>
      expect(screen.queryByText('Bonjour')).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Translate' })).toBeDisabled()
  })

  it('swaps languages and text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok('Bonjour')))
    render(<TranslateForm />)
    await screen.findByText('Bonjour')

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch languages' }),
    )

    // The translated text becomes the new source input.
    expect(screen.getByRole('textbox', { name: 'Translate from' })).toHaveValue(
      'Bonjour',
    )
    // Source now shows French as the active language.
    const fromTabs = screen.getByRole('tablist', { name: 'Translate from' })
    expect(
      within(fromTabs).getByRole('tab', { name: 'French' }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('resolves auto-detect to the default source when swapping', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok('Bonjour')))
    render(<TranslateForm />)
    await screen.findByText('Bonjour')

    const fromTabs = screen.getByRole('tablist', { name: 'Translate from' })
    await userEvent.click(
      within(fromTabs).getByRole('tab', { name: 'Detect Language' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Switch languages' }),
    )

    // auto -> English becomes the new target language.
    const toTabs = screen.getByRole('tablist', { name: 'Translate to' })
    expect(
      within(toTabs).getByRole('tab', { name: 'English' }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('reads the source and target text aloud', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok('Bonjour')))
    render(<TranslateForm />)
    await screen.findByText('Bonjour')

    const listenButtons = screen.getAllByRole('button', { name: 'Listen' })
    await userEvent.click(listenButtons[0])
    await userEvent.click(listenButtons[1])
    expect(speakMock).toHaveBeenCalledTimes(2)
  })

  it('copies the source and target text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok('Bonjour')))
    render(<TranslateForm />)
    await screen.findByText('Bonjour')

    const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
    await userEvent.click(copyButtons[0])
    expect(writeTextMock).toHaveBeenCalledWith('Hello, how are you?')

    await userEvent.click(copyButtons[1])
    expect(writeTextMock).toHaveBeenCalledWith('Bonjour')
  })

  it('ignores a stale response that resolves after a newer one', async () => {
    const first = deferred<Response>()
    const second = deferred<Response>()
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(first.promise) // mount request
      .mockReturnValueOnce(second.promise) // edit request
    vi.stubGlobal('fetch', fetchMock)
    render(<TranslateForm />)

    // The mount request is still pending; edit the text to start a second one.
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Translate from' }),
      '!',
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    // Newer (second) request resolves first and wins.
    second.resolve(ok('New'))
    expect(await screen.findByText('New')).toBeInTheDocument()

    // Stale (first) request resolves later and must be ignored.
    first.resolve(ok('Stale'))
    await waitFor(() =>
      expect(screen.queryByText('Stale')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('ignores a stale error that rejects after a newer success', async () => {
    const first = deferred<Response>()
    const second = deferred<Response>()
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    vi.stubGlobal('fetch', fetchMock)
    render(<TranslateForm />)

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Translate from' }),
      '!',
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

    second.resolve(ok('New'))
    await screen.findByText('New')

    first.reject(new Error('late failure'))
    await waitFor(() =>
      expect(screen.queryByText(/Network error/)).not.toBeInTheDocument(),
    )
    expect(screen.getByText('New')).toBeInTheDocument()
  })
})
