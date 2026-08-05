import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('renders an accessible name and a decorative icon', () => {
    render(<IconButton icon="/copy.svg" label="Copy" />)

    const button = screen.getByRole('button', { name: 'Copy' })
    expect(button).toHaveClass('icon-button--bordered')
    const img = button.querySelector('img')
    expect(img).toHaveAttribute('aria-hidden', 'true')
  })

  it('supports the plain variant and extra class names', () => {
    render(
      <IconButton icon="/i.svg" label="Listen" variant="plain" className="x" />,
    )
    const button = screen.getByRole('button', { name: 'Listen' })
    expect(button).toHaveClass('icon-button--plain', 'x')
  })

  it('forwards clicks and the disabled state', async () => {
    const onClick = vi.fn()
    const { rerender } = render(
      <IconButton icon="/i.svg" label="Copy" onClick={onClick} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <IconButton icon="/i.svg" label="Copy" onClick={onClick} disabled />,
    )
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled()
  })
})
