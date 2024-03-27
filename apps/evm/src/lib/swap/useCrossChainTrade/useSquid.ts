import { Squid } from '@0xsquid/sdk'
import { useQuery } from '@tanstack/react-query'
import { SquidIntegratorId } from 'sushi/config'

export const useSquid = () => {
  return useQuery({
    queryKey: ['squid'],
    queryFn: async () => {
      const squid = new Squid({
        baseUrl: 'https://v2.api.squidrouter.com',
        integratorId: SquidIntegratorId,
      })

      await squid.init()

      return squid
    },
    refetchInterval: Infinity,
  })
}
