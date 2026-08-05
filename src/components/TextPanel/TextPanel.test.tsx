import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextPanel } from './TextPanel'
import { SOURCE_LANGUAGES, TARGET_LANGUAGES } from '../../constants/languages'

const sourceBase = {
  variant: 'source' as const,
  languageOptions: SOURCE_LANGUAGES,
  languageValue: 'en',
  onLanguageChange: vi.fn(),
  inlineCount: SOURCE_LANGUAGES.length - 1,
  tabsAriaLabel: 'Translate from',
  onSpeak: vi.fn(),
  onCopy: vi.fn(),
  copied: false,
  speechSupported: true,
}

const targetBase = {
  variant: 'target' as const,
  languageOptions: TARGET_LANGUAGES,
  languageValue: 'fr',
  onLanguageChange: vi.fn(),
  inlineCount: TARGET_LANGUAGES.length - 1,
  tabsAriaLabel: 'Translate to',
  onSpeak: vi.fn(),
  onCopy: vi.fn(),
  copied: false,
  speechSupported: true,
}

describe('TextPanel (source)', () => {
  it('renders an editable textarea, counter, and footer slot', async () => {
    const onTextChange = vi.fn()
    render(
      <TextPanel
        {...sourceBase}
        text="Hi"
        onTextChange={onTextChange}
        maxChars={500}
        footerAction={<button type="button">Translate</button>}
      />,
    )

    const field = screen.getByRole('textbox', { name: 'Translate from' })
    expect(field).toHaveValue('Hi')
    expect(screen.getByText('2/500')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Translate' }),
    ).toBeInTheDocument()

    await userEvent.type(field, 'x')
    expect(onTextChange).toHaveBeenCalled()
  })

  it('wires the listen and copy buttons', async () => {
    const onSpeak = vi.fn()
    const onCopy = vi.fn()
    render(
      <TextPanel
        {...sourceBase}
        text="Hi"
        onTextChange={vi.fn()}
        onSpeak={onSpeak}
        onCopy={onCopy}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Listen' }))
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(onSpeak).toHaveBeenCalled()
    expect(onCopy).toHaveBeenCalled()
  })

  it('disables listen and copy when there is no text', () => {
    render(<TextPanel {...sourceBase} text="" onTextChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Listen' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled()
  })

  it('disables listen when speech is unsupported', () => {
    render(
      <TextPanel
        {...sourceBase}
        text="Hi"
        onTextChange={vi.fn()}
        speechSupported={false}
      />,
    )
    expect(screen.getByRole('button', { name: 'Listen' })).toBeDisabled()
  })

  it('shows the copied state on the copy button', () => {
    render(
      <TextPanel {...sourceBase} text="Hi" onTextChange={vi.fn()} copied />,
    )
    const copy = screen.getByRole('button', { name: 'Copied' })
    expect(copy).toHaveClass('icon-button--active')
  })
})

describe('TextPanel (target)', () => {
  it('renders read-only output with the translated text', () => {
    render(<TextPanel {...targetBase} text="Bonjour" />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('Bonjour')).toBeInTheDocument()
  })

  it('renders the error message instead of the text', () => {
    render(<TextPanel {...targetBase} text="Bonjour" error="Network error." />)
    const output = screen.getByText('Network error.')
    expect(output).toHaveClass('text-panel__output--error')
    expect(screen.queryByText('Bonjour')).not.toBeInTheDocument()
  })

  it('marks the output busy while loading and omits the counter', () => {
    render(<TextPanel {...targetBase} text="" loading />)
    const output = document.querySelector('.text-panel__output')
    expect(output).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText(/\/500/)).not.toBeInTheDocument()
  })

  it('renders a header action slot such as the swap button', () => {
    render(
      <TextPanel
        {...targetBase}
        text="Bonjour"
        headerAction={<button type="button">Switch</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Switch' })).toBeInTheDocument()
  })
})
