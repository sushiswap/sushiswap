import { ChainId } from '../chain/index.js'

const SUPPORTED_CHAIN_IDS = [
  ChainId.AVALANCHE,
  ChainId.BSC,
  ChainId.FANTOM,
  ChainId.GNOSIS,
  ChainId.HARMONY,
  ChainId.ETHEREUM,
  ChainId.HECO,
  ChainId.ARBITRUM,
  ChainId.OPTIMISM,
  ChainId.ZKSYNC_ERA,
  ChainId.LINEA,
  ChainId.BASE,
  ChainId.POLYGON,
  ChainId.SCROLL,
  ChainId.BLAST,
] as const

export const TokenSecurityChainIds = SUPPORTED_CHAIN_IDS

export type TokenSecurityChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export const isTokenSecurityChainId = (
  chainId: ChainId,
): chainId is TokenSecurityChainId =>
  SUPPORTED_CHAIN_IDS.includes(chainId as TokenSecurityChainId)
