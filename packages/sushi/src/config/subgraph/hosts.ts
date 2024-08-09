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
export const HAQQ_HOST = 'haqq.graph.p2p.org/subgraphs/name'
export const PCS_STUDIO_HOST = 'api.studio.thegraph.com/query/45376'
export const SUSHI_GOLDSKY_HOST =
  'api.goldsky.com/api/public/project_cls39ugcfyhbq01xl9tsf6g38/subgraphs'
export const SUSHI_DEDICATED_GOLDSKY_HOST =
  'api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs'
export const GOLDSKY_COMMUNITY_HOST =
  'api.goldsky.com/api/public/project_cl8ylkiw00krx0hvza0qw17vn/subgraphs'
export const WAGMI_METIS_HOST = 'metis.graph.wagmi.com/subgraphs/name'
export const WAGMI_KAVA_HOST = 'kava.graph.wagmi.com/subgraphs/name'
export const METIS_0XGRAPH_HOST =
  'metisapi.0xgraph.xyz/api/public/fc1ae952-7a36-44ac-9e9b-f46d70cedf7d/subgraphs'
export const SKALE_HOST =
  'elated-tan-skat-graph.skalenodes.com:8000/subgraphs/name'

const SUSHI_DOMAIN_RESTRICTED_API_KEY = '5d5d00365d2b8f675e12952d6eb5b9b0'
const DECENTRALIZED_NETWORK_KEY =
  process.env['SUSHI_GRAPH_KEY'] ||
  process.env['NEXT_PUBLIC_SUSHI_GRAPH_KEY'] ||
  SUSHI_DOMAIN_RESTRICTED_API_KEY
export const DECENTRALIZED_HOST_BY_SUBGRAPH_ID = `gateway-arbitrum.network.thegraph.com/api/${DECENTRALIZED_NETWORK_KEY}/subgraphs/id`
export const DECENTRALIZED_HOST_BY_DEPLOYMENT_ID = `gateway-arbitrum.network.thegraph.com/api/${DECENTRALIZED_NETWORK_KEY}/deployments/id`

export const SUSHI_DATA_API_HOST =
  process.env['SUSHI_DATA_API_HOST'] ||
  process.env['NEXT_PUBLIC_SUSHI_DATA_API_HOST'] ||
  'data.sushi.com/graphql'
