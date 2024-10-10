import { useQuery } from '@tanstack/react-query'
import { useEdgeConfig } from '~aptos/_common/providers/edge-config-provider'
import { SwapEdgeConfig } from './get-swap-edge-config'

export const useIsSwapMaintenance = () => {
  const { maintenance } = useEdgeConfig<SwapEdgeConfig>()

  return useQuery({
    queryKey: ['useIsSwapMaintenance'],
    queryFn: async () => {
      const resp = await fetch('/aptos/api/config/swap', {
        next: { revalidate: 60 },
      })
      const data = await resp.json()
      if (data.success && data.data) {
        return data.data.maintenance as boolean
      }

      return false
    },
    initialData: maintenance,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  })
}
