import { getPortfolioPositions } from '@sushiswap/graph-client/data-api'
import { Accordion, SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { formatUSD } from 'sushi/format'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { PortfolioALMPositions } from './PortfolioALMPositions'
import { PortfolioV2Positions } from './PortfolioV2Positions'
import { PortfolioV3Positions } from './PortfolioV3Positions'

function usePortfolioPositions(
  address: Address | undefined,
  refetchInterval?: 600_000,
) {
  return useQuery({
    queryKey: ['portfolio-positions', address],
    queryFn: async () => {
      const id = address as string
      const data = await getPortfolioPositions({ id })
      return data
    },
    enabled: !!address,
    refetchInterval,
  })
}

export const PortfolioPositions = () => {
  const id = useAccount()
  const { data, isLoading } = usePortfolioPositions(id.address)

  return (
    <div className="flex flex-col gap-y-5 h-full overflow-hidden">
      <div className="px-5">
        <div className="flex flex-col gap-y-3 bg-secondary rounded-xl px-5 py-3">
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <div className="">
            {isLoading ? (
              <SkeletonText fontSize="lg" className="!w-1/3" />
            ) : (
              <div className="text-2xl font-bold">
                {formatUSD(data!.totalUSD)}
              </div>
            )}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div>
          <div className="py-4 px-5">
            <SkeletonText />
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              id={i.toString()}
              className="flex w-full items-center px-5 py-3 gap-x-7"
            >
              <div className="flex items-center">
                <SkeletonCircle radius={28} />
                <SkeletonCircle radius={28} className="-ml-[12px]" />
              </div>
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
      ) : (
        <Accordion
          type="multiple"
          className="overflow-y-auto h-full"
          defaultValue={['v2', 'v3', 'alm']}
        >
          {data?.v2Positions.length ? (
            <PortfolioV2Positions positions={data.v2Positions} />
          ) : null}
          {data?.v3Positions.length ? (
            <PortfolioV3Positions positions={data.v3Positions} />
          ) : null}
          {data?.smartPositions.length ? (
            <PortfolioALMPositions positions={data.smartPositions} />
          ) : null}
        </Accordion>
      )}
    </div>
  )
}
