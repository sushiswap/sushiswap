export default [
  {
    chainId: 1,
    explorers: [
      {
        name: 'etherscan',
        url: 'https://etherscan.io',
        standard: 'EIP3091',
      },
      {
        name: 'blockscout',
        url: 'https://eth.blockscout.com',
        icon: 'blockscout',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://ethereum.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Ethereum Mainnet',
    shortName: 'eth',
  },
  {
    chainId: 10,
    explorers: [
      {
        name: 'etherscan',
        url: 'https://optimistic.etherscan.io',
        standard: 'EIP3091',
      },
      {
        name: 'blockscout',
        url: 'https://optimism.blockscout.com',
        icon: 'blockscout',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://optimism.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'OP Mainnet',
    shortName: 'oeth',
  },
  {
    chainId: 25,
    explorers: [
      {
        name: 'Cronos Explorer',
        url: 'https://explorer.cronos.org',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'Cronos',
      symbol: 'CRO',
      decimals: 18,
    },
    name: 'Cronos Mainnet',
    shortName: 'cro',
  },
  {
    chainId: 40,
    explorers: [
      {
        name: 'teloscan',
        url: 'https://teloscan.io',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Telos',
      symbol: 'TLOS',
      decimals: 18,
    },
    name: 'Telos EVM Mainnet',
    shortName: 'TelosEVM',
  },
  {
    chainId: 56,
    explorers: [
      {
        name: 'bscscan',
        url: 'https://bscscan.com',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://bnb.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'BNB Chain Native Token',
      symbol: 'BNB',
      decimals: 18,
    },
    name: 'BNB Smart Chain Mainnet',
    shortName: 'bnb',
  },
  {
    chainId: 66,
    explorers: [
      {
        name: 'OKLink',
        url: 'https://www.oklink.com/en/okc',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'OKXChain Global Utility Token',
      symbol: 'OKT',
      decimals: 18,
    },
    name: 'OKXChain Mainnet',
    shortName: 'okt',
  },
  {
    chainId: 97,
    explorers: [
      {
        name: 'bscscan-testnet',
        url: 'https://testnet.bscscan.com',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'BNB Chain Native Token',
      symbol: 'tBNB',
      decimals: 18,
    },
    name: 'BNB Smart Chain Testnet',
    shortName: 'bnbt',
  },
  {
    chainId: 100,
    explorers: [
      {
        name: 'gnosisscan',
        url: 'https://gnosisscan.io',
        standard: 'EIP3091',
      },
      {
        name: 'blockscout',
        url: 'https://gnosis.blockscout.com',
        icon: 'blockscout',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://gnosis.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'XDAI',
      decimals: 18,
    },
    name: 'Gnosis',
    shortName: 'gno',
  },
  {
    chainId: 108,
    explorers: [
      {
        name: 'thundercore-viewblock',
        url: 'https://viewblock.io/thundercore',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'ThunderCore Token',
      symbol: 'TT',
      decimals: 18,
    },
    name: 'ThunderCore Mainnet',
    shortName: 'TT',
  },
  {
    chainId: 122,
    explorers: [
      {
        name: 'blockscout',
        url: 'https://explorer.fuse.io',
        icon: 'blockscout',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Fuse',
      symbol: 'FUSE',
      decimals: 18,
    },
    name: 'Fuse Mainnet',
    shortName: 'fuse',
  },
  {
    chainId: 128,
    explorers: [
      {
        name: 'hecoinfo',
        url: 'https://hecoinfo.com',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Huobi ECO Chain Native Token',
      symbol: 'HT',
      decimals: 18,
    },
    name: 'Huobi ECO Chain Mainnet',
    shortName: 'heco',
  },
  {
    chainId: 137,
    explorers: [
      {
        name: 'polygonscan',
        url: 'https://polygonscan.com',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://polygon.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    name: 'Polygon Mainnet',
    shortName: 'matic',
  },
  {
    chainId: 199,
    explorers: [
      {
        name: 'BitTorrent Chain Explorer',
        url: 'https://bttcscan.com',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'BitTorrent',
      symbol: 'BTT',
      decimals: 18,
    },
    name: 'BitTorrent Chain Mainnet',
    shortName: 'BTT',
  },
  {
    chainId: 250,
    explorers: [
      {
        name: 'ftmscan',
        url: 'https://ftmscan.com',
        icon: 'ftmscan',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://fantom.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    name: 'Fantom Opera',
    shortName: 'ftm',
  },
  {
    chainId: 288,
    explorers: [
      {
        name: 'Bobascan',
        url: 'https://bobascan.com',
        standard: 'none',
      },
      {
        name: 'Blockscout',
        url: 'https://blockexplorer.boba.network',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Boba Network',
    shortName: 'Boba',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://gateway.boba.network',
        },
      ],
    },
  },
  {
    chainId: 314,
    explorers: [
      {
        name: 'Filfox',
        url: 'https://filfox.info/en',
        standard: 'none',
      },
      {
        name: 'Beryx',
        url: 'https://beryx.zondax.ch',
        standard: 'none',
      },
      {
        name: 'Glif Explorer',
        url: 'https://explorer.glif.io',
        standard: 'EIP3091',
      },
      {
        name: 'Dev.storage',
        url: 'https://dev.storage',
        standard: 'none',
      },
      {
        name: 'Filscan',
        url: 'https://filscan.io',
        standard: 'none',
      },
      {
        name: 'Filscout',
        url: 'https://filscout.io/en',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'filecoin',
      symbol: 'FIL',
      decimals: 18,
    },
    name: 'Filecoin - Mainnet',
    shortName: 'filecoin',
  },
  {
    chainId: 324,
    explorers: [
      {
        name: 'zkSync Era Block Explorer',
        url: 'https://explorer.zksync.io',
        icon: 'zksync-era',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'zkSync Mainnet',
    shortName: 'zksync',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://bridge.zksync.io/',
        },
      ],
    },
  },
  {
    chainId: 1088,
    explorers: [
      {
        name: 'blockscout',
        url: 'https://andromeda-explorer.metis.io',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Metis',
      symbol: 'METIS',
      decimals: 18,
    },
    name: 'Metis Andromeda Mainnet',
    shortName: 'metis-andromeda',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://bridge.metis.io',
        },
      ],
    },
  },
  {
    chainId: 1101,
    explorers: [
      {
        name: 'blockscout',
        url: 'https://zkevm.polygonscan.com',
        icon: 'zkevm',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Polygon zkEVM',
    shortName: 'zkevm',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://bridge.zkevm-rpc.com',
        },
      ],
    },
  },
  {
    chainId: 1116,
    explorers: [
      {
        name: 'Core Scan',
        url: 'https://scan.coredao.org',
        icon: 'core',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Core Blockchain Native Token',
      symbol: 'CORE',
      decimals: 18,
    },
    name: 'Core Blockchain Mainnet',
    shortName: 'core',
  },
  {
    chainId: 1284,
    explorers: [
      {
        name: 'moonscan',
        url: 'https://moonbeam.moonscan.io',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'Glimmer',
      symbol: 'GLMR',
      decimals: 18,
    },
    name: 'Moonbeam',
    shortName: 'mbeam',
  },
  {
    chainId: 1285,
    explorers: [
      {
        name: 'moonscan',
        url: 'https://moonriver.moonscan.io',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'Moonriver',
      symbol: 'MOVR',
      decimals: 18,
    },
    name: 'Moonriver',
    shortName: 'mriver',
  },
  {
    chainId: 2222,
    explorers: [
      {
        name: 'Kava EVM Explorer',
        url: 'https://kavascan.com',
        standard: 'EIP3091',
        icon: 'kava',
      },
    ],
    nativeCurrency: {
      name: 'Kava',
      symbol: 'KAVA',
      decimals: 18,
    },
    name: 'Kava',
    shortName: 'kava',
  },
  {
    chainId: 4002,
    explorers: [
      {
        name: 'ftmscan',
        url: 'https://testnet.ftmscan.com',
        icon: 'ftmscan',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
    },
    name: 'Fantom Testnet',
    shortName: 'tftm',
  },
  {
    chainId: 7000,
    explorers: [
      {
        name: 'ZetaChain Mainnet Explorer',
        url: 'https://explorer.mainnet.zetachain.com',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'Zeta',
      symbol: 'ZETA',
      decimals: 18,
    },
    name: 'ZetaChain Mainnet',
    shortName: 'zetachain-mainnet',
  },
  {
    chainId: 8453,
    explorers: [
      {
        name: 'basescan',
        url: 'https://basescan.org',
        standard: 'none',
      },
      {
        name: 'basescout',
        url: 'https://base.blockscout.com',
        icon: 'blockscout',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://base.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Base',
    shortName: 'base',
  },
  {
    chainId: 11235,
    explorers: [
      {
        name: 'Mainnet HAQQ Explorer',
        url: 'https://explorer.haqq.network',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Islamic Coin',
      symbol: 'ISLM',
      decimals: 18,
    },
    name: 'Haqq Network',
    shortName: 'ISLM',
  },
  {
    chainId: 42161,
    explorers: [
      {
        name: 'Arbiscan',
        url: 'https://arbiscan.io',
        standard: 'EIP3091',
      },
      {
        name: 'Arbitrum Explorer',
        url: 'https://explorer.arbitrum.io',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://arbitrum.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Arbitrum One',
    shortName: 'arb1',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://bridge.arbitrum.io',
        },
      ],
    },
  },
  {
    chainId: 42170,
    explorers: [
      {
        name: 'Arbitrum Nova Chain Explorer',
        url: 'https://nova-explorer.arbitrum.io',
        icon: 'blockscout',
        standard: 'EIP3091',
      },
      {
        name: 'dexguru',
        url: 'https://nova.dex.guru',
        icon: 'dexguru',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Arbitrum Nova',
    shortName: 'arb-nova',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://bridge.arbitrum.io',
        },
      ],
    },
  },
  {
    chainId: 42220,
    explorers: [
      {
        name: 'Celoscan',
        url: 'https://celoscan.io',
        standard: 'EIP3091',
      },
      {
        name: 'blockscout',
        url: 'https://explorer.celo.org',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
    name: 'Celo Mainnet',
    shortName: 'celo',
  },
  {
    chainId: 43113,
    explorers: [
      {
        name: 'snowtrace',
        url: 'https://testnet.snowtrace.io',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    name: 'Avalanche Fuji Testnet',
    shortName: 'Fuji',
  },
  {
    chainId: 43114,
    explorers: [
      {
        name: 'snowtrace',
        url: 'https://snowtrace.io',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Avalanche',
      symbol: 'AVAX',
      decimals: 18,
    },
    name: 'Avalanche C-Chain',
    shortName: 'avax',
  },
  {
    chainId: 43288,
    explorers: [
      {
        name: 'Boba Avax Explorer',
        url: 'https://blockexplorer.avax.boba.network',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'Boba Token',
      symbol: 'BOBA',
      decimals: 18,
    },
    name: 'Boba Avax',
    shortName: 'bobaavax',
  },
  {
    chainId: 56288,
    explorers: [
      {
        name: 'Boba BNB block explorer',
        url: 'https://blockexplorer.bnb.boba.network',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'Boba Token',
      symbol: 'BOBA',
      decimals: 18,
    },
    name: 'Boba BNB Mainnet',
    shortName: 'BobaBnb',
    parent: {
      type: 'L2',
      chain: 'eip155-5',
      bridges: [
        {
          url: 'https://gateway.boba.network',
        },
      ],
    },
  },
  {
    chainId: 59144,
    explorers: [
      {
        name: 'Etherscan',
        url: 'https://lineascan.build',
        standard: 'EIP3091',
        icon: 'linea',
      },
      {
        name: 'Blockscout',
        url: 'https://explorer.linea.build',
        standard: 'EIP3091',
        icon: 'linea',
      },
      {
        name: 'L2scan',
        url: 'https://linea.l2scan.co',
        standard: 'EIP3091',
        icon: 'linea',
      },
    ],
    nativeCurrency: {
      name: 'Linea Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Linea',
    shortName: 'linea',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://bridge.linea.build',
        },
      ],
    },
  },
  {
    chainId: 80001,
    explorers: [
      {
        name: 'polygonscan',
        url: 'https://mumbai.polygonscan.com',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    name: 'Mumbai',
    shortName: 'maticmum',
  },
  {
    chainId: 81457,
    explorers: [
      {
        name: 'Blastscan',
        url: 'https://blastscan.io',
        icon: 'blast',
        standard: 'EIP3091',
      },
      {
        name: 'Blast Explorer',
        url: 'https://blastexplorer.io',
        icon: 'blast',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Blast',
    shortName: 'blastmainnet',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
    },
  },
  {
    chainId: 421614,
    explorers: [
      {
        name: 'Arbitrum Sepolia Rollup Testnet Explorer',
        url: 'https://sepolia-explorer.arbitrum.io',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Arbitrum Sepolia',
    shortName: 'arb-sep',
    parent: {
      type: 'L2',
      chain: 'eip155-11155111',
      bridges: [
        {
          url: 'https://bridge.arbitrum.io',
        },
      ],
    },
  },
  {
    chainId: 534352,
    explorers: [
      {
        name: 'Scrollscan',
        url: 'https://scrollscan.com',
        standard: 'EIP3091',
      },
      {
        name: 'Blockscout',
        url: 'https://blockscout.scroll.io',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Scroll',
    shortName: 'scr',
    parent: {
      type: 'L2',
      chain: 'eip155-1',
      bridges: [
        {
          url: 'https://scroll.io/bridge',
        },
      ],
    },
  },
  {
    chainId: 11155111,
    explorers: [
      {
        name: 'etherscan-sepolia',
        url: 'https://sepolia.etherscan.io',
        standard: 'EIP3091',
      },
      {
        name: 'otterscan-sepolia',
        url: 'https://sepolia.otterscan.io',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    name: 'Sepolia',
    shortName: 'sep',
  },
  {
    chainId: 1666600000,
    explorers: [
      {
        name: 'Harmony Block Explorer',
        url: 'https://explorer.harmony.one',
        standard: 'EIP3091',
      },
    ],
    nativeCurrency: {
      name: 'ONE',
      symbol: 'ONE',
      decimals: 18,
    },
    name: 'Harmony Mainnet Shard 0',
    shortName: 'hmy-s0',
  },
  {
    chainId: 11297108109,
    explorers: [
      {
        name: 'Chainlens',
        url: 'https://palm.chainlens.com',
        standard: 'EIP3091',
      },
      {
        name: 'Dora',
        url: 'https://www.ondora.xyz/network/palm',
        standard: 'none',
      },
    ],
    nativeCurrency: {
      name: 'PALM',
      symbol: 'PALM',
      decimals: 18,
    },
    name: 'Palm',
    shortName: 'palm',
  },
] as const
