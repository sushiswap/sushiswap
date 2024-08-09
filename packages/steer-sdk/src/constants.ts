import { ChainId } from 'sushi/chain'
import { DECENTRALIZED_HOST_BY_SUBGRAPH_ID } from 'sushi/config/subgraph'

export const STEER_SUPPORTED_CHAIN_IDS = [
  ChainId.POLYGON,
  ChainId.BSC,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM,
  ChainId.THUNDERCORE,
  ChainId.METIS,
  ChainId.BASE,
  ChainId.AVALANCHE,
  ChainId.POLYGON_ZKEVM,
  // ChainId.CELO, // No V3 Celo deployment yet
  ChainId.KAVA,
  ChainId.LINEA,
  ChainId.SCROLL,
  ChainId.FANTOM,
  ChainId.BLAST,
  ChainId.ROOTSTOCK,
]

export const SteerChainIds = STEER_SUPPORTED_CHAIN_IDS

export type SteerChainId = (typeof STEER_SUPPORTED_CHAIN_IDS)[number]

export const isSteerChainId = (chainId: ChainId): chainId is SteerChainId =>
  STEER_SUPPORTED_CHAIN_IDS.includes(chainId as SteerChainId)

export const STEER_PERIPHERY_ADDRESS: Record<SteerChainId, `0x${string}`> = {
  [ChainId.POLYGON]: '0x29E1888F7DD0757f2873E494463Ec389dab38D27',
  [ChainId.BSC]: '0xe240B9a2936f6Fb8860219bC059349e50F03492e',
  [ChainId.OPTIMISM]: '0x7c464A0AB1f5ebf3E2dCccfec7EF41D02ED7a2f4',
  [ChainId.ARBITRUM]: '0x806c2240793b3738000fcb62C66BF462764B903F',
  [ChainId.THUNDERCORE]: '0xab36D30C1A1C683037Bd7AAC67f29B2e3ECC6576',
  [ChainId.METIS]: '0x806c2240793b3738000fcb62C66BF462764B903F',
  [ChainId.BASE]: '0x16BA7102271dC83Fff2f709691c2B601DAD7668e',
  [ChainId.AVALANCHE]: '0x5D8249e3F5f702e1Fd720167b40424fc2daDCd1e',
  [ChainId.POLYGON_ZKEVM]: '0xcA19bEc25A41443F35EeAE03411Dce87D8c0Edc4',
  // [ChainId.CELO]: '0xdca3251Ebe8f85458E8d95813bCb816460e4bef1',
  [ChainId.KAVA]: '0xf90107890B640387ec3b0474F0c61674AEbCb510',
  [ChainId.LINEA]: '0x0C5c5BEB833fD382b04e039f151942DC3D9A60ce',
  [ChainId.SCROLL]: '0xD90c8970708FfdFC403bdb56636621e3E9CCe921',
  [ChainId.FANTOM]: '0xcb77e4C30D92c8b959811E99213625C7b9490b96',
  [ChainId.BLAST]: '0xdca3251Ebe8f85458E8d95813bCb816460e4bef1',
  [ChainId.ROOTSTOCK]: '0x37cff062d52dd6e9e39df619ccd30c037a36bb83',
}

export const STEER_SUBGRAPH_URL: Record<SteerChainId, string> = {
  [ChainId.POLYGON]: `${DECENTRALIZED_HOST_BY_SUBGRAPH_ID}/uQxLz6EarmJcr2ymRRmTnrRPi8cCqas4XcPQb71HBvw`,
  [ChainId.BSC]: `${DECENTRALIZED_HOST_BY_SUBGRAPH_ID}/GLDP56fPGDz3MtmhtfTkz5CxWiqiNLACVrsJ9RqQeL4U`,
  [ChainId.OPTIMISM]: `${DECENTRALIZED_HOST_BY_SUBGRAPH_ID}/GgW1EwNARL3dyo3acQ3VhraQQ66MHT7QnYuGcQc5geDG`,
  [ChainId.ARBITRUM]: `${DECENTRALIZED_HOST_BY_SUBGRAPH_ID}/HVC4Br5yprs3iK6wF8YVJXy4QZWBNXTCFp8LPe3UpcD4`,
  // [ChainId.Evmos]: 'subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-evmos/api',
  [ChainId.THUNDERCORE]:
    'subgraph.steer.finance/thundercore/subgraphs/name/steerprotocol/steer-thundercore',
  [ChainId.METIS]:
    'subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-metis/api',
  [ChainId.BASE]:
    'subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-base/api',
  [ChainId.AVALANCHE]: `${DECENTRALIZED_HOST_BY_SUBGRAPH_ID}/GZotTj3rQJ8ZqVyodtK8TcnKcUxMgeF7mCJHGPYbu8dA`,
  [ChainId.POLYGON_ZKEVM]:
    'subgraph.steer.finance/zkevm/subgraphs/name/steerprotocol/steer-zkevm',
  // [ChainId.CELO]: `${DECENTRALIZED_HOST_BY_SUBGRAPH_ID}/BPaFHyfVrhv3pdjGodpQcWggAg1Bcrvc9SFc2t2BXeho`,
  [ChainId.KAVA]:
    'subgraph.steer.finance/kava/subgraphs/name/steerprotocol/steer-kava-evm',
  [ChainId.LINEA]:
    'https://api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-linea/1.1.2/gn',
  [ChainId.SCROLL]:
    'subgraph.steer.finance/scroll/subgraphs/name/steerprotocol/steer-scroll',
  [ChainId.FANTOM]: `${DECENTRALIZED_HOST_BY_SUBGRAPH_ID}/9uyX2WDuaxmcYh11ehUhU68M9uSCp5FXVQV2w4LqbpbV`,
  [ChainId.BLAST]:
    'api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-blast/1.1.1/gn',
  // [ChainId.MANTA]: 'subgraph.steer.finance/manta/subgraphs/name/steerprotocol/steer-manta'
  [ChainId.ROOTSTOCK]:
    'api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-rootstock/1.1.1/gn',
}

export enum SteerStrategy {
  SuperWide = 'SuperWide',
  DeltaNeutralStables = 'DeltaNeutralStables',
  StableExpansion = 'StableExpansion',
  ElasticExpansion = 'ElasticExpansion',
  MovingVolatilityChannel = 'MovingVolatilityChannel',
  MovingVolatilityChannelMedium = 'MovingVolatilityChannelMedium',
  HighLowChannel = 'HighLowChannel',
  StaticStable = 'StaticStable',
  ClassicRebalance = 'ClassicRebalance',
  ChannelMultiplier = 'ChannelMultiplier',
  PriceMultiplier = 'PriceMultiplier',
  FixedPercentage = 'FixedPercentage',
  KeltnerAlgo = 'KeltnerAlgo',
  BollingerAlgo = 'BollingerAlgo',
}

export const isSteerStrategy = (strategy: string): strategy is SteerStrategy =>
  Object.values(SteerStrategy).includes(strategy as SteerStrategy)
