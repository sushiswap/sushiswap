export const BA_LIST =
  'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json'

export const UNSUPPORTED_TOKEN_LIST_URLS: string[] = [BA_LIST]

export const SUSHI_DEFAULT_TOKEN_LIST = 'https://token-list.sushi.com'
export const SUSHI_CHAINLINK_TOKEN_LIST =
  'https://token-list.sushi.com/chainlink'

export const UNI_LIST = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
export const UNI_EXTENDED_LIST =
  'https://gateway.ipfs.io/ipns/extendedtokens.uniswap.org'

// const AAVE_LIST = 'tokenlist.aave.eth'

// const CMC_ALL_LIST =
//   'https://s3.coinmarketcap.com/generated/dex/tokens/eth-tokens-all.json'

const COINGECKO_LIST = 'https://tokens.coingecko.com/uniswap/all.json'
const COINGECK_BASE_LIST = 'https://tokens.coingecko.com/base/all.json'
const COINGECKO_BNB_LIST =
  'https://tokens.coingecko.com/binance-smart-chain/all.json'
const COINGECKO_ARBITRUM_LIST =
  'https://tokens.coingecko.com/arbitrum-one/all.json'
const COINGECKO_OPTIMISM_LIST =
  'https://tokens.coingecko.com/optimistic-ethereum/all.json'
const COINGECKO_CELO_LIST = 'https://tokens.coingecko.com/celo/all.json'
const COINGECKO_POLYGON_LIST =
  'https://tokens.coingecko.com/polygon-pos/all.json'
const COINGECKO_AVAX_LIST = 'https://tokens.coingecko.com/avalanche/all.json'

const COMPOUND_LIST =
  'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json'
const GEMINI_LIST = 'https://www.gemini.com/uniswap/manifest.json'
// const KLEROS_LIST = 't2crtokens.eth'
const SET_LIST =
  'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json'
// const WRAPPED_LIST = 'wrapped.tokensoft.eth'

export const OPTIMISM_LIST =
  'https://static.optimism.io/optimism.tokenlist.json'
export const ARBITRUM_LIST =
  'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json'
export const CELO_LIST =
  'https://celo-org.github.io/celo-token-list/celo.tokenlist.json'
export const PLASMA_BNB_LIST =
  'https://raw.githubusercontent.com/plasmadlt/plasma-finance-token-list/master/bnb.json'

export const LINEA_LIST =
  'https://raw.githubusercontent.com/Consensys/linea-token-list/main/json/linea-mainnet-token-fulllist.json'

// this is the default list of lists that are exposed to users
// lower index == higher priority for token import
export const DEFAULT_TOKEN_LIST_OF_TOKEN_LISTS_TO_DISPLAY: string[] = [
  SUSHI_DEFAULT_TOKEN_LIST,
  UNI_EXTENDED_LIST,
  COMPOUND_LIST,
  // AAVE_LIST,
  // CMC_ALL_LIST,
  COMPOUND_LIST,
  COINGECKO_LIST,
  COINGECK_BASE_LIST,
  COINGECKO_BNB_LIST,
  COINGECKO_ARBITRUM_LIST,
  COINGECKO_OPTIMISM_LIST,
  COINGECKO_CELO_LIST,
  COINGECKO_POLYGON_LIST,
  COINGECKO_AVAX_LIST,
  GEMINI_LIST,
  SET_LIST,
  ARBITRUM_LIST,
  OPTIMISM_LIST,
  CELO_LIST,
  PLASMA_BNB_LIST,
  LINEA_LIST,
]

export const DEFAULT_LIST_OF_LISTS: string[] = [
  ...DEFAULT_TOKEN_LIST_OF_TOKEN_LISTS_TO_DISPLAY,
  ...UNSUPPORTED_TOKEN_LIST_URLS, // need to load dynamic unsupported tokens as well
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  SUSHI_DEFAULT_TOKEN_LIST,
  SUSHI_CHAINLINK_TOKEN_LIST,
  OPTIMISM_LIST,
]

export const BLACKLIST_TOKEN_IDS: string[] = [
  // Fake Aptos token
  '0x8CDf7AF57E4c8B930e1B23c477c22f076530585e',
]
