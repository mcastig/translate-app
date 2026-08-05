import { describe, expect, it } from 'vitest'
import { SOURCE_LANGUAGES, TARGET_LANGUAGES, labelForCode } from './languages'

describe('languages', () => {
  it('offers Detect Language only as a source', () => {
    expect(SOURCE_LANGUAGES[0].label).toBe('Detect Language')
    expect(TARGET_LANGUAGES.some((l) => l.code === 'auto')).toBe(false)
  })

  it('resolves a known code to its label', () => {
    expect(labelForCode('fr')).toBe('French')
  })

  it('falls back to the code for an unknown language', () => {
    expect(labelForCode('xx')).toBe('xx')
  })
})
