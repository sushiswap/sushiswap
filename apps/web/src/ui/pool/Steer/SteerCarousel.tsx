'use client'

import { V3Pool, VaultV1 } from '@sushiswap/graph-client/data-api'
import { Carousel, SkeletonBox } from '@sushiswap/ui'
import { FC, useCallback, useMemo } from 'react'
import { SteerPoolCard } from './SteerPoolCard'

interface SteerCarousel {
  pool: V3Pool
  vaults: VaultV1[]
}

export const SteerCarousel: FC<SteerCarousel> = ({ pool, vaults }) => {
  const enabledVaults = useMemo(
    () => vaults.filter((vault) => vault.isEnabled),
    [vaults],
  )
  const render = useCallback(
    (vault: VaultV1) => {
      return (
        <div className="w-[400px]">
          <SteerPoolCard key={vault.id} pool={pool} vault={vault} />
        </div>
      )
    },
    [pool],
  )

  return enabledVaults?.length > 0 ? (
    <Carousel
      containerWidth={1700}
      slides={enabledVaults}
      render={render}
      className="mt-0 pt-0"
    />
  ) : (
    <div className="text-center">No smart pools found.</div>
  )
}

export const SteerCarouselLoading: FC = () => {
  const slides = useMemo(() => [1, 2, 3], [])
  const render = useCallback(() => {
    return (
      <div className="w-[400px]">
        <SkeletonBox className="h-[651px] w-[400px]" />
      </div>
    )
  }, [])

  return (
    <Carousel
      containerWidth={1700}
      slides={slides}
      render={render}
      className="px-2 mt-0 pt-0"
    />
  )
}
