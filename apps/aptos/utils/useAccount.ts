import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useMemo, useState } from 'react'

export function useAccount() {
  const { connected } = useWallet()
  const [isLoading, setLoading] = useState<boolean>(true)
  const isLoadingAccount = useMemo(() => {
    if (connected) {
      setLoading(false)
    } else {
      setTimeout(() => {
        setLoading(false)
      }, 1750)
    }
    return isLoading
  }, [connected, isLoading])
  return { isLoadingAccount }
}
