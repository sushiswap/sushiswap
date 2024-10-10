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
        href={`/aptos/pool?${searchParams.toString()}`}
      >
        <PathnameButton
          id="my-positions"
          pathname={'/aptos/pool'}
          asChild
          size="sm"
        >
          My Positions
        </PathnameButton>
      </LinkInternal>
      {/*<LinkInternal*/}
      {/*  shallow={true}*/}
      {/*  scroll={false}*/}
      {/*  href={`/pool/my-rewards?${searchParams.toString()}`}*/}
      {/*>*/}
      <PathnameButton
        disabled
        id="my-rewards"
        pathname={'/aptos/pool/my-rewards'}
        size="sm"
      >
        My Rewards
      </PathnameButton>
      {/*</LinkInternal>*/}
    </>
  )
}
