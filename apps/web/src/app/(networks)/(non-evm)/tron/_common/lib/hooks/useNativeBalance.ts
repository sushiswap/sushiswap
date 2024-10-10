import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useTronWeb } from './useTronWeb'

export const useNativeBalance = () => {
  const { address } = useWallet()
  const { tronWeb } = useTronWeb()
  return useQuery({
    queryKey: ['useNativeBalance'],
    queryFn: async () => {
      const balance = await tronWeb.trx.getUnconfirmedBalance(address)
      const formattedBalance = tronWeb.fromSun(balance)
      return { balance, formattedBalance }
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!address && !!tronWeb,
  })
}
