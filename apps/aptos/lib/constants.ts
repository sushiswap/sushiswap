import { Network } from 'aptos'

// testnet

export const FETCH_URL_PREFIX = 'https://fullnode.testnet.aptoslabs.com'
export const GRAPHQL_URL =
  'https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql'
export const providerNetwork = Network.TESTNET
export const MSafeOrigin = 'https://testnet.m-safe.io/'

// mainnet

// export const FETCH_URL_PREFIX = 'https://fullnode.mainnet.aptoslabs.com'
// export const GRAPHQL_URL = 'https://indexer.mainnet.aptoslabs.com/v1/graphql'
// export const providerNetwork = Network.MAINNET
// export const MSafeOrigin = 'https://app.m-safe.io'
