'use client'

import { LinkInternal } from '@sushiswap/ui'
import { useSearchParams } from 'next/navigation'
import { PathnameButton } from 'src/ui/pathname-button'

export function NavigationItems() {
  const searchParams = useSearchParams()

  return (
    <>
      <LinkInternal
        shallow={true}
        scroll={false}
        href={`/tron/pool?${searchParams.toString()}`}
      >
        <PathnameButton
          id="my-positions"
          pathname={`/tron/pool`}
          asChild
          size="sm"
        >
          My Positions
        </PathnameButton>
      </LinkInternal>
      {/* <LinkInternal
            shallow={true}
            scroll={false}
            href={`/tron/rewards?${searchParams.toString()}`}
          >
            <PathnameButton
              id="my-rewards"
              pathname={`/tron/rewards`}
              asChild
              size="sm"
            >
              My Rewards
            </PathnameButton>
          </LinkInternal> */}
    </>
  )
}
