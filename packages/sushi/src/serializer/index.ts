import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
// import { fileURLToPath } from 'url'
import serializer from 'serialijse'
import { ChainId } from 'sushi/chain'
import { Native } from '../currency/index.js'
import {
  BentoBridgePoolCode,
  BentoPoolCode,
  ConstantProductPoolCode,
  CurvePoolCode,
  NativeWrapBridgePoolCode,
  PoolCode,
  UniV3PoolCode,
} from '../router/index.js'
import {
  BridgeBento,
  BridgeUnlimited,
  ConstantProductRPool,
  CurveMultitokenCore,
  CurveMultitokenPool,
  CurvePool,
  RToken,
  RebaseInternal,
  StableSwapRPool,
  UniV3Pool,
} from '../tines/index.js'

// All classes registration - for deserialization
serializer.declarePersistable(NativeWrapBridgePoolCode)
serializer.declarePersistable(BridgeUnlimited)
serializer.declarePersistable(ConstantProductPoolCode)
serializer.declarePersistable(ConstantProductRPool)
serializer.declarePersistable(BentoPoolCode)
serializer.declarePersistable(StableSwapRPool)
serializer.declarePersistable(RebaseInternal)
serializer.declarePersistable(BentoBridgePoolCode)
serializer.declarePersistable(BridgeBento)
serializer.declarePersistable(UniV3PoolCode)
serializer.declarePersistable(UniV3Pool)
serializer.declarePersistable(CurvePoolCode)
serializer.declarePersistable(CurvePool)
serializer.declarePersistable(CurveMultitokenPool)
serializer.declarePersistable(CurveMultitokenCore)
serializer.declarePersistable(Native)

export { serializer }

export function makeSerializable(poolCodes: PoolCode[]) {
  poolCodes.forEach(({ pool }) => {
    pool.reserve0 = String(pool.reserve0) as unknown as bigint
    pool.reserve1 = String(pool.reserve1) as unknown as bigint
    pool.token0 = { ...pool.token0 } as RToken
    pool.token1 = { ...pool.token1 } as RToken
    if (pool instanceof StableSwapRPool) {
      pool.k = String(pool.k) as unknown as bigint
      pool.total0.rebaseBI.base = String(
        pool.total0.rebaseBI.base,
      ) as unknown as bigint
      pool.total0.rebaseBI.elastic = String(
        pool.total0.rebaseBI.elastic,
      ) as unknown as bigint
      pool.total1.rebaseBI.base = String(
        pool.total1.rebaseBI.base,
      ) as unknown as bigint
      pool.total1.rebaseBI.elastic = String(
        pool.total1.rebaseBI.elastic,
      ) as unknown as bigint
    } else if (pool instanceof UniV3Pool) {
      pool.liquidity = String(pool.liquidity) as unknown as bigint
      pool.sqrtPriceX96 = String(pool.sqrtPriceX96) as unknown as bigint
      pool.ticks.forEach((t) => {
        t.DLiquidity = String(t.DLiquidity) as unknown as bigint
      })
    } else if (pool instanceof CurvePool) {
      pool.D = String(pool.D) as unknown as bigint
      pool.rate0BI = String(pool.rate0BI) as unknown as bigint
      pool.rate1BN18 = String(pool.rate1BN18) as unknown as bigint
      pool.reserve0Rated = String(pool.reserve0Rated) as unknown as bigint
      pool.reserve1Rated = String(pool.reserve1Rated) as unknown as bigint
    } else if (pool instanceof CurveMultitokenPool) {
      const core = pool.core
      core.D = String(core.D) as unknown as bigint
      core.Ann = String(core.Ann) as unknown as bigint
      core.Annn = String(core.Annn) as unknown as bigint
      core.AnnMinus1 = String(core.AnnMinus1) as unknown as bigint
      core.nn = String(core.nn) as unknown as bigint
      core.n = String(core.n) as unknown as bigint
      core.nPlus1 = String(core.nPlus1) as unknown as bigint
      core.tokens = core.tokens.map((t) => ({ ...t }) as RToken)
      core.reserves = core.reserves.map((r) => String(r) as unknown as bigint)
      core.ratesBN18 = core.ratesBN18.map((r) => String(r) as unknown as bigint)
      core.reservesRated = core.reservesRated.map(
        (r) => String(r) as unknown as bigint,
      )
      //core.currentFlow = core.currentFlow.map(r => String(r) as unknown as bigint)
    }
  })
}

export function restoreAfterSerialization(poolCodes: PoolCode[]) {
  poolCodes.forEach(({ pool }) => {
    pool.reserve0 = BigInt(pool.reserve0)
    pool.reserve1 = BigInt(pool.reserve1)
    if (pool instanceof StableSwapRPool) {
      pool.k = BigInt(pool.k)
      pool.total0.rebaseBI.base = BigInt(pool.total0.rebaseBI.base)
      pool.total0.rebaseBI.elastic = BigInt(pool.total0.rebaseBI.elastic)
      pool.total1.rebaseBI.base = BigInt(pool.total1.rebaseBI.base)
      pool.total1.rebaseBI.elastic = BigInt(pool.total1.rebaseBI.elastic)
    } else if (pool instanceof UniV3Pool) {
      pool.liquidity = BigInt(pool.liquidity)
      pool.sqrtPriceX96 = BigInt(pool.sqrtPriceX96)
      pool.ticks.forEach((t) => {
        t.DLiquidity = BigInt(t.DLiquidity)
      })
    } else if (pool instanceof CurvePool) {
      pool.D = BigInt(pool.D)
      pool.rate0BI = BigInt(pool.rate0BI)
      pool.rate1BN18 = BigInt(pool.rate1BN18)
      pool.reserve0Rated = BigInt(pool.reserve0Rated)
      pool.reserve1Rated = BigInt(pool.reserve1Rated)
    } else if (pool instanceof CurveMultitokenPool) {
      const core = pool.core
      core.D = BigInt(core.D)
      core.Ann = BigInt(core.Ann)
      core.Annn = BigInt(core.Annn)
      core.AnnMinus1 = BigInt(core.AnnMinus1)
      core.nn = BigInt(core.nn)
      core.n = BigInt(core.n)
      core.nPlus1 = BigInt(core.nPlus1)
      core.reserves = core.reserves.map((r) => BigInt(r))
      core.ratesBN18 = core.ratesBN18.map((r) => BigInt(r))
      core.reservesRated = core.reservesRated.map((r) => BigInt(r))
      //core.currentFlow = core.currentFlow.map(r => BigInt(r))
    }
  })
}

export function serializePoolCodesJSON(pools: PoolCode[]): object {
  makeSerializable(pools)
  const data = serializer.serialize(pools)
  restoreAfterSerialization(pools)
  return JSON.parse(data)
}

export function deserializePoolCodesJSON(data: string): PoolCode[] {
  const poolCodes = serializer.deserialize(data) as PoolCode[]
  restoreAfterSerialization(poolCodes)
  return poolCodes
}

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// default dir for pools snapshots
const snapshotDirDefault = path.resolve(__dirname, '../pool-snapshots/')

export async function savePoolSnapshot(
  poolCodes: PoolCode[],
  chainId: ChainId,
  blockNumber: number | undefined,
  directory?: string,
) {
  // pools preparation for serialization
  makeSerializable(poolCodes)
  const data = serializer.serialize(poolCodes)
  const obj = JSON.parse(data)
  const humanReadableStr = JSON.stringify(obj, undefined, '  ')
  restoreAfterSerialization(poolCodes)

  directory = directory || snapshotDirDefault
  if (!existsSync(directory)) mkdirSync(directory)
  writeFileSync(
    path.resolve(directory, `${chainId}-${blockNumber}`),
    humanReadableStr,
  )
}

export async function loadPoolSnapshot(
  chainId: ChainId,
  blockNumber: number | undefined,
  directory?: string,
) {
  directory = directory || snapshotDirDefault
  const fileName = path.resolve(directory, `${chainId}-${blockNumber}`)
  if (!existsSync(fileName)) return undefined
  const str = readFileSync(fileName, 'utf8')
  const poolCodes = serializer.deserialize(str) as PoolCode[]
  restoreAfterSerialization(poolCodes)
  return poolCodes
}
