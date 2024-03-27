import { ExtractorConfig, LogFilterType } from '@sushiswap/extractor'
import { ChainId } from 'sushi/chain'
import {
  ExtractorSupportedChainId,
  PANCAKESWAP_V3_DEPLOYER_ADDRESS,
  PANCAKESWAP_V3_FACTORY_ADDRESS,
  PANCAKESWAP_V3_FEE_SPACING_MAP,
  PANCAKESWAP_V3_INIT_CODE_HASH,
  PancakeSwapV3ChainId,
  SUSHISWAP_V2_FACTORY_ADDRESS,
  SUSHISWAP_V2_INIT_CODE_HASH,
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SUSHISWAP_V3_INIT_CODE_HASH,
  SUSHISWAP_V3_TICK_LENS,
  SpecialExtractorClientConfig,
  type SushiSwapV2ChainId,
  type SushiSwapV3ChainId,
  UNISWAP_V2_FACTORY_ADDRESS,
  UNISWAP_V2_INIT_CODE_HASH,
  UNISWAP_V3_FACTORY_ADDRESS,
  UNISWAP_V3_INIT_CODE_HASH,
  type UniswapV3ChainId,
  publicClientConfig,
} from 'sushi/config'
import { LiquidityProviders } from 'sushi/router'
import { type Address, PublicClient, createPublicClient } from 'viem'

const RPC_MAX_CALLS_IN_ONE_BATCH = 1000

function sushiswapV2Factory(chainId: SushiSwapV2ChainId) {
  return {
    address: SUSHISWAP_V2_FACTORY_ADDRESS[chainId],
    provider: LiquidityProviders.SushiSwapV2,
    fee: 0.003,
    initCodeHash: SUSHISWAP_V2_INIT_CODE_HASH[chainId],
  } as const
}

function sushiswapV3Factory(chainId: SushiSwapV3ChainId) {
  return {
    address: SUSHISWAP_V3_FACTORY_ADDRESS[chainId],
    provider: LiquidityProviders.SushiSwapV3,
    initCodeHash: SUSHISWAP_V3_INIT_CODE_HASH[chainId],
  } as const
}

function uniswapV3Factory(chainId: UniswapV3ChainId) {
  return {
    address: UNISWAP_V3_FACTORY_ADDRESS[chainId],
    provider: LiquidityProviders.UniswapV3,
    initCodeHash: UNISWAP_V3_INIT_CODE_HASH[chainId],
  } as const
}

export function pancakeswapV3Factory(chainId: PancakeSwapV3ChainId) {
  return {
    address: PANCAKESWAP_V3_FACTORY_ADDRESS[chainId],
    provider: LiquidityProviders.PancakeSwapV3,
    initCodeHash: PANCAKESWAP_V3_INIT_CODE_HASH[chainId],
    deployer: PANCAKESWAP_V3_DEPLOYER_ADDRESS[chainId],
    feeSpacingMap: PANCAKESWAP_V3_FEE_SPACING_MAP,
  } as const
}

// ! TODO: Fix casts when viem is updated
export const EXTRACTOR_CONFIG: Record<
  ExtractorSupportedChainId,
  ExtractorConfig
> = {
  [ChainId.ARBITRUM]: {
    client: createPublicClient(publicClientConfig[ChainId.ARBITRUM]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.ARBITRUM),
      {
        address: '0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429' as Address,
        provider: LiquidityProviders.Dfyn,
        fee: 0.003,
        initCodeHash:
          '0xd49917af2b31d70ba7bea89230a93b55d3b6a99aacd03a72c288dfe524ec2f36',
      },
      {
        address: '0xA59B2044EAFD15ee4deF138D410d764c9023E1F0' as Address,
        provider: LiquidityProviders.Elk,
        fee: 0.003,
        initCodeHash:
          '0x84845e7ccb283dec564acfcd3d9287a491dec6d675705545a2ab8be22ad78f31',
      },
    ],
    factoriesV3: [
      uniswapV3Factory(ChainId.ARBITRUM),
      sushiswapV3Factory(ChainId.ARBITRUM),
      pancakeswapV3Factory(ChainId.ARBITRUM),
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.ARBITRUM],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logType: LogFilterType.Native,
    logging: true,
    maxCallsInOneBatch: RPC_MAX_CALLS_IN_ONE_BATCH,
  },
  [ChainId.ARBITRUM_NOVA]: {
    client: createPublicClient(publicClientConfig[ChainId.ARBITRUM_NOVA]),
    factoriesV2: [sushiswapV2Factory(ChainId.ARBITRUM_NOVA)],
    factoriesV3: [sushiswapV3Factory(ChainId.ARBITRUM_NOVA)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.ARBITRUM_NOVA],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.AVALANCHE]: {
    client: createPublicClient(publicClientConfig[ChainId.AVALANCHE]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.AVALANCHE),
      {
        address: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10' as Address,
        provider: LiquidityProviders.TraderJoe,
        fee: 0.003,
        initCodeHash:
          '0x0bbca9af0511ad1a1da383135cf3a8d2ac620e549ef9f6ae3a4c33c2fed0af91',
      },
    ],
    factoriesV3: [sushiswapV3Factory(ChainId.AVALANCHE)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.AVALANCHE],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 100,
    logging: true,
  },
  [ChainId.BASE]: {
    client: createPublicClient(
      publicClientConfig[ChainId.BASE],
    ) as PublicClient,
    factoriesV2: [
      sushiswapV2Factory(ChainId.BASE),
      {
        address: '0xFDa619b6d20975be80A10332cD39b9a4b0FAa8BB' as Address,
        provider: LiquidityProviders.BaseSwap,
        fee: 0.0025,
        initCodeHash:
          '0xb618a2730fae167f5f8ac7bd659dd8436d571872655bcb6fd11f2158c8a64a3b',
      },
    ],
    factoriesV3: [
      sushiswapV3Factory(ChainId.BASE),
      uniswapV3Factory(ChainId.BASE),
      pancakeswapV3Factory(ChainId.BASE),
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.BASE],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.BOBA]: {
    client: createPublicClient(publicClientConfig[ChainId.BOBA]),
    factoriesV2: [sushiswapV2Factory(ChainId.BOBA)],
    factoriesV3: [sushiswapV3Factory(ChainId.BOBA)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.BOBA],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.BOBA_BNB]: {
    client: createPublicClient(publicClientConfig[ChainId.BOBA_BNB]),
    factoriesV2: [sushiswapV2Factory(ChainId.BOBA_BNB)],
    factoriesV3: [],
    tickHelperContractV3:
      '0x0000000000000000000000000000000000000000' as Address,
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.BSC]: {
    client: createPublicClient(SpecialExtractorClientConfig[ChainId.BSC]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.BSC),
      {
        address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73' as Address,
        provider: LiquidityProviders.PancakeSwap,
        fee: 0.0025,
        initCodeHash:
          '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
      },
      {
        address: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE' as Address,
        provider: LiquidityProviders.Biswap,
        fee: 0.002,
        initCodeHash:
          '0xfea293c909d87cd4153593f077b76bb7e94340200f4ee84211ae8e4f9bd7ffdf',
      },
      {
        address: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6' as Address,
        provider: LiquidityProviders.ApeSwap,
        fee: 0.003,
        initCodeHash:
          '0xf4ccce374816856d11f00e4069e7cada164065686fbef53c6167a63ec2fd8c5b',
      },
      {
        address: '0x0eb58E5c8aA63314ff5547289185cC4583DfCBD5' as Address,
        provider: LiquidityProviders.JetSwap,
        fee: 0.003,
        initCodeHash:
          '0x3125d0a15fa7af49ce234ba1cf5f931bad0504242e0e1ee9fcd7d1d7aa88c651',
      },
    ],
    factoriesV3: [
      uniswapV3Factory(ChainId.BSC),
      sushiswapV3Factory(ChainId.BSC),
      pancakeswapV3Factory(ChainId.BSC),
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.BSC],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 1000,
    logging: true,
    maxCallsInOneBatch: RPC_MAX_CALLS_IN_ONE_BATCH,
    maxBatchesSimultaniously: 5,
    experimantalPoolIncrementalMode: true, // Only changed pools are sent from Extractor to Router
    checkPoolIncrementalModeCorrectness: true, // if experimantalPoolIncrementalMode then make correctness check (resourcefull)
  },
  [ChainId.BTTC]: {
    client: createPublicClient(publicClientConfig[ChainId.BTTC]),
    factoriesV2: [sushiswapV2Factory(ChainId.BTTC)],
    factoriesV3: [sushiswapV3Factory(ChainId.BTTC)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.BTTC],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.CELO]: {
    client: createPublicClient(
      publicClientConfig[ChainId.CELO],
    ) as unknown as PublicClient,
    factoriesV2: [sushiswapV2Factory(ChainId.CELO)],
    factoriesV3: [uniswapV3Factory(ChainId.CELO)],
    tickHelperContractV3:
      '0x5f115D9113F88e0a0Db1b5033D90D4a9690AcD3D' as Address,
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.CORE]: {
    client: createPublicClient(publicClientConfig[ChainId.CORE]),
    factoriesV2: [sushiswapV2Factory(ChainId.CORE)],
    factoriesV3: [sushiswapV3Factory(ChainId.CORE)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.CORE],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.ETHEREUM]: {
    client: createPublicClient(SpecialExtractorClientConfig[ChainId.ETHEREUM]),
    factoriesV2: [
      {
        address: UNISWAP_V2_FACTORY_ADDRESS,
        provider: LiquidityProviders.UniswapV2,
        fee: 0.003,
        initCodeHash: UNISWAP_V2_INIT_CODE_HASH,
      },
      sushiswapV2Factory(ChainId.ETHEREUM),
      {
        address: '0xBAe5dc9B19004883d0377419FeF3c2C8832d7d7B' as Address,
        provider: LiquidityProviders.ApeSwap,
        fee: 0.003,
        initCodeHash:
          '0xe2200989b6f9506f3beca7e9c844741b3ad1a88ad978b6b0973e96d3ca4707aa',
      },
      {
        address: '0x6511eBA915fC1b94b2364289CCa2b27AE5898d80' as Address,
        provider: LiquidityProviders.Elk,
        fee: 0.003,
        initCodeHash:
          '0x84845e7ccb283dec564acfcd3d9287a491dec6d675705545a2ab8be22ad78f31',
      },
      {
        address: '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362' as Address,
        provider: LiquidityProviders.PancakeSwap,
        fee: 0.0025,
        initCodeHash:
          '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
      },
    ],
    factoriesV3: [
      uniswapV3Factory(ChainId.ETHEREUM),
      sushiswapV3Factory(ChainId.ETHEREUM),
      pancakeswapV3Factory(ChainId.ETHEREUM),
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.ETHEREUM],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
    maxCallsInOneBatch: RPC_MAX_CALLS_IN_ONE_BATCH,
    maxBatchesSimultaniously: 5,
  },
  [ChainId.FANTOM]: {
    client: createPublicClient(publicClientConfig[ChainId.FANTOM]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.FANTOM),
      {
        address: '0xd9820a17053d6314B20642E465a84Bf01a3D64f5' as Address,
        provider: LiquidityProviders.Dfyn,
        fee: 0.003,
        initCodeHash:
          '0xd3ab2c392f54feb4b3b2a677f449b133c188ad2f1015eff3e94ea9315282c5f5',
      },
      {
        address: '0x7Ba73c99e6f01a37f3e33854c8F544BbbadD3420' as Address,
        provider: LiquidityProviders.Elk,
        fee: 0.003,
        initCodeHash:
          '0x84845e7ccb283dec564acfcd3d9287a491dec6d675705545a2ab8be22ad78f31',
      },
      {
        address: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3' as Address,
        provider: LiquidityProviders.SpookySwap,
        fee: 0.003,
        initCodeHash:
          '0xcdf2deca40a0bd56de8e3ce5c7df6727e5b1bf2ac96f283fa9c4b3e6b42ea9d2',
      },
    ],
    factoriesV3: [
      sushiswapV3Factory(ChainId.FANTOM),
      {
        address: '0xaf20f5f19698f1D19351028cd7103B63D30DE7d7' as Address,
        provider: LiquidityProviders.Wagmi,
        initCodeHash:
          '0x30146866f3a846fe3c636beb2756dbd24cf321bc52c9113c837c21f47470dfeb',
      },
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.FANTOM],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.FUSE]: {
    client: createPublicClient(publicClientConfig[ChainId.FUSE]),
    factoriesV2: [sushiswapV2Factory(ChainId.FUSE)],
    factoriesV3: [sushiswapV3Factory(ChainId.FUSE)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.FUSE],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.GNOSIS]: {
    client: createPublicClient(publicClientConfig[ChainId.GNOSIS]),
    factoriesV2: [sushiswapV2Factory(ChainId.GNOSIS)],
    factoriesV3: [sushiswapV3Factory(ChainId.GNOSIS)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.GNOSIS],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.OPTIMISM]: {
    client: createPublicClient(
      publicClientConfig[ChainId.OPTIMISM],
    ) as PublicClient,
    factoriesV2: [
      sushiswapV2Factory(ChainId.OPTIMISM),
      // {
      //   address: '0xedfad3a0F42A8920B011bb0332aDe632e552d846' as Address,
      //   provider: LiquidityProviders.Elk,
      //   fee: 0.003,
      //   initCodeHash: '0x84845e7ccb283dec564acfcd3d9287a491dec6d675705545a2ab8be22ad78f31',
      // },
    ],
    factoriesV3: [
      uniswapV3Factory(ChainId.OPTIMISM),
      sushiswapV3Factory(ChainId.OPTIMISM),
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.OPTIMISM],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
    maxCallsInOneBatch: RPC_MAX_CALLS_IN_ONE_BATCH,
  },
  [ChainId.POLYGON]: {
    client: createPublicClient(publicClientConfig[ChainId.POLYGON]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.POLYGON),
      {
        address: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32' as Address,
        provider: LiquidityProviders.QuickSwap,
        fee: 0.003,
        initCodeHash:
          '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
      },
      {
        address: '0xCf083Be4164828f00cAE704EC15a36D711491284' as Address,
        provider: LiquidityProviders.ApeSwap,
        fee: 0.003,
        initCodeHash:
          '0x511f0f358fe530cda0859ec20becf391718fdf5a329be02f4c95361f3d6a42d8',
      },
      {
        address: '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B' as Address,
        provider: LiquidityProviders.Dfyn,
        fee: 0.003,
        initCodeHash:
          '0xf187ed688403aa4f7acfada758d8d53698753b998a3071b06f1b777f4330eaf3',
      },
      {
        address: '0xE3BD06c7ac7E1CeB17BdD2E5BA83E40D1515AF2a' as Address,
        provider: LiquidityProviders.Elk,
        fee: 0.003,
        initCodeHash:
          '0x84845e7ccb283dec564acfcd3d9287a491dec6d675705545a2ab8be22ad78f31',
      },
      {
        address: '0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7' as Address,
        provider: LiquidityProviders.JetSwap,
        fee: 0.003,
        initCodeHash:
          '0x505c843b83f01afef714149e8b174427d552e1aca4834b4f9b4b525f426ff3c6',
      },
    ],
    factoriesV3: [
      uniswapV3Factory(ChainId.POLYGON),
      sushiswapV3Factory(ChainId.POLYGON),
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.POLYGON],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 100,
    logging: true,
    maxBatchesSimultaniously: 5,
    maxCallsInOneBatch: RPC_MAX_CALLS_IN_ONE_BATCH,
  },
  [ChainId.POLYGON_ZKEVM]: {
    client: createPublicClient(publicClientConfig[ChainId.POLYGON_ZKEVM]),
    factoriesV2: [
      // sushiswapV2Factory(ChainId.POLYGON_ZKEVM)
    ],
    factoriesV3: [
      sushiswapV3Factory(ChainId.POLYGON_ZKEVM),
      pancakeswapV3Factory(ChainId.POLYGON_ZKEVM),
      {
        address: '0xdE474Db1Fa59898BC91314328D29507AcD0D593c' as Address,
        provider: LiquidityProviders.DovishV3,
        initCodeHash:
          '0xd3e7f58b9af034cfa7a0597e539bae7c6b393817a47a6fc1e1503cd6eaffe22a',
      },
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.POLYGON_ZKEVM],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
    maxCallsInOneBatch: 5,
  },

  [ChainId.SCROLL]: {
    client: createPublicClient(publicClientConfig[ChainId.SCROLL]),
    factoriesV2: [sushiswapV2Factory(ChainId.SCROLL)],
    factoriesV3: [sushiswapV3Factory(ChainId.SCROLL)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.SCROLL],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.LINEA]: {
    client: createPublicClient(publicClientConfig[ChainId.LINEA]),
    // factoriesV2: [sushiswapV2Factory(ChainId.LINEA)], // no v2 on linea?
    factoriesV3: [
      sushiswapV3Factory(ChainId.LINEA),
      pancakeswapV3Factory(ChainId.LINEA),
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.LINEA],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.FILECOIN]: {
    client: createPublicClient(publicClientConfig[ChainId.FILECOIN]),
    factoriesV2: [sushiswapV2Factory(ChainId.FILECOIN)],
    factoriesV3: [sushiswapV3Factory(ChainId.FILECOIN)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.FILECOIN],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.METIS]: {
    client: createPublicClient(publicClientConfig[ChainId.METIS]),
    factoriesV2: [sushiswapV2Factory(ChainId.METIS)],
    factoriesV3: [sushiswapV3Factory(ChainId.METIS)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.METIS],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.HAQQ]: {
    client: createPublicClient(publicClientConfig[ChainId.HAQQ]),
    factoriesV2: [sushiswapV2Factory(ChainId.HAQQ)],
    factoriesV3: [sushiswapV3Factory(ChainId.HAQQ)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.HAQQ],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.HARMONY]: {
    client: createPublicClient(publicClientConfig[ChainId.HARMONY]),
    factoriesV2: [sushiswapV2Factory(ChainId.HARMONY)],
    // No V3 on Harmony?
    factoriesV3: [],
    tickHelperContractV3:
      '0x0000000000000000000000000000000000000000' as Address,
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.KAVA]: {
    client: createPublicClient(publicClientConfig[ChainId.KAVA]),
    factoriesV2: [sushiswapV2Factory(ChainId.KAVA)],
    factoriesV3: [sushiswapV3Factory(ChainId.KAVA)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.KAVA],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.MOONBEAM]: {
    client: createPublicClient(publicClientConfig[ChainId.MOONBEAM]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.MOONBEAM),
      {
        address: '0x19B85ae92947E0725d5265fFB3389e7E4F191FDa' as Address,
        provider: LiquidityProviders.Solarbeam,
        fee: 0.003,
        initCodeHash:
          '0x9a100ded5f254443fbd264cb7e87831e398a8b642e061670a9bc35ba27293dbf',
      },
    ],
    factoriesV3: [
      // No SushiSwapV3 on Moonbeam?
      uniswapV3Factory(ChainId.MOONBEAM),
    ],
    tickHelperContractV3:
      '0x1f4F7b041895D9eB1A79be0896AF3E68e4160010' as Address,
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
  },
  [ChainId.MOONRIVER]: {
    client: createPublicClient(publicClientConfig[ChainId.MOONRIVER]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.MOONRIVER),
      {
        address: '0x049581aEB6Fe262727f290165C29BDAB065a1B68' as Address,
        provider: LiquidityProviders.Solarbeam,
        fee: 0.003,
        initCodeHash:
          '0x9a100ded5f254443fbd264cb7e87831e398a8b642e061670a9bc35ba27293dbf',
      },
    ],
    factoriesV3: [sushiswapV3Factory(ChainId.MOONRIVER)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.MOONRIVER],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 100,
    logging: true,
  },
  [ChainId.TELOS]: {
    client: createPublicClient(publicClientConfig[ChainId.TELOS]),
    factoriesV2: [sushiswapV2Factory(ChainId.TELOS)],
    factoriesV3: [],
    factoriesAlgebra: [
      {
        address: '0xA09BAbf9A48003ae9b9333966a8Bda94d820D0d9' as Address,
        provider: LiquidityProviders.Swapsicle,
      },
    ],
    tickHelperContractV3:
      '0x0000000000000000000000000000000000000000' as Address,
    tickHelperContractAlgebra:
      '0x9dE2dEA5c68898eb4cb2DeaFf357DFB26255a4aa' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
    maxCallsInOneBatch: RPC_MAX_CALLS_IN_ONE_BATCH,
  },

  [ChainId.THUNDERCORE]: {
    client: createPublicClient(publicClientConfig[ChainId.THUNDERCORE]),
    factoriesV2: [sushiswapV2Factory(ChainId.THUNDERCORE)],
    factoriesV3: [sushiswapV3Factory(ChainId.THUNDERCORE)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.THUNDERCORE],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.ZETACHAIN]: {
    client: createPublicClient(publicClientConfig[ChainId.ZETACHAIN]),
    factoriesV2: [sushiswapV2Factory(ChainId.ZETACHAIN)],
    factoriesV3: [sushiswapV3Factory(ChainId.ZETACHAIN)],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.ZETACHAIN],
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.CRONOS]: {
    client: createPublicClient(publicClientConfig[ChainId.CRONOS]),
    factoriesV2: [
      {
        address: '0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15' as Address,
        provider: LiquidityProviders.VVSStandard,
        fee: 0.003,
        initCodeHash:
          '0xa77ee1cc0f39570ddde947459e293d7ebc2c30ff4e8fc45860afdcb2c2d3dc17',
      },
    ],
    factoriesV3: [],
    tickHelperContractV3:
      '0x0000000000000000000000000000000000000000' as Address,
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  [ChainId.BLAST]: {
    client: createPublicClient(publicClientConfig[ChainId.BLAST]),
    factoriesV2: [
      sushiswapV2Factory(ChainId.BLAST),
      {
        address: '0x04C9f118d21e8B767D2e50C946f0cC9F6C367300' as Address,
        provider: LiquidityProviders.SwapBlast,
        fee: 0.001,
        initCodeHash:
          '0x89f2ba5c4e1e84307b0efac8ff56efab2786d9becd741ff83b1b6397de76dafc',
      },
      {
        address: '0x66346aac17d0e61156AC5F2A934ccF2a9BDe4c65' as Address,
        provider: LiquidityProviders.BlastDEX,
        fee: 0.002,
        initCodeHash:
          '0x376acff9b60b853f5ccc9f1caecb8dcf722793593330ac58aac8a880a3eb8b9e',
      },
      {
        address: '0xE27cb06A15230A7480d02956a3521E78C5bFD2D0' as Address,
        provider: LiquidityProviders.MonoswapV2,
        fee: 0.003,
        initCodeHash:
          '0xd1a99f7339108abbcc2eaa6478ee4a0394e2a63f04de08793721fb2f3eff5a38',
      },
      {
        address: '0xb4A7D971D0ADea1c73198C97d7ab3f9CE4aaFA13' as Address,
        provider: LiquidityProviders.ThrusterV2,
        fee: 0.003,
        initCodeHash:
          '0x6f0346418750a1a53597a51ceff4f294b5f0e87f09715525b519d38ad3fab2cb',
      },
      {
        address: '0x37836821a2c03c171fB1a595767f4a16e2b93Fc4' as Address,
        provider: LiquidityProviders.ThrusterV2,
        fee: 0.01,
        initCodeHash:
          '0x32a9ff5a51b653cbafe88e38c4da86b859135750d3ca435f0ce732c8e3bb8335',
      },
      {
        address: '0xA1da7a7eB5A858da410dE8FBC5092c2079B58413',
        provider: LiquidityProviders.DyorV2,
        fee: 0.0025,
        initCodeHash:
          '0xda2f1a903916d7de88d9357d27d763f123502a5d48e3b229d5fa049b3ffdeeb5',
      },
      {
        address: '0xD97fFc2041a8aB8f6bc4aeE7eE8ECA485381D088',
        provider: LiquidityProviders.HyperBlast,
        fee: 0.003,
        initCodeHash:
          '0x2e6ab686c26cf8ecf0a8c01a9fb0ef96dbd4631c04b03005350fa49e8f2f32f8',
      },
    ],
    factoriesV3: [
      sushiswapV3Factory(ChainId.BLAST),
      {
        address: '0x48d0F09710794313f33619c95147F34458BF7C3b',
        provider: LiquidityProviders.MonoswapV3,
        initCodeHash:
          '0x7ea070216c7d9135010a36147394687bab92df4695e924000eed7c4b33eb922f',
      },
      {
        address: '0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127',
        deployer: '0xa08ae3d3f4dA51C22d3c041E468bdF4C61405AaB',
        provider: LiquidityProviders.ThrusterV3,
        initCodeHash:
          '0xd0c3a51b16dbc778f000c620eaabeecd33b33a80bd145e1f7cbc0d4de335193d',
      },
    ],
    tickHelperContractV3: SUSHISWAP_V3_TICK_LENS[ChainId.BLAST] as Address,
    tickHelperContractAlgebra:
      '0x0000000000000000000000000000000000000000' as Address,
    cacheDir: './cache',
    logDepth: 50,
    logging: true,
  },
  // [ChainId.RONIN]: {
  //   client: createPublicClient(publicClientConfig[ChainId.RONIN]),
  //   factoriesV2: [],
  //   factoriesV3: [],
  //   tickHelperContract: '0x0000000000000000000000000000000000000000' as Address,
  //   cacheDir: './cache',
  //   logDepth: 50,
  //   logging: true,
  // },
}

export const PORT = process.env['PORT'] || 80

export const SENTRY_DSN = process.env['SENTRY_DSN'] as string
if (!SENTRY_DSN) {
  throw new Error('SENTRY_DSN is not set')
}
export const SENTRY_ENVIRONMENT = process.env['SENTRY_ENVIRONMENT'] as string
if (!SENTRY_ENVIRONMENT) {
  throw new Error('SENTRY_ENVIRONMENT is not set')
}

export const CHAIN_ID = Number(
  process.env['CHAIN_ID'],
) as keyof typeof EXTRACTOR_CONFIG
if (!CHAIN_ID) {
  throw new Error('CHAIN_ID is not set')
}

if (!(CHAIN_ID in EXTRACTOR_CONFIG)) {
  throw new Error(`EXTRACTOR_CONFIG is not set for CHAIN_ID=${CHAIN_ID}`)
}

export const POOLS_SERIALIZATION_INTERVAL = (_chainId: ChainId) => 4_000
export const REQUESTED_PAIRS_SERIALIZATION_INTERVAL = (_chainId: ChainId) =>
  120_000
