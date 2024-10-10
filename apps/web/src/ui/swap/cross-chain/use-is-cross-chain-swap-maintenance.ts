import { useQuery } from '@tanstack/react-query'
import { useEdgeConfig } from 'src/providers/edge-config-provider'
import { CrossChainSwapEdgeConfig } from '~evm/[chainId]/(trade)/cross-chain-swap/get-cross-chain-swap-edge-config'

export const useIsCrossChainSwapMaintenance = () => {
  const { maintenance } = useEdgeConfig<CrossChainSwapEdgeConfig>()

  return useQuery({
    queryKey: ['cross-chain-swap-maintenance'],
    queryFn: async () => {
      const resp = await fetch('/api/config/xswap', {
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
  })
}
