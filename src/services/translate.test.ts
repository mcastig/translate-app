import { afterEach, describe, expect, it, vi } from 'vitest'
import { translateText } from './translate'

function mockFetchOnce(value: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(value),
  } as Response)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('translateText', () => {
  it('returns the translated text on success', async () => {
    const fetchMock = mockFetchOnce({
      responseData: { translatedText: 'Bonjour' },
      responseStatus: 200,
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await translateText({
      text: 'Hello',
      source: 'en',
      target: 'fr',
    })

    expect(result).toBe('Bonjour')
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('q=Hello')
    expect(url).toContain('langpair=en%7Cfr')
  })

  it('accepts a string responseStatus of "200"', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({
        responseData: { translatedText: 'Hola' },
        responseStatus: '200',
      }),
    )

    await expect(
      translateText({ text: 'Hello', source: 'en', target: 'es' }),
    ).resolves.toBe('Hola')
  })

  it('resolves the auto source to the default language', async () => {
    const fetchMock = mockFetchOnce({
      responseData: { translatedText: 'Bonjour' },
      responseStatus: 200,
    })
    vi.stubGlobal('fetch', fetchMock)

    await translateText({ text: 'Hello', source: 'auto', target: 'fr' })

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('langpair=en%7Cfr')
  })

  it('returns an empty string for blank input without calling fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      translateText({ text: '   ', source: 'en', target: 'fr' }),
    ).resolves.toBe('')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns the original text when source and target match', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      translateText({ text: 'Hello', source: 'en', target: 'en' }),
    ).resolves.toBe('Hello')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns the original text when auto resolves to the target', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      translateText({ text: 'Hello', source: 'auto', target: 'en' }),
    ).resolves.toBe('Hello')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws a friendly error on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')))

    await expect(
      translateText({ text: 'Hello', source: 'en', target: 'fr' }),
    ).rejects.toThrow('Network error. Check your connection and try again.')
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetchOnce({}, false))

    await expect(
      translateText({ text: 'Hello', source: 'en', target: 'fr' }),
    ).rejects.toThrow('Translation service is unavailable. Try again later.')
  })

  it('throws the API detail message on a non-200 status', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({
        responseData: { translatedText: '' },
        responseStatus: 403,
        responseDetails: 'INVALID LANGUAGE PAIR',
      }),
    )

    await expect(
      translateText({ text: 'Hello', source: 'en', target: 'fr' }),
    ).rejects.toThrow('INVALID LANGUAGE PAIR')
  })

  it('falls back to a generic message when no detail is given', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetchOnce({
        responseData: { translatedText: '' },
        responseStatus: 500,
      }),
    )

    await expect(
      translateText({ text: 'Hello', source: 'en', target: 'fr' }),
    ).rejects.toThrow('Could not translate this text.')
  })
})
