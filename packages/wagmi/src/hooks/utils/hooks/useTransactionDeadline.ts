import { ChainId, chainsL2 } from 'sushi/chain'

import { useQuery } from '@tanstack/react-query'
import { useCurrentBlockTimestamp } from '../..'

const L2_DEADLINE_FROM_NOW = 60n * 5n
const TTL = 30n

interface UseTransactionDeadline {
  chainId: ChainId
  enabled?: boolean
}

export const useTransactionDeadline = ({
  chainId,
  enabled = true,
}: UseTransactionDeadline) => {
  const { data: currentBlockTimestampQuery } = useCurrentBlockTimestamp(
    chainId,
    enabled,
  )

  // currentBlockTimestampQuery is excluded from the dependencies array by design,
  // deadline should be updated every 60s, not on every block
  return useQuery({
    queryKey: ['useTransactionDeadline'],
    queryFn: () => {
      const blockTimestamp = currentBlockTimestampQuery
      let data = undefined

      if (
        blockTimestamp &&
        chainId &&
        Object.keys(chainsL2).includes(chainId.toString())
      ) {
        data = blockTimestamp + L2_DEADLINE_FROM_NOW
      }

      if (blockTimestamp) {
        data = blockTimestamp + TTL * 60n
      }

      return data
    },
    refetchInterval: 60_000,
    enabled: Boolean(enabled && currentBlockTimestampQuery),
  })
}
