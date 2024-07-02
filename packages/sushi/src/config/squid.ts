import { Hex } from 'viem'
import { ChainId } from '../chain/index.js'

export const SquidIntegratorId = 'sushiswap-sdk'

export const SquidApiURL = 'https://apiplus.squidrouter.com/v2'

export const SQUID_CHAIN_NAME = {
  [ChainId.ARBITRUM]: 'Arbitrum',
  [ChainId.AVALANCHE]: 'Avalanche',
  [ChainId.BASE]: 'base',
  [ChainId.BSC]: 'binance',
  [ChainId.CELO]: 'celo',
  [ChainId.ETHEREUM]: 'Ethereum',
  [ChainId.FANTOM]: 'Fantom',
  [ChainId.FILECOIN]: 'filecoin',
  [ChainId.KAVA]: 'kava',
  [ChainId.MOONBEAM]: 'Moonbeam',
  [ChainId.OPTIMISM]: 'optimism',
  [ChainId.POLYGON_ZKEVM]: 'polygon-zkevm',
  [ChainId.POLYGON]: 'Polygon',
  [ChainId.LINEA]: 'linea',
  [ChainId.SCROLL]: 'scroll',
  [ChainId.BLAST]: 'blast',
} as const

export const SQUID_ROUTER_ADDRESS = {
  [ChainId.ETHEREUM]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.BSC]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.POLYGON]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.AVALANCHE]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.FANTOM]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.MOONBEAM]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.ARBITRUM]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.OPTIMISM]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.BASE]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.CELO]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.KAVA]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.FILECOIN]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.LINEA]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.SCROLL]: '0xce16F69375520ab01377ce7B88f5BA8C48F8D666',
  [ChainId.BLAST]: '0x492751eC3c57141deb205eC2da8bFcb410738630',
} as const

export enum SquidMulticallCallType {
  Default = 0,
  FullTokenBalance = 1,
  FullNativeBalance = 2,
  CollectTokenBalance = 3,
}

export type SquidMulticallCall = {
  callType: SquidMulticallCallType
  target: Hex
  value: bigint
  callData: Hex
  payload: Hex
}
