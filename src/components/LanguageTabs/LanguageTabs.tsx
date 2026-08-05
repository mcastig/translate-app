import { useEffect, useRef, useState } from 'react'
import type { Language } from '../../constants/languages'
import expandIcon from '../../assets/icons/expand-down.svg'
import './LanguageTabs.css'

interface LanguageTabsProps {
  options: Language[]
  /** Currently selected language code. */
  value: string
  onChange: (code: string) => void
  /** How many options render as inline tabs; the rest go in the dropdown. */
  inlineCount: number
  /** Accessible name for the tab group. */
  ariaLabel: string
}

/**
 * Language selector matching the design: the first `inlineCount` options are
 * shown as a row of tabs, and any overflow lives behind a dropdown. The
 * dropdown button reflects the active overflow language, or the first overflow
 * option when an inline tab is selected.
 */
export function LanguageTabs({
  options,
  value,
  onChange,
  inlineCount,
  ariaLabel,
}: LanguageTabsProps) {
  const inline = options.slice(0, inlineCount)
  const overflow = options.slice(inlineCount)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const activeOverflow = overflow.find((lang) => lang.code === value)
  const dropdownLabel = (activeOverflow ?? overflow[0])?.label

  const select = (code: string) => {
    onChange(code)
    setOpen(false)
  }

  return (
    <div className="language-tabs" role="tablist" aria-label={ariaLabel}>
      {inline.map((lang) => (
        <button
          key={lang.code}
          type="button"
          role="tab"
          aria-selected={value === lang.code}
          className={`language-tabs__tab${
            value === lang.code ? ' language-tabs__tab--active' : ''
          }`}
          onClick={() => onChange(lang.code)}
        >
          {lang.label}
        </button>
      ))}

      {overflow.length > 0 && (
        <div className="language-tabs__dropdown" ref={containerRef}>
          <button
            type="button"
            className={`language-tabs__tab language-tabs__trigger${
              activeOverflow ? ' language-tabs__tab--active' : ''
            }`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            {dropdownLabel}
            <img
              src={expandIcon}
              alt=""
              aria-hidden="true"
              className="language-tabs__chevron"
            />
          </button>

          {open && (
            <ul className="language-tabs__menu" role="listbox">
              {overflow.map((lang) => (
                <li key={lang.code} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === lang.code}
                    className="language-tabs__option"
                    onClick={() => select(lang.code)}
                  >
                    {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
