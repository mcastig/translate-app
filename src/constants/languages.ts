/**
 * Supported languages. `code` follows ISO 639-1, which is what the MyMemory
 * API expects in its `langpair` parameter. `AUTO_CODE` is a UI-only sentinel
 * for "Detect Language" — see services/translate.ts for how it is resolved.
 */
export interface Language {
  code: string
  label: string
}

export const AUTO_CODE = 'auto'

export const DETECT_LANGUAGE: Language = {
  code: AUTO_CODE,
  label: 'Detect Language',
}

export const ENGLISH: Language = { code: 'en', label: 'English' }
export const FRENCH: Language = { code: 'fr', label: 'French' }
export const SPANISH: Language = { code: 'es', label: 'Spanish' }

/** Languages offered as the translation target (no auto-detect). */
export const TARGET_LANGUAGES: Language[] = [ENGLISH, FRENCH, SPANISH]

/** Languages offered as the translation source (auto-detect first). */
export const SOURCE_LANGUAGES: Language[] = [
  DETECT_LANGUAGE,
  ...TARGET_LANGUAGES,
]

/** Default text shown on first load, per the design. */
export const DEFAULT_TEXT = 'Hello, how are you?'
export const DEFAULT_SOURCE = ENGLISH.code
export const DEFAULT_TARGET = FRENCH.code

/** Maximum characters allowed in the source field. */
export const MAX_CHARS = 500

/** Look up a language label by code, falling back to the code itself. */
export function labelForCode(code: string): string {
  return SOURCE_LANGUAGES.find((lang) => lang.code === code)?.label ?? code
}
