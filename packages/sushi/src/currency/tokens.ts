import { ChainId } from '../chain/index.js'
import { Token } from './Token.js'
import {
  AAVE_ADDRESS,
  AGEUR_ADDRESS,
  AMPL_ADDRESS,
  ANKR_ADDRESS,
  APE_ADDRESS,
  ARB_ADDRESS,
  BAL_ADDRESS,
  BCT_ADDRESS,
  BUSD_ADDRESS,
  COMP_ADDRESS,
  CRV_ADDRESS,
  DAI_ADDRESS,
  ENJ_ADDRESS,
  FEI_ADDRESS,
  FRAX_ADDRESS,
  FXS_ADDRESS,
  GALA_ADDRESS,
  GNO_ADDRESS,
  GNS_ADDRESS,
  GRT_ADDRESS,
  JPY_ADDRESS,
  JUGNI_ADDRESS,
  KLIMA_ADDRESS,
  KNCv2_ADDRESS,
  KP3R_ADDRESS,
  LDO_ADDRESS,
  LINK_ADDRESS,
  LUSD_ADDRESS,
  MAI_ADDRESS,
  MANA_ADDRESS,
  MATIC_ADDRESS,
  MIM_ADDRESS,
  MKR_ADDRESS,
  NFTX_ADDRESS,
  OCEAN_ADDRESS,
  OHM_ADDRESS,
  OP_ADDRESS,
  PRIMATE_ADDRESS,
  QUICK_ADDRESS,
  RNDR_ADDRESS,
  SAND_ADDRESS,
  SNX_ADDRESS,
  STG_ADDRESS,
  SUSHI_ADDRESS,
  SWISE_ADDRESS,
  TEL_ADDRESS,
  TRIBE_ADDRESS,
  TUSD_ADDRESS,
  UNI_ADDRESS,
  USDB_ADDRESS,
  USDC_ADDRESS,
  USDT_ADDRESS,
  USD_PLUS_ADDRESS,
  WAVAX_ADDRESS,
  WBTC_ADDRESS,
  WETH9_ADDRESS,
  WNATIVE_ADDRESS,
  WORMHOLE_USDC_ADDRESS,
  WORMHOLE_WBTC_ADDRESS,
  WORMHOLE_WETH_ADDRESS,
  XSUSHI_ADDRESS,
  YFI_ADDRESS,
  axlDAI_ADDRESS,
  axlETH_ADDRESS,
  axlUSDC_ADDRESS,
  axlUSDT_ADDRESS,
  axlWBTC_ADDRESS,
  rETH2_ADDRESS,
  renBTC_ADDRESS,
  sETH2_ADDRESS,
} from './token-addresses.js'

function addressMapToTokenMap(
  {
    decimals,
    symbol,
    name,
  }: {
    decimals: number | string
    symbol?: string | undefined
    name?: string | undefined
  },
  map: Record<number | string, string>,
) {
  return Object.fromEntries(
    Object.entries(map).map(([chainId, address]) => [
      chainId,
      new Token({
        chainId,
        address,
        decimals,
        symbol,
        name,
      }),
    ]),
  )
}

export const AMPL = addressMapToTokenMap(
  { decimals: 9, symbol: 'AMPL', name: 'Ampleforth' },
  AMPL_ADDRESS,
)

export const SAND = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'SAND',
    name: 'SAND',
  },
  SAND_ADDRESS,
) as Record<keyof typeof SAND_ADDRESS, Token>

export const STG = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'STG',
    name: 'StargateToken',
  },
  STG_ADDRESS,
) as Record<keyof typeof STG_ADDRESS, Token>

export const GNS = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'GNS',
    name: 'Gains Network',
  },
  GNS_ADDRESS,
) as Record<keyof typeof GNS_ADDRESS, Token>

export const MANA = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'MANA',
    name: 'Decentraland',
  },
  MANA_ADDRESS,
) as Record<keyof typeof MANA_ADDRESS, Token>

export const MKR = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'MKR',
    name: 'Maker',
  },
  MKR_ADDRESS,
) as Record<keyof typeof MKR_ADDRESS, Token>

export const YFI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'YFI',
    name: 'yearn.finance',
  },
  YFI_ADDRESS,
) as Record<keyof typeof YFI_ADDRESS, Token>

export const ENJ = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'ENJ',
    name: 'Enjin Coin',
  },
  ENJ_ADDRESS,
) as Record<keyof typeof ENJ_ADDRESS, Token>

export const CRV = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'CRV',
    name: 'Curve DAO Token',
  },
  CRV_ADDRESS,
) as Record<keyof typeof CRV_ADDRESS, Token>

export const SNX = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'SNX',
    name: 'Synthetix Network Token',
  },
  SNX_ADDRESS,
) as Record<keyof typeof SNX_ADDRESS, Token>

export const GALA = addressMapToTokenMap(
  {
    decimals: 8,
    symbol: 'GALA',
    name: 'Gala',
  },
  GALA_ADDRESS,
) as Record<keyof typeof GALA_ADDRESS, Token>

export const MATIC = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'MATIC',
    name: 'Matic Token',
  },
  MATIC_ADDRESS,
) as Record<keyof typeof MATIC_ADDRESS, Token>

export const GNO = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'GNO',
    name: 'Gnosis Token',
  },
  GNO_ADDRESS,
) as Record<keyof typeof GNO_ADDRESS, Token>

export const ARB = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'ARB',
    name: 'Arbitrum',
  },
  ARB_ADDRESS,
) as Record<keyof typeof ARB_ADDRESS, Token>

export const KP3R = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'KP3R',
    name: 'Keep3rV1',
  },
  KP3R_ADDRESS,
) as Record<keyof typeof KP3R_ADDRESS, Token>

export const LDO = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'LDO',
    name: 'Lido DAO Token',
  },
  LDO_ADDRESS,
) as Record<keyof typeof LDO_ADDRESS, Token>

export const APE = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'APE',
    name: 'ApeCoin',
  },
  APE_ADDRESS,
) as Record<keyof typeof APE_ADDRESS, Token>

export const PRIMATE = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'PRIMATE',
    name: 'PRIMATE',
  },
  PRIMATE_ADDRESS,
) as Record<keyof typeof PRIMATE_ADDRESS, Token>

export const rETH2 = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'rETH2',
    name: 'StakeWise Reward ETH2',
  },
  rETH2_ADDRESS,
) as Record<keyof typeof rETH2_ADDRESS, Token>

export const sETH2 = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'sETH2',
    name: 'StakeWise Staked ETH2',
  },
  sETH2_ADDRESS,
) as Record<keyof typeof sETH2_ADDRESS, Token>

export const SWISE = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'SWISE',
    name: 'StakeWise',
  },
  SWISE_ADDRESS,
) as Record<keyof typeof SWISE_ADDRESS, Token>

export const FEI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'FEI',
    name: 'Fei USD',
  },
  FEI_ADDRESS,
) as Record<keyof typeof FEI_ADDRESS, Token>

export const TRIBE = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'TRIBE',
    name: 'Tribe',
  },
  TRIBE_ADDRESS,
) as Record<keyof typeof TRIBE_ADDRESS, Token>

export const renBTC = addressMapToTokenMap(
  {
    decimals: 8,
    symbol: 'renBTC',
    name: 'renBTC',
  },
  renBTC_ADDRESS,
) as Record<keyof typeof renBTC_ADDRESS, Token>

export const NFTX = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'NFTX',
    name: 'NFTX',
  },
  NFTX_ADDRESS,
) as Record<keyof typeof NFTX_ADDRESS, Token>

export const OHM = addressMapToTokenMap(
  {
    decimals: 9,
    symbol: 'OHM',
    name: 'Olympus',
  },
  OHM_ADDRESS,
) as Record<keyof typeof OHM_ADDRESS, Token>

export const WBTC = addressMapToTokenMap(
  {
    decimals: 8,
    symbol: 'WBTC',
    name: 'Wrapped BTC',
  },
  WBTC_ADDRESS,
) as Record<keyof typeof WBTC_ADDRESS, Token>

export const UNI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'UNI',
    name: 'Uniswap',
  },
  UNI_ADDRESS,
) as Record<keyof typeof UNI_ADDRESS, Token>

export const BUSD = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'BUSD',
    name: 'BUSD Token',
  },
  BUSD_ADDRESS,
) as Record<keyof typeof BUSD_ADDRESS, Token>

export const MAI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'MAI',
    name: 'Mai Stablecoin',
  },
  MAI_ADDRESS,
) as Record<keyof typeof MAI_ADDRESS, Token>

export const TUSD = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'TUSD',
    name: 'TrueUSD',
  },
  TUSD_ADDRESS,
) as Record<keyof typeof TUSD_ADDRESS, Token>

export const AGEUR = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'agEUR',
    name: 'agEUR',
  },
  AGEUR_ADDRESS,
) as Record<keyof typeof AGEUR_ADDRESS, Token>

export const ANKR = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'ANKR',
    name: 'Anker Network',
  },
  ANKR_ADDRESS,
) as Record<keyof typeof ANKR_ADDRESS, Token>

export const AAVE = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'AAVE',
    name: 'Aave Token',
  },
  AAVE_ADDRESS,
) as Record<keyof typeof AAVE_ADDRESS, Token>

export const COMP = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'COMP',
    name: 'Compound ',
  },
  COMP_ADDRESS,
) as Record<keyof typeof COMP_ADDRESS, Token>

export const JPY = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'JPYC',
    name: 'JPY Coin',
  },
  JPY_ADDRESS,
) as Record<keyof typeof JPY_ADDRESS, Token>

export const LUSD = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'LUSD',
    name: 'LUSD Stablecoin',
  },
  LUSD_ADDRESS,
) as Record<keyof typeof LUSD_ADDRESS, Token>

export const WETH9 = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  WETH9_ADDRESS,
) as Record<keyof typeof WETH9_ADDRESS, Token>

export const WNATIVE = {
  [ChainId.ETHEREUM]: WETH9[ChainId.ETHEREUM],
  [ChainId.SEPOLIA]: WETH9[ChainId.SEPOLIA],
  // [ChainId.ROPSTEN]: WETH9[ChainId.ROPSTEN],
  // [ChainId.RINKEBY]: WETH9[ChainId.RINKEBY],
  // [ChainId.GÖRLI]: WETH9[ChainId.GÖRLI],
  // [ChainId.KOVAN]: WETH9[ChainId.KOVAN],
  [ChainId.OPTIMISM]: WETH9[ChainId.OPTIMISM],
  [ChainId.FANTOM]: new Token({
    chainId: ChainId.FANTOM,
    address: WNATIVE_ADDRESS[ChainId.FANTOM],
    decimals: 18,
    symbol: 'WFTM',
    name: 'Wrapped FTM',
  }),
  [ChainId.FANTOM_TESTNET]: new Token({
    chainId: ChainId.FANTOM_TESTNET,
    address: WNATIVE_ADDRESS[ChainId.FANTOM_TESTNET],
    decimals: 18,
    symbol: 'WFTM',
    name: 'Wrapped FTM',
  }),
  [ChainId.POLYGON]: new Token({
    chainId: ChainId.POLYGON,
    address: WNATIVE_ADDRESS[ChainId.POLYGON],
    decimals: 18,
    symbol: 'WMATIC',
    name: 'Wrapped Matic',
  }),
  [ChainId.POLYGON_TESTNET]: new Token({
    chainId: ChainId.POLYGON_TESTNET,
    address: WNATIVE_ADDRESS[ChainId.POLYGON_TESTNET],
    decimals: 18,
    symbol: 'WMATIC',
    name: 'Wrapped Matic',
  }),
  [ChainId.GNOSIS]: new Token({
    chainId: ChainId.GNOSIS,
    address: WNATIVE_ADDRESS[ChainId.GNOSIS],
    decimals: 18,
    symbol: 'WXDAI',
    name: 'Wrapped xDai',
  }),
  [ChainId.BSC]: new Token({
    chainId: ChainId.BSC,
    address: WNATIVE_ADDRESS[ChainId.BSC],
    decimals: 18,
    symbol: 'WBNB',
    name: 'Wrapped BNB',
  }),
  [ChainId.BSC_TESTNET]: new Token({
    chainId: ChainId.BSC_TESTNET,
    address: WNATIVE_ADDRESS[ChainId.BSC_TESTNET],
    decimals: 18,
    symbol: 'WBNB',
    name: 'Wrapped BNB',
  }),
  [ChainId.ARBITRUM]: WETH9[ChainId.ARBITRUM],
  [ChainId.ARBITRUM_TESTNET]: WETH9[ChainId.ARBITRUM_TESTNET],
  [ChainId.ARBITRUM_NOVA]: WETH9[ChainId.ARBITRUM_NOVA],
  [ChainId.AVALANCHE]: new Token({
    chainId: ChainId.AVALANCHE,
    address: WNATIVE_ADDRESS[ChainId.AVALANCHE],
    decimals: 18,
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
  }),
  [ChainId.AVALANCHE_TESTNET]: new Token({
    chainId: ChainId.AVALANCHE_TESTNET,
    address: WNATIVE_ADDRESS[ChainId.AVALANCHE_TESTNET],
    decimals: 18,
    symbol: 'WAVAX',
    name: 'Wrapped AVAX',
  }),
  [ChainId.HECO]: new Token({
    chainId: ChainId.HECO,
    address: WNATIVE_ADDRESS[ChainId.HECO],
    decimals: 18,
    symbol: 'WHT',
    name: 'Wrapped HT',
  }),
  // [ChainId.HECO_TESTNET]: new Token({
  //   chainId: ChainId.HECO_TESTNET,
  //   address: WNATIVE_ADDRESS[ChainId.HECO_TESTNET],
  //   decimals: 18,
  //   symbol: 'WHT',
  //   name: 'Wrapped HT',
  // }),
  [ChainId.HARMONY]: new Token({
    chainId: ChainId.HARMONY,
    address: WNATIVE_ADDRESS[ChainId.HARMONY],
    decimals: 18,
    symbol: 'WONE',
    name: 'Wrapped ONE',
  }),
  // [ChainId.HARMONY_TESTNET]: new Token({
  //   chainId: ChainId.HARMONY_TESTNET,
  //   address: WNATIVE_ADDRESS[ChainId.HARMONY_TESTNET],
  //   decimals: 18,
  //   symbol: 'WONE',
  //   name: 'Wrapped ONE',
  // }),
  [ChainId.OKEX]: new Token({
    chainId: ChainId.OKEX,
    address: WNATIVE_ADDRESS[ChainId.OKEX],
    decimals: 18,
    symbol: 'WOKT',
    name: 'Wrapped OKExChain',
  }),
  // [ChainId.OKEX_TESTNET]: new Token({
  //   chainId: ChainId.OKEX_TESTNET,
  //   address: WNATIVE_ADDRESS[ChainId.OKEX_TESTNET],
  //   decimals: 18,
  //   symbol: 'WOKT',
  //   name: 'Wrapped OKExChain',
  // }),
  [ChainId.CELO]: new Token({
    chainId: ChainId.CELO,
    address: WNATIVE_ADDRESS[ChainId.CELO],
    decimals: 18,
    symbol: 'CELO',
    name: 'Celo',
  }),
  [ChainId.PALM]: new Token({
    chainId: ChainId.PALM,
    address: WNATIVE_ADDRESS[ChainId.PALM],
    decimals: 18,
    symbol: 'WPALM',
    name: 'Wrapped Palm',
  }),
  [ChainId.MOONRIVER]: new Token({
    chainId: ChainId.MOONRIVER,
    address: WNATIVE_ADDRESS[ChainId.MOONRIVER],
    decimals: 18,
    symbol: 'WMOVR',
    name: 'Wrapped Moonriver',
  }),
  [ChainId.FUSE]: new Token({
    chainId: ChainId.FUSE,
    address: WNATIVE_ADDRESS[ChainId.FUSE],
    decimals: 18,
    symbol: 'WFUSE',
    name: 'Wrapped Fuse',
  }),
  [ChainId.TELOS]: new Token({
    chainId: ChainId.TELOS,
    address: WNATIVE_ADDRESS[ChainId.TELOS],
    decimals: 18,
    symbol: 'WTLOS',
    name: 'Wrapped Telos',
  }),
  [ChainId.MOONBEAM]: new Token({
    chainId: ChainId.MOONBEAM,
    address: WNATIVE_ADDRESS[ChainId.MOONBEAM],
    decimals: 18,
    symbol: 'WGLMR',
    name: 'Wrapped Glimmer',
  }),
  [ChainId.KAVA]: new Token({
    chainId: ChainId.KAVA,
    address: WNATIVE_ADDRESS[ChainId.KAVA],
    decimals: 18,
    symbol: 'WKAVA',
    name: 'Wrapped Kava',
  }),
  [ChainId.METIS]: new Token({
    chainId: ChainId.METIS,
    address: WNATIVE_ADDRESS[ChainId.METIS],
    decimals: 18,
    symbol: 'WMETIS',
    name: 'Wrapped Metis',
  }),
  [ChainId.BOBA]: WETH9[ChainId.BOBA],
  [ChainId.BOBA_AVAX]: new Token({
    chainId: ChainId.BOBA_AVAX,
    address: WNATIVE_ADDRESS[ChainId.BOBA_AVAX],
    decimals: 18,
    symbol: 'WBOBA',
    name: 'Wrapped Boba',
  }),
  [ChainId.BOBA_BNB]: new Token({
    chainId: ChainId.BOBA_BNB,
    address: WNATIVE_ADDRESS[ChainId.BOBA_BNB],
    decimals: 18,
    symbol: 'WBOBA',
    name: 'Wrapped Boba',
  }),
  [ChainId.BTTC]: new Token({
    chainId: ChainId.BTTC,
    address: WNATIVE_ADDRESS[ChainId.BTTC],
    decimals: 18,
    symbol: 'WBTT',
    name: 'Wrapped BitTorrent Token',
  }),
  // [ChainId.SEPOLIA]: WETH9[ChainId.SEPOLIA],
  // [ChainId.CONSENSUS_ZKEVM_TESTNET]: WETH9[ChainId.CONSENSUS_ZKEVM_TESTNET],
  // [ChainId.SCROLL_ALPHA_TESTNET]: WETH9[ChainId.SCROLL_ALPHA_TESTNET],
  // [ChainId.BASE_TESTNET]: WETH9[ChainId.BASE_TESTNET],
  [ChainId.THUNDERCORE]: new Token({
    chainId: ChainId.THUNDERCORE,
    address: WNATIVE_ADDRESS[ChainId.THUNDERCORE],
    decimals: 18,
    symbol: 'WTT',
    name: 'Wrapped Thunder Token',
  }),
  [ChainId.POLYGON_ZKEVM]: WETH9[ChainId.POLYGON_ZKEVM],
  [ChainId.HAQQ]: new Token({
    chainId: ChainId.HAQQ,
    address: WNATIVE_ADDRESS[ChainId.HAQQ],
    decimals: 18,
    symbol: 'WISLM',
    name: 'Wrapped Islamic Coin',
  }),
  [ChainId.CORE]: new Token({
    chainId: ChainId.CORE,
    address: WNATIVE_ADDRESS[ChainId.CORE],
    decimals: 18,
    symbol: 'WCORE',
    name: 'Wrapped Core',
  }),
  [ChainId.ZKSYNC_ERA]: WETH9[ChainId.ZKSYNC_ERA],
  [ChainId.LINEA]: WETH9[ChainId.LINEA],
  [ChainId.BASE]: WETH9[ChainId.BASE],
  [ChainId.SCROLL]: WETH9[ChainId.SCROLL],
  [ChainId.FILECOIN]: new Token({
    chainId: ChainId.FILECOIN,
    address: WNATIVE_ADDRESS[ChainId.FILECOIN],
    decimals: 18,
    symbol: 'WFIL',
    name: 'Wrapped FIL',
  }),
  [ChainId.ZETACHAIN]: new Token({
    chainId: ChainId.ZETACHAIN,
    address: WNATIVE_ADDRESS[ChainId.ZETACHAIN],
    decimals: 18,
    symbol: 'WZETA',
    name: 'Wrapped ZETA',
  }),
  [ChainId.CRONOS]: new Token({
    chainId: ChainId.CRONOS,
    address: WNATIVE_ADDRESS[ChainId.CRONOS],
    decimals: 18,
    symbol: 'WCRO',
    name: 'Wrapped CRO',
  }),
  [ChainId.BLAST]: WETH9[ChainId.BLAST],
} as const

export const SUSHI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'SUSHI',
    name: 'SushiToken',
  },
  SUSHI_ADDRESS,
) as Record<keyof typeof SUSHI_ADDRESS, Token>

export const XSUSHI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'XSUSHI',
    name: 'SushiBar',
  },
  XSUSHI_ADDRESS,
) as Record<keyof typeof XSUSHI_ADDRESS, Token>

export const axlUSDC: Record<keyof typeof axlUSDC_ADDRESS, Token> =
  addressMapToTokenMap(
    {
      decimals: 6,
      symbol: 'axlUSDC',
      name: 'Axelar Wrapped USDC',
    },
    axlUSDC_ADDRESS,
  ) as Record<keyof typeof axlUSDC_ADDRESS, Token>

export const axlUSDT: Record<keyof typeof axlUSDT_ADDRESS, Token> =
  addressMapToTokenMap(
    {
      decimals: 6,
      symbol: 'axlUSDT',
      name: 'Axelar Wrapped USDT',
    },
    axlUSDT_ADDRESS,
  ) as Record<keyof typeof axlUSDT_ADDRESS, Token>

export const axlDAI: Record<keyof typeof axlDAI_ADDRESS, Token> =
  addressMapToTokenMap(
    {
      decimals: 18,
      symbol: 'axlDAI',
      name: 'Axelar Wrapped DAI',
    },
    axlDAI_ADDRESS,
  ) as Record<keyof typeof axlDAI_ADDRESS, Token>

export const axlETH: Record<keyof typeof axlETH_ADDRESS, Token> =
  addressMapToTokenMap(
    {
      decimals: 18,
      symbol: 'axlETH',
      name: 'Axelar Wrapped ETH',
    },
    axlETH_ADDRESS,
  ) as Record<keyof typeof axlETH_ADDRESS, Token>

export const axlWBTC: Record<keyof typeof axlWBTC_ADDRESS, Token> =
  addressMapToTokenMap(
    {
      decimals: 8,
      symbol: 'axlWBTC',
      name: 'Axelar Wrapped BTC',
    },
    axlWBTC_ADDRESS,
  ) as Record<keyof typeof axlWBTC_ADDRESS, Token>

export const USD_PLUS: Record<keyof typeof USD_PLUS_ADDRESS, Token> =
  addressMapToTokenMap(
    {
      decimals: 6,
      symbol: 'USD+',
      name: 'USD+',
    },
    USD_PLUS_ADDRESS,
  ) as Record<keyof typeof USD_PLUS_ADDRESS, Token>

export const USDC: Record<keyof typeof USDC_ADDRESS, Token> = {
  ...(addressMapToTokenMap(
    {
      decimals: 6,
      symbol: 'USDC',
      name: 'USD Coin',
    },
    USDC_ADDRESS,
  ) as Omit<
    Record<keyof typeof USDC_ADDRESS, Token>,
    typeof ChainId.BSC & typeof ChainId.BSC_TESTNET
  >),
  [ChainId.BSC]: new Token({
    chainId: ChainId.BSC,
    address: USDC_ADDRESS[ChainId.BSC],
    decimals: 18,
    symbol: 'USDC',
    name: 'USD Coin',
  }),
  [ChainId.BOBA_BNB]: new Token({
    chainId: ChainId.BOBA_BNB,
    address: USDC_ADDRESS[ChainId.BOBA_BNB],
    decimals: 18,
    symbol: 'USDC',
    name: 'USD Coin',
  }),
} as const

export const USDT: Record<keyof typeof USDT_ADDRESS, Token> = {
  ...(addressMapToTokenMap(
    {
      decimals: 6,
      symbol: 'USDT',
      name: 'Tether USD',
    },
    USDT_ADDRESS,
  ) as Omit<
    Record<keyof typeof USDT_ADDRESS, Token>,
    typeof ChainId.BSC & typeof ChainId.BSC_TESTNET
  >),
  [ChainId.BSC]: new Token({
    chainId: ChainId.BSC,
    address: USDT_ADDRESS[ChainId.BSC],
    decimals: 18,
    symbol: 'USDT',
    name: 'Tether USD',
  }),
  [ChainId.BSC_TESTNET]: new Token({
    chainId: ChainId.BSC_TESTNET,
    address: USDT_ADDRESS[ChainId.BSC_TESTNET],
    decimals: 18,
    symbol: 'USDT',
    name: 'Tether USD',
  }),
  [ChainId.BOBA_BNB]: new Token({
    chainId: ChainId.BOBA_BNB,
    address: USDT_ADDRESS[ChainId.BOBA_BNB],
    decimals: 18,
    symbol: 'USDT',
    name: 'Tether USD',
  }),
}

export const DAI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  DAI_ADDRESS,
) as Record<keyof typeof DAI_ADDRESS, Token>

export const MIM = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'MIM',
    name: 'Magic Internet Money',
  },
  MIM_ADDRESS,
) as Record<keyof typeof MIM_ADDRESS, Token>

export const FRAX = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'FRAX',
    name: 'Frax',
  },
  FRAX_ADDRESS,
) as Record<keyof typeof FRAX_ADDRESS, Token>

export const FXS = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'FXS',
    name: 'Frax Share',
  },
  FXS_ADDRESS,
) as Record<keyof typeof FXS_ADDRESS, Token>

export const BCT = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'BCT',
    name: 'Toucan Protocol: Base Carbon Tonne',
  },
  BCT_ADDRESS,
) as Record<keyof typeof BCT_ADDRESS, Token>

export const KLIMA = addressMapToTokenMap(
  {
    decimals: 9,
    symbol: 'KLIMA',
    name: 'Klima DAO',
  },
  KLIMA_ADDRESS,
) as Record<keyof typeof KLIMA_ADDRESS, Token>

export const QUICK = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'QUICK',
    name: 'Quickswap',
  },
  QUICK_ADDRESS,
) as Record<keyof typeof QUICK_ADDRESS, Token>

export const OP = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'OP',
    name: 'Optimism',
  },
  OP_ADDRESS,
) as Record<keyof typeof OP_ADDRESS, Token>

export const OCEAN = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'OCEAN',
    name: 'Ocean Token',
  },
  OCEAN_ADDRESS,
) as Record<keyof typeof OCEAN_ADDRESS, Token>

export const BAL = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'BAL',
    name: 'Balancer',
  },
  BAL_ADDRESS,
) as Record<keyof typeof BAL_ADDRESS, Token>

export const WAVAX = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'WAVAX',
    name: 'Wrapped Avalanche Token',
  },
  WAVAX_ADDRESS,
) as Record<keyof typeof WAVAX_ADDRESS, Token>

export const KNCv2 = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'KNCv2',
    name: 'Kyber Network Crystal V2',
  },
  KNCv2_ADDRESS,
) as Record<keyof typeof KNCv2_ADDRESS, Token>

export const GRT = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'GRT',
    name: 'Graph Token',
  },
  GRT_ADDRESS,
) as Record<keyof typeof GRT_ADDRESS, Token>

export const TEL = addressMapToTokenMap(
  {
    decimals: 2,
    symbol: 'TEL',
    name: 'Telcoin',
  },
  TEL_ADDRESS,
) as Record<keyof typeof TEL_ADDRESS, Token>

export const RNDR = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'RNDR',
    name: 'Render Token',
  },
  RNDR_ADDRESS,
) as Record<keyof typeof RNDR_ADDRESS, Token>

export const LINK = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'LINK',
    name: 'ChainLink Token',
  },
  LINK_ADDRESS,
) as Record<keyof typeof LINK_ADDRESS, Token>

export const USDB = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'USDB',
    name: 'USD Blast',
  },
  USDB_ADDRESS,
) as Record<keyof typeof USDB_ADDRESS, Token>

export const WORMHOLE_USDC = addressMapToTokenMap(
  {
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin (Wormhole)',
  },
  WORMHOLE_USDC_ADDRESS,
) as Record<keyof typeof WORMHOLE_USDC_ADDRESS, Token>

export const WORMHOLE_WBTC = addressMapToTokenMap(
  {
    decimals: 8,
    symbol: 'WBTC',
    name: 'Wrapped BTC (Wormhole)',
  },
  WORMHOLE_WBTC_ADDRESS,
) as Record<keyof typeof WORMHOLE_WBTC_ADDRESS, Token>

export const WORMHOLE_WETH = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether (Wormhole)',
  },
  WORMHOLE_WETH_ADDRESS,
) as Record<keyof typeof WORMHOLE_WETH_ADDRESS, Token>

export const JUGNI = addressMapToTokenMap(
  {
    decimals: 18,
    symbol: 'JUGNI',
    name: 'Jugni',
  },
  JUGNI_ADDRESS,
) as Record<keyof typeof JUGNI_ADDRESS, Token>

export const THUNDERCORE_ANY_USDT = new Token({
  chainId: ChainId.THUNDERCORE,
  address: '0x0dcb0cb0120d355cde1ce56040be57add0185baa',
  decimals: 6,
  symbol: 'anyUSDT',
  name: 'Any Tether USD',
})

export const THUNDERCORE_ANY_USDC = new Token({
  chainId: ChainId.THUNDERCORE,
  address: '0xdc42728b0ea910349ed3c6e1c9dc06b5fb591f98',
  decimals: 18,
  symbol: 'anyUSDC',
  name: 'Any USD Coin',
})

export const THUNDERCORE_ANY_BUSD = new Token({
  chainId: ChainId.THUNDERCORE,
  address: '0xb12c13e66ade1f72f71834f2fc5082db8c091358',
  decimals: 18,
  symbol: 'anyBUSD',
  name: 'Any BUSD Token',
})

export const BTTC_BSC_BRIDGE_USDC = new Token({
  chainId: ChainId.BTTC,
  address: '0xca424b845497f7204d9301bd13ff87c0e2e86fcf',
  decimals: 18,
  symbol: 'USDC (BSC)',
  name: 'USD Coin (BSC)',
})
export const BTTC_ETHEREUM_BRIDGE_USDC = new Token({
  chainId: ChainId.BTTC,
  address: '0xae17940943ba9440540940db0f1877f101d39e8b',
  decimals: 6,
  symbol: 'USDC (Ethereum)',
  name: 'USD Coin (Ethereum)',
})
export const BTTC_TRON_BRIDGE_USDC = new Token({
  chainId: ChainId.BTTC,
  address: '0x935faa2fcec6ab81265b301a30467bbc804b43d3',
  decimals: 6,
  symbol: 'USDC (Tron)',
  name: 'USD Coin (Tron)',
})
export const BTTC_BSC_BRIDGE_USDT = new Token({
  chainId: ChainId.BTTC,
  address: '0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d',
  decimals: 18,
  symbol: 'USDT (BSC)',
  name: 'Tether USD (BSC)',
})
export const BTTC_ETHEREUM_BRIDGE_USDT = new Token({
  chainId: ChainId.BTTC,
  address: '0xe887512ab8bc60bcc9224e1c3b5be68e26048b8b',
  decimals: 6,
  symbol: 'USDT (Ethereum)',
  name: 'Tether USD (Ethereum)',
})
export const BTTC_TRON_BRIDGE_USDT = new Token({
  chainId: ChainId.BTTC,
  address: '0xdb28719f7f938507dbfe4f0eae55668903d34a15',
  decimals: 6,
  symbol: 'USDT (Tron)',
  name: 'Tether USD (Tron)',
})

export const BASE_BRIDGE_USDC = new Token({
  chainId: ChainId.BASE,
  address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  decimals: 6,
  symbol: 'USDbC',
  name: 'USD Base Coin',
})

export const ZETA_ETH_BRIDGE_USDC = new Token({
  chainId: ChainId.ZETACHAIN,
  address: '0x0cbe0dF132a6c6B4a2974Fa1b7Fb953CF0Cc798a',
  decimals: 6,
  symbol: 'USDC.ETH',
  name: 'ZetaChain ZRC20 USDC on ETH',
})
export const ZETA_BSC_BRIDGE_USDC = new Token({
  chainId: ChainId.ZETACHAIN,
  address: '0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0',
  decimals: 18,
  symbol: 'USDC.BSC',
  name: 'ZetaChain ZRC20 USDC on BSC',
})
export const ZETA_ETH_BRIDGE_USDT = new Token({
  chainId: ChainId.ZETACHAIN,
  address: '0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7',
  decimals: 6,
  symbol: 'USDT.ETH',
  name: 'ZetaChain ZRC20 USDT on ETH',
})
export const ZETA_BSC_BRIDGE_USDT = new Token({
  chainId: ChainId.ZETACHAIN,
  address: '0x91d4F0D54090Df2D81e834c3c8CE71C6c865e79F',
  decimals: 18,
  symbol: 'USDT.BSC',
  name: 'ZetaChain ZRC20 USDT on BSC',
})

export const FILECOIN_CELER_BRIDGE_USDC = new Token({
  chainId: ChainId.FILECOIN,
  address: '0x2421db204968A367CC2C866CD057fA754Cb84EdF',
  decimals: 6,
  symbol: 'ceUSDC',
  name: 'USD Coin (Celer)',
})

export const FILECOIN_CELER_BRIDGE_USDT = new Token({
  chainId: ChainId.FILECOIN,
  address: '0x422849b355039bc58f2780cc4854919fc9cfaf94',
  decimals: 6,
  symbol: 'ceUSDT',
  name: 'Tether USD (Celer)',
})

export const MUSD = new Token({
  chainId: ChainId.BLAST,
  address: '0x837fE561e9C5DFa73F607fDa679295DBC2Be5E40',
  name: 'Monoswap USD',
  symbol: 'MUSD',
  decimals: 18,
})
