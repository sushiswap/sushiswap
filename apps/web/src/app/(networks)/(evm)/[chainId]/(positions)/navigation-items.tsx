'use client'

import { LinkInternal } from '@sushiswap/ui'
import { useSearchParams } from 'next/navigation'
import { PathnameButton } from 'src/ui/pathname-button'
import { ChainKey } from 'sushi/chain'
import { chainId } from 'test/constants'

export function NavigationItems() {
  const searchParams = useSearchParams()

  return (
    <>
      <LinkInternal
        shallow={true}
        scroll={false}
        href={`/${ChainKey[chainId]}/pool?${searchParams.toString()}`}
      >
        <PathnameButton
          id="my-positions"
          pathname={`/${ChainKey[chainId]}/pool`}
          asChild
          size="sm"
        >
          My Positions
        </PathnameButton>
      </LinkInternal>
      <LinkInternal
        shallow={true}
        scroll={false}
        href={`/${ChainKey[chainId]}/rewards?${searchParams.toString()}`}
      >
        <PathnameButton
          id="my-rewards"
          pathname={`/${ChainKey[chainId]}/rewards`}
          asChild
          size="sm"
        >
          My Rewards
        </PathnameButton>
      </LinkInternal>
      <LinkInternal
        shallow={true}
        scroll={false}
        href={`/${ChainKey[chainId]}/migrate?${searchParams.toString()}`}
      >
        <PathnameButton
          id="migrate"
          pathname={`/${ChainKey[chainId]}/migrate`}
          asChild
          size="sm"
        >
          Migrate
        </PathnameButton>
      </LinkInternal>
    </>
  )
}
