import { NetworkName } from '@aptos-labs/wallet-adapter-react'
import { Network } from 'aptos'
import { L0_USDC, USDC } from '~aptos/_common/config/coins'
import { Token } from '~aptos/_common/lib/types/token'

export const SUPPORTED_NETWORKS = [
  NetworkName.Testnet,
  NetworkName.Mainnet,
] as const

export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number]

export function isSupportedNetwork(
  network: NetworkName | undefined,
): network is SupportedNetwork {
  return SUPPORTED_NETWORKS.includes(network as SupportedNetwork)
}

export function networkNameToNetwork(network: NetworkName): Network {
  return network === NetworkName.Testnet ? Network.TESTNET : Network.MAINNET
}

export interface NetworkConfig {
  network: SupportedNetwork
  api: {
    fetchUrlPrefix: string
    graphqlUrl: string
  }
  contracts: {
    swap: string
    masterchef: string | undefined
  }
  other: {
    MSafeOrigin: string
  }
  default_stable: Token
}

export const chains: Record<SupportedNetwork, NetworkConfig> = {
  [NetworkName.Testnet]: {
    network: NetworkName.Testnet,
    api: {
      fetchUrlPrefix: 'https://fullnode.testnet.aptoslabs.com',
      graphqlUrl: 'https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql',
    },
    contracts: {
      swap: '0x608666b9e1c958e0cda5aeaef77cadf207a1fe63430bd2c7a6863693371ca483',
      masterchef:
        '0x3c44ba1eb8ccf8d82cfbee2a7026bf42cb154a1166df37479b329b72cb122fe9',
    },
    other: {
      MSafeOrigin: 'https://testnet.m-safe.io/',
    },
    default_stable: USDC[NetworkName.Testnet],
  },
  [NetworkName.Mainnet]: {
    network: NetworkName.Mainnet,
    api: {
      fetchUrlPrefix: 'https://fullnode.mainnet.aptoslabs.com',
      graphqlUrl: 'https://indexer.mainnet.aptoslabs.com/v1/graphql',
    },
    contracts: {
      swap: '0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c',
      masterchef: undefined,
    },
    other: {
      MSafeOrigin: 'https://app.m-safe.io',
    },
    default_stable: L0_USDC[NetworkName.Mainnet],
  },
}
