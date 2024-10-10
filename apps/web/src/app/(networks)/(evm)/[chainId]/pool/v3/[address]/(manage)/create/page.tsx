import { notFound } from 'next/navigation'
import React from 'react'
import { ConcentratedLiquidityProvider } from 'src/ui/pool/ConcentratedLiquidityProvider'
import { NewPosition } from 'src/ui/pool/NewPosition'
import { type ChainId } from 'sushi'
import { isSushiSwapV3ChainId } from 'sushi/config'
import { isAddress } from 'viem'

export default async function PositionsCreatePage({
  params,
}: { params: { address: string; chainId: string } }) {
  const { chainId: _chainId, address } = params
  const chainId = +_chainId as ChainId

  if (
    !isSushiSwapV3ChainId(chainId) ||
    !isAddress(address, { strict: false })
  ) {
    return notFound()
  }

  return (
    <ConcentratedLiquidityProvider>
      <NewPosition address={address} chainId={chainId} />
    </ConcentratedLiquidityProvider>
  )
}
