import type { ButtonHTMLAttributes } from 'react'
import './IconButton.css'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Source path of the icon to render. */
  icon: string
  /** Accessible name — icon buttons have no visible text. */
  label: string
  /** Visual emphasis: a bordered control or a borderless glyph. */
  variant?: 'bordered' | 'plain'
}

/**
 * Accessible square button wrapping a single SVG icon. The icon is decorative;
 * the button is named via `aria-label`.
 */
export function IconButton({
  icon,
  label,
  variant = 'bordered',
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`icon-button icon-button--${variant} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      <img src={icon} alt="" aria-hidden="true" className="icon-button__icon" />
    </button>
  )
}
