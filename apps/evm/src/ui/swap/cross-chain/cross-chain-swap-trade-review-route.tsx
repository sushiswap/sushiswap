'use client'

import { Currency, SkeletonBox, SkeletonText, SquidIcon } from '@sushiswap/ui'
import { SushiXSwap2Adapter } from 'src/lib/swap/useCrossChainTrade/SushiXSwap2'
import { Chain } from 'sushi/chain'
import { STARGATE_TOKEN } from 'sushi/config'
import { TradeRoutePathView } from '../trade-route-path-view'
import {
  useCrossChainSwapTrade,
  useDerivedStateCrossChainSwap,
} from './derivedstate-cross-chain-swap-provider'

export const CrossChainSwapTradeReviewRoute = () => {
  const {
    state: { adapter, chainId0, token0, token1, chainId1 },
  } = useDerivedStateCrossChainSwap()
  const { data: trade, isLoading: isTradeLoading } = useCrossChainSwapTrade()

  return (
    <div className="px-3 flex justify-between w-full">
      <div className="p-3 flex flex-col gap-2.5 overflow-hidden">
        <span className="text-[10px] text-muted-foreground overflow-hidden overflow-ellipsis whitespace-nowrap">
          From: {Chain.fromChainId(chainId0)?.name?.toUpperCase()}
        </span>
        <div className="flex flex-col gap-2">
          {isTradeLoading || !trade ? (
            <SkeletonText fontSize="xs" />
          ) : (
            <span className="text-xs font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
              Swap {token0?.symbol} to {trade.srcBridgeToken?.symbol}
            </span>
          )}
          {isTradeLoading || !trade ? (
            <SkeletonBox className="h-2.5 py-0.5 w-[80px]" />
          ) : trade.srcTrade ? (
            <TradeRoutePathView trade={trade.srcTrade}>
              <button
                type="button"
                className="text-[10px] text-blue font-semibold text-left"
              >
                View Route
              </button>
            </TradeRoutePathView>
          ) : null}
        </div>
      </div>
      <div className="flex items-center opacity-20 -ml-1 gap-1">
        <span className="bg-blue w-2 h-2 rounded-full" />
        <span className="bg-blue w-4 h-0.5 rounded-md" />
        <span className="bg-blue w-2 h-2 rounded-full" />
      </div>
      <div className="p-3 grow flex flex-col gap-2.5 items-center overflow-hidden">
        {adapter === SushiXSwap2Adapter.Stargate ? (
          <span className="flex items-center text-[10px] text-muted-foreground gap-1">
            Via
            <Currency.Icon currency={STARGATE_TOKEN} width={10} height={10} />
            Stargate
          </span>
        ) : (
          <span className="flex items-center text-[10px] text-muted-foreground gap-1">
            Via
            <SquidIcon width={10} height={10} />
            Squid
          </span>
        )}
        {isTradeLoading || !trade ? (
          <SkeletonText fontSize="xs" />
        ) : (
          <span className="text-xs font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
            Bridge {trade.srcBridgeToken?.symbol}
          </span>
        )}
      </div>
      <div className="flex items-center opacity-20 -mr-1 gap-1">
        <span className="bg-blue w-2 h-2 rounded-full" />
        <span className="bg-blue w-4 h-0.5 rounded-md" />
        <span className="bg-blue w-2 h-2 rounded-full" />
      </div>
      <div className="p-3 flex flex-col gap-2.5 overflow-hidden">
        <span className="text-[10px] text-muted-foreground overflow-hidden overflow-ellipsis whitespace-nowrap">
          To: {Chain.fromChainId(chainId1)?.name?.toUpperCase()}
        </span>
        <div className="flex flex-col gap-2">
          {isTradeLoading || !trade ? (
            <SkeletonText fontSize="xs" />
          ) : (
            <span className="text-xs font-medium overflow-hidden overflow-ellipsis whitespace-nowrap">
              Swap {trade.dstBridgeToken?.symbol} to {token1?.symbol}
            </span>
          )}
          {isTradeLoading || !trade ? (
            <SkeletonBox className="h-2.5 py-0.5 w-[80px]" />
          ) : trade.dstTrade ? (
            <TradeRoutePathView trade={trade.dstTrade}>
              <button
                type="button"
                className="text-[10px] text-blue font-semibold text-left"
              >
                View Route
              </button>
            </TradeRoutePathView>
          ) : null}
        </div>
      </div>
    </div>
  )
}
