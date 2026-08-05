import type { ReactNode } from 'react'
import { useId } from 'react'
import type { Language } from '../../constants/languages'
import { LanguageTabs } from '../LanguageTabs/LanguageTabs'
import { IconButton } from '../IconButton/IconButton'
import soundIcon from '../../assets/icons/sound.svg'
import copyIcon from '../../assets/icons/copy.svg'
import './TextPanel.css'

interface TextPanelProps {
  variant: 'source' | 'target'
  /** Language selector configuration. */
  languageOptions: Language[]
  languageValue: string
  onLanguageChange: (code: string) => void
  inlineCount: number
  tabsAriaLabel: string
  /** Text content: editable for the source, read-only for the target. */
  text: string
  onTextChange?: (value: string) => void
  placeholder?: string
  maxChars?: number
  /** Target-only states. */
  loading?: boolean
  error?: string | null
  /** Listen / copy wiring. */
  onSpeak: () => void
  onCopy: () => void
  copied: boolean
  speechSupported: boolean
  /** Optional slot in the header (e.g. the swap button) and footer (Translate). */
  headerAction?: ReactNode
  footerAction?: ReactNode
}

/**
 * One side of the translator. Renders the language tabs, the text area (or
 * read-only output), the character counter, and the listen/copy controls. The
 * source and target panels share this chrome and differ only through props.
 */
export function TextPanel({
  variant,
  languageOptions,
  languageValue,
  onLanguageChange,
  inlineCount,
  tabsAriaLabel,
  text,
  onTextChange,
  placeholder,
  maxChars,
  loading = false,
  error = null,
  onSpeak,
  onCopy,
  copied,
  speechSupported,
  headerAction,
  footerAction,
}: TextPanelProps) {
  const fieldId = useId()
  const isEditable = typeof onTextChange === 'function'
  const hasText = text.trim() !== ''

  return (
    <section className={`text-panel text-panel--${variant}`}>
      <div className="text-panel__header">
        <LanguageTabs
          options={languageOptions}
          value={languageValue}
          onChange={onLanguageChange}
          inlineCount={inlineCount}
          ariaLabel={tabsAriaLabel}
        />
        {headerAction}
      </div>

      <hr className="text-panel__divider" />

      <div className="text-panel__body">
        {isEditable ? (
          <textarea
            id={fieldId}
            className="text-panel__input"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            maxLength={maxChars}
            placeholder={placeholder}
            aria-label={tabsAriaLabel}
            spellCheck={false}
          />
        ) : (
          <output
            className={`text-panel__output${
              error ? ' text-panel__output--error' : ''
            }`}
            aria-live="polite"
            aria-busy={loading}
          >
            {error ? error : text}
          </output>
        )}

        {maxChars !== undefined && (
          <p className="text-panel__counter" aria-hidden="true">
            {text.length}/{maxChars}
          </p>
        )}
      </div>

      <div className="text-panel__footer">
        <div className="text-panel__actions">
          <IconButton
            icon={soundIcon}
            label="Listen"
            onClick={onSpeak}
            disabled={!speechSupported || !hasText}
          />
          <IconButton
            icon={copyIcon}
            label={copied ? 'Copied' : 'Copy'}
            onClick={onCopy}
            disabled={!hasText}
            className={copied ? 'icon-button--active' : ''}
          />
        </div>
        {footerAction}
      </div>
    </section>
  )
}
