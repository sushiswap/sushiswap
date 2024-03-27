import { publicWagmiConfig } from '@sushiswap/wagmi-config'
import {
  coinbaseWallet,
  injected,
  safe,
  walletConnect,
} from '@wagmi/connectors'
import { ChainId } from 'sushi'
import { cookieStorage, createConfig, createStorage } from 'wagmi'

export const DEFAULT_POLLING_INTERVAL = 4_000

// Allow for custom polling intervals for each chain with a default
const pollingInterval = new Proxy(
  {
    [ChainId.ETHEREUM]: 8000, // BT is 12s
    [ChainId.POLYGON_ZKEVM]: 8000, // BT is 13s
    [ChainId.FILECOIN]: 20000, // BT is 30s
  } as Partial<Record<ChainId, number>>,
  {
    get: (target, name) => {
      return Object.hasOwn(target, name)
        ? target[Number(name) as keyof typeof target]
        : DEFAULT_POLLING_INTERVAL
    },
  },
)

export const createProductionConfig = () => {
  return createConfig({
    chains: publicWagmiConfig.chains,
    transports: publicWagmiConfig.transports,
    pollingInterval,
    connectors: [
      injected({
        shimDisconnect: true,
      }),
      walletConnect({
        showQrModal: true,
        projectId: '187b0394dbf3b20ce7762592560eafd2',
        metadata: {
          name: 'Sushi',
          description: 'Community home of DeFi',
          url: 'https://www.sushi.com',
          icons: ['https://www.sushi.com/icon.png'],
        },
      }),
      coinbaseWallet({
        // TODO: Flesh out coinbase wallet connect options?
        appName: 'Sushi 2.0',
        appLogoUrl:
          'https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/sushi.jpg',
      }),
      safe({
        // TODO: Other self-hosted safes for some networks?
        allowedDomains: [
          /gnosis-safe.io$/,
          /app.safe.global$/,
          /safe.fuse.io$/,
          /multisig.moonbeam.network$/,
          /safe.fantom.network$/,
          /ui.celo-safe.io$/,
          /multisig.harmony.one$/,
        ],
        debug: false,
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  })
}

export const config = createProductionConfig()
