'use client'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { captureException } from '@sentry/nextjs'
import { Button, LinkInternal, typographyVariants } from '@sushiswap/ui'
import { useEffect } from 'react'

export default function ErrorPage({
  error,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to sentry
    captureException(error)
  }, [error])

  return (
    <div className="flex justify-center items-center pt-20 px-4">
      <div className="flex flex-col gap-8 text-center">
        <h2
          className={typographyVariants({
            variant: 'h1',
            className: 'max-w-lg font-semibold',
          })}
        >
          Something went wrong!
        </h2>
        <div className="flex justify-center gap-8">
          <Button
            variant="link"
            size="xl"
            asChild
            icon={ChevronRightIcon}
            iconPosition="end"
          >
            <LinkInternal href="/swap">Swap any token</LinkInternal>
          </Button>
          <Button
            variant="link"
            size="xl"
            asChild
            icon={ChevronRightIcon}
            iconPosition="end"
          >
            <LinkInternal href="/pool">See a list of our pools</LinkInternal>
          </Button>
        </div>
      </div>
    </div>
  )
}
