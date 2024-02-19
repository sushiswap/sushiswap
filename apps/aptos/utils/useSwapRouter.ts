import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useSlippageTolerance } from '@sushiswap/hooks'
import { useQuery } from '@tanstack/react-query'
import { useSwapState } from 'app/swap/trade/TradeProvider'
import { usePools } from 'utils/usePools'
import { useAllCommonPairs } from 'utils/utilFunctions'

type useSwapRouterArgs = {
  balance: number | undefined
}

export function useSwapRouter({ balance }: useSwapRouterArgs) {
  const { amount, token0, token1 } = useSwapState()
  const { account, connected } = useWallet()
  const [slippageTolerance] = useSlippageTolerance()
  const { data: pairs } = usePools(true)
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
        balance,
      },
    ],
    queryFn: async () =>
      useAllCommonPairs(
        parseFloat(
          (Number(amount) * 10 ** token0.decimals) as unknown as string,
        ),
        token0,
        token1,
        pairs,
      ),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    enabled: Boolean(amount && Number(amount) > 0),
  })
}
