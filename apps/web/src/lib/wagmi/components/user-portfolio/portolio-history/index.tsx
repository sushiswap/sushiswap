import { getPortfolioHistory } from '@sushiswap/graph-client/data-api'
import { SkeletonCircle, SkeletonText } from '@sushiswap/ui'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { PortfolioApproveTransaction } from './PortfolioApproveTransaction'
import { PortfolioOtherTransaction } from './PortfolioOtherTransaction'
import { PortfolioReceiveTransaction } from './PortfolioReceiveTransaction'
import { PortfolioSendTransaction } from './PortfolioSendTransaction'

function usePortfolioHistory(
  address: Address | undefined,
  refetchInterval?: 600_000,
) {
  return useQuery({
    queryKey: ['portfolio-history', address],
    queryFn: async () => {
      const id = address as string
      const data = await getPortfolioHistory({ id })
      return data
    },
    enabled: !!address,
    refetchInterval,
  })
}

export const PortfolioHistory = () => {
  const { address } = useAccount()
  const { data, isLoading } = usePortfolioHistory(address)

  return (
    <div className="flex flex-col gap-y-5 h-full overflow-hidden">
      <div className="overflow-y-auto h-full cursor-default">
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
        ) : (
          data?.map((tx) =>
            tx.category === 'APPROVE' ? (
              <PortfolioApproveTransaction tx={tx} />
            ) : tx.category === 'SEND' ? (
              <PortfolioSendTransaction tx={tx} />
            ) : tx.category === 'RECEIVE' ? (
              <PortfolioReceiveTransaction tx={tx} />
            ) : (
              <PortfolioOtherTransaction tx={tx} />
            ),
          )
        )}
      </div>
    </div>
  )
}
