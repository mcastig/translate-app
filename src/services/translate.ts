import { AUTO_CODE, DEFAULT_SOURCE } from '../constants/languages'

/**
 * Translation service.
 *
 * NOTE ON THE ENDPOINT: the challenge brief points at
 * `https://mymemory.translated.net/doc/spec.php`, but that URL serves the API
 * *documentation* (HTML), not translations. The real MyMemory endpoint is the
 * GET request below — free and key-less. Keeping every network detail in this
 * one module means swapping providers later touches a single file.
 */
const ENDPOINT = 'https://api.mymemory.translated.net/get'

export interface TranslateParams {
  text: string
  source: string
  target: string
}

interface MyMemoryResponse {
  responseData: { translatedText: string }
  responseStatus: number | string
  responseDetails?: string
}

/**
 * "Detect Language" has no real equivalent in MyMemory's `langpair`, so the
 * auto sentinel resolves to the default source. This is a documented
 * simplification rather than true language detection.
 */
function resolveSource(source: string): string {
  return source === AUTO_CODE ? DEFAULT_SOURCE : source
}

export async function translateText({
  text,
  source,
  target,
}: TranslateParams): Promise<string> {
  const trimmed = text.trim()
  if (trimmed === '') return ''

  const resolvedSource = resolveSource(source)
  // MyMemory rejects identical source/target; nothing to translate anyway.
  if (resolvedSource === target) return text

  const params = new URLSearchParams({
    q: text,
    langpair: `${resolvedSource}|${target}`,
  })

  let response: Response
  try {
    response = await fetch(`${ENDPOINT}?${params.toString()}`)
  } catch {
    throw new Error('Network error. Check your connection and try again.')
  }

  if (!response.ok) {
    throw new Error('Translation service is unavailable. Try again later.')
  }

  const data = (await response.json()) as MyMemoryResponse
  if (Number(data.responseStatus) !== 200) {
    throw new Error(data.responseDetails || 'Could not translate this text.')
  }

  return data.responseData.translatedText
}
