import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

interface UseBalances {
  account: string | undefined
  chainId: number
}

export const useBalancesRefetch = ({ chainId, account }: UseBalances) => {
  const queryClient = useQueryClient()
  return useCallback(async () => {
    return await queryClient.refetchQueries({
      queryKey: [`/api/balance/v2/${chainId}/${account}`],
      type: 'active',
    })
  }, [queryClient, chainId, account])
}
