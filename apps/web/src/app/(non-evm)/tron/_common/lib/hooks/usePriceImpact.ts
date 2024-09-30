import { useQuery } from '@tanstack/react-query'
import { parseUnits, toBigNumber } from '~tron/_common/lib/utils/formatters'
import {
  getValidTokenAddress,
  isAddress,
} from '~tron/_common/lib/utils/helpers'
import { IReserves, IToken } from '~tron/_common/types/token-type'
import { useTronWeb } from './useTronWeb'

const calculatePriceImpact = ({
  initialReserve0,
  initialReserve1,
  tokenAmount0,
}: {
  initialReserve0: any
  initialReserve1: any
  tokenAmount0: any
}): number => {
  const k = initialReserve0.times(initialReserve1) // Constant product
  const newReserveX = initialReserve0.plus(tokenAmount0) // Updated reserve of token X
  const newReserveY = k.div(newReserveX) // Updated reserve of token Y using constant product formula
  const receivedTokenY = initialReserve1.minus(newReserveY) // Amount of token Y received
  const priceImpact = receivedTokenY.div(newReserveY).times(toBigNumber(100)) // Price impact percentage
  return Number(priceImpact)
}
export const usePriceImpact = ({
  amount,
  token,
  reserves,
}: {
  amount: string
  token: IToken
  reserves: IReserves[] | undefined
}) => {
  const { tronWeb } = useTronWeb()

  return useQuery({
    queryKey: ['usePriceImpact', { reserves, token, amount }],
    queryFn: async () => {
      if (!reserves || !token || !amount) return 0

      const reserve0 = reserves?.find(
        (reserve) =>
          getValidTokenAddress(reserve.address as string) ===
          getValidTokenAddress(token.address),
      )
      const reserve1 = reserves?.find(
        (reserve) =>
          getValidTokenAddress(reserve.address as string) !==
          getValidTokenAddress(token.address),
      )
      if (!reserve0 || !reserve1) return 0

      const priceImpactPercentage = calculatePriceImpact({
        initialReserve0: toBigNumber(reserve0.reserve ?? ''),
        initialReserve1: toBigNumber(reserve1.reserve ?? ''),
        tokenAmount0: toBigNumber(Number(parseUnits(amount, token.decimals))),
      })

      return priceImpactPercentage
    },
    enabled:
      !!amount &&
      !!token &&
      !!reserves?.[0]?.address &&
      !!reserves?.[1]?.address &&
      isAddress(getValidTokenAddress(token?.address)) &&
      isAddress(getValidTokenAddress(reserves?.[0]?.address)) &&
      isAddress(getValidTokenAddress(reserves?.[1]?.address)) &&
      !!tronWeb,
  })
}
