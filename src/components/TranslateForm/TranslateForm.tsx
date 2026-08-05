import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AUTO_CODE,
  DEFAULT_SOURCE,
  DEFAULT_TARGET,
  DEFAULT_TEXT,
  MAX_CHARS,
  SOURCE_LANGUAGES,
  TARGET_LANGUAGES,
} from '../../constants/languages'
import { translateText } from '../../services/translate'
import { useDebounce } from '../../hooks/useDebounce'
import { useSpeech } from '../../hooks/useSpeech'
import { useClipboard } from '../../hooks/useClipboard'
import { TextPanel } from '../TextPanel/TextPanel'
import { IconButton } from '../IconButton/IconButton'
import swapIcon from '../../assets/icons/swap.svg'
import translateIcon from '../../assets/icons/sort-alpha.svg'
import './TranslateForm.css'

const DEBOUNCE_MS = 500

/**
 * Stateful translator: owns the source/target text and languages, runs
 * debounced real-time translation, and wires up swap, listen, and copy. The
 * Translate button forces an immediate translation, bypassing the debounce.
 */
export function TranslateForm() {
  const [sourceText, setSourceText] = useState(DEFAULT_TEXT)
  const [targetText, setTargetText] = useState('')
  const [sourceLang, setSourceLang] = useState(DEFAULT_SOURCE)
  const [targetLang, setTargetLang] = useState(DEFAULT_TARGET)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { speak, supported: speechSupported } = useSpeech()
  const sourceClip = useClipboard()
  const targetClip = useClipboard()

  // Guards against out-of-order responses: only the latest request applies.
  const requestId = useRef(0)

  const runTranslation = useCallback(
    async (text: string, source: string, target: string) => {
      const id = ++requestId.current

      if (text.trim() === '') {
        setTargetText('')
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const result = await translateText({ text, source, target })
        if (id === requestId.current) setTargetText(result)
      } catch (err) {
        if (id !== requestId.current) return
        setError(
          err instanceof Error ? err.message : 'Could not translate this text.',
        )
        setTargetText('')
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    [],
  )

  // Debounce each input independently so a swap (which changes several at once)
  // settles to a single consistent translation rather than firing on stale text.
  const debouncedText = useDebounce(sourceText, DEBOUNCE_MS)
  const debouncedSource = useDebounce(sourceLang, DEBOUNCE_MS)
  const debouncedTarget = useDebounce(targetLang, DEBOUNCE_MS)

  useEffect(() => {
    // Synchronizes the output with an external system (the translation API)
    // whenever the debounced inputs change. The setState happens inside the
    // async request, not as a render-cascade, so the rule is safe to relax here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runTranslation(debouncedText, debouncedSource, debouncedTarget)
  }, [debouncedText, debouncedSource, debouncedTarget, runTranslation])

  const handleTranslateClick = () => {
    void runTranslation(sourceText, sourceLang, targetLang)
  }

  const handleSwap = () => {
    setSourceText(targetText)
    setTargetText(sourceText)
    setSourceLang(targetLang)
    setTargetLang(sourceLang === AUTO_CODE ? DEFAULT_SOURCE : sourceLang)
  }

  return (
    <div className="translate-form">
      <TextPanel
        variant="source"
        languageOptions={SOURCE_LANGUAGES}
        languageValue={sourceLang}
        onLanguageChange={setSourceLang}
        inlineCount={SOURCE_LANGUAGES.length - 1}
        tabsAriaLabel="Translate from"
        text={sourceText}
        onTextChange={setSourceText}
        placeholder="Enter text to translate"
        maxChars={MAX_CHARS}
        onSpeak={() => speak(sourceText, sourceLang)}
        onCopy={() => void sourceClip.copy(sourceText)}
        copied={sourceClip.copied}
        speechSupported={speechSupported}
        footerAction={
          <button
            type="button"
            className="translate-form__translate"
            onClick={handleTranslateClick}
            disabled={loading || sourceText.trim() === ''}
          >
            <img src={translateIcon} alt="" aria-hidden="true" />
            {loading ? 'Translating…' : 'Translate'}
          </button>
        }
      />

      <TextPanel
        variant="target"
        languageOptions={TARGET_LANGUAGES}
        languageValue={targetLang}
        onLanguageChange={setTargetLang}
        inlineCount={TARGET_LANGUAGES.length - 1}
        tabsAriaLabel="Translate to"
        text={targetText}
        loading={loading}
        error={error}
        onSpeak={() => speak(targetText, targetLang)}
        onCopy={() => void targetClip.copy(targetText)}
        copied={targetClip.copied}
        speechSupported={speechSupported}
        headerAction={
          <IconButton
            icon={swapIcon}
            label="Switch languages"
            onClick={handleSwap}
          />
        }
      />
    </div>
  )
}
