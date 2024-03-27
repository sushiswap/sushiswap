import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { readContracts } from '@wagmi/core/actions'
import { erc20Abi } from 'sushi/abi'
import { uniswapV3PoolAbi } from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import {
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SUSHISWAP_V3_TICK_LENS,
  SushiSwapV3ChainId,
  SushiSwapV3FeeAmount,
} from 'sushi/config'
import { Currency, Token, Type } from 'sushi/currency'
import { computeSushiSwapV3PoolAddress } from 'sushi/pool'
import { RToken, UniV3Pool } from 'sushi/tines'
import { Address } from 'viem'

export enum V3PoolState {
  LOADING = 'Loading',
  NOT_EXISTS = 'Not exists',
  EXISTS = 'Exists',
  INVALID = 'Invalid',
}

interface PoolData {
  address: Address
  token0: Token
  token1: Token
  fee: SushiSwapV3FeeAmount
  sqrtPriceX96: bigint
  activeTick: number
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS = {
  [SushiSwapV3FeeAmount.LOWEST]: 1,
  [SushiSwapV3FeeAmount.LOW]: 10,
  [SushiSwapV3FeeAmount.MEDIUM]: 60,
  [SushiSwapV3FeeAmount.HIGH]: 200,
} as const

// TODO: figure out how many ticks we need depending on fee
export const NUMBER_OF_SURROUNDING_TICKS = {
  [SushiSwapV3FeeAmount.LOWEST]: 1000,
  [SushiSwapV3FeeAmount.LOW]: 1000,
  [SushiSwapV3FeeAmount.MEDIUM]: 1000,
  [SushiSwapV3FeeAmount.HIGH]: 1000,
} as const

const tickLensAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'pool', type: 'address' },
      { internalType: 'int16', name: 'tickBitmapIndex', type: 'int16' },
    ],
    name: 'getPopulatedTicksInWord',
    outputs: [
      {
        components: [
          { internalType: 'int24', name: 'tick', type: 'int24' },
          { internalType: 'int128', name: 'liquidityNet', type: 'int128' },
          { internalType: 'uint128', name: 'liquidityGross', type: 'uint128' },
        ],
        internalType: 'struct ITickLens.PopulatedTick[]',
        name: 'populatedTicks',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const getActiveTick = (tickCurrent: number, feeAmount: SushiSwapV3FeeAmount) =>
  tickCurrent && feeAmount
    ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) *
      TICK_SPACINGS[feeAmount]
    : undefined

const bitmapIndex = (tick: number, tickSpacing: number) => {
  return Math.floor(tick / tickSpacing / 256)
}

export const getV3Pools = async (
  chainId: ChainId,
  currencies: [Currency | undefined, Currency | undefined][],
  config: PublicWagmiConfig,
) => {
  const allCurrencyCombinationsWithAllFees: [
    Type,
    Type,
    SushiSwapV3FeeAmount,
  ][] = currencies.reduce<[Currency, Currency, SushiSwapV3FeeAmount][]>(
    (list, [tokenA, tokenB]) => {
      if (tokenA !== undefined && tokenB !== undefined) {
        return list.concat([
          [tokenA, tokenB, SushiSwapV3FeeAmount.LOWEST],
          [tokenA, tokenB, SushiSwapV3FeeAmount.LOW],
          [tokenA, tokenB, SushiSwapV3FeeAmount.MEDIUM],
          [tokenA, tokenB, SushiSwapV3FeeAmount.HIGH],
        ])
      }
      return []
    },
    [],
  )

  const filtered: [Token, Token, SushiSwapV3FeeAmount][] = []
  allCurrencyCombinationsWithAllFees.forEach(
    ([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return
        filtered.push(
          tokenA.sortsBefore(tokenB)
            ? [tokenA, tokenB, feeAmount]
            : [tokenB, tokenA, feeAmount],
        )
      }
    },
  )

  const slot0Contracts = filtered.map(
    ([currencyA, currencyB, fee]) =>
      ({
        chainId,
        address: computeSushiSwapV3PoolAddress({
          factoryAddress:
            SUSHISWAP_V3_FACTORY_ADDRESS[chainId as SushiSwapV3ChainId],
          tokenA: currencyA.wrapped,
          tokenB: currencyB.wrapped,
          fee,
        }),
        abi: uniswapV3PoolAbi,
        functionName: 'slot0',
      }) as const,
  )

  const slot0 = await readContracts(config, {
    contracts: slot0Contracts,
  })

  if (slot0Contracts.length === 0) return [[V3PoolState.INVALID, null]]
  if (!slot0) return slot0Contracts.map(() => [V3PoolState.LOADING, null])

  const existingPools: [V3PoolState, PoolData][] = []

  filtered.forEach(([token0, token1, fee], i) => {
    if (!slot0[i]) return
    const [sqrtPriceX96, tick] = slot0[i].result || []
    if (!sqrtPriceX96 || sqrtPriceX96 === 0n || typeof tick === 'undefined')
      return
    // const [tokenA, tokenB, fee] = tokens[index]
    existingPools.push([
      V3PoolState.LOADING,
      {
        address: slot0Contracts[i].address,
        sqrtPriceX96,
        activeTick: getActiveTick(tick, fee),
        token0,
        token1,
        fee,
      } as PoolData,
    ])
  })

  const liquidityContracts = existingPools.map(
    ([, poolData]) =>
      ({
        chainId,
        address: poolData.address as Address,
        abi: uniswapV3PoolAbi,
        functionName: 'liquidity',
      }) as const,
  )

  const token0Contracts = existingPools.map(
    ([, poolData]) =>
      ({
        chainId,
        address: poolData.token0.wrapped.address as Address,
        args: [poolData.address as Address],
        abi: erc20Abi,
        functionName: 'balanceOf',
      }) as const,
  )

  const token1Contracts = existingPools.map(
    ([, poolData]) =>
      ({
        chainId,
        address: poolData.token1.wrapped.address as Address,
        args: [poolData.address as Address],
        abi: erc20Abi,
        functionName: 'balanceOf',
      }) as const,
  )

  const minIndexes = existingPools.map(([, poolData]) =>
    bitmapIndex(
      poolData.activeTick -
        NUMBER_OF_SURROUNDING_TICKS[poolData.fee] * TICK_SPACINGS[poolData.fee],
      TICK_SPACINGS[poolData.fee],
    ),
  )
  const maxIndexes = existingPools.map(([, poolData]) =>
    bitmapIndex(
      poolData.activeTick +
        NUMBER_OF_SURROUNDING_TICKS[poolData.fee] * TICK_SPACINGS[poolData.fee],
      TICK_SPACINGS[poolData.fee],
    ),
  )

  const lowerTicksContracts = existingPools.map(
    ([, poolData], i) =>
      ({
        chainId,
        address: SUSHISWAP_V3_TICK_LENS[
          chainId as SushiSwapV3ChainId
        ] as Address,
        args: [poolData.address as Address, minIndexes[i]],
        abi: tickLensAbi,
        functionName: 'getPopulatedTicksInWord',
      }) as const,
  )

  const upperTicksContracts = existingPools.map(
    ([, poolData], i) =>
      ({
        chainId,
        address: SUSHISWAP_V3_TICK_LENS[
          chainId as SushiSwapV3ChainId
        ] as Address,
        args: [poolData.address as Address, maxIndexes[i]],
        abi: tickLensAbi,
        functionName: 'getPopulatedTicksInWord',
      }) as const,
  )

  const [
    liquidity,
    token0Balances,
    token1Balances,
    lowerTickResults,
    upperTickResults,
  ] = await Promise.all([
    readContracts(config, {
      contracts: liquidityContracts,
    }),
    readContracts(config, {
      contracts: token0Contracts,
    }),
    readContracts(config, {
      contracts: token1Contracts,
    }),
    readContracts(config, {
      contracts: lowerTicksContracts,
    }),
    readContracts(config, {
      contracts: upperTicksContracts,
    }),
  ])
  const isContractLengthsNull =
    liquidityContracts.length === 0 ||
    token0Contracts.length === 0 ||
    token1Contracts.length === 0 ||
    lowerTicksContracts.length === 0 ||
    upperTicksContracts.length === 0

  if (isContractLengthsNull) return [[V3PoolState.INVALID, null]]
  if (
    !liquidity ||
    !token0Balances ||
    !token1Balances ||
    !lowerTickResults ||
    !upperTickResults
  )
    return existingPools.map(() => [V3PoolState.LOADING, null])

  return existingPools.map(([, pool], i) => {
    const token0Balance = token0Balances[i].result
    const token1Balance = token1Balances[i].result

    const _liquidity = liquidity?.[i].result

    if (
      !_liquidity ||
      !token0Balance ||
      !token1Balance ||
      !lowerTickResults?.[i] ||
      !upperTickResults?.[i]
    )
      return [V3PoolState.LOADING, null]

    const lowerTicks =
      lowerTickResults[i].result?.map((tick) => ({
        index: tick.tick,
        DLiquidity: tick.liquidityGross,
      })) ?? []
    const upperTicks =
      upperTickResults[i].result?.map((tick) => ({
        index: tick.tick,
        DLiquidity: tick.liquidityGross,
      })) ?? []
    const ticks = [...lowerTicks, ...upperTicks].sort(
      (a, b) => a.index - b.index,
    )

    return [
      V3PoolState.EXISTS,
      new UniV3Pool(
        pool.address,
        pool.token0 as RToken,
        pool.token1 as RToken,
        pool.fee / 1_000_000,
        token0Balance,
        token1Balance,
        pool.activeTick,
        _liquidity,
        pool.sqrtPriceX96,
        ticks,
      ),
    ]
  })
}
