import { useQuery } from '@tanstack/react-query'
import { SupportedNetwork } from '~aptos/_common/config/chains'
import { useNetwork } from './use-network'

type UseLedgerVersion = { secondsAgo: number; network: SupportedNetwork }

export function getLedgerVersionUrl({ secondsAgo, network }: UseLedgerVersion) {
  return `/api/ledgerversion?network=${network}&secondsAgo=${secondsAgo}`
}

export function getLedgerVersion(args: UseLedgerVersion) {
  return fetch(getLedgerVersionUrl(args))
}

export function useLedgerVersion({
  secondsAgo,
}: Omit<UseLedgerVersion, 'network'>) {
  const { network } = useNetwork()

  return useQuery({
    queryKey: [getLedgerVersionUrl({ secondsAgo, network })],
    queryFn: async () => {
      const response = await getLedgerVersion({ secondsAgo, network })
      if (response.status !== 200) {
        throw new Error('Failed to fetch ledger version')
      }

      return (await response.json()) as number
    },
    enabled: Boolean(secondsAgo),
    gcTime: 600,
    staleTime: 300,
  })
}
