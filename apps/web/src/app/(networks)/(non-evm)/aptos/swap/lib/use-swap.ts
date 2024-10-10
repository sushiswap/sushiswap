import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useSlippageTolerance } from '@sushiswap/hooks'
import { useQuery } from '@tanstack/react-query'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { usePools } from '~aptos/pool/lib/use-pools'
import { getSwapRoute } from '~aptos/swap/lib/swap-get-route'
import { useSimpleSwapState } from '~aptos/swap/ui/simple/simple-swap-provider/simple-swap-provider'

export function useSwap() {
  const { amount, token0, token1 } = useSimpleSwapState()
  const { account, connected } = useWallet()
  const { network } = useNetwork()
  const [slippageTolerance] = useSlippageTolerance()
  const { data: pools } = usePools()

  return useQuery({
    queryKey: [
      'router',
      {
        amount,
        token0,
        token1,
        account,
        connected,
        slippageTolerance,
        network,
      },
    ],
    queryFn: async () => {
      if (!pools) {
        throw new Error('No pairs found')
      }

      return getSwapRoute({
        amountIn: Number(amount) * 10 ** token0.decimals,
        tokenIn: token0,
        tokenOut: token1,
        pools,
        network,
      })
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 60000,
    enabled: Boolean(amount && Number(amount) > 0 && pools),
  })
}
