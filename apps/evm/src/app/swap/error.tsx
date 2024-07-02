'use client' // Error components must be Client Components

import { captureException } from '@sentry/nextjs'

import { useLogger } from 'next-axiom'
import { useEffect } from 'react'

export default function SwapError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  const log = useLogger()

  useEffect(() => {
    // Capture the error and send it to Sentry
    captureException(error)
  }, [error])

  useEffect(() => {
    // Log the error to an error reporting service
    log.error('swap page error', error)
  }, [log, error])
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        type="button"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  )
}
