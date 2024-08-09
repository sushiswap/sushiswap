import '@sushiswap/database'
import { getV3Pool } from '@sushiswap/graph-client/data-api'
import { useQuery } from '@tanstack/react-query'
import { ChainId } from 'sushi/chain'
import { Amount, Token } from 'sushi/currency'
import { parseUnits } from 'viem'

interface UseConcentratedLiquidityPoolStats {
  chainId: ChainId | undefined
  address: string | undefined
  enabled?: boolean
}

export const useConcentratedLiquidityPoolStats = ({
  chainId,
  address,
  enabled = true,
}: UseConcentratedLiquidityPoolStats) => {
  return useQuery({
    queryKey: ['useConcentratedLiquidityPoolStats'],
    queryFn: async () => {
      if (!chainId || !address) return undefined

      const data = await getV3Pool({ chainId: Number(chainId), address })
      if (data) {
        return {
          ...data,
          token0: new Token({
            chainId: data.chainId,
            address: data.token0.address,
            decimals: data.token0.decimals,
            name: data.token0.name,
            symbol: data.token0.symbol,
          }),
          token1: new Token({
            chainId: data.chainId,
            address: data.token1.address,
            decimals: data.token1.decimals,
            name: data.token1.name,
            symbol: data.token1.symbol,
          }),
          feeAmount: data.swapFee * 1000000,
          incentives: data.incentives.map((incentive) => {
            const rewardToken = new Token({
              chainId: incentive.chainId,
              address: incentive.rewardToken.address,
              decimals: incentive.rewardToken.decimals,
              name: incentive.rewardToken.name,
              symbol: incentive.rewardToken.symbol,
            })

            return {
              ...incentive,
              reward: Amount.fromRawAmount(
                rewardToken,
                parseUnits(
                  incentive.rewardPerDay.toString(),
                  incentive.rewardToken.decimals,
                ),
              ),
            }
          }),
        }
      }

      return null
    },
    refetchInterval: 10000,
    enabled: Boolean(enabled && address),
  })
}
