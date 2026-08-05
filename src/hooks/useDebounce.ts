import { useEffect, useState } from 'react'

/**
 * Returns a copy of `value` that only updates after `delay` ms have passed
 * without a change. Used to throttle real-time translation requests so we
 * don't hit the API on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
