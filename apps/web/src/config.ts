import { PoolChainIds } from '@sushiswap/graph-client/data-api'
import { Chain, ChainId, TESTNET_CHAIN_IDS } from 'sushi/chain'
import {
  AGGREGATOR_ONLY_CHAIN_IDS,
  EXTRACTOR_SUPPORTED_CHAIN_IDS,
  SUSHISWAP_SUPPORTED_CHAIN_IDS,
} from 'sushi/config'

export const NonStandardChainId = {
  APTOS: 'aptos',
  TRON: 'tron',
} as const

export type NonStandardChainId =
  (typeof NonStandardChainId)[keyof typeof NonStandardChainId]

export const isNonStandardChainId = (
  nonStandardChainId: string,
): nonStandardChainId is NonStandardChainId =>
  Object.values(NonStandardChainId).includes(
    nonStandardChainId as NonStandardChainId,
  )

interface NonStandardChain extends Omit<Chain, 'chainId'> {
  chainId: string
}

export const NonStandardChain = {
  [NonStandardChainId.APTOS]: {
    name: 'Aptos',
    nativeCurrency: {
      name: 'Aptos',
      symbol: 'APT',
      decimals: 8,
    },
    shortName: 'aptos',
    chainId: 'aptos',
  },
  [NonStandardChainId.TRON]: {
    name: 'Tron',
    nativeCurrency: {
      name: 'Tron',
      symbol: 'TRX',
      decimals: 6,
    },
    shortName: 'tron',
    chainId: 'tron',
  },
} as Record<NonStandardChainId, NonStandardChain>

export const SWAP_API_SUPPORTED_CHAIN_IDS = EXTRACTOR_SUPPORTED_CHAIN_IDS

export type SwapApiEnabledChainId =
  (typeof SWAP_API_SUPPORTED_CHAIN_IDS)[number]
export const isSwapApiEnabledChainId = (
  chainId: number,
): chainId is SwapApiEnabledChainId =>
  SWAP_API_SUPPORTED_CHAIN_IDS.includes(chainId as SwapApiEnabledChainId)

export const DISABLED_CHAIN_IDS = [
  ChainId.BOBA_AVAX,
  ChainId.PALM,
  ChainId.HECO,
  ChainId.OKEX,
  // NonStandardChainId.TRON,
] as const

export const NEW_CHAIN_IDS = [] as const

const PREFERRED_CHAINID_ORDER = [
  ...NEW_CHAIN_IDS,
  ChainId.ETHEREUM,
  NonStandardChainId.TRON,
  ChainId.BSC,
  ChainId.ARBITRUM,
  ChainId.BASE,
  ChainId.AVALANCHE,
  ChainId.POLYGON,
  ChainId.SCROLL,
  ChainId.BLAST,
  ChainId.OPTIMISM,
  NonStandardChainId.APTOS,
  ChainId.LINEA,
  ChainId.MANTLE,
  ChainId.CORE,
  ChainId.CRONOS,
  ChainId.GNOSIS,
  ChainId.ROOTSTOCK,
  ChainId.KAVA,
  ChainId.ZKSYNC_ERA,
  ChainId.FANTOM,
  ChainId.CELO,
  ChainId.FILECOIN,
  ChainId.TELOS,
  ChainId.METIS,
  ChainId.POLYGON_ZKEVM,
  ChainId.MOONBEAM,
  ChainId.ZETACHAIN,
  ChainId.BOBA,
  ChainId.HARMONY,
  ChainId.ARBITRUM_NOVA,
  ChainId.HAQQ,
  ChainId.FUSE,
  ChainId.THUNDERCORE,
  ChainId.SKALE_EUROPA,
  ChainId.BOBA_BNB,
] as const

export const CHAIN_IDS = [
  ...SUSHISWAP_SUPPORTED_CHAIN_IDS,
  ...AGGREGATOR_ONLY_CHAIN_IDS,
] as const

export const AMM_SUPPORTED_CHAIN_IDS = SUSHISWAP_SUPPORTED_CHAIN_IDS.filter(
  (
    c,
  ): c is Exclude<
    (typeof SUSHISWAP_SUPPORTED_CHAIN_IDS)[number],
    (typeof TESTNET_CHAIN_IDS)[number] | (typeof DISABLED_CHAIN_IDS)[number]
  > =>
    !TESTNET_CHAIN_IDS.includes(c as (typeof TESTNET_CHAIN_IDS)[number]) &&
    !DISABLED_CHAIN_IDS.includes(c as (typeof DISABLED_CHAIN_IDS)[number]),
)

export const SUPPORTED_CHAIN_IDS = Array.from(
  new Set([
    ...PREFERRED_CHAINID_ORDER.filter((el) =>
      CHAIN_IDS.includes(el as (typeof CHAIN_IDS)[number]),
    ),
    ...CHAIN_IDS,
  ]),
).filter(
  (
    c,
  ): c is Exclude<
    (typeof CHAIN_IDS)[number],
    (typeof TESTNET_CHAIN_IDS)[number] | (typeof DISABLED_CHAIN_IDS)[number]
  > =>
    !TESTNET_CHAIN_IDS.includes(c as (typeof TESTNET_CHAIN_IDS)[number]) &&
    !DISABLED_CHAIN_IDS.includes(c as (typeof DISABLED_CHAIN_IDS)[number]),
)

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]
export const isSupportedChainId = (
  chainId: number,
): chainId is SupportedChainId =>
  SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId)

const UNSORTED_SUPPORTED_NETWORKS = [
  ...SUPPORTED_CHAIN_IDS,
  NonStandardChainId.APTOS,
  NonStandardChainId.TRON,
].filter(
  (c) => !DISABLED_CHAIN_IDS.includes(c as (typeof DISABLED_CHAIN_IDS)[number]),
)

export const SUPPORTED_NETWORKS = Array.from(
  new Set([
    ...PREFERRED_CHAINID_ORDER.filter((el) =>
      UNSORTED_SUPPORTED_NETWORKS.includes(
        el as (typeof UNSORTED_SUPPORTED_NETWORKS)[number],
      ),
    ),
    ...UNSORTED_SUPPORTED_NETWORKS,
  ]),
)

const UNSORTED_POOL_SUPPORTED_NETWORKS = [
  ...PoolChainIds,
  NonStandardChainId.APTOS,
  NonStandardChainId.TRON,
].filter(
  (c) => !DISABLED_CHAIN_IDS.includes(c as (typeof DISABLED_CHAIN_IDS)[number]),
)

export const POOL_SUPPORTED_NETWORKS = Array.from(
  new Set([
    ...PREFERRED_CHAINID_ORDER.filter((el) =>
      UNSORTED_POOL_SUPPORTED_NETWORKS.includes(
        el as (typeof UNSORTED_POOL_SUPPORTED_NETWORKS)[number],
      ),
    ),
    ...UNSORTED_POOL_SUPPORTED_NETWORKS,
  ]),
)

export const TWAP_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM,
  ChainId.BASE,
  ChainId.ETHEREUM,
] as const

export type TwapSupportedChainId = (typeof TWAP_SUPPORTED_CHAIN_IDS)[number]
export const isTwapSupportedChainId = (
  chainId: number,
): chainId is TwapSupportedChainId =>
  TWAP_SUPPORTED_CHAIN_IDS.includes(chainId as TwapSupportedChainId)
