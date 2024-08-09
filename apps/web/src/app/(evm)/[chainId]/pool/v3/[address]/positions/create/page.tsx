import { Container, LinkInternal } from '@sushiswap/ui'
import React from 'react'
import { ConcentratedLiquidityProvider } from 'src/ui/pool/ConcentratedLiquidityProvider'
import { NewPosition } from 'src/ui/pool/NewPosition'
import { ChainId } from 'sushi'
import { isSushiSwapV3ChainId } from 'sushi/config'

export default async function PositionsCreatePage({
  params,
}: { params: { address: string; chainId: string } }) {
  const chainId = +params.chainId as ChainId

  if (!isSushiSwapV3ChainId(chainId)) {
    throw new Error('This page only supports SushiSwap V3 pools')
  }

  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4">
      <div className="flex flex-col gap-4">
        <LinkInternal
          href={`/${chainId}/pool/v3/${params.address}/positions`}
          className="text-blue hover:underline text-sm"
        >
          ← Back
        </LinkInternal>
        <ConcentratedLiquidityProvider>
          <NewPosition address={params.address} chainId={chainId} />
        </ConcentratedLiquidityProvider>
      </div>
    </Container>
  )
}
