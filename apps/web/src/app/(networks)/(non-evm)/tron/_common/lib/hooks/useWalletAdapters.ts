import {
  TronLinkAdapter,
  WalletConnectAdapter,
} from '@tronweb3/tronwallet-adapters'
import { useMemo } from 'react'
import { IS_TESTNET } from '~tron/_common/constants/is-testnet'

export const useWalletAdapters = () => {
  const adapters = useMemo(() => {
    return [
      new TronLinkAdapter({ dappName: 'SushiSwap on Tron' }),
      new WalletConnectAdapter({
        network: IS_TESTNET ? 'Shasta' : 'Mainnet',
        //TODO: Get real prjoect ID from sushi team
        options: { projectId: '74b1794741f5f9376c04ca8af64705d8' },
      }),
    ]
  }, [])
  return { adapters }
}
