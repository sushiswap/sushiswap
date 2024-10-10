import { useQuery } from '@tanstack/react-query'
import TronWeb from 'tronweb'
import { ROUTER_ABI } from '~tron/_common/constants/abis/router-abi'
import { ROUTER_CONTRACT } from '~tron/_common/constants/contracts'
import {
  getIfWrapOrUnwrap,
  getValidTokenAddress,
} from '~tron/_common/lib/utils/helpers'
import { useSwapState } from '~tron/swap/swap-provider'
import { useTronWeb } from './useTronWeb'

export const useAmountsOut = ({ amountIn }: { amountIn: string }) => {
  const { tronWeb } = useTronWeb()
  const { route, token0, token1 } = useSwapState()

  return useQuery({
    queryKey: ['useAmountsOut', { route, amountIn }],
    queryFn: async () => {
      const swapType = getIfWrapOrUnwrap(token0, token1)
      if (swapType === 'wrap' || swapType === 'unwrap') {
        return [amountIn, amountIn]
      }
      if (!route) return []

      const cleanedAddressRoute = route?.map((i) => getValidTokenAddress(i))
      if (!amountIn || Number.isNaN(Number(amountIn))) return []
      try {
        tronWeb.setAddress(ROUTER_CONTRACT)
        const routerContract = await tronWeb.contract(
          ROUTER_ABI,
          ROUTER_CONTRACT,
        )
        const amountsOuts = await routerContract
          .getAmountsOut(amountIn, cleanedAddressRoute)
          .call()

        return amountsOuts?.amounts?.map((i: typeof TronWeb.BigNumber) =>
          i.toString(),
        ) as string[]
      } catch (error) {
        console.log('useAmountsOut error', error)
        return [amountIn, '0']
      }
    },
    enabled: !!amountIn && !!tronWeb,
  })
}
