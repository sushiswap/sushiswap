'use client'

import {
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  Container,
} from '@sushiswap/ui'
import React, { FC } from 'react'
import { SushiSwapV2ChainId, isSushiSwapV3ChainId } from 'sushi/config'

import { useIsMounted } from '@sushiswap/hooks'
import { ConnectButton } from 'src/lib/wagmi/components/connect-button'
import { useAccount } from 'wagmi'
import { useSidebar } from '../sidebar'
import { PositionCard, PositionCardSkeleton } from './PositionCard'
import { PositionCardList } from './PositionCardList'

const MigrateTabContentPositions: FC<{ chainId: SushiSwapV2ChainId }> = ({
  chainId,
}) => {
  const { isConnected } = useAccount()

  const { isOpen: isSidebarOpen } = useSidebar()

  if (!isConnected) {
    return (
      <Container maxWidth="7xl" className="px-4">
        <ConnectButton />
      </Container>
    )
  }

  return (
    <PositionCardList chainId={chainId}>
      {({ positions, isLoading }) => {
        if (!isLoading && positions.length === 0) {
          return (
            <Container maxWidth="7xl" className="px-4">
              <span className="text-sm text-muted-foreground">
                No positions found for migration.
              </span>
            </Container>
          )
        }

        return !isLoading ? (
          <Carousel
            slideWidth={320}
            slides={positions.filter((position) =>
              isSushiSwapV3ChainId(position?.pool.chainId),
            )}
            render={(position) => <PositionCard position={position} />}
            containerWidth={isSidebarOpen ? 1504 : 1280}
            className="px-4"
          />
        ) : (
          <Container maxWidth="7xl" className="pt-4 px-4 pb-10 mx-auto">
            <PositionCardSkeleton />
          </Container>
        )
      }}
    </PositionCardList>
  )
}

export const MigrateTabContent: FC<{ chainId: SushiSwapV2ChainId }> = ({
  chainId,
}) => {
  const isMounted = useIsMounted()

  return (
    <div className="mb-40">
      <Container maxWidth="7xl" className="px-4 mx-auto">
        <CardHeader className="!px-0">
          <CardTitle>Migrate.</CardTitle>
          <CardDescription>
            By migrating your liquidity positions,
            <br />
            you will benefit from increased capital efficiency.
          </CardDescription>
        </CardHeader>
      </Container>
      {isMounted ? <MigrateTabContentPositions chainId={chainId} /> : null}
    </div>
  )
}
