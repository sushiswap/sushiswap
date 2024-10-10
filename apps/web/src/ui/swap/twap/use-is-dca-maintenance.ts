import { useQuery } from '@tanstack/react-query'
import ms from 'ms'
import { useEdgeConfig } from 'src/providers/edge-config-provider'
import { DCAEdgeConfig } from '~evm/[chainId]/(trade)/dca/get-dca-edge-config'

export const useIsDCAMaintenance = () => {
  const { maintenance } = useEdgeConfig<DCAEdgeConfig>()

  return useQuery({
    queryKey: ['dca-maintenance'],
    queryFn: async () => {
      const resp = await fetch('/api/config/dca', {
        next: { revalidate: 60 },
      })
      const data = await resp.json()

      if (data.success && data.data) {
        return data.data.maintenance as boolean
      }

      return false
    },
    initialData: maintenance,
    refetchInterval: ms('1m'),
  })
}
