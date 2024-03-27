'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useBlockNumber, useReadContract } from 'wagmi'
import { Multicall3ChainId, getMulticall3ContractConfig } from '../contracts'

// TODO: Readd direct export, not sure why it's not working
export const useCurrentBlockTimestamp = (
  chainId: Multicall3ChainId,
  enabled = true,
) => {
  const queryClient = useQueryClient()
  const query = useReadContract({
    ...getMulticall3ContractConfig(chainId),
    functionName: 'getCurrentBlockTimestamp',
    query: {
      enabled,
    },
  })

  const { data: blockNumber } = useBlockNumber({ chainId, watch: true })

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
