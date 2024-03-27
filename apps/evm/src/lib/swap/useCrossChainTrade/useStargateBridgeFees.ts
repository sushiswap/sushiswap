import {
  useBlockNumber,
  useReadContract,
  useReadContracts,
} from '@sushiswap/wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { stargateFeeLibraryV03Abi, stargatePoolAbi } from 'sushi/abi'
import {
  STARGATE_ADAPTER_ADDRESS,
  STARGATE_CHAIN_ID,
  STARGATE_ETH_ADDRESS,
  STARGATE_POOL_ADDRESS,
  STARGATE_POOL_ID,
  StargateAdapterChainId,
  StargateChainId,
} from 'sushi/config'
import { Amount, Currency } from 'sushi/currency'
import { Address, zeroAddress } from 'viem'

interface UseStargateBridgeFees {
  amount?: Amount<Currency>
  srcChainId: StargateAdapterChainId
  srcBridgeToken?: Currency
  dstChainId: StargateAdapterChainId
  dstBridgeToken?: Currency
  enabled: boolean
}

const useStargatePool = ({
  srcChainId,
  srcBridgeToken,
  dstChainId,
  dstBridgeToken,
  enabled = false,
}: UseStargateBridgeFees) => {
  const queryClient = useQueryClient()
  const query = useReadContracts({
    contracts: useMemo(
      () =>
        !srcBridgeToken || !dstBridgeToken
          ? undefined
          : ([
              {
                address: STARGATE_POOL_ADDRESS[srcChainId][
                  srcBridgeToken.isNative
                    ? STARGATE_ETH_ADDRESS[
                        srcChainId as keyof typeof STARGATE_ETH_ADDRESS
                      ]
                    : srcBridgeToken.address
                ] as Address,
                functionName: 'getChainPath',
                args: [
                  STARGATE_CHAIN_ID[dstChainId as StargateChainId],
                  BigInt(
                    STARGATE_POOL_ID[dstChainId][
                      dstBridgeToken.isNative
                        ? STARGATE_ETH_ADDRESS[
                            dstChainId as keyof typeof STARGATE_ETH_ADDRESS
                          ]
                        : dstBridgeToken.address
                    ] ?? 0,
                  ),
                ],
                abi: stargatePoolAbi,
                chainId: srcChainId,
              },
              {
                address: STARGATE_POOL_ADDRESS[srcChainId][
                  srcBridgeToken.isNative
                    ? STARGATE_ETH_ADDRESS[
                        srcChainId as keyof typeof STARGATE_ETH_ADDRESS
                      ]
                    : srcBridgeToken.address
                ] as Address,
                functionName: 'feeLibrary',
                abi: stargatePoolAbi,
                chainId: srcChainId,
              },
              {
                address: STARGATE_POOL_ADDRESS[srcChainId][
                  srcBridgeToken.isNative
                    ? STARGATE_ETH_ADDRESS[
                        srcChainId as keyof typeof STARGATE_ETH_ADDRESS
                      ]
                    : srcBridgeToken.address
                ] as Address,
                functionName: 'sharedDecimals',
                abi: stargatePoolAbi,
                chainId: srcChainId,
              },
            ] as const),
      [srcChainId, srcBridgeToken, dstChainId, dstBridgeToken],
    ),
    query: { enabled: Boolean(enabled && srcBridgeToken && dstBridgeToken) },
  })

  const { data: blockNumber } = useBlockNumber({
    chainId: srcChainId,
    watch: true,
  })

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries(
        query.queryKey,
        {},
        { cancelRefetch: false },
      )
    }
  }, [blockNumber, query.queryKey, queryClient])

  return query
}

export const useStargateBridgeFees = ({
  amount,
  srcChainId,
  srcBridgeToken,
  dstChainId,
  dstBridgeToken,
  enabled = false,
}: UseStargateBridgeFees) => {
  const { data: stargatePoolResults } = useStargatePool({
    srcChainId,
    srcBridgeToken,
    dstChainId,
    dstBridgeToken,
    enabled,
  })

  const adjusted = useMemo(() => {
    if (!amount || !stargatePoolResults?.[2]?.result) return undefined
    const localDecimals = BigInt(amount.currency.decimals)
    const sharedDecimals = stargatePoolResults[2].result
    if (localDecimals === sharedDecimals) return amount
    return localDecimals > sharedDecimals
      ? amount.asFraction.divide(10n ** (localDecimals - sharedDecimals))
      : amount.asFraction.multiply(10n ** (sharedDecimals - localDecimals))
  }, [amount, stargatePoolResults])

  const queryClient = useQueryClient()
  const query = useReadContract({
    address: stargatePoolResults?.[1]?.result ?? zeroAddress,
    functionName: 'getFees',
    args: useMemo(
      () =>
        !srcBridgeToken || !dstBridgeToken
          ? undefined
          : [
              BigInt(
                STARGATE_POOL_ID[srcChainId][
                  srcBridgeToken.isNative
                    ? STARGATE_ETH_ADDRESS[
                        srcChainId as keyof typeof STARGATE_ETH_ADDRESS
                      ]
                    : srcBridgeToken.address
                ] ?? 0,
              ),
              BigInt(
                STARGATE_POOL_ID[dstChainId][
                  dstBridgeToken.isNative
                    ? STARGATE_ETH_ADDRESS[
                        dstChainId as keyof typeof STARGATE_ETH_ADDRESS
                      ]
                    : dstBridgeToken.address
                ] ?? 0,
              ),
              STARGATE_CHAIN_ID[dstChainId as StargateChainId],
              STARGATE_ADAPTER_ADDRESS[srcChainId] as Address,
              BigInt(adjusted?.quotient ?? 0),
            ],
      [srcChainId, srcBridgeToken, dstChainId, dstBridgeToken, adjusted],
    ) as [bigint, bigint, number, `0x${string}`, bigint] | undefined,
    abi: stargateFeeLibraryV03Abi,
    chainId: srcChainId,
    query: {
      enabled: Boolean(
        enabled &&
          adjusted &&
          srcBridgeToken &&
          dstBridgeToken &&
          stargatePoolResults?.[1]?.result &&
          stargatePoolResults?.[2]?.result,
      ),
      select(getFeesResults) {
        if (
          !amount ||
          !getFeesResults ||
          !stargatePoolResults?.[1]?.result ||
          !stargatePoolResults?.[2]?.result ||
          !srcBridgeToken ||
          !dstBridgeToken
        ) {
          return undefined
        }

        const localDecimals = BigInt(amount.currency.decimals)
        const sharedDecimals = stargatePoolResults[2].result

        const { eqFee, eqReward, lpFee, protocolFee } = getFeesResults

        if (localDecimals === sharedDecimals)
          return [
            Amount.fromRawAmount(srcBridgeToken, eqFee),
            Amount.fromRawAmount(srcBridgeToken, eqReward),
            Amount.fromRawAmount(srcBridgeToken, lpFee),
            Amount.fromRawAmount(srcBridgeToken, protocolFee),
          ]

        const _eqFee =
          localDecimals > sharedDecimals
            ? eqFee * 10n ** (localDecimals - sharedDecimals)
            : eqFee / 10n ** (sharedDecimals - localDecimals)

        const _eqReward =
          localDecimals > sharedDecimals
            ? eqReward * 10n ** (localDecimals - sharedDecimals)
            : eqReward / 10n ** (sharedDecimals - localDecimals)

        const _lpFee =
          localDecimals > sharedDecimals
            ? lpFee * 10n ** (localDecimals - sharedDecimals)
            : lpFee / 10n ** (sharedDecimals - localDecimals)

        const _protocolFee =
          localDecimals > sharedDecimals
            ? protocolFee * 10n ** (localDecimals - sharedDecimals)
            : protocolFee / 10n ** (sharedDecimals - localDecimals)

        return [
          Amount.fromRawAmount(srcBridgeToken, _eqFee),
          Amount.fromRawAmount(srcBridgeToken, _eqReward),
          Amount.fromRawAmount(srcBridgeToken, _lpFee),
          Amount.fromRawAmount(srcBridgeToken, _protocolFee),
        ]
      },
    },
  })

  const { data: blockNumber } = useBlockNumber({
    chainId: srcChainId,
    watch: true,
  })

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries(
        query.queryKey,
        {},
        { cancelRefetch: false },
      )
    }
  }, [blockNumber, queryClient, query.queryKey])

  return query
}
