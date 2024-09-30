import { IToken } from '~tron/_common/types/token-type'
import { IS_TESTNET } from './is-testnet'

export const TRON: IToken = {
  address: 'TRON',
  decimals: 6,
  logoURI:
    'https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415',
  name: 'TRX (TRON)',
  symbol: 'TRX',
}

export const WTRX: IToken = {
  address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
  decimals: 6,
  logoURI:
    'https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415',
  name: 'Wrapped TRX',
  symbol: 'WTRX',
}

export const INTERMEDIATE_TOKEN = WTRX

const MAINNET_TOKENS: IToken[] = [
  {
    address: 'TRON',
    decimals: 6,
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415',
    name: 'TRX (TRON)',
    symbol: 'TRX',
  },
  {
    symbol: 'SUN',
    address: 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S',
    decimals: 18,
    name: 'SUN',
    logoURI:
      'https://static.tronscan.org/production/logo/TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S.png',
  },
  {
    symbol: 'BTT',
    address: 'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4',
    decimals: 18,
    name: 'BitTorrent',
    logoURI: 'https://static.tronscan.org/production/logo/1002000.png',
  },
  {
    symbol: 'SUNOLD',
    address: 'TKkeiboTkxXKJpbmVFbv4a8ov5rAfRDMf9',
    decimals: 18,
    name: 'SUNOLD',
    logoURI: 'https://static.tronscan.org/production/logo/SUNLogo.178d4636.png',
  },
  {
    symbol: 'NFT',
    address: 'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq',
    decimals: 6,
    name: 'APENFT',
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq.png',
  },
  {
    symbol: 'BTC',
    address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    decimals: 8,
    name: 'Bitcoin',
    logoURI:
      'https://static.tronscan.org/production/logo/TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9.png',
  },
  {
    symbol: 'WBTC',
    address: 'TXpw8XeWYeTUd4quDskoUqeQPowRh4jY65',
    decimals: 8,
    name: 'Wrapped BTC',
    logoURI:
      'https://static.tronscan.org/production/logo/TXpw8XeWYeTUd4quDskoUqeQPowRh4jY65.png',
  },
  {
    symbol: 'ETHOLD',
    address: 'THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF',
    decimals: 18,
    name: 'EthereumOLD',
    logoURI:
      'https://static.tronscan.org/production/logo/THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF.png',
  },
  {
    symbol: 'WETH',
    address: 'TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok',
    decimals: 18,
    name: 'Wrapped ETH',
    logoURI:
      'https://static.tronscan.org/production/logo/TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok.png',
  },
  {
    symbol: 'WBTT',
    address: 'TKfjV9RNKJJCqPvBtK8L7Knykh7DNWvnYt',
    decimals: 6,
    name: 'Wrapped BitTorrent',
    logoURI:
      'https://static.tronscan.org/production/logo/TKfjV9RNKJJCqPvBtK8L7Knykh7DNWvnYt.png',
  },
  {
    symbol: 'WTRX',
    address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
    decimals: 6,
    name: 'Wrapped TRX',
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png',
  },
  {
    symbol: 'JST',
    address: 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9',
    decimals: 18,
    name: 'JUST GOV v1.0',
    logoURI: 'https://static.tronscan.org/production/logo/just_icon.png',
  },
  {
    symbol: 'WIN',
    address: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
    decimals: 6,
    name: 'WINK',
    logoURI: 'https://static.tronscan.org/profile_images/JKtJTydD_400x400.jpg',
  },
  {
    symbol: 'TUSD',
    address: 'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4',
    decimals: 18,
    name: 'TrueUSD',
    logoURI:
      'https://static.tronscan.org/production/logo/TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4.png',
  },
  {
    symbol: 'USDT',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    decimals: 6,
    name: 'Tether USD',
    logoURI: 'https://static.tronscan.org/production/logo/usdtlogo.png',
  },
  {
    symbol: 'USDJ',
    address: 'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT',
    decimals: 18,
    name: 'JUST Stablecoin v1.0',
    logoURI: 'https://static.tronscan.org/production/logo/usdj.png',
  },
  {
    symbol: 'LTC',
    address: 'TR3DLthpnDdCGabhVDbD3VMsiJoCXY3bZd',
    decimals: 8,
    name: 'Litecoin',
    logoURI:
      'https://static.tronscan.org/production/logo/TR3DLthpnDdCGabhVDbD3VMsiJoCXY3bZd.png',
  },
  {
    symbol: 'HT',
    address: 'TDyvndWuvX5xTBwHPYJi7J3Yq8pq8yh62h',
    decimals: 18,
    name: 'HuobiToken',
    logoURI:
      'https://static.tronscan.org/production/logo/TDyvndWuvX5xTBwHPYJi7J3Yq8pq8yh62h.png',
  },
  {
    symbol: 'USDD',
    address: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
    decimals: 18,
    name: 'Decentralized USD',
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn.png',
  },
  {
    symbol: 'sTRX',
    address: 'TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5',
    decimals: 18,
    name: 'staked TRX',
    logoURI:
      'https://static.tronscan.org/production/upload/logo/new/TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5.png',
  },
  {
    symbol: 'ETH',
    address: 'TRFe3hT5oYhjSZ6f3ji5FJ7YCfrkWnHRvh',
    decimals: 18,
    name: 'Ethereum',
    logoURI:
      'https://static.tronscan.org/production/logo/TRFe3hT5oYhjSZ6f3ji5FJ7YCfrkWnHRvh.png',
  },
  {
    symbol: 'stUSDT',
    address: 'TThzxNRLrW2Brp9DcTQU8i4Wd9udCWEdZ3',
    decimals: 18,
    name: 'Staked USDT',
    logoURI:
      'https://static.tronscan.org/production/upload/logo/new/stUSDT_logo.png',
  },
  {
    symbol: 'HTX',
    address: 'TUPM7K8REVzD2UdV4R5fe5M8XbnR2DdoJ6',
    decimals: 18,
    name: 'HTX',
    logoURI: 'https://static.tronscan.org/production/upload/logo/new/HTX.png',
  },
  {
    symbol: 'SUNDOG',
    address: 'TXL6rJbvmjD46zeN1JssfgxvSo99qC8MRT',
    decimals: 18,
    name: 'Sundog',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/SUNDOG_TXr7if_EzxfYukzq9ZU.png',
  },
  {
    symbol: 'FOFAR',
    address: 'TUFonyWZ4Tza5MzgDj6g2u5rfdGoRVYG7g',
    decimals: 18,
    name: 'FOFAR',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/FOFAR_THQg9C_IavjUsY3Wun7.jpg',
  },
  {
    symbol: 'IVfun',
    address: 'TSig7sWzEL2K83mkJMQtbyPpiVSbR6pZnb',
    decimals: 18,
    name: 'Invest Zone',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/IVfun_TYE2hX_1rR7Q8GfwFKa.jpg',
  },
  {
    symbol: 'MUNCAT',
    address: 'TE2T2vLnEQT1XW647EAQAHWqd6NZL1hweR',
    decimals: 18,
    name: 'MUNCAT',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/MUNCAT_TJ44MB_FKFM8Y8eyhH2.jpeg',
  },
  {
    symbol: 'SUNWUKONG',
    address: 'TP3prcvQknVthrVnn281cKST56eWiLgJJM',
    decimals: 18,
    name: 'SunWukong',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/SUNWUKONG_TCyGhb_xSV6IxtwuU33.png',
  },
  {
    symbol: 'CZ',
    address: 'TSZu2myGg42ZEsT7RvvbVvhVS3kf9f1e57',
    decimals: 18,
    name: 'Changpeng Zhao',
    logoURI: 'https://cdn.sunpump.meme/public/logo/CZ_TBDSE9_iEzd2xG48TpN.jpeg',
  },
  {
    symbol: 'SUNCAT',
    address: 'TAwAg9wtQzTMFsijnSFotJrpxhMm3AqW1d',
    decimals: 18,
    name: 'SUNCAT',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/SUNCAT_TWj3Mp_ynpQjPlfRZu9.jpeg',
  },
  {
    symbol: 'Tcat',
    address: 'TVgHqeP41s3qMDH3oKBsScEUzvyXw6bKAm',
    decimals: 18,
    name: 'Tron Cat',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/Tcat_TXv3PZ_f4HN7mpJqQ9V.png',
  },
  {
    symbol: 'DRGN',
    address: 'TV5yB8f4AdoAfVVUdkytyZnX5e7SeGAZr2',
    decimals: 18,
    name: 'Dragon Sun',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/DRGN_TUcY9d_GmJcXp1VNNqz.jpg',
  },
  {
    symbol: 'BULL',
    address: 'TAt4ufXFaHZAEV44ev7onThjTnF61SEaEM',
    decimals: 18,
    name: 'Tron Bull',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/BULL_TYvwPp_negdGNxhFCpp.png',
  },
  {
    symbol: 'SUNDOGE',
    address: 'TAz6oGWhsmHPp7Ap6khmAYxjfHFYokqdQ4',
    decimals: 18,
    name: 'SUNDOGE',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/SUNDOGE_THL9Hf_XQ7Lq2GubqOE.PNG',
  },
  {
    symbol: 'ROCK',
    address: 'TJvwMR3RjHc8jA9QwwjWGANrR3Y4scLSZm',
    decimals: 18,
    name: 'ROCK',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/ROCK_TK157u_SW8560kjmR1W.jpeg',
  },
  {
    symbol: 'TDOG',
    address: 'TAPxMfHHgFyZMHuuz8wL56pi54eB2xkK2q',
    decimals: 18,
    name: 'Tron Dog',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/TDOG_TW2UbF_SHNKw5HVdKEF.PNG',
  },
  {
    symbol: 'PSYOP',
    address: 'TBFr8v7HkKGydiHAjDL8NzqYf7cJqNsTVY',
    decimals: 18,
    name: 'PSYOPTRON',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/PSYOP_TEX3q5_JlNNNeGizAHQ.png',
  },
  {
    symbol: 'MWD',
    address: 'TEfg1LnM3yApCjAgax35wDg6SRpmZFuQS3',
    decimals: 18,
    name: 'MEW-WOOF-DAO',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/MWD_TWcE6E_SsCtXAZ1KvWi.jpeg',
  },
  {
    symbol: 'TRONKEY',
    address: 'TRHsKfoPJxFHnJ4wJ8Zc9nmSNAyaNYqff7',
    decimals: 18,
    name: 'TRONKEY',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/TRONKEY_TVFkWK_9m3fDI3ioDiW.jpeg',
  },
  {
    symbol: 'HOTSUN',
    address: 'TCXTVfR7pFH8voLyqhbUGXdiYaBkTDmYCQ',
    decimals: 18,
    name: 'HOTSUN',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/HOTSUN_TUueYg_emDoYuKXklz4.jpeg',
  },
  {
    symbol: 'SUNKEY',
    address: 'TJgB8bFWzMQfbqmCicf39XHby5uB5qoEQq',
    decimals: 18,
    name: 'SUNKEY',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/SUNKEY_TArygL_CL1PcUh6ZQr5.jpg',
  },
  {
    symbol: 'CZC',
    address: 'TRJBN2ninnLKUUDR1f686goCYetPcPed8f',
    decimals: 18,
    name: 'Crypto Zillion Club',
    logoURI: 'https://cdn.sunpump.meme/public/logo/CZC_TH5Eyn_1tR9tsfvqbYq.png',
  },
  {
    symbol: 'TBEER',
    address: 'TKCJp1q9325BfQbu2Suh7mshQs8ijuqv3y',
    decimals: 18,
    name: 'TRON BEER',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/TBEER_TXMN3d_FSZeVq8A5nzi.jpg',
  },
  {
    symbol: 'VIKITA',
    address: 'TP7r1pDoS1snMjEJE1kE17GRt3Df4mYuZz',
    decimals: 18,
    name: 'VIKITA',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/VIKITA_TVNpDy_QRP17X2aRh0E.jpg',
  },
  {
    symbol: 'MEOWKA',
    address: 'TYpSKB5hfaKpRDwS2p7bait3xuCKYnwDKJ',
    decimals: 18,
    name: 'Meowka Neko',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/MEOWKA_TFD7X8_2AtEA0p50jde.PNG',
  },
  {
    symbol: 'TWX',
    address: 'TTFreuJ4pYDaCeEMEtiR1GQDwPPrS4jKFk',
    decimals: 18,
    name: 'Twiskers',
    logoURI: 'https://cdn.sunpump.meme/public/logo/TWX_TF8z6B_bQu1A9s9Wox2.png',
  },
  {
    symbol: 'PUSS',
    address: 'TX5eXdf8458bZ77fk8xdvUgiQmC3L93iv7',
    decimals: 18,
    name: 'PUSS',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/PUSS_TQRxQN_ls9y5lDjLoeb.png',
  },
  {
    symbol: 'LABR',
    address: 'TMEvVHCUngZ6JfuvnH74cX8UFw1KedAuhR',
    decimals: 18,
    name: 'Labrador',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/LABR_TTGSZE_HG9I7qi3BY11.png',
  },
  {
    symbol: '$Afro',
    address: 'TDnXXUXH37zEojEfrvYziS6yKSpYmkdjHE',
    decimals: 18,
    name: 'Afro',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/$Afro_TPeQ55_cHUMaVSFmoe8.png',
  },
  {
    symbol: 'CDOG',
    address: 'TVXmroHbJsJ6rVm3wGn2G9723yz3Kbqp9x',
    decimals: 18,
    name: 'Cyber Dog',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/CDOG_TQU2Lr_ZBlOpcEb0sXM.jpg',
  },
  {
    symbol: 'TBULL',
    address: 'TPeoxx1VhUMnAUyjwWfximDYFDQaxNQQ45',
    decimals: 18,
    name: 'Tron Bull',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/TBULL_TSfV1B_YQaduaEhm0cB.webp',
  },
  {
    symbol: 'USDCOLD',
    address: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    decimals: 6,
    name: 'USD Coin Old',
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz81.png',
  },
  {
    symbol: 'MOONDOG',
    address: 'TMWD9A3N3EhhEhiTCkEESBrVTosNmMJy8T',
    decimals: 18,
    name: 'MOONDOG',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/MOONDOG_TQXe52_BoDeNysxsme5.png',
  },
  {
    symbol: 'SunJoker',
    address: 'TRGEYcmBSAz3PswhtAHcUPjGbuGr1H9Fza',
    decimals: 18,
    name: 'SunJoker',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/SunJoker_TM2wL8_WsJV6iyQA2Fr.jpg',
  },
  {
    symbol: 'WHALE',
    address: 'TWP6GgtstiuYbpygSFcZLzJQrj9eDVQcq2',
    decimals: 18,
    name: 'Crypto Whale',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/WHALE_TDnHMp_YlFkVV8WBOWL.png',
  },
  {
    symbol: 'BICOIN',
    address: 'TF7ixydn7nfCgj9wQj3fRdKRAvsZ8egHcx',
    decimals: 18,
    name: 'B1COIN',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/BICOIN_TJvQmL_cpZkc8sGaKuC.png',
  },
  {
    symbol: 'BOG',
    address: 'TYteXtNLyZb9D6vZatpwvkq52YrdSMP4Y1',
    decimals: 18,
    name: 'Birddog',
    logoURI:
      'https://cdn.sunpump.meme/public/logo/BOG_TEuGom_vb57Hpv7PKdK.jpeg',
  },
]

const TESTNET_TOKENS: IToken[] = [
  {
    address: 'TRON',
    decimals: 6,
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415',
    name: 'TRX (TRON)',
    symbol: 'TRX',
  },
  {
    address: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', //mainnet address currently
    decimals: 6,
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415',
    name: 'Wrapped TRX',
    symbol: 'WTRX',
  },
  {
    address: 'TSdZwNqpHofzP6BsBKGQUWdBeJphLmF6id',
    decimals: 6,
    logoURI:
      'https://static.tronscan.org/production/upload/logo/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz81.png',
    name: 'USDC Coin',
    symbol: 'USDC',
  },
]

export const DEFAULT_TOKEN_LIST = IS_TESTNET ? TESTNET_TOKENS : MAINNET_TOKENS

export const DEFAULT_TOKEN_LIST_WITH_KEY = DEFAULT_TOKEN_LIST.reduce<
  Record<string, IToken>
>((acc, { address, decimals, name, symbol, logoURI }) => {
  acc[address] = {
    name,
    decimals,
    symbol,
    address,
    logoURI,
  }
  return acc
}, {})

export const STABLE_TOKENS = DEFAULT_TOKEN_LIST.filter(
  (token) =>
    token.symbol === 'USDT' ||
    token.symbol === 'TUSD' ||
    token.symbol === 'USDD',
)
