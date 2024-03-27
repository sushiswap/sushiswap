import { ChainId } from 'sushi/chain'

export const TRIDENT_ENABLED_NETWORKS = [
  ChainId.OPTIMISM,
  ChainId.POLYGON,
  ChainId.KAVA,
  ChainId.METIS,
  ChainId.BTTC,
  ChainId.ARBITRUM,
  ChainId.AVALANCHE,
  ChainId.BSC,
] as const

export type TridentChainId = (typeof TRIDENT_ENABLED_NETWORKS)[number]

export const SUSHISWAP_ENABLED_NETWORKS = [
  ChainId.ARBITRUM,
  ChainId.AVALANCHE,
  ChainId.BSC,
  ChainId.CELO,
  ChainId.ETHEREUM,
  ChainId.FANTOM,
  ChainId.FUSE,
  ChainId.GNOSIS,
  ChainId.MOONBEAM,
  ChainId.MOONRIVER,
  ChainId.POLYGON,
  ChainId.HARMONY,
  ChainId.ARBITRUM_NOVA,
  ChainId.BOBA,
  ChainId.BOBA_AVAX,
  ChainId.BOBA_BNB,
  ChainId.BASE,
  ChainId.SCROLL,
  ChainId.KAVA,
  ChainId.METIS,
  ChainId.BTTC,
  ChainId.FILECOIN,
  ChainId.ZETACHAIN,
  ChainId.THUNDERCORE,
  ChainId.CORE,
  ChainId.HAQQ,
  ChainId.OPTIMISM,
  ChainId.LINEA,
  ChainId.POLYGON_ZKEVM,
  ChainId.BLAST,
  // ChainId.PALM,
  // ChainId.HECO,
  // ChainId.OKEX
] as const

export type SushiSwapChainId = (typeof SUSHISWAP_ENABLED_NETWORKS)[number]

export const SUSHISWAP_V3_ENABLED_NETWORKS = [
  ChainId.ETHEREUM,
  ChainId.ARBITRUM_NOVA,
  ChainId.ARBITRUM,
  ChainId.AVALANCHE,
  ChainId.BSC,
  ChainId.BOBA,
  ChainId.FANTOM,
  ChainId.FUSE,
  ChainId.GNOSIS,
  ChainId.MOONRIVER,
  ChainId.OPTIMISM,
  ChainId.POLYGON,
  ChainId.POLYGON_ZKEVM,
  ChainId.THUNDERCORE,
  ChainId.CORE,
  ChainId.BASE,
  ChainId.LINEA,
  ChainId.SCROLL,
  ChainId.KAVA,
  ChainId.METIS,
  ChainId.BTTC,
  ChainId.FILECOIN,
  ChainId.HAQQ,
  ChainId.ZETACHAIN,
  ChainId.BLAST,
]
export type SushiSwapV3ChainId = (typeof SUSHISWAP_V3_ENABLED_NETWORKS)[number]

export const SWAP_ENABLED_NETWORKS = Array.from(
  new Set([
    ...SUSHISWAP_ENABLED_NETWORKS,
    ...SUSHISWAP_V3_ENABLED_NETWORKS,
    ...TRIDENT_ENABLED_NETWORKS,
  ]),
)

export type SwapSupportedChainIds = typeof SWAP_ENABLED_NETWORKS
export type SwapSupportedChainId = SwapSupportedChainIds[number]

export const GRAPH_HOST = 'api.thegraph.com/subgraphs/name'
export const PENDING_GRAPH_HOST = 'api.thegraph.com/subgraphs/id'

export const KAVA_HOST = 'pvt.graph.kava.io/subgraphs/name'
export const PENDING_KAVA_HOST = 'pvt.graph.kava.io/subgraphs/id'

export const METIS_HOST = 'andromeda.thegraph.metis.io/subgraphs/name'
export const PENDING_METIS_HOST = 'andromeda.thegraph.metis.io/subgraphs/id'

export const FILECOIN_HOST = 'sushi.laconic.com/subgraphs/name'
export const STUDIO_HOST = 'api.studio.thegraph.com/query/32073'
export const THUNDERCORE_HOST = 'graph-node.thundercore.com/subgraphs/name'
export const CORE_HOST = 'thegraph.coredao.org/subgraphs/name'
export const LINEA_HOST = 'graph-query.linea.build/subgraphs/name'
export const HAQQ_HOST = 'haqq.graph.p2p.org/subgraphs/name'
export const ZETACHAIN_HOST =
  'api.goldsky.com/api/public/project_cls39ugcfyhbq01xl9tsf6g38/subgraphs'
export const BLAST_HOST =
  'api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs'

export const SUSHI_HOST = 'subgraphs.sushi.com/subgraphs/name'

export const CHAIN_NAME: Record<number, string> = {
  [ChainId.ARBITRUM]: 'Arbitrum',
  [ChainId.AVALANCHE]: 'Avalanche',
  [ChainId.BSC]: 'Bsc',
  [ChainId.ETHEREUM]: 'Ethereum',
  [ChainId.FANTOM]: 'Fantom',
  [ChainId.GNOSIS]: 'Gnosis',
  // [ChainId.GÖRLI]: 'Görli',
  [ChainId.HARMONY]: 'Harmony',
  [ChainId.MOONBEAM]: 'Moonbeam',
  [ChainId.MOONRIVER]: 'Moonriver',
  [ChainId.OPTIMISM]: 'Optimism',
  [ChainId.POLYGON]: 'Polygon',
  [ChainId.TELOS]: 'Telos',
  [ChainId.CELO]: 'Celo',
  [ChainId.FUSE]: 'Fuse',
  [ChainId.OKEX]: 'OKEx',
  [ChainId.HECO]: 'HECO',
  [ChainId.PALM]: 'Palm',
  [ChainId.KAVA]: 'Kava',
  [ChainId.METIS]: 'Metis',
  [ChainId.BOBA]: 'Boba',
  [ChainId.ARBITRUM_NOVA]: 'Arbitrum Nova',
  [ChainId.BOBA_AVAX]: 'Boba Avax',
  [ChainId.BOBA_BNB]: 'Boba BNB',
  [ChainId.BTTC]: 'BitTorrent',
  [ChainId.THUNDERCORE]: 'ThunderCore',
  [ChainId.POLYGON_ZKEVM]: 'Polygon zkEVM',
  [ChainId.CORE]: 'Core',
  [ChainId.BASE]: 'Base',
  [ChainId.LINEA]: 'Linea',
  [ChainId.SCROLL]: 'Scroll',
  [ChainId.FILECOIN]: 'Filecoin',
  [ChainId.HAQQ]: 'HAQQ',
  [ChainId.ZETACHAIN]: 'ZetaChain',
  [ChainId.BLAST]: 'Blast',
} as const

export const SUBGRAPH_HOST: Record<number, string> = {
  [ChainId.ARBITRUM]: GRAPH_HOST,
  [ChainId.ARBITRUM_NOVA]: SUSHI_HOST,
  [ChainId.AVALANCHE]: GRAPH_HOST,
  [ChainId.BSC]: GRAPH_HOST,
  [ChainId.CELO]: GRAPH_HOST,
  [ChainId.ETHEREUM]: GRAPH_HOST,
  [ChainId.FANTOM]: GRAPH_HOST,
  [ChainId.FUSE]: GRAPH_HOST,
  [ChainId.GNOSIS]: GRAPH_HOST,
  // [ChainId.GÖRLI]: GRAPH_HOST,
  [ChainId.HARMONY]: GRAPH_HOST,
  [ChainId.KAVA]: KAVA_HOST,
  [ChainId.METIS]: METIS_HOST,
  [ChainId.MOONBEAM]: GRAPH_HOST,
  [ChainId.MOONRIVER]: GRAPH_HOST,
  [ChainId.OPTIMISM]: GRAPH_HOST,
  [ChainId.POLYGON]: GRAPH_HOST,
  [ChainId.POLYGON_ZKEVM]: STUDIO_HOST,
  [ChainId.BOBA]: GRAPH_HOST,
  [ChainId.BOBA_AVAX]: SUSHI_HOST,
  [ChainId.BOBA_BNB]: SUSHI_HOST,
  [ChainId.BTTC]: SUSHI_HOST,
  [ChainId.OKEX]: '',
  [ChainId.HECO]: '',
  // [ChainId.KOVAN]: '',
  [ChainId.THUNDERCORE]: THUNDERCORE_HOST,
  [ChainId.CORE]: CORE_HOST,
  [ChainId.BASE]: STUDIO_HOST,
  [ChainId.LINEA]: LINEA_HOST,
  [ChainId.SCROLL]: STUDIO_HOST,
  [ChainId.FILECOIN]: FILECOIN_HOST,
  [ChainId.HAQQ]: HAQQ_HOST,
  [ChainId.ZETACHAIN]: ZETACHAIN_HOST,
  [ChainId.BLAST]: BLAST_HOST,
} as const

export const BENTOBOX_SUBGRAPH_NAME = {
  [ChainId.ETHEREUM]: 'sushiswap/bentobox-ethereum',
  [ChainId.POLYGON]: 'sushiswap/bentobox-polygon',
  [ChainId.AVALANCHE]: 'sushiswap/bentobox-avalanche',
  [ChainId.BSC]: 'sushiswap/bentobox-bsc',
  [ChainId.FANTOM]: 'sushiswap/bentobox-fantom',
  [ChainId.GNOSIS]: 'sushiswap/bentobox-gnosis',
  [ChainId.ARBITRUM]: 'sushiswap/bentobox-arbitrum',
  [ChainId.CELO]: 'sushiswap/bentobox-celo',
  [ChainId.MOONRIVER]: 'sushiswap/bentobox-moonriver',
  [ChainId.MOONBEAM]: 'sushiswap/bentobox-moonbeam',
  [ChainId.OPTIMISM]: 'sushiswap/bentobox-optimism',
  [ChainId.HARMONY]: 'sushiswap/bentobox-harmony',
  [ChainId.KAVA]: 'sushiswap/bentobox-kava',
  [ChainId.BTTC]: 'sushiswap/bentobox-bttc',
} as const

export const BENTOBOX_ENABLED_NETWORKS = Object.keys(
  BENTOBOX_SUBGRAPH_NAME,
).map(Number) as BentoBoxChainId[]

export type BentoBoxChainId = keyof typeof BENTOBOX_SUBGRAPH_NAME

export const BLOCKS_SUBGRAPH_NAME: Record<number, string> = {
  [ChainId.ETHEREUM]: 'blocklytics/ethereum-blocks',
  [ChainId.GNOSIS]: 'matthewlilley/xdai-blocks',
  [ChainId.POLYGON]: 'matthewlilley/polygon-blocks',
  [ChainId.POLYGON_ZKEVM]: 'blocks-polygon-zkevm/v0.0.2',
  [ChainId.FANTOM]: 'matthewlilley/fantom-blocks',
  [ChainId.BSC]: 'matthewlilley/bsc-blocks',
  [ChainId.HARMONY]: 'sushiswap/harmony-blocks',
  [ChainId.AVALANCHE]: 'matthewlilley/avalanche-blocks',
  [ChainId.CELO]: 'ubeswap/celo-blocks',
  [ChainId.ARBITRUM]: 'sushiswap/arbitrum-blocks',
  [ChainId.OKEX]: 'okexchain-blocks/oec',
  [ChainId.HECO]: 'hecoblocks/heco',
  [ChainId.MOONRIVER]: 'sushiswap/moonriver-blocks',
  [ChainId.FUSE]: 'sushiswap/fuse-blocks',
  // [ChainId.KOVAN]: 'blocklytics/kovan-blocks',
  [ChainId.MOONBEAM]: 'sushiswap/moonbeam-blocks',
  [ChainId.OPTIMISM]: 'beethovenxfi/optimism-blocks',
  [ChainId.KAVA]: 'sushiswap/blocks-kava',
  [ChainId.METIS]: 'sushiswap/blocks-metis',
  [ChainId.ARBITRUM_NOVA]: 'sushiswap/blocks-arbitrum-nova',
  [ChainId.BOBA]: 'sushiswap/blocks-boba',
  [ChainId.BOBA_AVAX]: 'sushiswap/blocks-boba-avax',
  [ChainId.BOBA_BNB]: 'sushiswap/blocks-boba-bnb',
  [ChainId.BTTC]: 'sushiswap/blocks-bttc',
  [ChainId.THUNDERCORE]: 'sushiswap/blocks-thundercore',
  [ChainId.CORE]: 'sushiswap/blocks-core',
  [ChainId.BASE]: 'blocks-base/v0.0.1',
  [ChainId.LINEA]: 'sushiswap/blocks-linea',
  [ChainId.SCROLL]: 'blocks-scroll/v0.0.1',
  [ChainId.FILECOIN]: 'sushiswap/blocks',
  [ChainId.HAQQ]: 'sushi/blocks-haqq',
  [ChainId.ZETACHAIN]: 'blocks-zetachain/1.0.0/gn',
  [ChainId.BLAST]: 'sushiswap/blocks-blast/gn',
} as const

export const SECONDS_BETWEEN_BLOCKS: Record<number, number> = {
  [ChainId.ETHEREUM]: 12,
  [ChainId.GNOSIS]: 5,
  [ChainId.POLYGON]: 2,
  [ChainId.POLYGON_ZKEVM]: 5,
  [ChainId.FANTOM]: 2,
  [ChainId.BSC]: 3,
  [ChainId.HARMONY]: 2,
  [ChainId.AVALANCHE]: 2,
  [ChainId.CELO]: 5,
  [ChainId.ARBITRUM]: 0.25,
  [ChainId.OKEX]: 3.8,
  [ChainId.HECO]: 3,
  [ChainId.MOONRIVER]: 12.2,
  [ChainId.FUSE]: 5,
  // [ChainId.KOVAN]: 4,
  [ChainId.MOONBEAM]: 12.2,
  [ChainId.OPTIMISM]: 2,
  [ChainId.KAVA]: 6.3,
  [ChainId.METIS]: 4.5,
  [ChainId.ARBITRUM_NOVA]: 1,
  [ChainId.BOBA]: 250,
  [ChainId.BOBA_AVAX]: 612,
  [ChainId.BOBA_BNB]: 0.5,
  [ChainId.BTTC]: 2,
  [ChainId.THUNDERCORE]: 1,
  [ChainId.SCROLL]: 3,
} as const

export const EXCHANGE_SUBGRAPH_NAME: Record<number, string> = {
  [ChainId.AVALANCHE]: 'sushiswap/exchange-avalanche',
  [ChainId.ARBITRUM]: 'sushiswap/exchange-arbitrum-backup',
  [ChainId.BSC]: 'sushiswap/bsc-exchange',
  [ChainId.CELO]: 'sushiswap/exchange-celo',
  [ChainId.ETHEREUM]: 'sushiswap/exchange-ethereum',
  [ChainId.FANTOM]: 'sushiswap/exchange-fantom',
  [ChainId.FUSE]: 'sushiswap/exchange-fuse',
  [ChainId.GNOSIS]: 'sushiswap/xdai-exchange',
  [ChainId.MOONBEAM]: 'sushiswap/exchange-moonbeam',
  [ChainId.MOONRIVER]: 'sushiswap/exchange-moonriver',
  [ChainId.HARMONY]: 'sushiswap/exchange-harmony',
  [ChainId.ARBITRUM_NOVA]: 'sushi-0m/sushiswap-arbitrum-nova',
  [ChainId.POLYGON]: 'sushiswap/exchange-polygon',
  [ChainId.BOBA]: 'sushi-0m/sushiswap-boba',
  [ChainId.BOBA_AVAX]: 'sushi-0m/sushiswap-boba-avax',
  [ChainId.BOBA_BNB]: 'sushi-0m/sushiswap-boba-bnb',
} as const

export const SUSHISWAP_SUBGRAPH_NAME: Record<number, string> = {
  [ChainId.ETHEREUM]: 'sushi-v2/sushiswap-ethereum',
  [ChainId.AVALANCHE]: 'sushi-v2/sushiswap-avalanche',
  [ChainId.ARBITRUM]: 'sushi-v2/sushiswap-arbitrum',
  [ChainId.BSC]: 'sushi-v2/sushiswap-bsc',
  [ChainId.CELO]: 'sushi-v2/sushiswap-celo',
  [ChainId.FANTOM]: 'sushi-v2/sushiswap-fantom',
  [ChainId.FUSE]: 'sushi-v2/sushiswap-fuse',
  [ChainId.GNOSIS]: 'sushi-v2/sushiswap-gnosis',
  [ChainId.MOONBEAM]: 'sushi-v2/sushiswap-moonbeam',
  [ChainId.MOONRIVER]: 'sushi-v2/sushiswap-moonriver',
  [ChainId.HARMONY]: 'olastenberg/sushiswap-harmony-fix',
  [ChainId.ARBITRUM_NOVA]: 'sushi-0m/sushiswap-arbitrum-nova',
  [ChainId.BOBA]: 'sushi-v2/sushiswap-boba',
  [ChainId.POLYGON]: 'sushi-v2/sushiswap-polygon',
  [ChainId.BOBA_AVAX]: 'sushi-0m/sushiswap-boba-avax',
  [ChainId.BOBA_BNB]: 'sushi-0m/sushiswap-boba-bnb',
  [ChainId.BASE]: 'sushiswap-base/v0.0.1',
  [ChainId.SCROLL]: 'sushiswap-scroll/v0.0.1',
  [ChainId.KAVA]: 'sushi-v2/sushiswap-kava',
  [ChainId.METIS]: 'sushi-v2/sushiswap-metis',
  [ChainId.BTTC]: 'sushi-v2/sushiswap-bttc',
  [ChainId.FILECOIN]: 'sushiswap/sushiswap-filecoin',
  [ChainId.ZETACHAIN]: 'sushiswap-zetachain/1.0.0/gn',
  [ChainId.THUNDERCORE]: 'sushi-v2/sushiswap-thundercore',
  [ChainId.CORE]: 'sushi-v2/sushiswap-core',
  [ChainId.HAQQ]: 'sushi/sushiswap-haqq',
  [ChainId.OPTIMISM]: 'sushi-subgraphs/sushiswap-optimism',
  [ChainId.LINEA]: 'sushiswap/sushiswap-linea',
  [ChainId.POLYGON_ZKEVM]: 'v2-polygon-zkevm/v0.0.1',
  [ChainId.BLAST]: 'sushiswap/sushiswap-blast/gn',
} as const

export const SUSHISWAP_V3_SUBGRAPH_NAME: Record<number, string> = {
  [ChainId.ARBITRUM_NOVA]: 'sushi-v3/v3-arbitrum-nova',
  [ChainId.ARBITRUM]: 'sushi-v3/v3-arbitrum',
  [ChainId.AVALANCHE]: 'sushi-v3/v3-avalanche',
  [ChainId.BSC]: 'sushi-v3/v3-bsc',
  [ChainId.BOBA]: 'sushi-v3/v3-boba',
  [ChainId.ETHEREUM]: 'sushi-v3/v3-ethereum',
  [ChainId.FANTOM]: 'sushi-v3/v3-fantom',
  [ChainId.FUSE]: 'sushi-v3/v3-fuse',
  [ChainId.GNOSIS]: 'sushi-v3/v3-gnosis',
  [ChainId.MOONRIVER]: 'sushi-v3/v3-moonriver',
  [ChainId.OPTIMISM]: 'sushi-v3/v3-optimism',
  [ChainId.POLYGON]: 'sushi-v3/v3-polygon',
  [ChainId.POLYGON_ZKEVM]: 'v3-polygon-zkevm/v0.0.2',
  [ChainId.THUNDERCORE]: 'sushi-v3/v3-thundercore',
  [ChainId.CORE]: 'sushi-v3/v3-core',
  [ChainId.BASE]: 'v3-base/v0.0.1',
  [ChainId.LINEA]: 'sushi-v3/v3-linea',
  [ChainId.SCROLL]: 'v3-scroll/v0.0.1',
  [ChainId.KAVA]: 'sushi-v3/v3-kava',
  [ChainId.METIS]: 'sushi-v3/v3-metis',
  [ChainId.BTTC]: 'sushi-v3/v3-bttc',
  [ChainId.FILECOIN]: 'sushiswap/v3-filecoin',
  [ChainId.HAQQ]: 'sushi/v3-haqq',
  [ChainId.ZETACHAIN]: 'v3-zetachain/1.0.0/gn',
  [ChainId.BLAST]: 'sushiswap/v3-blast/gn',
}

export const TRIDENT_SUBGRAPH_NAME: Record<number, string> = {
  [ChainId.POLYGON]: 'sushi-v2/trident-polygon',
  [ChainId.OPTIMISM]: 'sushi-v2/trident-optimism',
  [ChainId.KAVA]: 'sushi-qa/trident-kava',
  [ChainId.METIS]: 'sushi-v2/trident-metis',
  [ChainId.BTTC]: 'sushi-v2/trident-bttc',
  [ChainId.ARBITRUM]: 'sushi-v2/trident-arbitrum',
  [ChainId.BSC]: 'sushi-v2/trident-bsc',
  [ChainId.AVALANCHE]: 'sushi-v2/trident-avalanche',
} as const

export const TRIDENT_SUBGRAPH_START_BLOCK: Record<
  keyof typeof TRIDENT_SUBGRAPH_NAME,
  number
> = {
  [ChainId.POLYGON]: 34188953,
  [ChainId.OPTIMISM]: 7464195,
  [ChainId.KAVA]: 162097,
  [ChainId.METIS]: 3030678,
  [ChainId.BTTC]: 13304596,
  [ChainId.ARBITRUM]: 43756724,
  [ChainId.BSC]: 23136876,
  [ChainId.AVALANCHE]: 22495996,
} as const

export const MINICHEF_SUBGRAPH_NAME = {
  [ChainId.POLYGON]: 'jiro-ono/minichef-staging-updates', // new trident subgraph not synced yet
  [ChainId.GNOSIS]: 'jiro-ono/gnosis-minichef-staging',
  // [ChainId.HARMONY]: 'sushiswap/harmony-minichef', // subgraph broken
  [ChainId.ARBITRUM]: 'jiro-ono/arbitrum-minichef-staging',
  [ChainId.CELO]: 'sushiswap/celo-minichef-v2',
  [ChainId.MOONRIVER]: 'sushiswap/moonriver-minichef',
  [ChainId.FUSE]: 'sushiswap/fuse-minichef',
  [ChainId.FANTOM]: 'sushiswap/fantom-minichef',
  [ChainId.MOONBEAM]: 'sushiswap/moonbeam-minichef',
  [ChainId.KAVA]: 'sushiswap/kava-minichef', //block subgraph not synced yet
  [ChainId.METIS]: 'sushiswap/metis-minichef',
  [ChainId.BOBA]: 'sushiswap/minichef-boba',
  [ChainId.ARBITRUM_NOVA]: 'sushiswap/minichef-arbitrum-nova',
  [ChainId.BTTC]: 'sushiswap/minichef-bttc',
  [ChainId.OPTIMISM]: 'sushiswap/minichef-optimism',
  [ChainId.AVALANCHE]: 'sushiswap/minichef-avalanche',
  [ChainId.BSC]: 'sushiswap/minichef-bsc',
} as const

export const MASTERCHEF_V1_SUBGRAPH_NAME =
  'jiro-ono/masterchef-staging' as const
export const MASTERCHEF_V2_SUBGRAPH_NAME = 'sushiswap/master-chefv2' as const

export const FURO_ENABLED_NETWORKS = [
  ChainId.ETHEREUM,
  ChainId.ARBITRUM,
  ChainId.AVALANCHE,
  ChainId.BSC,
  ChainId.FANTOM,
  ChainId.GNOSIS,
  ChainId.HARMONY,
  ChainId.MOONBEAM,
  ChainId.MOONRIVER,
  ChainId.OPTIMISM,
  ChainId.POLYGON,
] as const

// TODO: Make typesafe
export const FURO_SUBGRAPH_NAME: Record<string, string> = {
  [ChainId.ETHEREUM]: 'sushi-subgraphs/furo-ethereum',
  // [ChainId.GÖRLI]: 'sushi-subgraphs/furo-goerli',
  [ChainId.ARBITRUM]: 'sushi-subgraphs/furo-arbitrum',
  [ChainId.AVALANCHE]: 'sushi-subgraphs/furo-avalanche',
  [ChainId.BSC]: 'sushi-subgraphs/furo-bsc',
  [ChainId.FANTOM]: 'sushi-subgraphs/furo-fantom',
  [ChainId.GNOSIS]: 'sushi-subgraphs/furo-gnosis',
  [ChainId.HARMONY]: 'sushi-subgraphs/furo-harmony',
  [ChainId.MOONBEAM]: 'sushi-subgraphs/furo-moonbeam',
  [ChainId.MOONRIVER]: 'sushi-subgraphs/furo-moonriver',
  [ChainId.OPTIMISM]: 'sushi-subgraphs/furo-optimism',
  [ChainId.POLYGON]: 'sushi-subgraphs/furo-polygon',
} as const

export const KASHI_SUBGRAPH_NAME: Record<number, string> = {
  [ChainId.ARBITRUM]: 'sushiswap/kashi-arbitrum',
} as const

export const CONCENTRATED_SUBGRAPH_NAME: Record<number, string> = {
  [ChainId.ETHEREUM]: 'uniswap/uniswap-v3',
  [ChainId.ARBITRUM]: 'ianlapham/arbitrum-minimal',
}

export const STEER_ENABLED_NETWORKS = [
  ChainId.POLYGON,
  ChainId.AVALANCHE,
  ChainId.OPTIMISM,
  ChainId.ARBITRUM,
  ChainId.BSC,
  ChainId.CELO,
  ChainId.BASE,
  ChainId.THUNDERCORE,
  ChainId.METIS,
  ChainId.POLYGON_ZKEVM,
  ChainId.KAVA,
  ChainId.LINEA,
  ChainId.SCROLL,
] as const

export type SteerChainId = (typeof STEER_ENABLED_NETWORKS)[number]

export const STEER_SUBGRAPH_URL: Record<SteerChainId, string> = {
  [ChainId.POLYGON]:
    'api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-polygon',
  [ChainId.BSC]:
    'api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-bsc',
  [ChainId.OPTIMISM]:
    'api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-optimism',
  [ChainId.ARBITRUM]:
    'api.thegraph.com/subgraphs/name/steerprotocol/steer-protocol-arbitrum',
  // [ChainId.Evmos]: 'subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-evmos/api',
  [ChainId.THUNDERCORE]:
    'subgraph.steer.finance/thundercore/subgraphs/name/steerprotocol/steer-thundercore',
  [ChainId.METIS]:
    'subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-metis/api',
  [ChainId.BASE]:
    'subgraph.satsuma-prod.com/769a117cc018/steer/steer-protocol-base/api',
  [ChainId.AVALANCHE]:
    'api.thegraph.com/subgraphs/name/rakeshbhatt10/avalance-test-subgraph',
  [ChainId.POLYGON_ZKEVM]:
    'http://13.228.90.202:8000/subgraphs/name/steerprotocol/steer-zkevm',
  [ChainId.CELO]:
    'api.thegraph.com/subgraphs/name/rakeshbhatt10/steer-test-celo',
  [ChainId.KAVA]:
    'subgraph.steer.finance/kava/subgraphs/name/steerprotocol/steer-kava-evm',
  [ChainId.LINEA]:
    'subgraph.steer.finance/linea/subgraphs/name/steerprotocol/steer-linea',
  [ChainId.SCROLL]:
    'subgraph.steer.finance/scroll/subgraphs/name/steerprotocol/steer-scroll',
  // [ChainId.MANTA]: 'subgraph.steer.finance/manta/subgraphs/name/steerprotocol/steer-manta'
}

export const DEFAULT_CHAIN_ID = ChainId.ETHEREUM
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID]

export const isTridentChain = (chainId: ChainId): chainId is TridentChainId =>
  Object.keys(TRIDENT_SUBGRAPH_NAME).map(Number).includes(chainId)

export const isSushiSwapChain = (
  chainId: ChainId,
): chainId is SushiSwapChainId =>
  Object.keys(SUSHISWAP_SUBGRAPH_NAME).map(Number).includes(chainId)

export const isSushiSwapV3Chain = (
  chainId: ChainId,
): chainId is SushiSwapV3ChainId =>
  Object.keys(SUSHISWAP_V3_SUBGRAPH_NAME).map(Number).includes(chainId)
