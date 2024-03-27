import { useQuery } from '@tanstack/react-query'
import { useConfig } from 'wagmi'
import { getAllPoolsCodeMap } from '../actions/getAllPoolsCodeMap'
import { UsePoolsParams } from '../types'

export const usePoolsCodeMap = ({
  enabled = true,
  ...variables
}: Omit<UsePoolsParams, 'config'>) => {
  const { chainId, currencyA, currencyB } = variables

  const config = useConfig()

  return useQuery({
    queryKey: ['usePoolsCodeMap', { chainId, currencyA, currencyB }],
    queryFn: async () => await getAllPoolsCodeMap({ ...variables, config }),
    refetchInterval: 10000,
    enabled,
  })
}
