import { ChainId } from '../chain/index.js'

export const SUSHIXSWAP_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM,
  ChainId.AVALANCHE,
  ChainId.BSC,
  ChainId.ETHEREUM,
  ChainId.FANTOM,
  ChainId.OPTIMISM,
  ChainId.POLYGON,
] as const

export type SushiXSwapChainId = (typeof SUSHIXSWAP_SUPPORTED_CHAIN_IDS)[number]

export const SUSHIXSWAP_ADDRESS: Record<SushiXSwapChainId, `0x${string}`> = {
  [ChainId.ARBITRUM]: '0x53b08DbD70327b7Ba3B7886Fc9987BC985d27262',
  [ChainId.AVALANCHE]: '0x2c8C987C4777AB740d20Cb581f5d381BE95A4A4a',
  [ChainId.BSC]: '0x7A4af156379f512DE147ed3b96393047226d923F',
  [ChainId.ETHEREUM]: '0x011E52E4E40CF9498c79273329E8827b21E2e581',
  [ChainId.FANTOM]: '0xD045d27c1f7e7f770a807B0a85d8e3F852e0F2BE',
  [ChainId.OPTIMISM]: '0x8B396ddF906D552b2F98a8E7d743DD58Cd0d920f',
  [ChainId.POLYGON]: '0xd08b5f3e89F1e2d6b067e0A0cbdb094e6e41E77c',
} as const

export const isSushiXSwapChainId = (
  chainId: ChainId,
): chainId is SushiXSwapChainId =>
  SUSHIXSWAP_SUPPORTED_CHAIN_IDS.includes(chainId as SushiXSwapChainId)

export const SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS = [
  ChainId.ETHEREUM,
  ChainId.BSC,
  ChainId.AVALANCHE,
  ChainId.POLYGON,
  ChainId.ARBITRUM,
  ChainId.OPTIMISM,
  ChainId.BASE,
] as const

export type SushiXSwap2ChainId =
  (typeof SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS)[number]

export const SUSHIXSWAP_2_ADDRESS: Record<SushiXSwap2ChainId, `0x${string}`> = {
  [ChainId.ETHEREUM]: '0x804b526e5bf4349819fe2db65349d0825870f8ee',
  [ChainId.BSC]: '0x804b526e5bf4349819fe2db65349d0825870f8ee',
  [ChainId.AVALANCHE]: '0x804b526e5bf4349819fe2db65349d0825870f8ee',
  [ChainId.POLYGON]: '0x804b526e5bf4349819fe2db65349d0825870f8ee',
  [ChainId.ARBITRUM]: '0x804b526e5bf4349819fe2db65349d0825870f8ee',
  [ChainId.OPTIMISM]: '0x804b526e5bf4349819fe2db65349d0825870f8ee',
  [ChainId.BASE]: '0x804b526e5bf4349819fe2db65349d0825870f8ee',
} as const

export const isSushiXSwap2ChainId = (
  chainId: ChainId,
): chainId is SushiXSwap2ChainId =>
  SUSHIXSWAP_2_SUPPORTED_CHAIN_IDS.includes(chainId as SushiXSwap2ChainId)

export const STARGATE_ADAPTER_SUPPORTED_CHAIN_IDS = [
  ChainId.ETHEREUM,
  ChainId.BSC,
  ChainId.AVALANCHE,
  ChainId.POLYGON,
  ChainId.ARBITRUM,
  ChainId.OPTIMISM,
  ChainId.BASE,
] as const

export type StargateAdapterChainId =
  (typeof STARGATE_ADAPTER_SUPPORTED_CHAIN_IDS)[number]

export const STARGATE_ADAPTER_ADDRESS: Record<
  StargateAdapterChainId,
  `0x${string}`
> = {
  [ChainId.ETHEREUM]: '0xD408a20f1213286fB3158a2bfBf5bFfAca8bF269',
  [ChainId.BSC]: '0xFF51a7C624Eb866917102707F3dA8bFb99Db8692',
  [ChainId.AVALANCHE]: '0xFF51a7C624Eb866917102707F3dA8bFb99Db8692',
  [ChainId.POLYGON]: '0x1719DEf1BF8422a777f2442bcE704AC4Fb20c7f0',
  [ChainId.ARBITRUM]: '0xFF51a7C624Eb866917102707F3dA8bFb99Db8692',
  [ChainId.OPTIMISM]: '0xA62eC622DbA415Aa94110739B1f951B1202Cf322',
  [ChainId.BASE]: '0xD408a20f1213286fB3158a2bfBf5bFfAca8bF269',
} as const

export const isStargateAdapterChainId = (
  chainId: ChainId,
): chainId is StargateAdapterChainId =>
  STARGATE_ADAPTER_SUPPORTED_CHAIN_IDS.includes(
    chainId as StargateAdapterChainId,
  )
