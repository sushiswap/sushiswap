'use client'

import { Container } from '@sushiswap/ui'
import { useEffect } from 'react'
import { useTokenInfo } from '~tron/_common/lib/hooks/useTokenInfo'
import { isAddress } from '~tron/_common/lib/utils/helpers'
import { Manage } from '~tron/_common/ui/Pools/Manage/Manage'
import { PoolLiquidity } from '~tron/_common/ui/Pools/PoolDetails/PoolLiquidity'
import { PoolPosition } from '~tron/_common/ui/Pools/PoolPosition/PoolPosition'
import { PoolRewards } from '~tron/_common/ui/Pools/PoolRewards/PoolRewards'
import { usePoolDispatch } from '~tron/_common/ui/Pools/pool-provider'

export default function PoolByIdPage({
  params,
}: { params: { address: string } }) {
  const decodedPoolId = decodeURIComponent(params.address).split(':')
  const token0 = decodedPoolId[0]
  const token1 = decodedPoolId[1]
  const pairAddress = decodedPoolId[2]
  const { data: token0Data, isLoading: isLoadingToken0 } = useTokenInfo({
    tokenAddress: token0,
  })

  const { data: token1Data, isLoading: isLoadingToken1 } = useTokenInfo({
    tokenAddress: token1,
  })
  const isLoadingTokens = isLoadingToken0 || isLoadingToken1
  const { setToken0, setToken1, setPairAddress } = usePoolDispatch()

  useEffect(() => {
    if (pairAddress && isAddress(pairAddress)) {
      setPairAddress(pairAddress)
    }
  }, [pairAddress, setPairAddress])

  useEffect(() => {
    if (token0Data) {
      setToken0(token0Data)
    }
    if (token1Data) {
      setToken1(token1Data)
    }
  }, [token0Data, token1Data, setToken0, setToken1])

  return (
    <Container maxWidth="5xl" className="px-2 sm:px-4">
      <div className="grid grid-cols-1 md:grid-cols-[auto_400px] gap-6">
        <div className="flex flex-col gap-6">
          <Manage />
          <PoolLiquidity
            pairAddress={pairAddress}
            token0={token0Data}
            token1={token1Data}
            isLoading={isLoadingTokens}
          />
        </div>
        <div className="flex flex-col gap-6">
          <PoolPosition
            token0={token0Data}
            token1={token1Data}
            isLoading={isLoadingTokens}
          />
          <PoolRewards />
        </div>
      </div>
    </Container>
  )
}
