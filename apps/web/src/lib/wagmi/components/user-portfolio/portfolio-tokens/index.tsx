import { getPortfolioWallet } from '@sushiswap/graph-client/data-api'
import { SkeletonCircle, SkeletonText, classNames } from '@sushiswap/ui'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { formatPercent, formatUSD } from 'sushi/format'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { PortfolioTokensList } from './PortfolioTokensList'

function usePortfolioWallet(
  address: Address | undefined,
  refetchInterval?: 600_000,
) {
  return useQuery({
    queryKey: ['portfolio-wallet', address],
    queryFn: async () => {
      const id = address as string
      const data = await getPortfolioWallet({ id })
      return data
    },
    enabled: !!address,
    refetchInterval,
  })
}

export const PortfolioTokens = () => {
  const { address } = useAccount()
  const { data, isLoading } = usePortfolioWallet(address)

  return (
    <div className="flex flex-col gap-y-5 h-full overflow-hidden">
      <div className="px-5">
        <div className="flex flex-col gap-y-3 bg-secondary rounded-xl px-5 py-3">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <div className="flex flex-col gap-y-2">
            {isLoading ? (
              <>
                <SkeletonText fontSize="lg" className="!w-1/3" />
                <SkeletonText className="!w-1/2" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatUSD(data!.totalUSD)}
                </div>
                <div
                  className={classNames(
                    'text-sm',
                    data!.amountUSD24Change > 0
                      ? 'text-green'
                      : data!.amountUSD24Change < 0
                        ? 'text-red'
                        : 'text-muted-foreground',
                  )}
                >
                  {`${data!.amountUSD24Change > 0 ? '+' : ''}${formatUSD(
                    data!.amountUSD24Change,
                  )} (${formatPercent(data!.percentageChange24h)})`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              id={i.toString()}
              className="flex w-full items-center px-5 py-3 gap-x-5"
            >
              <SkeletonCircle radius={28} />
              <div className="flex w-full justify-between items-center gap-x-3">
                <div className="basis-3/4 flex flex-col gap-y-1">
                  <SkeletonText fontSize="sm" />
                  <SkeletonText fontSize="xs" />
                </div>
                <div className="basis-1/4 flex flex-col gap-y-1">
                  <SkeletonText fontSize="sm" />
                  <SkeletonText fontSize="xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.tokens.length ? (
        <PortfolioTokensList tokens={data.tokens} />
      ) : null}
    </div>
  )
}
