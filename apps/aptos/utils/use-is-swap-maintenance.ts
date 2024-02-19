import { useQuery } from '@tanstack/react-query'
import { useEdgeConfig } from '../providers/edge-config-provider'
import { SwapEdgeConfig } from '../lib/edge/get-swap-edge-config'

export const useIsSwapMaintenance = () => {
  const { maintenance } = useEdgeConfig<SwapEdgeConfig>()

  return useQuery({
    queryKey: ['useIsSwapMaintenance'],
    queryFn: async () => {
      const resp = await fetch('/api/config/swap', {
        next: { revalidate: 60 },
      })

      const data = await resp.json()

      console.log(data)

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
