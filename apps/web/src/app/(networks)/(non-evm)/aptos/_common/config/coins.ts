import { NetworkName } from '@aptos-labs/wallet-adapter-core'
import { type SupportedNetwork } from '~aptos/_common/config/chains'
import { type Token } from '~aptos/_common/lib/types/token'

export const USDC = {
  [NetworkName.Testnet]: {
    name: 'Tether',
    symbol: 'USDT',
    decimals: 8,
    address:
      '0xe05d610ddad41a45e61b1327f01fcc0a582eedae00683ef969b85fa892c4b4f::usdt::Tether',
  },
} as const satisfies Partial<Record<SupportedNetwork, Token>>

export const L0_USDC = {
  [NetworkName.Mainnet]: {
    address:
      '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    decimals: 6,
    symbol: 'lzUSDC',
    name: 'USD coin',
  },
  [NetworkName.Testnet]: {
    address:
      '0x8c805723ebc0a7fc5b7d3e7b75d567918e806b3461cb9fa21941a9edc0220bf::devnet_coins::DevnetUSDC',
    decimals: 8,
    symbol: 'lzUSDC',
    name: 'USD coin',
  },
} as const satisfies Partial<Record<SupportedNetwork, Token>>

export const CE_USDC = {
  [NetworkName.Mainnet]: {
    address:
      '0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d::celer_coin_manager::UsdcCoin',
    decimals: 6,
    symbol: 'ceUSDC',
    name: 'Celer - USD Coin',
  },
} as const satisfies Partial<Record<SupportedNetwork, Token>>

export const WH_USDC = {
  [NetworkName.Mainnet]: {
    address:
      '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T',
    decimals: 6,
    symbol: 'whUSDC',
    name: 'Wormhole - USD Coin',
  },
} as const satisfies Partial<Record<SupportedNetwork, Token>>

export const Aptos: Record<SupportedNetwork, Token> = {
  [NetworkName.Testnet]: {
    name: 'APTOS',
    symbol: 'APT',
    decimals: 8,
    address: '0x1::aptos_coin::AptosCoin',
  },
  [NetworkName.Mainnet]: {
    name: 'APTOS',
    symbol: 'APT',
    decimals: 8,
    address: '0x1::aptos_coin::AptosCoin',
  },
}

export const STABLECOINS: Record<SupportedNetwork, Token[]> = {
  [NetworkName.Mainnet]: [
    L0_USDC[NetworkName.Mainnet],
    CE_USDC[NetworkName.Mainnet],
    WH_USDC[NetworkName.Mainnet],
  ],
  [NetworkName.Testnet]: [USDC[NetworkName.Testnet]],
}
