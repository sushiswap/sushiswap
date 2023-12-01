import {
  DataFetcher,
  LiquidityProviders,
  NUMBER_OF_SURROUNDING_TICKS,
  UniV3PoolCode,
} from '@sushiswap/router'
import { CL_MAX_TICK } from '@sushiswap/tines'
import { CL_MIN_TICK } from '@sushiswap/tines'
import { UniV3Pool } from '@sushiswap/tines'
import {
  UniV3Environment,
  UniV3PoolInfo,
  createRandomUniV3Pool,
  createUniV3EnvReal,
  createUniV3Pool,
  possibleFee,
} from '@sushiswap/tines-sandbox'
import { expect } from 'chai'
import { ethers, network } from 'hardhat'
import { ChainId } from 'sushi/chain'
import { createPublicClient } from 'viem'
import { custom } from 'viem'
import { hardhat } from 'viem/chains'

import { loadPoolSnapshot } from './utils/poolSerializer'

const POLLING_INTERVAL = process.env.ALCHEMY_ID ? 1_000 : 10_000
async function getDataFetcherData(
  pool: UniV3PoolInfo,
  existedPools: Set<string>,
): Promise<UniV3Pool> {
  const client = createPublicClient({
    chain: {
      ...hardhat,
      batchSize: 1024,
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
  const chainId = network.config.chainId as ChainId

  const dataFetcher = new DataFetcher({ chainId, client })
  dataFetcher.startDataFetching([LiquidityProviders.UniswapV3])
  await dataFetcher.fetchPoolsForToken(pool.token0, pool.token1, existedPools)
  const pcMap = dataFetcher.getCurrentPoolCodeMap(pool.token0, pool.token1)
  const uniPoolCodes = Array.from(pcMap.values()).filter(
    (p) => p instanceof UniV3PoolCode,
  )
  expect(uniPoolCodes.length).equal(1)
  const tinesPool = uniPoolCodes[0].pool as UniV3Pool
  return tinesPool
}

// maxTickDiff - how much is min and max ticks from current price index
// pool1 - reference pool
// pool2 - should be the same, maybe lesser quantity of ticks
function checkPoolsHaveTheSameState(
  pool1: UniV3Pool,
  pool2: UniV3Pool,
  maxTickDiff = 0,
) {
  expect(pool1.address).equal(pool2.address)
  expect(pool1.token0.address).equal(pool2.token0.address)
  expect(pool1.token1.address).equal(pool2.token1.address)
  expect(pool1.fee).equal(pool2.fee)
  expect(pool1.reserve0.eq(pool2.reserve0)).equal(true)
  expect(pool1.reserve1.eq(pool2.reserve1)).equal(true)
  expect(pool1.liquidity.eq(pool2.liquidity)).equal(true)
  expect(pool1.sqrtPriceX96.eq(pool2.sqrtPriceX96)).equal(true)
  if (pool2.nearestTick > 1)
    expect(pool1.ticks[pool1.nearestTick].index).equal(
      pool2.ticks[pool2.nearestTick].index,
    )

  if (maxTickDiff !== 0) {
    // Check ticks, taking into account that pool2 ticks can be a subset of pool1 ticks
    const priceTickIndex = Math.round(
      Math.log(pool1.calcCurrentPriceWithoutFee(true)) / Math.log(1.0001),
    )
    expect(pool2.ticks.length).gte(4)
    expect(pool2.ticks[0].index).equal(CL_MIN_TICK)
    const minTick = pool2.ticks[1].index
    expect(minTick).lt(priceTickIndex)
    const maxTick = pool2.ticks[pool2.ticks.length - 2].index
    expect(maxTick).gt(priceTickIndex)
    expect(pool2.ticks[pool2.ticks.length - 1].index).equal(CL_MAX_TICK)
    const mustBeTicks = pool1.ticks.filter(
      ({ index }) => minTick < index && index < maxTick,
    )
    mustBeTicks.forEach((t, i) => {
      const t2 = pool2.ticks[i + 2]
      expect(t.index).equal(t2.index)
      expect(t.DLiquidity.eq(t2.DLiquidity)).equal(
        true,
        `${i}, ${
          t.index
        } ${t.DLiquidity.toString()} != ${t2.DLiquidity.toString()}`,
      )
    })
  } else {
    pool1.ticks.forEach((t1, i) => {
      const t2 = pool2.ticks[i]
      expect(t1.index).equal(t2.index)
      expect(t1.DLiquidity.eq(t2.DLiquidity)).equal(
        true,
        `${i}, ${
          t1.index
        } ${t1.DLiquidity.toString()} != ${t2.DLiquidity.toString()}`,
      )
    })
  }
}

function getPoolInfoTicksForCurrentDataFetcher(): number {
  return NUMBER_OF_SURROUNDING_TICKS
}

describe('DataFetcher Uni V3', () => {
  let env: UniV3Environment
  let existedPools = new Set<string>()

  before(async () => {
    env = await createUniV3EnvReal(ethers)
    const poolCodes = loadPoolSnapshot(
      network.config.chainId as ChainId,
      (network.config as { forking: { blockNumber?: number } }).forking
        ?.blockNumber,
    )
    if (poolCodes !== undefined)
      existedPools = new Set(Array.from(poolCodes.map((pc) => pc.pool.address)))
  })

  it('test simple', async () => {
    // 5 is tick# 16090. So, only ticks from 6090 to 26090 are fetched
    const poolInfo = await createUniV3Pool(env, 500, 5, [
      { from: 0, to: +16700, val: 1e18 },
      { from: 15500, to: +16500, val: 1e18 },
    ])
    const poolTines2 = await getDataFetcherData(poolInfo, existedPools)
    checkPoolsHaveTheSameState(
      poolInfo.tinesPool,
      poolTines2,
      getPoolInfoTicksForCurrentDataFetcher(),
    )
  })

  const randomPools = 4
  for (let i = 0; i < randomPools; ++i) {
    it(`random pool #${i + 1}/${randomPools}`, async () => {
      const fee = possibleFee[i % possibleFee.length]
      const fromTo = [
        [-4500, 0], // 100x1
        [-7500, 2500], // 500x10
        [-24000, 3000], // 3000x60
        [-80000, 20000], // 10000x200
      ][i % possibleFee.length]
      const poolInfo = await createRandomUniV3Pool(
        env,
        `pool${i}`,
        10,
        0.8,
        fee,
        fromTo[0],
        fromTo[1],
      )
      const poolTines2 = await getDataFetcherData(poolInfo, existedPools)
      //console.log(poolInfo.tinesPool.ticks.length, poolTines2.ticks.length)
      checkPoolsHaveTheSameState(
        poolInfo.tinesPool,
        poolTines2,
        getPoolInfoTicksForCurrentDataFetcher(),
      )
    })
  }
})
