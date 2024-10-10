'use client'

import { useRouter } from 'next/navigation'
import React, { FC, useMemo, useState } from 'react'
import { useTokenAmountDollarValues } from 'src/lib/hooks'
import { useConcentratedPositionInfo } from 'src/lib/wagmi/hooks/positions/hooks/useConcentratedPositionInfo'
import { ConcentratedLiquidityProvider } from 'src/ui/pool/ConcentratedLiquidityProvider'
import {
  ConcentratedLiquidityURLStateProvider,
  useConcentratedLiquidityURLState,
} from 'src/ui/pool/ConcentratedLiquidityURLStateProvider'
import { ConcentratedLiquidityWidget } from 'src/ui/pool/ConcentratedLiquidityWidget'
import { SelectFeeConcentratedWidget } from 'src/ui/pool/SelectFeeConcentratedWidget'
import { SelectNetworkWidget } from 'src/ui/pool/SelectNetworkWidget'
import { SelectPricesWidget } from 'src/ui/pool/SelectPricesWidget'
import { SelectTokensWidget } from 'src/ui/pool/SelectTokensWidget'
import { ChainKey, computeSushiSwapV3PoolAddress } from 'sushi'
import {
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SUSHISWAP_V3_SUPPORTED_CHAIN_IDS,
  SushiSwapV3ChainId,
  isWNativeSupported,
} from 'sushi/config'
import { tryParseAmount } from 'sushi/currency'
import { SWRConfig } from 'swr'
import { useAccount } from 'wagmi'

export default function Page({ params }: { params: { chainId: string } }) {
  return (
    <ConcentratedLiquidityURLStateProvider
      chainId={+params.chainId as SushiSwapV3ChainId}
    >
      <SWRConfig>
        <ConcentratedLiquidityProvider>
          <_Add />
        </ConcentratedLiquidityProvider>
      </SWRConfig>
    </ConcentratedLiquidityURLStateProvider>
  )
}

const _Add: FC = () => {
  const { address } = useAccount()
  const {
    chainId,
    token0,
    token1,
    setToken1,
    setToken0,
    feeAmount,
    setFeeAmount,
    tokensLoading,
    tokenId,
    switchTokens,
  } = useConcentratedLiquidityURLState()

  const router = useRouter()

  const [_invert, _setInvert] = useState(false)
  const { data: position } = useConcentratedPositionInfo({
    chainId,
    token0,
    tokenId,
    token1,
  })

  const poolAddress = useMemo(
    () =>
      token0 && token1 && feeAmount && chainId
        ? computeSushiSwapV3PoolAddress({
            factoryAddress: SUSHISWAP_V3_FACTORY_ADDRESS[chainId],
            tokenA: token0.wrapped,
            tokenB: token1.wrapped,
            fee: feeAmount,
          })
        : undefined,
    [chainId, feeAmount, token0, token1],
  )

  const fiatAmounts = useMemo(
    () => [tryParseAmount('1', token0), tryParseAmount('1', token1)],
    [token0, token1],
  )
  const _fiatAmountsAsNumber = useTokenAmountDollarValues({
    chainId,
    amounts: fiatAmounts,
  })

  return (
    <>
      <SelectNetworkWidget
        selectedNetwork={chainId}
        onSelect={(chainId) => router.push(`/${ChainKey[chainId]}/pool/v3/add`)}
        networks={SUSHISWAP_V3_SUPPORTED_CHAIN_IDS}
      />
      <SelectTokensWidget
        chainId={chainId}
        token0={token0}
        token1={token1}
        setToken0={setToken0}
        setToken1={setToken1}
        includeNative={isWNativeSupported(chainId)}
      />
      <SelectFeeConcentratedWidget
        feeAmount={feeAmount}
        setFeeAmount={setFeeAmount}
        token1={token1}
        token0={token0}
      />
      <SelectPricesWidget
        chainId={chainId}
        token0={token0}
        token1={token1}
        poolAddress={poolAddress}
        tokenId={tokenId}
        feeAmount={feeAmount}
        switchTokens={switchTokens}
      />
      <ConcentratedLiquidityWidget
        chainId={chainId}
        account={address}
        token0={token0}
        token1={token1}
        setToken0={setToken0}
        setToken1={setToken1}
        feeAmount={feeAmount}
        tokensLoading={tokensLoading}
        existingPosition={position ?? undefined}
        tokenId={tokenId}
        successLink={`/${ChainKey[chainId]}/pools/v3/${poolAddress}/${tokenId}`}
      />
    </>
  )
}
