import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageTabs } from './LanguageTabs'
import { SOURCE_LANGUAGES, TARGET_LANGUAGES } from '../../constants/languages'

function renderTabs(value = 'en', onChange = vi.fn()) {
  render(
    <LanguageTabs
      options={SOURCE_LANGUAGES}
      value={value}
      onChange={onChange}
      inlineCount={SOURCE_LANGUAGES.length - 1}
      ariaLabel="Translate from"
    />,
  )
  return onChange
}

describe('LanguageTabs', () => {
  it('renders inline tabs and marks the active one', () => {
    renderTabs('en')
    const tab = screen.getByRole('tab', { name: 'English' })
    expect(tab).toHaveAttribute('aria-selected', 'true')
    expect(tab).toHaveClass('language-tabs__tab--active')
  })

  it('calls onChange when an inline tab is clicked', async () => {
    const onChange = renderTabs('en')
    await userEvent.click(screen.getByRole('tab', { name: 'French' }))
    expect(onChange).toHaveBeenCalledWith('fr')
  })

  it('opens the dropdown and selects an overflow language', async () => {
    const onChange = renderTabs('en')

    await userEvent.click(screen.getByRole('button', { name: /Spanish/ }))
    const option = screen.getByRole('option', { name: 'Spanish' })
    await userEvent.click(option)

    expect(onChange).toHaveBeenCalledWith('es')
    // Menu closes after selection.
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('reflects the active overflow language on the trigger', () => {
    renderTabs('es')
    const trigger = screen.getByRole('button', { name: /Spanish/ })
    expect(trigger).toHaveClass('language-tabs__tab--active')
    // Closed by default, so the option is not rendered yet.
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('toggles the dropdown closed when the trigger is clicked again', async () => {
    renderTabs('en')
    const trigger = screen.getByRole('button', { name: /Spanish/ })

    await userEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the dropdown on an outside click', async () => {
    render(
      <div>
        <LanguageTabs
          options={SOURCE_LANGUAGES}
          value="en"
          onChange={vi.fn()}
          inlineCount={SOURCE_LANGUAGES.length - 1}
          ariaLabel="Translate from"
        />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.click(screen.getByRole('button', { name: /Spanish/ }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the dropdown when Escape is pressed', async () => {
    renderTabs('en')
    await userEvent.click(screen.getByRole('button', { name: /Spanish/ }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('keeps the dropdown open for non-Escape keys', async () => {
    renderTabs('en')
    await userEvent.click(screen.getByRole('button', { name: /Spanish/ }))

    await userEvent.keyboard('a')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('renders no dropdown when every option fits inline', () => {
    render(
      <LanguageTabs
        options={TARGET_LANGUAGES}
        value="en"
        onChange={vi.fn()}
        inlineCount={TARGET_LANGUAGES.length}
        ariaLabel="Translate to"
      />,
    )
    expect(
      screen.queryByRole('button', { name: /Spanish/ }),
    ).not.toBeInTheDocument()
  })
})
