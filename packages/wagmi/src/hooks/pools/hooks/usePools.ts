import { useQuery } from '@tanstack/react-query'
import { useConfig } from 'wagmi'
import { getAllPools } from '../actions/getAllPools'
import { UsePoolsParams } from '../types'

export const usePools = ({ enabled = true, ...variables }: UsePoolsParams) => {
  const { chainId, currencyA, currencyB } = variables

  const config = useConfig()

  return useQuery({
    queryKey: ['usePools', { chainId, currencyA, currencyB }],
    queryFn: async () => await getAllPools({ ...variables, config }),
    refetchInterval: 10000,
    enabled,
  })
}
