import { ChainId } from '../../chain/index.js'
import { STARGATE_USDC, STARGATE_USDT } from '../../config/stargate.js'
import { Token } from '../Token.js'
import {
  BUSD,
  DAI,
  FRAX,
  LUSD,
  MIM,
  USDC,
  USDT,
  USD_PLUS,
  WORMHOLE_USDC,
  axlUSDC,
} from './tokens.js'

const THUNDERCORE_ANY_USDT = new Token({
  chainId: ChainId.THUNDERCORE,
  address: '0x0dcb0cb0120d355cde1ce56040be57add0185baa',
  decimals: 6,
  symbol: 'anyUSDT',
  name: 'Any Tether USD',
})

const THUNDERCORE_ANY_USDC = new Token({
  chainId: ChainId.THUNDERCORE,
  address: '0xdc42728b0ea910349ed3c6e1c9dc06b5fb591f98',
  decimals: 18,
  symbol: 'anyUSDC',
  name: 'Any USD Coin',
})

const THUNDERCORE_ANY_BUSD = new Token({
  chainId: ChainId.THUNDERCORE,
  address: '0xb12c13e66ade1f72f71834f2fc5082db8c091358',
  decimals: 18,
  symbol: 'anyBUSD',
  name: 'Any BUSD Token',
})

const BTTC_BSC_BRIDGE_USDC = new Token({
  chainId: ChainId.BTTC,
  address: '0xca424b845497f7204d9301bd13ff87c0e2e86fcf',
  decimals: 18,
  symbol: 'USDC (BSC)',
  name: 'USD Coin (BSC)',
})
const BTTC_ETHEREUM_BRIDGE_USDC = new Token({
  chainId: ChainId.BTTC,
  address: '0xae17940943ba9440540940db0f1877f101d39e8b',
  decimals: 6,
  symbol: 'USDC (Ethereum)',
  name: 'USD Coin (Ethereum)',
})
const BTTC_TRON_BRIDGE_USDC = new Token({
  chainId: ChainId.BTTC,
  address: '0x935faa2fcec6ab81265b301a30467bbc804b43d3',
  decimals: 6,
  symbol: 'USDC (Tron)',
  name: 'USD Coin (Tron)',
})
const BTTC_BSC_BRIDGE_USDT = new Token({
  chainId: ChainId.BTTC,
  address: '0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d',
  decimals: 18,
  symbol: 'USDT (BSC)',
  name: 'Tether USD (BSC)',
})
const BTTC_ETHEREUM_BRIDGE_USDT = new Token({
  chainId: ChainId.BTTC,
  address: '0xe887512ab8bc60bcc9224e1c3b5be68e26048b8b',
  decimals: 6,
  symbol: 'USDT (Ethereum)',
  name: 'Tether USD (Ethereum)',
})
const BTTC_TRON_BRIDGE_USDT = new Token({
  chainId: ChainId.BTTC,
  address: '0xdb28719f7f938507dbfe4f0eae55668903d34a15',
  decimals: 6,
  symbol: 'USDT (Tron)',
  name: 'Tether USD (Tron)',
})

const BASE_BRIDGE_USDC = new Token({
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

export const STABLES = {
  [ChainId.ARBITRUM]: [
    USDC[ChainId.ARBITRUM],
    USDT[ChainId.ARBITRUM],
    DAI[ChainId.ARBITRUM],
    MIM[ChainId.ARBITRUM],
    FRAX[ChainId.ARBITRUM],
  ],
  [ChainId.ARBITRUM_NOVA]: [
    USDC[ChainId.ARBITRUM_NOVA],
    USDT[ChainId.ARBITRUM_NOVA],
    DAI[ChainId.ARBITRUM_NOVA],
  ],
  [ChainId.AVALANCHE]: [
    USDC[ChainId.AVALANCHE],
    USDT[ChainId.AVALANCHE],
    DAI[ChainId.AVALANCHE],
    MIM[ChainId.AVALANCHE],
    FRAX[ChainId.AVALANCHE],
  ],
  [ChainId.BASE]: [
    USDC[ChainId.BASE],
    DAI[ChainId.BASE],
    axlUSDC[ChainId.BASE],
    USD_PLUS[ChainId.BASE],
    BASE_BRIDGE_USDC,
  ],
  [ChainId.BOBA]: [USDC[ChainId.BOBA], USDT[ChainId.BOBA], DAI[ChainId.BOBA]],
  [ChainId.BOBA_AVAX]: [USDC[ChainId.BOBA_AVAX], USDT[ChainId.BOBA_AVAX]],
  [ChainId.BOBA_BNB]: [USDC[ChainId.BOBA_BNB], USDT[ChainId.BOBA_BNB]],
  [ChainId.BSC]: [
    USDC[ChainId.BSC],
    USDT[ChainId.BSC],
    DAI[ChainId.BSC],
    BUSD[ChainId.BSC],
    MIM[ChainId.BSC],
    FRAX[ChainId.BSC],
  ],
  [ChainId.BTTC]: [
    USDC[ChainId.BTTC],
    USDT[ChainId.BTTC],
    BTTC_BSC_BRIDGE_USDC,
    BTTC_ETHEREUM_BRIDGE_USDC,
    BTTC_TRON_BRIDGE_USDC,
    BTTC_BSC_BRIDGE_USDT,
    BTTC_ETHEREUM_BRIDGE_USDT,
    BTTC_TRON_BRIDGE_USDT,
  ],
  [ChainId.CELO]: [USDC[ChainId.CELO], USDT[ChainId.CELO], DAI[ChainId.CELO]],
  [ChainId.CORE]: [USDC[ChainId.CORE], USDT[ChainId.CORE]],
  [ChainId.ETHEREUM]: [
    USDC[ChainId.ETHEREUM],
    USDT[ChainId.ETHEREUM],
    DAI[ChainId.ETHEREUM],
    LUSD[ChainId.ETHEREUM],
    MIM[ChainId.ETHEREUM],
    FRAX[ChainId.ETHEREUM],
  ],
  [ChainId.FANTOM]: [
    axlUSDC[ChainId.FANTOM],
    STARGATE_USDC[ChainId.FANTOM],
    STARGATE_USDT[ChainId.FANTOM],
    MIM[ChainId.FANTOM],
    FRAX[ChainId.FANTOM],
  ],
  [ChainId.FILECOIN]: [USDC[ChainId.FILECOIN], DAI[ChainId.FILECOIN]],
  [ChainId.FUSE]: [USDC[ChainId.FUSE], USDT[ChainId.FUSE], DAI[ChainId.FUSE]],
  [ChainId.GNOSIS]: [
    USDC[ChainId.GNOSIS],
    USDT[ChainId.GNOSIS],
    DAI[ChainId.GNOSIS],
  ],
  [ChainId.HARMONY]: [
    USDC[ChainId.HARMONY],
    USDT[ChainId.HARMONY],
    DAI[ChainId.HARMONY],
    FRAX[ChainId.HARMONY],
  ],
  [ChainId.HAQQ]: [USDC[ChainId.HAQQ], USDT[ChainId.HAQQ], DAI[ChainId.HAQQ]],
  [ChainId.HECO]: [USDC[ChainId.HECO], USDT[ChainId.HECO], DAI[ChainId.HECO]],
  [ChainId.KAVA]: [axlUSDC[ChainId.KAVA], USDT[ChainId.KAVA]],
  [ChainId.LINEA]: [USDC[ChainId.LINEA], DAI[ChainId.LINEA]],
  [ChainId.METIS]: [
    USDC[ChainId.METIS],
    USDT[ChainId.METIS],
    DAI[ChainId.METIS],
  ],
  [ChainId.MOONBEAM]: [
    WORMHOLE_USDC[ChainId.MOONBEAM],
    axlUSDC[ChainId.MOONBEAM],
    FRAX[ChainId.MOONBEAM],
  ],
  [ChainId.MOONRIVER]: [
    USDC[ChainId.MOONRIVER],
    USDT[ChainId.MOONRIVER],
    DAI[ChainId.MOONRIVER],
    MIM[ChainId.MOONRIVER],
    FRAX[ChainId.MOONRIVER],
  ],
  [ChainId.OKEX]: [USDC[ChainId.OKEX], USDT[ChainId.OKEX], DAI[ChainId.OKEX]],
  [ChainId.OPTIMISM]: [
    USDC[ChainId.OPTIMISM],
    USDT[ChainId.OPTIMISM],
    DAI[ChainId.OPTIMISM],
    FRAX[ChainId.OPTIMISM],
  ],
  [ChainId.POLYGON]: [
    USDC[ChainId.POLYGON],
    USDT[ChainId.POLYGON],
    DAI[ChainId.POLYGON],
    MIM[ChainId.POLYGON],
    FRAX[ChainId.POLYGON],
  ],
  [ChainId.POLYGON_ZKEVM]: [
    USDC[ChainId.POLYGON_ZKEVM],
    USDT[ChainId.POLYGON_ZKEVM],
    DAI[ChainId.POLYGON_ZKEVM],
  ],
  [ChainId.SCROLL]: [
    USDC[ChainId.SCROLL],
    USDT[ChainId.SCROLL],
    DAI[ChainId.SCROLL],
  ],
  [ChainId.TELOS]: [USDC[ChainId.TELOS], USDT[ChainId.TELOS]],
  [ChainId.THUNDERCORE]: [
    USDC[ChainId.THUNDERCORE],
    USDT[ChainId.THUNDERCORE],
    BUSD[ChainId.THUNDERCORE],
    THUNDERCORE_ANY_BUSD,
    THUNDERCORE_ANY_USDT,
    THUNDERCORE_ANY_USDC,
  ],
  [ChainId.ZETACHAIN]: [
    ZETA_BSC_BRIDGE_USDC,
    ZETA_BSC_BRIDGE_USDT,
    ZETA_ETH_BRIDGE_USDC,
    ZETA_ETH_BRIDGE_USDT,
  ],
  // TESTNETS
  [ChainId.RINKEBY]: [USDC[ChainId.RINKEBY]],
  [ChainId.ROPSTEN]: [
    USDC[ChainId.ROPSTEN],
    USDT[ChainId.ROPSTEN],
    DAI[ChainId.ROPSTEN],
  ],
  [ChainId.KOVAN]: [
    USDC[ChainId.KOVAN],
    USDT[ChainId.KOVAN],
    DAI[ChainId.KOVAN],
  ],
  [ChainId.POLYGON_TESTNET]: [USDC[ChainId.POLYGON_TESTNET]],
} as const
