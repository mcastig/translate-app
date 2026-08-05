import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees and reset mocks between tests so state never leaks across cases.
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
