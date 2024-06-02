import { UseTradeReturn } from '@sushiswap/react-query'
import {
  SimulateContractErrorType,
  useSimulateContract,
} from '@sushiswap/wagmi'
import { useMemo } from 'react'
import { useDerivedStateSimpleSwap } from 'src/ui/swap/simple/derivedstate-simple-swap-provider'
import { routeProcessor4Abi } from 'sushi/abi'
import {
  ROUTE_PROCESSOR_4_ADDRESS,
  isRouteProcessor4ChainId,
} from 'sushi/config'
import { BaseError } from 'viem'
import { getTokenTax } from '../swap/getTokenTax'

const isMinOutError = (error: SimulateContractErrorType | null) =>
  error instanceof BaseError &&
  (error.message.includes('MinimalOutputBalanceViolation') ||
    error.message.includes('0x963b34a5'))

export function useSimulateTrade({
  trade,
  enabled = true,
}: {
  trade: UseTradeReturn | undefined
  enabled?: boolean
}) {
  const {
    state: { chainId },
    mutate: { setTokenTax },
  } = useDerivedStateSimpleSwap()

  const simulateTrade = useSimulateContract({
    chainId: chainId,
    address: isRouteProcessor4ChainId(chainId)
      ? ROUTE_PROCESSOR_4_ADDRESS[chainId]
      : undefined,
    abi: routeProcessor4Abi,
    functionName: trade?.functionName,
    args: trade?.writeArgs as any,
    value: trade?.value || 0n,
    gasPrice: trade?.gasPrice,
    query: {
      retry: (i, error) => {
        if (
          trade &&
          typeof trade.tokenTax === 'undefined' &&
          isMinOutError(error)
        )
          return false
        return i < 3
      },
      enabled:
        enabled &&
        Boolean(
          trade?.writeArgs &&
            isRouteProcessor4ChainId(chainId) &&
            trade?.route?.status !== 'NoWay',
        ),
      onError: (error: SimulateContractErrorType) => {
        if (isMinOutError(error)) {
          if (trade?.amountOut && typeof trade.tokenTax === 'undefined') {
            const _tokenTax = getTokenTax({
              error,
              expectedAmountOut: trade.amountOut,
            })

            setTokenTax(_tokenTax)
          } else if (trade && trade.tokenTax !== false) {
            setTokenTax(false)
          }
        }
      },
      onSuccess: () => {
        if (trade && typeof trade.tokenTax === 'undefined') {
          setTokenTax(false)
        }
      },
    },
  })

  return useMemo(
    () => ({
      ...simulateTrade,
      isError:
        trade &&
        typeof trade.tokenTax === 'undefined' &&
        isMinOutError(simulateTrade.error)
          ? false
          : simulateTrade.isError,
      error:
        trade &&
        typeof trade.tokenTax === 'undefined' &&
        isMinOutError(simulateTrade.error)
          ? null
          : simulateTrade.error,
    }),
    [simulateTrade, trade],
  )
}
