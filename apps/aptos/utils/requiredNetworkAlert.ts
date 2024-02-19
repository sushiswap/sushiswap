import { NetworkInfo } from '@aptos-labs/wallet-adapter-core'

export default function requiredNetworkAlert(
  network: NetworkInfo | null,
  disconnect: () => void,
) {
  if (network?.name?.toLowerCase() === undefined) {
    disconnect()
  }
  if (
    network?.name?.toLowerCase() === 'mainnet' ||
    network?.name?.toLowerCase() === 'devnet'
  ) {
    disconnect()
    alert('Please switch network to testnet')
  }
}
