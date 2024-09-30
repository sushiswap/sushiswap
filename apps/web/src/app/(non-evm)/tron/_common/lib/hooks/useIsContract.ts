import { useQuery } from '@tanstack/react-query'
import { isContract } from '~tron/_common/lib/utils/helpers'
import { useTronWeb } from './useTronWeb'

export const useIsContract = ({
  address,
}: { address: string | null | undefined }) => {
  const { tronWeb } = useTronWeb()

  return useQuery({
    queryKey: ['useIsContract', { address }],
    queryFn: async () => {
      if (!address) return false
      return await isContract(tronWeb, address)
    },
    enabled: !!address && !!tronWeb,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}
