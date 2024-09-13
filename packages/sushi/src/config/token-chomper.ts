import { ChainId } from '../chain/index.js'

export const TOKEN_CHOMPER_CHAIN_IDS = [
  ChainId.ETHEREUM,
  ChainId.ARBITRUM,
  ChainId.OPTIMISM,
  ChainId.BASE,
  ChainId.POLYGON,
  ChainId.AVALANCHE,
  ChainId.BSC,
  ChainId.LINEA,
  ChainId.ARBITRUM_NOVA,
  ChainId.GNOSIS,
  ChainId.FANTOM,
  ChainId.BTTC,
  ChainId.CELO,
  ChainId.FILECOIN,
  ChainId.HAQQ,
  ChainId.KAVA,
  ChainId.METIS,
  ChainId.THUNDERCORE,
  ChainId.SCROLL,
  ChainId.ZETACHAIN,
  ChainId.MOONBEAM,
  ChainId.MOONRIVER,
  ChainId.POLYGON_ZKEVM,
  ChainId.FUSE,
  ChainId.HARMONY,
  ChainId.TELOS,
  ChainId.BOBA,
  ChainId.BOBA_BNB,
  ChainId.CORE,
  ChainId.CRONOS,
  ChainId.BLAST,
  ChainId.SKALE_EUROPA,
  ChainId.ROOTSTOCK,
  ChainId.MANTLE,
  ChainId.ZKSYNC_ERA,
] as const

export type TokenChomperChainId = (typeof TOKEN_CHOMPER_CHAIN_IDS)[number]

export const TOKEN_CHOMPER_ADDRESS: Record<TokenChomperChainId, `0x${string}`> =
  {
    [ChainId.ETHEREUM]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.ARBITRUM]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.OPTIMISM]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.BASE]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.POLYGON]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.AVALANCHE]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.BSC]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.LINEA]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.ARBITRUM_NOVA]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.GNOSIS]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.FANTOM]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.BTTC]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.CELO]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.FILECOIN]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.HAQQ]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.KAVA]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.METIS]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.THUNDERCORE]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.SCROLL]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.ZETACHAIN]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.MOONBEAM]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.MOONRIVER]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.POLYGON_ZKEVM]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.FUSE]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.HARMONY]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.TELOS]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.BOBA]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.BOBA_BNB]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.CORE]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.CRONOS]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.BLAST]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.SKALE_EUROPA]: '0x34D94b354cfeEF8CEe18489184A23d4c475b6903',
    [ChainId.ROOTSTOCK]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.MANTLE]: '0xca226bd9c754F1283123d32B2a7cF62a722f8ADa',
    [ChainId.ZKSYNC_ERA]: '0xCd4eE95b182139969b041DdDc49c5449C21702E1',
  } as const

export const isTokenChomperChainId = (
  chainId: ChainId,
): chainId is TokenChomperChainId =>
  TOKEN_CHOMPER_CHAIN_IDS.includes(chainId as TokenChomperChainId)
