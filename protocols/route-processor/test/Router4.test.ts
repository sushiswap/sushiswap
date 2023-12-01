import {
  SnapshotRestorer,
  takeSnapshot,
} from '@nomicfoundation/hardhat-network-helpers'
import {
  CURVE_NON_FACTORY_POOLS,
  DataFetcher,
  LiquidityProviders,
  NativeWrapBridgePoolCode,
  PermitData,
  PoolFilter,
  Router,
  sETH,
} from '@sushiswap/router'
import { PoolCode } from '@sushiswap/router/dist/pools/PoolCode'
import {
  BridgeBento,
  // CurveMultitokenCore,
  // CurveMultitokenPool,
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
import { erc20Abi, routeProcessor4Abi, weth9Abi } from 'sushi/abi'
import { ChainId, chainName } from 'sushi/chain'
import { BENTOBOX_ADDRESS, BentoBoxChainId } from 'sushi/config'
import {
  DAI,
  DAI_ADDRESS,
  FRAX,
  FRAX_ADDRESS,
  FXS,
  FXS_ADDRESS,
  LINK,
  LINK_ADDRESS,
  MIM,
  MIM_ADDRESS,
  Native,
  SUSHI,
  SUSHI_ADDRESS,
  Token,
  Type,
  USDC,
  USDC_ADDRESS,
  USDT,
  USDT_ADDRESS,
  WBTC,
  WBTC_ADDRESS,
  WNATIVE,
} from 'sushi/currency'
import { abs } from 'sushi/math'
import { type Contract } from 'sushi/types'
import {
  Address,
  Client,
  HDAccount,
  Hex,
  createPublicClient,
  custom,
  testActions,
  walletActions,
} from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { hardhat } from 'viem/chains'

import RouteProcessor4 from '../artifacts/contracts/RouteProcessor4.sol/RouteProcessor4.json'
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
  _client: Client,
  router: Address,
  token?: Address,
  amount = 1n,
): Promise<boolean> {
  if (token) {
    return await setTokenBalance(token, router, amount)
  }
  return false
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
  let poolList: PoolCode[] = []
  if (!UPDATE_POOL_STATES) {
    poolList = await getAllPoolCodes(
      dataFetcher,
      chainId,
      (network.config as { forking: { blockNumber?: number } }).forking
        ?.blockNumber,
    )
    poolList.forEach((p) => poolCodes.set(p.pool.uniqueID(), p))
  }

  const RouteProcessorTx = await client.deployContract({
    chain: null,
    abi: routeProcessor4Abi,
    bytecode: RouteProcessor4.bytecode as Hex,
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
    abi: routeProcessor4Abi,
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
    poolList,
    snapshot: await takeSnapshot(),
  } satisfies {
    chainId: ChainId
    client: Client
    rp: Contract<typeof routeProcessor4Abi>
    user: HDAccount
    user2: HDAccount
    dataFetcher: DataFetcher
    poolCodes: Map<string, PoolCode>
    poolList: PoolCode[]
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
    String(amount),
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
  throwAtNoWay = true,
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
      if (!usedPools.has(e[1].pool.address)) pcMap.set(e[0], e[1])
    })
  }
  //await checkPoolsState(pcMap, env.user.address, env.chainId)

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
  // const cc = route.legs
  //   .map((l) => {
  //     if (pcMap.get(l.uniqueId)?.liquidityProvider == LiquidityProviders.CurveSwap)
  //       return `${pcMap.get(l.uniqueId)?.poolName}: ${l.tokenFrom.symbol} -> ${l.tokenTo.symbol}  ${
  //         l.poolAddress
  //       }  ${l.assumedAmountIn} -> ${l.assumedAmountOut}`
  //   })
  //   .filter((s) => s !== undefined)
  // if (cc.length) console.log(cc.join('\n'))
  // console.log(
  //   'ROUTE:',
  //   route.legs.map(
  //     (l) =>
  //       `${l.tokenFrom.symbol} -> ${l.tokenTo.symbol}  ${l.poolAddress}  ${l.assumedAmountIn} -> ${l.assumedAmountOut}`
  //   )
  // )
  // const poolsS = new Map<string, [number, number][]>()
  // route.legs.forEach(l => {
  //   const pool = pcMap.get(l.uniqueId)?.pool
  //   if (pool instanceof CurveMultitokenPool) {
  //     const prev: [number, number][] = poolsS.get(pool.core.address) ?? []
  //     prev.push([pool.index0, pool.index1])
  //     poolsS.set(pool.core.address, prev)
  //   }
  // })
  // Array.from(poolsS.entries()).forEach(([addr, ind]) => {
  //   if (ind.length >= 2)
  //     ind.forEach(([i0, i1]) => console.log(`    ${addr} ${i0}-${i1}`))
  // })
  // if (route.fromToken.symbol !== 'ETH' && route.toToken.symbol !== 'ETH') {
  //   route.legs.forEach(l => {
  //     if (l.tokenFrom.symbol == 'ETH')
  //     console.log(`    IN ${l.tokenFrom.symbol} ${l.absolutePortion} ${l.uniqueId} `)
  //     if (l.tokenTo.symbol == 'ETH')
  //     console.log(`    OUT ${l.tokenTo.symbol} ${l.uniqueId} `)
  //   })
  // }

  if (route.status === RouteStatus.NoWay) {
    if (throwAtNoWay) throw new Error('NoWay')
    return
  }

  const rpParams = Router.routeProcessor4Params(
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
  const tx = await env.client.writeContract({
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

  const receipt = await env.client.waitForTransactionReceipt({ hash: tx })

  if (!UPDATE_POOL_STATES) {
    route.legs.forEach((l) => {
      if (!(pcMap.get(l.uniqueId) instanceof NativeWrapBridgePoolCode)) {
        usedPools.add(l.poolAddress)
      }
    })
  }

  // const trace = await network.provider.send('debug_traceTransaction', [receipt.transactionHash])
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
  throwAtNoWay = true,
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
    throwAtNoWay,
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
      if (!usedPools.has(e[1].pool.address)) pcMap.set(e[0], e[1])
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
  const rpParams = Router.routeProcessor4Params(
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
      if (!(pcMap.get(l.uniqueId) instanceof NativeWrapBridgePoolCode)) {
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
    balanceOutBI =
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
describe('End-to-end RouteProcessor4 test', async function () {
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
      // MKR[chainId as keyof typeof MKR_ADDRESS],
      // YFI[chainId as keyof typeof YFI_ADDRESS],
      // CRV[chainId as keyof typeof CRV_ADDRESS],
      // SNX[chainId as keyof typeof SNX_ADDRESS],
      // GNO[chainId as keyof typeof GNO_ADDRESS],
      // LDO[chainId as keyof typeof LDO_ADDRESS],
      // APE[chainId as keyof typeof APE_ADDRESS],
      // FEI[chainId as keyof typeof FEI_ADDRESS],
      WBTC[chainId as keyof typeof WBTC_ADDRESS],
      // UNI[chainId as keyof typeof UNI_ADDRESS],
      // BUSD[chainId as keyof typeof BUSD_ADDRESS],
      // AAVE[chainId as keyof typeof AAVE_ADDRESS],
      // COMP[chainId as keyof typeof COMP_ADDRESS],
      // LUSD[chainId as keyof typeof LUSD_ADDRESS],
      MIM[chainId as keyof typeof MIM_ADDRESS],
      LINK[chainId as keyof typeof LINK_ADDRESS],
    ]
  })

  if (network.config.chainId === 137) {
    // permit in FRAX is implemented only for POLYGON
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
      const permit = await makePermit(
        env,
        token,
        intermidiateResult[0] as bigint,
      )
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
  }

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

  if (network.config.chainId === 137) {
    // NoWay
    it.skip('Trident Native => SUSHI => Native (Polygon only)', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e4) * BigInt(1e18)
      intermidiateResult = await updMakeSwap(
        env,
        Native.onChain(chainId),
        SUSHI[chainId as keyof typeof SUSHI_ADDRESS],
        intermidiateResult,
        usedPools,
        [LiquidityProviders.Trident],
      )
      intermidiateResult = await updMakeSwap(
        env,
        SUSHI[chainId as keyof typeof SUSHI_ADDRESS],
        Native.onChain(chainId),
        intermidiateResult,
        usedPools,
        [LiquidityProviders.Trident],
      )
    })
  }

  if (network.config.chainId === 137) {
    // NoWay
    it.skip('StablePool Native => USDC => USDT => DAI => USDC (Polygon only)', async function () {
      const filter = (pool: RPool) =>
        pool instanceof StableSwapRPool || pool instanceof BridgeBento
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e4) * BigInt(1e18)
      intermidiateResult = await updMakeSwap(
        env,
        Native.onChain(chainId),
        USDC[chainId as keyof typeof USDC_ADDRESS],
        intermidiateResult,
        usedPools,
      )
      intermidiateResult = await updMakeSwap(
        env,
        USDC[chainId as keyof typeof USDC_ADDRESS],
        USDT[chainId as keyof typeof USDT_ADDRESS],
        intermidiateResult,
        usedPools,
        undefined,
        filter,
      )
      intermidiateResult = await updMakeSwap(
        env,
        USDT[chainId as keyof typeof USDT_ADDRESS],
        DAI[chainId as keyof typeof DAI_ADDRESS],
        intermidiateResult,
        usedPools,
        undefined,
        filter,
      )
      intermidiateResult = await updMakeSwap(
        env,
        DAI[chainId as keyof typeof DAI_ADDRESS],
        USDC[chainId as keyof typeof USDC_ADDRESS],
        intermidiateResult,
        usedPools,
        undefined,
        filter,
      )
    })
  }

  if (process.env.ALCHEMY_ID) {
    it('V3,  Native => USDC => NATIVE', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      let amountAndBlock: [bigint | undefined, bigint] = [undefined, 1n]
      const amountIn =
        chainId === ChainId.ETHEREUM ? 100 * 1e18 : 10_000_000 * 1e18
      amountAndBlock[0] = BigInt(amountIn) // should be partial
      amountAndBlock = await updMakeSwap(
        env,
        Native.onChain(chainId),
        USDC[chainId as keyof typeof USDC_ADDRESS],
        amountAndBlock,
        usedPools,
        [LiquidityProviders.UniswapV3, LiquidityProviders.SushiSwapV3],
      )
      amountAndBlock = await updMakeSwap(
        env,
        USDC[chainId as keyof typeof USDC_ADDRESS],
        Native.onChain(chainId),
        amountAndBlock,
        usedPools,
        [LiquidityProviders.UniswapV3, LiquidityProviders.SushiSwapV3],
      )
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
        console.log(
          'Round # ',
          i + 1,
          ' Total Route # ',
          ++routeCounter,
          `pools: ${env.poolCodes.size - usedPools.size}/${env.poolCodes.size}`,
          `${testTokensSet[currentToken]?.symbol} => ${testTokensSet[nextToken]?.symbol}`,
        )
        intermidiateResult = await updMakeSwap(
          env,
          testTokensSet[currentToken] as Type,
          testTokensSet[nextToken] as Type,
          intermidiateResult,
          usedPools,
          undefined,
          undefined,
          undefined,
          false, //throwAtNoWay
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

  if (network.config.chainId === 1) {
    it('Curve 3pool test using 2 pools from 3', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e5) * BigInt(1e18)
      intermidiateResult = await updMakeSwap(
        env,
        Native.onChain(chainId),
        USDT[chainId as keyof typeof USDT_ADDRESS],
        intermidiateResult,
        usedPools,
        [LiquidityProviders.CurveSwap, LiquidityProviders.SushiSwapV2],
      )
    })

    it('Curve pool 0xc5424b857f758e906013f3555dad202e4bdb4567: Native => sETH', async function () {
      await env.snapshot.restore()
      const usedPools = new Set<string>()
      intermidiateResult[0] = BigInt(1e3) * BigInt(1e18)
      intermidiateResult = await updMakeSwap(
        env,
        Native.onChain(chainId),
        sETH,
        intermidiateResult,
        usedPools,
        [LiquidityProviders.CurveSwap],
      )
    })

    it('Path token => ETH => token', async function () {
      await env.snapshot.restore()
      const amoutIn = BigInt(1e18)
      await setRouterPrimaryBalance(
        env.client,
        env.user.address,
        sETH.address as Address,
        amoutIn * 2n,
      )
      intermidiateResult[0] = amoutIn
      intermidiateResult = await updMakeSwap(
        env,
        sETH,
        USDC[ChainId.ETHEREUM],
        intermidiateResult,
        undefined,
        [LiquidityProviders.CurveSwap, LiquidityProviders.UniswapV2],
      )
    })

    it('Curve Native inside: sETH - Native - WETH', async function () {
      await env.snapshot.restore()
      const amoutIn = BigInt(1e18)
      await setRouterPrimaryBalance(
        env.client,
        env.user.address,
        sETH.address as Address,
        amoutIn * 2n,
      )
      intermidiateResult[0] = amoutIn
      intermidiateResult = await updMakeSwap(
        env,
        sETH,
        WNATIVE[chainId],
        intermidiateResult,
        undefined,
        [LiquidityProviders.CurveSwap],
      )
    })

    const amountInForTest: Record<Address, number> = {
      '0x0ce6a5ff5217e38315f87032cf90686c96627caa': 1e16,
      '0x93054188d876f558f4a66b2ef1d97d16edf0895b': 1e10,
    }

    const pools = CURVE_NON_FACTORY_POOLS[ChainId.ETHEREUM]
    for (let i = 0; i < pools.length; ++i) {
      const [address, type, [from, to]] = pools[i]
      it(`Curve pool ${address} ${type} ${from.symbol}->${to.symbol}`, async function () {
        await env.snapshot.restore()
        const amoutIn = BigInt(amountInForTest[address] ?? 1e18)
        if (from instanceof Token)
          await setRouterPrimaryBalance(
            env.client,
            env.user.address,
            from.address as Address,
            amoutIn * 2n,
          )
        intermidiateResult[0] = amoutIn
        intermidiateResult = await updMakeSwap(
          env,
          from,
          to,
          intermidiateResult,
          undefined,
          [LiquidityProviders.CurveSwap],
        )
      })
    }
  }
})
