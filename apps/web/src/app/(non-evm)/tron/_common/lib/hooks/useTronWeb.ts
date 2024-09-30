import { useMemo } from 'react'
import TronWeb from 'tronweb'
import { IS_TESTNET } from '~tron/_common/constants/is-testnet'

if (!process.env.NEXT_PUBLIC_TRON_PRO_API_KEY) {
  throw new Error('NEXT_PUBLIC_TRON_PRO_API_KEY is not set')
}

export const useTronWeb = () => {
  const tronWeb = useMemo(() => {
    const host = IS_TESTNET
      ? 'https://api.shasta.trongrid.io/'
      : 'https://api.trongrid.io/'
    return new TronWeb({
      fullHost: host,

      headers: { 'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRON_PRO_API_KEY },
    })
  }, [])
  return { tronWeb }
}
