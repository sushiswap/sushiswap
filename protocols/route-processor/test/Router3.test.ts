import {
  SnapshotRestorer,
  takeSnapshot,
} from '@nomicfoundation/hardhat-network-helpers'
import {
  DataFetcher,
  LiquidityProviders,
  NativeWrapBridgePoolCode,
  PermitData,
  PoolFilter,
  Router,
} from '@sushiswap/router'
import { PoolCode } from '@sushiswap/router/dist/pools/PoolCode'
import {
  BridgeBento,
  RPool,
  RouteStatus,
  StableSwapRPool,
  getBigInt,
} from '@sushiswap/tines'
import { setTokenBalance } from '@sushiswap/tines-sandbox'
import { expect } from 'chai'
import { signERC2612Permit } from 'eth-permit'
import { config, network } from 'hardhat'
import seedrandom from 'seedrandom'
import { erc20Abi, routeProcessor3Abi, weth9Abi } from 'sushi/abi'
import { ChainId, chainName } from 'sushi/chain'
import { BENTOBOX_ADDRESS, BentoBoxChainId } from 'sushi/config'
import {
  DAI,
  DAI_ADDRESS,
  FRAX,
  FRAX_ADDRESS,
  FXS,
  FXS_ADDRESS,
  Native,
  SUSHI,
  SUSHI_ADDRESS,
  Token,
  Type,
  USDC,
  USDC_ADDRESS,
  USDT,
  USDT_ADDRESS,
  WBTC_ADDRESS,
  WNATIVE,
} from 'sushi/currency'
import { abs } from 'sushi/math'
import { type Contract } from 'sushi/types'
import {
  Address,
  Client,
  Hex,
  createPublicClient,
  custom,
  testActions,
  walletActions,
} from 'viem'
import { HDAccount, mnemonicToAccount } from 'viem/accounts'
import { hardhat } from 'viem/chains'

import RouteProcessor3 from '../artifacts/contracts/RouteProcessor3.sol/RouteProcessor3.json'
import { getAllPoolCodes } from './utils/getAllPoolCodes'

// Updating  pools' state allows to test DF updating ability, but makes tests very-very slow (
const UPDATE_POOL_STATES = false
const POLLING_INTERVAL = process.env.ALCHEMY_ID ? 1_000 : 10_000
const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms))

function getRandomExp(rnd: () => number, min: number, max: number) {
  const minL = Math.log(min)
  const maxL = Math.log(max)
  const v = rnd() * (maxL - minL) + minL
  const res = Math.exp(v)
  console.assert(res <= max && res >= min, 'Random value is out of the range')
  return res
}

async function setRouterPrimaryBalance(
  client: Client,
  router: Address,
  token?: Address,
): Promise<void> {
  if (token) {
    await setTokenBalance(client, token, router, 1n)
  }
}

async function getTestEnvironment() {
  const client = createPublicClient({
    batch: {
      multicall: {
        batchSize: 2048,
        wait: 1,
      },
    },
    chain: {
      ...hardhat,
      contracts: {
        multicall3: {
          address: '0xca11bde05977b3631167028862be2a173976ca11',
          blockCreated: 25770160,
        },
      },
      pollingInterval: POLLING_INTERVAL,
    },
    transport: custom(network.provider),
  })
    .extend(testActions({ mode: 'hardhat' }))
    .extend(walletActions)

  const accounts = config.networks.hardhat.accounts as { mnemonic: string }

  const user = mnemonicToAccount(accounts.mnemonic, { accountIndex: 0 })
  const user2 = mnemonicToAccount(accounts.mnemonic, { accountIndex: 1 })

  const chainId = network.config.chainId as ChainId
  const dataFetcher = new DataFetcher({ chainId, client })

  dataFetcher.startDataFetching()
  const poolCodes = new Map<string, PoolCode>()
  if (!UPDATE_POOL_STATES) {
    const pc = await getAllPoolCodes(
      dataFetcher,
      chainId,
      (network.config as { forking: { blockNumber?: number } }).forking
        ?.blockNumber,
    )
    pc.forEach((p) => poolCodes.set(p.pool.address, p))
  }

  const RouteProcessorTx = await client.deployContract({
    chain: null,
    abi: routeProcessor3Abi,
    bytecode: RouteProcessor3.bytecode as Hex,
    account: user.address,
    args: [BENTOBOX_ADDRESS[chainId as BentoBoxChainId], []],
  })
  const RouteProcessorAddress = (
    await client.waitForTransactionReceipt({ hash: RouteProcessorTx })
  ).contractAddress
  if (!RouteProcessorAddress)
    throw new Error('RouteProcessorAddress is undefined')
  const RouteProcessor = {
    address: RouteProcessorAddress,
    abi: routeProcessor3Abi,
  }

  // saturate router balance with wei of tokens
  await Promise.all([
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      WNATIVE[chainId].address as Address,
    ),
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      SUSHI_ADDRESS[chainId as keyof typeof SUSHI_ADDRESS],
    ),
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      USDC_ADDRESS[chainId as keyof typeof USDC_ADDRESS],
    ),
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      USDT_ADDRESS[chainId as keyof typeof USDT_ADDRESS],
    ),
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      DAI_ADDRESS[chainId as keyof typeof DAI_ADDRESS],
    ),
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      FRAX_ADDRESS[chainId as keyof typeof FRAX_ADDRESS],
    ),
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      FXS_ADDRESS[chainId as keyof typeof FXS_ADDRESS],
    ),
    setRouterPrimaryBalance(
      client,
      RouteProcessorAddress,
      WBTC_ADDRESS[chainId as keyof typeof WBTC_ADDRESS],
    ),
  ])

  console.log(
    `  Network: ${
      chainName[chainId]
    }, Forked Block: ${await client.getBlockNumber()}`,
  )
  //console.log('    User creation ...')

  return {
    chainId,
    client,
    rp: RouteProcessor,
    user,
    user2,
    dataFetcher,
    poolCodes,
    snapshot: await takeSnapshot(),
  } satisfies {
    chainId: ChainId
    client: Client
    rp: Contract<typeof routeProcessor3Abi>
    user: HDAccount
    user2: HDAccount
    dataFetcher: DataFetcher
    poolCodes: Map<string, PoolCode>
    snapshot: SnapshotRestorer
  }
}

type TestEnvironment = Awaited<ReturnType<typeof getTestEnvironment>>

async function makePermit(
  env: TestEnvironment,
  token: Token,
  amount: bigint,
): Promise<PermitData> {
  const result = await signERC2612Permit(
    network.provider,
    token.address,
    env.user.address,
    env.rp.address,
    `0x${amount.toString(16)}`,
  )
  return {
    value: BigInt(result.value),
    deadline: BigInt(result.deadline),
    v: result.v,
    r: result.r,
    s: result.s,
  }
}

// all pool data assumed to be updated
async function makeSwap(
  env: TestEnvironment,
  fromToken: Type,
  amountIn: bigint,
  toToken: Type,
  usedPools: Set<string>,
  providers?: LiquidityProviders[],
  poolFilter?: PoolFilter,
  permits: PermitData[] = [],
): Promise<[bigint, bigint] | undefined> {
  // console.log(`Make swap ${fromToken.symbol} -> ${toToken.symbol} amount: ${amountIn.toString()}`)

  if (fromToken instanceof Token && permits.length === 0) {
    await env.client.writeContract({
      chain: null,
      abi: erc20Abi,
      address: fromToken.address as Address,
      account: env.user.address,
      functionName: 'approve',
      args: [env.rp.address, amountIn],
    })
  }

  let pcMap: Map<string, PoolCode>
  if (UPDATE_POOL_STATES) {
    await env.dataFetcher.fetchPoolsForToken(fromToken, toToken)
    pcMap = env.dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)
  } else {
    pcMap = new Map()
    Array.from(env.poolCodes.entries()).forEach((e) => {
      if (!usedPools.has(e[0])) pcMap.set(e[0], e[1])
    })
  }
  //await checkPoolsState(pcMap, env.user, env.chainId)

  const route = Router.findBestRoute(
    pcMap,
    env.chainId,
    fromToken,
    amountIn,
    toToken,
    30e9,
    providers,
    poolFilter,
  )
  // console.log(Router.routeToHumanString(pcMap, route, fromToken, toToken))
  // console.log(
  //   'ROUTE:',
  //   route.legs.map(
  //     (l) =>
  //       `${l.tokenFrom.symbol} -> ${l.tokenTo.symbol}  ${l.poolAddress}  ${l.assumedAmountIn} -> ${l.assumedAmountOut}`
  //   )
  // )
  if (route.status === RouteStatus.NoWay) return

  const rpParams = Router.routeProcessor2Params(
    pcMap,
    route,
    fromToken,
    toToken,
    env.user.address,
    env.rp.address,
    permits,
  )
  if (rpParams === undefined) return

  // console.log('Call route processor (may take long time for the first launch)...')

  let balanceOutBIBefore: bigint
  let toTokenContract: Contract<typeof weth9Abi> | undefined = undefined
  if (toToken instanceof Token) {
    toTokenContract = {
      abi: weth9Abi,
      address: toToken.address as Address,
    }

    balanceOutBIBefore = await env.client.readContract({
      ...(toTokenContract as NonNullable<typeof toTokenContract>),
      account: env.user.address,
      functionName: 'balanceOf',
      args: [env.user.address],
    })
  } else {
    balanceOutBIBefore = await env.client.getBalance({
      address: env.user.address,
    })
  }

  const txHash = await env.client.writeContract({
    chain: null,
    ...env.rp,
    functionName: 'processRoute',
    args: [
      rpParams.tokenIn as Address,
      rpParams.amountIn,
      rpParams.tokenOut as Address,
      rpParams.amountOutMin,
      rpParams.to,
      rpParams.routeCode,
    ],
    account: env.user.address,
    value: rpParams.value || 0n,
  })
  const receipt = await env.client.waitForTransactionReceipt({ hash: txHash })

  if (!UPDATE_POOL_STATES) {
    route.legs.forEach((l) => {
      if (!(pcMap.get(l.poolAddress) instanceof NativeWrapBridgePoolCode)) {
        usedPools.add(l.poolAddress)
      }
    })
  }

  // const trace = await network.provider.send('debug_traceTransaction', [receipt.transactionHash])
  // printGasUsage(trace)

  // console.log("Fetching user's output balance ...")
  let balanceOutBI: bigint
  if (toTokenContract) {
    balanceOutBI =
      (await env.client.readContract({
        ...toTokenContract,
        functionName: 'balanceOf',
        args: [env.user.address],
      })) - balanceOutBIBefore
  } else {
    balanceOutBI =
      (await env.client.getBalance({ address: env.user.address })) -
      balanceOutBIBefore
    balanceOutBI = balanceOutBI + receipt.effectiveGasPrice * receipt.gasUsed
  }
  const slippage = Number(
    ((balanceOutBI - route.amountOutBI) * 10_000n) / route.amountOutBI,
  )

  if (abs(route.amountOutBI - balanceOutBI) > 10n) {
    if (slippage < 0) {
      console.log(`expected amountOut: ${route.amountOutBI.toString()}`)
      console.log(`real amountOut:     ${balanceOutBI.toString()}`)
      console.log(`slippage: ${slippage / 100}%`)
    }
    expect(slippage).greaterThanOrEqual(0) // positive slippage could be if we 'gather' some liquidity on the route
  }

  return [balanceOutBI, receipt.blockNumber]
}

async function dataUpdated(env: TestEnvironment, minBlockNumber: bigint) {
  if (UPDATE_POOL_STATES)
    for (;;) {
      if (env.dataFetcher.getLastUpdateBlock() >= minBlockNumber) return
      await delay(500)
    }
}

async function updMakeSwap(
  env: TestEnvironment,
  fromToken: Type,
  toToken: Type,
  lastCallResult: bigint | [bigint | undefined, bigint],
  usedPools: Set<string> = new Set(),
  providers?: LiquidityProviders[],
  poolFilter?: PoolFilter,
  permits: PermitData[] = [],
): Promise<[bigint | undefined, bigint]> {
  const [amountIn, waitBlock] =
    typeof lastCallResult === 'bigint' ? [lastCallResult, 1n] : lastCallResult
  if (amountIn === undefined) return [undefined, waitBlock] // previous swap failed

  //console.log('Wait data update for min block', waitBlock)
  await dataUpdated(env, waitBlock)

  const res = await makeSwap(
    env,
    fromToken,
    amountIn,
    toToken,
    usedPools,
    providers,
    poolFilter,
    permits,
  )
  if (res === undefined) return [undefined, waitBlock]
  else return res
}

async function checkTransferAndRoute(
  env: TestEnvironment,
  fromToken: Type,
  toToken: Type,
  lastCallResult: bigint | [bigint | undefined, bigint],
  usedPools: Set<string>,
): Promise<[bigint | undefined, bigint]> {
  const [amountIn, waitBlock] =
    typeof lastCallResult === 'bigint' ? [lastCallResult, 1n] : lastCallResult
  if (amountIn === undefined) return [undefined, waitBlock] // previous swap failed
  await dataUpdated(env, waitBlock)

  if (fromToken instanceof Token) {
    await env.client.writeContract({
      chain: null,
      abi: erc20Abi,
      address: fromToken.address as Address,
      account: env.user.address,
      functionName: 'approve',
      args: [env.rp.address, amountIn],
    })
  }

  let pcMap: Map<string, PoolCode>
  if (UPDATE_POOL_STATES) {
    await env.dataFetcher.fetchPoolsForToken(fromToken, toToken)
    pcMap = env.dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)
  } else {
    pcMap = new Map()
    Array.from(env.poolCodes.entries()).forEach((e) => {
      if (!usedPools.has(e[0])) pcMap.set(e[0], e[1])
    })
  }

  const route = Router.findBestRoute(
    pcMap,
    env.chainId,
    fromToken,
    amountIn,
    toToken,
    30e9,
  )
  const rpParams = Router.routeProcessor2Params(
    pcMap,
    route,
    fromToken,
    toToken,
    env.user.address,
    env.rp.address,
  )
  const transferValue = getBigInt(
    0.02 * 10 ** Native.onChain(env.chainId).decimals,
  )
  rpParams.value = (rpParams.value || 0n) + transferValue

  const balanceUser2Before = await env.client.getBalance({
    address: env.user2.address,
  })

  let balanceOutBIBefore: bigint
  let toTokenContract: Contract<typeof weth9Abi> | undefined = undefined
  if (toToken instanceof Token) {
    toTokenContract = {
      abi: weth9Abi,
      address: toToken.address as Address,
    }

    balanceOutBIBefore = await env.client.readContract({
      ...(toTokenContract as NonNullable<typeof toTokenContract>),
      account: env.user.address,
      functionName: 'balanceOf',
      args: [env.user.address],
    })
  } else {
    balanceOutBIBefore = await env.client.getBalance({
      address: env.user.address,
    })
  }
  const tx = await env.client.writeContract({
    ...env.rp,
    chain: null,
    functionName: 'transferValueAndprocessRoute',
    args: [
      env.user2.address,
      transferValue,
      rpParams.tokenIn,
      rpParams.amountIn,
      rpParams.tokenOut,
      rpParams.amountOutMin,
      rpParams.to,
      rpParams.routeCode,
    ],
    account: env.user.address,
    value: rpParams.value,
  })
  const receipt = await env.client.waitForTransactionReceipt({ hash: tx })

  if (!UPDATE_POOL_STATES) {
    route.legs.forEach((l) => {
      if (!(pcMap.get(l.poolAddress) instanceof NativeWrapBridgePoolCode)) {
        usedPools.add(l.poolAddress)
      }
    })
  }

  let balanceOutBI: bigint
  if (toTokenContract) {
    balanceOutBI =
      (await env.client.readContract({
        ...(toTokenContract as NonNullable<typeof toTokenContract>),
        account: env.user.address,
        functionName: 'balanceOf',
        args: [env.user.address],
      })) - balanceOutBIBefore
  } else {
    balanceOutBI = balanceOutBI =
      (await env.client.getBalance({ address: env.user.address })) -
      balanceOutBIBefore
    balanceOutBI = balanceOutBI + receipt.effectiveGasPrice * receipt.gasUsed
    balanceOutBI = balanceOutBI + transferValue
  }
  expect(balanceOutBI >= rpParams.amountOutMin).equal(true)

  const balanceUser2After = await env.client.getBalance({
    address: env.user2.address,
  })
  const transferredValue = balanceUser2After - balanceUser2Before
  expect(transferredValue === transferValue).equal(true)

  return [balanceOutBI, receipt.blockNumber]
}

// skipped because took too long time. Unskip to check the RP
describe('End-to-end RouteProcessor3 test', async function () {
  let env: TestEnvironment
  let chainId: ChainId
  let intermidiateResult: [bigint | undefined, bigint] = [undefined, 1n]
  let testTokensSet: (Type | undefined)[]
  let SUSHI_LOCAL: Token
  let USDC_LOCAL: Token

  before(async () => {
    env = await getTestEnvironment()
    chainId = env.chainId

    type SUSHI_CHAINS = keyof typeof SUSHI_ADDRESS
    type USDC_CHAINS = keyof typeof USDC_ADDRESS
    type USDT_CHAINS = keyof typeof USDT_ADDRESS
    type DAI_CHAINS = keyof typeof DAI_ADDRESS
    type FRAX_CHAINS = keyof typeof FRAX_ADDRESS
    type FXS_CHAINS = keyof typeof FXS_ADDRESS
    SUSHI_LOCAL = SUSHI[chainId as SUSHI_CHAINS]
    USDC_LOCAL = USDC[chainId as USDC_CHAINS]
    testTokensSet = [
      Native.onChain(chainId),
      WNATIVE[chainId],
      SUSHI[chainId as SUSHI_CHAINS],
      USDC[chainId as USDC_CHAINS],
      USDT[chainId as USDT_CHAINS],
      DAI[chainId as DAI_CHAINS],
      FRAX[chainId as FRAX_CHAINS],
      FXS[chainId as FXS_CHAINS],
    ]
  })

  it('Permit: Native => FRAX => Native', async function () {
    await env.snapshot.restore()
    const usedPools = new Set<string>()
    const token = FRAX[chainId as keyof typeof FRAX_ADDRESS]
    const amountIn = BigInt('999999999999999983222784') // BigInt(1e6 * 1e18) - copied over the value from the unrefactored test
    intermidiateResult[0] = amountIn
    intermidiateResult = await updMakeSwap(
      env,
      Native.onChain(chainId),
      token,
      intermidiateResult,
      usedPools,
    )
    const permit = await makePermit(env, token, intermidiateResult[0] as bigint)
    intermidiateResult = await updMakeSwap(
      env,
      token,
      Native.onChain(chainId),
      intermidiateResult,
      usedPools,
      undefined,
      undefined,
      [permit],
    )
  })

  it('Native => SUSHI => Native', async function () {
    await env.snapshot.restore()
    const usedPools = new Set<string>()
    intermidiateResult[0] = BigInt(1e6) * BigInt(1e18)
    intermidiateResult = await updMakeSwap(
      env,
      Native.onChain(chainId),
      SUSHI_LOCAL,
      intermidiateResult,
      usedPools,
    )
    intermidiateResult = await updMakeSwap(
      env,
      SUSHI_LOCAL,
      Native.onChain(chainId),
      intermidiateResult,
      usedPools,
    )
  })

  it('Native => WrappedNative => Native', async function () {
    await env.snapshot.restore()
    const usedPools = new Set<string>()
    intermidiateResult[0] = BigInt(1e18)
    intermidiateResult = await updMakeSwap(
      env,
      Native.onChain(chainId),
      WNATIVE[chainId],
      intermidiateResult,
      usedPools,
    )
    intermidiateResult = await updMakeSwap(
      env,
      WNATIVE[chainId],
      Native.onChain(chainId),
      intermidiateResult,
      usedPools,
    )
  })

  it('Trident Native => SUSHI => Native (Polygon only)', async function () {
    if (chainId === ChainId.POLYGON) {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e4) * BigInt(1e18)
      intermidiateResult = await updMakeSwap(
        env,
        Native.onChain(chainId),
        SUSHI[chainId],
        intermidiateResult,
        usedPools,
        [LiquidityProviders.Trident],
      )
      intermidiateResult = await updMakeSwap(
        env,
        SUSHI[chainId],
        Native.onChain(chainId),
        intermidiateResult,
        usedPools,
        [LiquidityProviders.Trident],
      )
    }
  })

  it('StablePool Native => USDC => USDT => DAI => USDC (Polygon only)', async function () {
    const filter = (pool: RPool) =>
      pool instanceof StableSwapRPool || pool instanceof BridgeBento

    if (chainId === ChainId.POLYGON) {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e4) * BigInt(1e18)
      intermidiateResult = await updMakeSwap(
        env,
        Native.onChain(chainId),
        USDC[chainId],
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await updMakeSwap(
        env,
        USDC[chainId],
        USDT[chainId],
        intermidiateResult,
        usedPools,
        undefined,
        filter,
      )
      intermidiateResult = await updMakeSwap(
        env,
        USDT[chainId],
        DAI[chainId],
        intermidiateResult,
        usedPools,
        undefined,
        filter,
      )
      intermidiateResult = await updMakeSwap(
        env,
        DAI[chainId],
        USDC[chainId],
        intermidiateResult,
        usedPools,
        undefined,
        filter,
      )
    }
  })

  if (process.env.ALCHEMY_ID) {
    it('V3,  Native => USDC => NATIVE', async function () {
      if (chainId === ChainId.POLYGON) {
        await env.snapshot.restore()
        const usedPools = new Set<string>()
        let amountAndBlock: [bigint | undefined, bigint] = [undefined, 1n]
        amountAndBlock[0] = BigInt(1e7) * BigInt(1e18) // should be partial
        amountAndBlock = await updMakeSwap(
          env,
          Native.onChain(chainId),
          USDC[chainId],
          amountAndBlock,
          usedPools,
          [LiquidityProviders.UniswapV3, LiquidityProviders.SushiSwapV3],
        )
        amountAndBlock = await updMakeSwap(
          env,
          USDC[chainId],
          Native.onChain(chainId),
          amountAndBlock,
          usedPools,
          [LiquidityProviders.UniswapV3, LiquidityProviders.SushiSwapV3],
        )
      }
    })
  }

  function getNextToken(rnd: () => number, previousTokenIndex: number): number {
    for (;;) {
      const next = Math.floor(rnd() * testTokensSet.length)
      if (next === previousTokenIndex) continue
      if (testTokensSet[next] === undefined) continue
      return next
    }
  }

  it.skip('Random swap test', async function () {
    let routeCounter = 0
    for (let i = 0; i < 1000; ++i) {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      let currentToken = 0
      const rnd: () => number = seedrandom(`testSeed ${i}`) // random [0, 1)
      intermidiateResult[0] = getBigInt(getRandomExp(rnd, 1e15, 1e24))
      for (;;) {
        const nextToken = getNextToken(rnd, currentToken)
        console.log('Round # ', i + 1, ' Total Route # ', ++routeCounter)
        intermidiateResult = await updMakeSwap(
          env,
          testTokensSet[currentToken] as Type,
          testTokensSet[nextToken] as Type,
          intermidiateResult,
          usedPools,
        )
        currentToken = nextToken
        if (
          currentToken === 0 ||
          intermidiateResult[0] === undefined ||
          intermidiateResult[0] <= 1000n
        )
          break
      }
    }
  })

  it('Special Router', async function () {
    await env.snapshot.restore()

    let pcMap
    if (UPDATE_POOL_STATES) {
      await env.dataFetcher.fetchPoolsForToken(
        Native.onChain(chainId),
        SUSHI_LOCAL,
      )
      pcMap = env.dataFetcher.getCurrentPoolCodeMap(
        Native.onChain(chainId),
        SUSHI_LOCAL,
      )
    } else pcMap = env.poolCodes

    const route = Router.findSpecialRoute(
      pcMap,
      chainId,
      Native.onChain(chainId),
      BigInt(1e18),
      SUSHI_LOCAL,
      30e9,
    )
    expect(route).not.undefined
  })

  if (network.config.chainId === ChainId.POLYGON) {
    it('Transfer value and route 1', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e18)
      intermidiateResult = await checkTransferAndRoute(
        env,
        Native.onChain(chainId),
        SUSHI_LOCAL,
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await checkTransferAndRoute(
        env,
        SUSHI_LOCAL,
        USDC_LOCAL,
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await checkTransferAndRoute(
        env,
        USDC_LOCAL,
        Native.onChain(chainId),
        intermidiateResult,
        usedPools,
      )
    })

    it('Transfer value and route 2', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e18)
      intermidiateResult = await checkTransferAndRoute(
        env,
        Native.onChain(chainId),
        WNATIVE[chainId],
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await checkTransferAndRoute(
        env,
        WNATIVE[chainId],
        SUSHI_LOCAL,
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await checkTransferAndRoute(
        env,
        SUSHI_LOCAL,
        WNATIVE[chainId],
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await checkTransferAndRoute(
        env,
        WNATIVE[chainId],
        Native.onChain(chainId),
        intermidiateResult,
        usedPools,
      )
    })

    it('Transfer value and route 3 - check EOA', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e18)
      env.user2.address = '0x0000000000000000000000000000000000000001'
      intermidiateResult = await checkTransferAndRoute(
        env,
        Native.onChain(chainId),
        SUSHI_LOCAL,
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await checkTransferAndRoute(
        env,
        SUSHI_LOCAL,
        USDC_LOCAL,
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await checkTransferAndRoute(
        env,
        USDC_LOCAL,
        Native.onChain(chainId),
        intermidiateResult,
        usedPools,
      )
    })

    it('Transfer value and route 4 - not payable address', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e18)
      env.user2.address = '0x597A9bc3b24C2A578CCb3aa2c2C62C39427c6a49'
      let throwed = false
      try {
        await checkTransferAndRoute(
          env,
          Native.onChain(chainId),
          SUSHI_LOCAL,
          intermidiateResult,
          usedPools,
        )
      } catch (_e) {
        throwed = true
      }
      expect(
        throwed,
        'Transfer value to not payable address should fail',
      ).equal(true)
    })
  }
})
