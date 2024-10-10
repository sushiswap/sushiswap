'use client' // Error components must be Client Components

import * as Sentry from '@sentry/nextjs'
import {
  Button,
  Container,
  classNames,
  typographyVariants,
} from '@sushiswap/ui'
import { useEffect } from 'react'

export default function SwapError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Capture the error and send it to Sentry
    Sentry.captureException(error)
  }, [error])
  return (
    <>
      <h1
        className={classNames(
          typographyVariants({ variant: 'h1' }),
          'mx-auto text-center p-4',
        )}
      >
        Something went wrong!
      </h1>
      <Container maxWidth="lg" className="px-4">
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
        </div>
      </Container>
    </>
  )
}
