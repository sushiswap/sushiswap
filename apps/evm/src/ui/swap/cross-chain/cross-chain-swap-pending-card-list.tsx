'use client'

import { Label } from '@sushiswap/ui'
import { CrossChainSwapPendingCard } from './cross-chain-swap-pending-card'
import { useCrossChainSwapPendingTransactionsProvider } from './cross-chain-swap-pending-transactions-provider'

export const CrossChainSwapPendingCardList = () => {
  const pendingTransactions = useCrossChainSwapPendingTransactionsProvider()

  if (pendingTransactions.length === 0) return <></>

  return (
    <div className="flex flex-col space-y-3">
      <Label className="px-2 text-muted-foreground">
        Pending transactions ({pendingTransactions.length})
      </Label>
      {pendingTransactions
        .reverse()
        .map(({ tradeId, amountIn, amountOut, txHash, chainId0, chainId1 }) => {
          return (
            <CrossChainSwapPendingCard
              key={tradeId}
              tradeId={tradeId}
              txHash={txHash}
              amountIn={amountIn}
              amountOut={amountOut}
              chainId0={chainId0}
              chainId1={chainId1}
            />
          )
        })}
    </div>
  )
}
