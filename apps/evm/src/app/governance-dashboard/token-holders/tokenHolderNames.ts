export const tokenHolderNames = {
  '0xf977814e90da44bfa03b6295a0616a897441acec': 'Binance 8',
  '0x8798249c2e607446efb7ad49ec89dd1865ff4272': 'SushiSwap: xSUSHI Token',
  '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b': 'OKX',
  '0xe94b5eec1fa96ceecbd33ef5baa8d00e4493f4f3': 'SushiSwap: Treasury Multisig',
  '0x5a52e96bacdabb82fd05763e25335261b270efcb': 'Binance 28',
  '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503': 'Binance: Binance-Peg Tokens',
  '0xf89d7b9c864f589bbf53a82105107622b35eaa40': 'Bybit',
  '0x795065dcc9f64b5614c407a6efdc400da6221fb0': 'Sushiswap: SUSHI',
  '0x4b0181102a0112a2ef11abee5563bb4a3176c9d7': 'Compound: cSushi Token',
  '0x3ee18b2214aff97000d974cf647e7c347e8fa585': 'Wormhole: Portal Token Bridge',
  '0xcbe6b83e77cdc011cc18f6f0df8444e5783ed982': 'Sushiswap: Merkle Distributor',
  '0x0d0707963952f2fba59dd06f2b425ace40b492fe': 'Gate.io',
  '0x28c6c06298d514db089934071355e5743bf21d60': 'Binance 14',
  '0xf5bce5077908a1b7370b9ae04adc565ebd643966': 'Sushiswap: BentoBox V1',
  '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43': 'Coinbase 10',
  '0xe93381fb4c4f14bda253907b18fad305d799241a': 'Huobi 10',
  '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd':
    'Sushiswap: MasterChef LP Staking Pool',
  '0x34ea4138580435b5a521e460035edb19df1938c1': 'Binance US 2',
  '0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec': 'Bitfinex: Hot Wallet',
  '0x742d35cc6634c0532925a3b844bc454e4438f44e': 'Bitfinex 2',
  '0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf': 'Polygon (Matic): ERC20 Bridge',
}

export function isCustomName(
  address: string,
): address is keyof typeof tokenHolderNames {
  return address in tokenHolderNames
}
