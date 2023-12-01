import {
  Extractor,
  FactoryV2,
  FactoryV3,
  LogFilterType,
  MultiCallAggregator,
  TokenManager,
} from '@sushiswap/extractor'
import {
  DataFetcher,
  LiquidityProviders,
  NativeWrapProvider,
} from '@sushiswap/router'
import {
  ADDITIONAL_BASES,
  BASES_TO_CHECK_TRADES_AGAINST,
} from '@sushiswap/router-config'
import {
  SUSHISWAP_V2_FACTORY_ADDRESS,
  SUSHISWAP_V2_INIT_CODE_HASH,
} from '@sushiswap/v2-sdk'
import {
  POOL_INIT_CODE_HASH,
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SUSHISWAP_V3_INIT_CODE_HASH,
  SushiSwapV3ChainId,
} from '@sushiswap/v3-sdk'
import { expect } from 'chai'
import { ChainId } from 'sushi/chain'
import { Token } from 'sushi/currency'
import { http, Address, Transport, createPublicClient } from 'viem'
import { Chain, arbitrum, mainnet, polygon } from 'viem/chains'

export const RP3Address = {
  [ChainId.ETHEREUM]: '0x827179dD56d07A7eeA32e3873493835da2866976' as Address,
  [ChainId.POLYGON]: '0x0a6e511Fe663827b9cA7e2D2542b20B37fC217A6' as Address,
  [ChainId.ARBITRUM]: '0xfc506AaA1340b4dedFfd88bE278bEe058952D674' as Address,
  [ChainId.OPTIMISM]: '0x4C5D5234f232BD2D76B96aA33F5AE4FCF0E4BFAb' as Address,
  [ChainId.CELO]: '0x2f686751b19a9d91cc3d57d90150Bc767f050066' as Address,
  [ChainId.POLYGON_ZKEVM]:
    '0x2f686751b19a9d91cc3d57d90150Bc767f050066' as Address,
  [ChainId.AVALANCHE]: '0x717b7948AA264DeCf4D780aa6914482e5F46Da3e' as Address,
  [ChainId.BASE]: '0x0BE808376Ecb75a5CF9bB6D237d16cd37893d904' as Address,
}

export const TickLensContract = {
  [ChainId.ETHEREUM]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.POLYGON]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.ARBITRUM]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.OPTIMISM]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.CELO]: '0x5f115D9113F88e0a0Db1b5033D90D4a9690AcD3D' as Address,
  [ChainId.POLYGON_ZKEVM]:
    '0x0BE808376Ecb75a5CF9bB6D237d16cd37893d904' as Address,
  [ChainId.AVALANCHE]: '0xDdC1b5920723F774d2Ec2C3c9355251A20819776' as Address,
  [ChainId.BASE]: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3' as Address,
}

export const UniswapV2FactoryAddress: Record<number, string> = {
  [ChainId.ETHEREUM]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
}
function uniswapV2Factory(chain: ChainId): FactoryV2 {
  return {
    address: UniswapV2FactoryAddress[chain] as Address,
    provider: LiquidityProviders.UniswapV2,
    fee: 0.003,
    initCodeHash:
      '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
  }
}

function sushiswapV2Factory(chain: ChainId): FactoryV2 {
  return {
    address: SUSHISWAP_V2_FACTORY_ADDRESS[chain] as Address,
    provider: LiquidityProviders.SushiSwapV2,
    fee: 0.003,
    initCodeHash: SUSHISWAP_V2_INIT_CODE_HASH[chain],
  }
}

export const UniswapV3FactoryAddress: Record<number, string> = {
  [ChainId.ETHEREUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.POLYGON]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.ARBITRUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.OPTIMISM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.BSC]: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
  [ChainId.CELO]: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
  [ChainId.BASE]: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
}
function uniswapV3Factory(chain: ChainId): FactoryV3 {
  return {
    address: UniswapV3FactoryAddress[chain] as Address,
    provider: LiquidityProviders.UniswapV3,
    initCodeHash: POOL_INIT_CODE_HASH,
  }
}

function sushiswapV3Factory(chainId: SushiSwapV3ChainId) {
  return {
    address: SUSHISWAP_V3_FACTORY_ADDRESS[chainId],
    provider: LiquidityProviders.SushiSwapV3,
    initCodeHash: SUSHISWAP_V3_INIT_CODE_HASH[chainId],
  } as const
}

async function CompareTest(args: {
  transport?: Transport
  providerURL?: string
  chain: Chain
  factoriesV2: FactoryV2[]
  factoriesV3: FactoryV3[]
  liquidityProviders: LiquidityProviders[]
  tickHelperContract: Address
  cacheDir: string
  logDepth: number
  logType?: LogFilterType
  logging?: boolean
  maxCallsInOneBatch?: number
  RP3Address: Address
  account?: Address
  checkTokens?: Token[]
}) {
  const transport = args.transport ?? http(args.providerURL)
  const client = createPublicClient({
    chain: args.chain,
    transport: transport,
  })
  const chainId = client.chain?.id as ChainId

  const extractor = new Extractor({ ...args, client, logging: false })
  await extractor.start(
    BASES_TO_CHECK_TRADES_AGAINST[chainId].concat(args.checkTokens ?? []),
  )

  const nativeProvider = new NativeWrapProvider(chainId, client)
  const poolsNativeSet = new Set(
    nativeProvider.getCurrentPoolList().map((pc) => pc.pool.address),
  )

  const tokenManager = new TokenManager(
    extractor.extractorV2?.multiCallAggregator ||
      (extractor.extractorV3?.multiCallAggregator as MultiCallAggregator),
    __dirname,
    `tokens-${client.chain?.id}`,
  )
  await tokenManager.addCachedTokens()
  const tokens =
    args.checkTokens ??
    BASES_TO_CHECK_TRADES_AGAINST[chainId]
      .concat(Array.from(tokenManager.tokens.values()))
      .slice(0, 60)

  let count = 0
  for (let i = 1; i < tokens.length; i += 2) {
    const j = i - 1
    if (tokens[i].address === tokens[j].address) continue

    const add0 = ADDITIONAL_BASES[chainId]?.[tokens[i].address] ?? []
    const add1 = ADDITIONAL_BASES[chainId]?.[tokens[j].address] ?? []

    const dataFetcher = new DataFetcher({ chainId, client })
    dataFetcher.startDataFetching(args.liquidityProviders)

    const [poolCodesExtractor, poolCodesDataFetcher] = await Promise.all([
      extractor.getPoolCodesForTokensAsync(
        BASES_TO_CHECK_TRADES_AGAINST[chainId]
          .concat([tokens[i], tokens[j]])
          .concat(add0)
          .concat(add1),
        10_000, // 10 sec timeout
      ),
      (async () => {
        await dataFetcher.fetchPoolsForToken(tokens[i], tokens[j])
        return await dataFetcher.getCurrentPoolCodeList(tokens[i], tokens[j])
      })(),
    ])

    const poolsExtractor = poolCodesExtractor.map((pc) => pc.pool.address)
    const poolsExtractorSet = new Set(poolsExtractor)

    const poolsDataFetcher = poolCodesDataFetcher.map((pc) => pc.pool.address)
    const poolsDataFetcherSet = new Set(poolsDataFetcher)

    const poolsExtractorOnly = poolsExtractor.filter(
      (p) => !poolsDataFetcherSet.has(p) && !poolsNativeSet.has(p),
    )
    const poolsDataFetcherOnly = poolsDataFetcher.filter(
      (p) => !poolsExtractorSet.has(p) && !poolsNativeSet.has(p),
    )

    console.log(
      `${++count} ${tokens[i].symbol} -> ${
        tokens[j].symbol
      } [${poolsExtractorOnly}] [${poolsDataFetcherOnly}]`,
    )
    expect(poolsExtractorOnly.length).equal(0)
    expect(poolsDataFetcherOnly.length).equal(0)
  }
}

it('Ethereum Extractor - DataFetcher compare test', async () => {
  await CompareTest({
    providerURL: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
    chain: mainnet,
    factoriesV2: [
      //
      sushiswapV2Factory(ChainId.ETHEREUM),
      uniswapV2Factory(ChainId.ETHEREUM),
    ],
    factoriesV3: [
      //
      uniswapV3Factory(ChainId.ETHEREUM),
      sushiswapV3Factory(ChainId.ETHEREUM),
    ],
    liquidityProviders: [
      //
      LiquidityProviders.SushiSwapV2,
      LiquidityProviders.UniswapV2,
      LiquidityProviders.UniswapV3,
      LiquidityProviders.SushiSwapV3,
    ],
    tickHelperContract: TickLensContract[ChainId.ETHEREUM],
    cacheDir: './cache',
    logDepth: 50,
    RP3Address: RP3Address[ChainId.ETHEREUM],
  })
})

it('Polygon Extractor - DataFetcher compare test', async () => {
  await CompareTest({
    providerURL: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
    chain: polygon,
    factoriesV2: [
      //
      sushiswapV2Factory(ChainId.POLYGON),
    ],
    factoriesV3: [
      //
      uniswapV3Factory(ChainId.POLYGON),
    ],
    liquidityProviders: [
      //
      LiquidityProviders.SushiSwapV2,
      LiquidityProviders.UniswapV3,
    ],
    tickHelperContract: TickLensContract[ChainId.ETHEREUM],
    cacheDir: './cache',
    logDepth: 100,
    RP3Address: RP3Address[ChainId.ETHEREUM],
  })
})

it('Arbitrum Extractor - DataFetcher compare test', async () => {
  await CompareTest({
    providerURL: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
    chain: arbitrum,
    factoriesV2: [
      //
    ],
    factoriesV3: [
      //
      uniswapV3Factory(ChainId.ARBITRUM),
    ],
    liquidityProviders: [
      //
      LiquidityProviders.UniswapV3,
    ],
    tickHelperContract: TickLensContract[ChainId.ETHEREUM],
    cacheDir: './cache',
    logDepth: 300,
    RP3Address: RP3Address[ChainId.ETHEREUM],
  })
})
