import {
  AbiStateMutability,
  Address,
  ContractFunctionParameters,
  PublicClient,
  getContract,
  parseAbi,
} from 'viem'
import { ChainId } from '../../chain/index.js'
import {
  DAI,
  FRAX,
  LINK,
  USDC,
  USDT,
  WBTC,
  renBTC,
} from '../../currency/index.js'
import { Native, Token, Type } from '../../currency/index.js'
import { RToken, createCurvePoolsForMultipool } from '../../tines/index.js'
import { getCurrencyCombinations } from '../get-currency-combinations.js'
import { CurvePoolCode } from '../pool-codes/CurvePool.js'
import { PoolCode } from '../pool-codes/PoolCode.js'
import { LiquidityProvider, LiquidityProviders } from './LiquidityProvider.js'

const stETH = new Token({
  chainId: 1,
  address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  decimals: 18,
  symbol: 'stETH',
  name: 'Liquid staked Ether 2.0',
})

const sBTC = new Token({
  chainId: 1,
  address: '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
  decimals: 18,
  symbol: 'sBTC',
  name: 'Synth sBTC',
})

export const sETH = new Token({
  chainId: 1,
  address: '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb',
  decimals: 18,
  symbol: 'sETH',
  name: 'Synth sETH',
})

const rETH = new Token({
  chainId: 1,
  address: '0x9559Aaa82d9649C7A7b220E7c461d2E74c9a3593',
  decimals: 18,
  symbol: 'rETH',
  name: 'StaFi',
})

const ankrETH = new Token({
  chainId: 1,
  address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
  decimals: 18,
  symbol: 'ankrETH',
  name: 'Ankr Staked ETH',
})

const frxETH = new Token({
  chainId: 1,
  address: '0x5e8422345238f34275888049021821e8e08caa1f',
  decimals: 18,
  symbol: 'frxETH',
  name: 'Frax Ether',
})

const sEUR = new Token({
  chainId: 1,
  address: '0xd71ecff9342a5ced620049e616c5035f1db98620',
  decimals: 18,
  symbol: 'sEUR',
  name: 'Synth sEUR',
})

const EURS = new Token({
  chainId: 1,
  address: '0xdb25f211ab05b1c97d595516f45794528a807ad8',
  decimals: 2,
  symbol: 'EURS',
  name: 'STASIS EURS',
})

const aDAI = new Token({
  chainId: 1,
  address: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
  decimals: 18,
  symbol: 'aDAI',
  name: 'Aave interest bearing DAI',
})

const aSUSD = new Token({
  chainId: 1,
  address: '0x6C5024Cd4F8A59110119C56f8933403A539555EB',
  decimals: 18,
  symbol: 'aSUSD',
  name: 'Aave interest bearing SUSD',
})

const cUSDC = new Token({
  chainId: 1,
  address: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
  decimals: 8,
  symbol: 'cUSDC',
  name: 'Compound USD Coin',
})

const cDAI = new Token({
  chainId: 1,
  address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  decimals: 8,
  symbol: 'cDAI',
  name: 'Compound Dai',
})

const sLINK = new Token({
  chainId: 1,
  address: '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6',
  decimals: 18,
  symbol: 'sLINK',
  name: 'Synth sLINK',
})

const sUSD = new Token({
  chainId: 1,
  address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
  decimals: 18,
  symbol: 'sUSD',
  name: 'Synth sUSD',
})

const HBTC = new Token({
  chainId: 1,
  address: '0x0316EB71485b0Ab14103307bf65a021042c6d380',
  decimals: 18,
  symbol: 'HBTS',
  name: 'Huobi BTC',
})

export enum CurvePoolType {
  Legacy = 'Legacy', // 'exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) -> uint256'
  LegacyV2 = 'LegacyV2', // 'function coins(int128) pure returns (address)'
  LegacyV3 = 'LegacyV3',
  Factory = 'Factory',
}

const ETH = Native.onChain(ChainId.ETHEREUM)
export const CURVE_NON_FACTORY_POOLS: Record<
  number,
  [Address, CurvePoolType, Type[]][]
> = {
  [ChainId.ETHEREUM]: [
    [
      // 3pool
      '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
      CurvePoolType.LegacyV3,
      [DAI[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM]],
    ],
    [
      // susd
      '0xa5407eae9ba41422680e2e00537571bcc53efbfd',
      CurvePoolType.LegacyV2,
      [
        DAI[ChainId.ETHEREUM],
        USDC[ChainId.ETHEREUM],
        USDT[ChainId.ETHEREUM],
        sUSD,
      ],
    ],
    [
      '0xdc24316b9ae028f1497c275eb9192a3ea0f67022',
      CurvePoolType.Legacy,
      [ETH, stETH],
    ],
    [
      '0xdcef968d416a41cdac0ed8702fac8128a64241a2',
      CurvePoolType.Legacy,
      [FRAX[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM]],
    ],
    [
      '0xf253f83aca21aabd2a20553ae0bf7f65c755a07f',
      CurvePoolType.Legacy,
      [WBTC[ChainId.ETHEREUM], sBTC],
    ],
    [
      '0xc5424b857f758e906013f3555dad202e4bdb4567',
      CurvePoolType.Legacy,
      [ETH, sETH],
    ],
    [
      '0xa1f8a6807c402e4a15ef4eba36528a3fed24e577',
      CurvePoolType.Legacy,
      [ETH, frxETH],
    ],
    [
      '0x0ce6a5ff5217e38315f87032cf90686c96627caa',
      CurvePoolType.Legacy,
      [EURS, sEUR],
    ],
    [
      '0xa96a65c051bf88b4095ee1f2451c2a9d43f53ae2',
      CurvePoolType.Legacy,
      [ETH, ankrETH],
    ],
    [
      '0xeb16ae0052ed37f479f7fe63849198df1765a733',
      CurvePoolType.Legacy,
      [aDAI, aSUSD],
    ],
    [
      '0xf9440930043eb3997fc70e1339dbb11f341de7a8',
      CurvePoolType.Legacy,
      [ETH, rETH],
    ],
    [
      '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56',
      CurvePoolType.LegacyV2,
      [cDAI, cUSDC],
    ],
    [
      '0xf178c0b5bb7e7abf4e12a4838c7b7c5ba2c623c0',
      CurvePoolType.Legacy,
      [LINK[ChainId.ETHEREUM], sLINK],
    ],
    [
      '0x4ca9b3063ec5866a4b82e437059d2c43d1be596f',
      CurvePoolType.LegacyV3,
      [HBTC, WBTC[ChainId.ETHEREUM]],
    ],
    [
      '0x93054188d876f558f4a66b2ef1d97d16edf0895b',
      CurvePoolType.LegacyV2,
      [renBTC[ChainId.ETHEREUM], WBTC[ChainId.ETHEREUM]],
    ],
    // Low liquidity ['0xfd5db7463a3ab53fd211b4af195c5bccc1a03890', CurvePoolType.Legacy],
  ],
}

export const CURVE_FACTORY_ADDRESSES: Record<number, `0x${string}`[]> = {
  [ChainId.ETHEREUM]: [
    // '0x0959158b6040d32d04c301a72cbfd6b39e21c9ae',  // Metapools only - uncomment when we support them
    // '0xb9fc157394af804a3578134a6585c0dc9cc990d4',  // Metapools only - uncomment when we support them
    //'0xf18056bbd320e96a48e3fbf8bc061322531aac99', for crypto2 pools only
  ],
}

const factoryABI = parseAbi([
  'function pool_count() pure returns (uint256)',
  'function pool_list(uint256) pure returns (address)',
  'function find_pool_for_coins(address, address, uint256) view returns (address)',
  //'function get_n_coins(address) pure returns (uint256)',
] as const)

export async function getAllSupportedCurvePools(
  publicClient: PublicClient,
): Promise<Map<string, CurvePoolType>> {
  const result: Map<string, CurvePoolType> = new Map()
  const chainId = await publicClient.getChainId()

  const promises = CURVE_FACTORY_ADDRESSES[
    chainId as keyof typeof CURVE_FACTORY_ADDRESSES
  ]?.map(async (factory) => {
    const factoryContract = getContract({
      address: factory as `0x${string}`,
      abi: factoryABI,
      client: {
        public: publicClient,
      },
    })

    const poolNum = await factoryContract.read.pool_count()
    for (let i = 0n; i < poolNum; ++i) {
      const poolAddress = await factoryContract.read.pool_list([i])
      result.set(poolAddress, CurvePoolType.Factory)
    }
  })
  // @ts-ignore
  await Promise.all(promises)
  ;(CURVE_NON_FACTORY_POOLS[chainId] ?? []).forEach((pool) =>
    result.set(pool[0], pool[1]),
  )

  return result
}

const curvePoolABI = {
  [CurvePoolType.Factory]: parseAbi([
    'function A() pure returns (uint256)',
    'function fee() pure returns (uint256)',
    'function coins(uint256) pure returns (address)',
    'function balances(uint256) pure returns (uint256)',
  ] as const),
  [CurvePoolType.Legacy]: parseAbi([
    'function A() pure returns (uint256)',
    'function fee() pure returns (uint256)',
    'function coins(uint256) pure returns (address)',
    'function balances(uint256) pure returns (uint256)',
  ] as const),
  [CurvePoolType.LegacyV2]: parseAbi([
    'function A() pure returns (uint256)',
    'function fee() pure returns (uint256)',
    'function coins(int128) pure returns (address)',
    'function balances(int128) pure returns (uint256)',
  ] as const),
  [CurvePoolType.LegacyV3]: parseAbi([
    'function A() pure returns (uint256)',
    'function fee() pure returns (uint256)',
    'function coins(uint256) pure returns (address)',
    'function balances(uint256) pure returns (uint256)',
  ] as const),
} as const
/*
async function getCurvePoolCode(publicClient: PublicClient, poolAddress: string, poolType: CurvePoolType, token0: Type, token1: Type): Promise<PoolCode> {
  const poolContract = getContract({
    address: poolAddress as '0x${string}',
    abi: curvePoolABI[poolType],
    publicClient,
  })

  const userAddress = await user.getAddress()
  const tokenContracts = []
  const tokenTines: RToken[] = []
  for (let i = 0; i < 100; ++i) {
    let token
    try {
      token = await poolContract.coins(i)
    } catch (e) {
      break
    }
    if (token == '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      // native
      tokenContracts.push(undefined)
      tokenTines.push({ address: token, name: token, symbol: token, chainId: 1, decimals: 18 })
    } else {
      const res = await setTokenBalance(token, userAddress, initialBalance)
      expect(res).equal(true, 'Wrong setTokenBalance for ' + token)

      const tokenContract = new Contract(token, erc20Abi, user)
      try {
        await tokenContract.approve(poolAddress, initialBalance.toString())
      } catch (_) {
        // in try block because crv token (0xD533a949740bb3306d119CC777fa900bA034cd52) doesn't allow re-approve (((
      }
      tokenContracts.push(tokenContract)

      const decimals = await tokenContract.decimals()
      tokenTines.push({ address: token, name: token, symbol: token, chainId: 1, decimals })
    }
}*/

export class CurveProvider extends LiquidityProvider {
  foundPools: PoolCode[] = []

  override getType(): LiquidityProviders {
    return LiquidityProviders.CurveSwap
  }

  /**
   * The name of liquidity provider to be used for pool naming. For example, 'SushiSwap'
   */
  override getPoolProviderName(): string {
    return 'Curve'
  }

  /**
   * Initiates event listeners for top pools
   */
  override startFetchPoolsData(): void {
    // simple implementation - no prefetching
  }

  async getPoolsForTokens(
    t0: Token,
    t1: Token,
    excludePools?: Set<string>,
  ): Promise<Map<Address, [CurvePoolType, Type[]]>> {
    const pools: Map<Address, [CurvePoolType, Type[]]> = new Map()
    let currencyCombinations = getCurrencyCombinations(this.chainId, t0, t1)
    for (let i = 0; currencyCombinations.length > 0; ++i) {
      const calls = (CURVE_FACTORY_ADDRESSES[this.chainId] ?? []).flatMap(
        (factory) =>
          currencyCombinations.map(([t0, t1]) => ({
            address: factory,
            chainId: this.chainId,
            abi: factoryABI,
            functionName: 'find_pool_for_coins' as const,
            args: [
              t0.address as Address,
              t1.address as Address,
              BigInt(i),
            ] as const,
          })),
      )
      const newFoundPools = await this.client.multicall({
        multicallAddress: this.client.chain?.contracts?.multicall3
          ?.address as '0x${string}',
        allowFailure: true,
        contracts: calls,
      })
      newFoundPools.forEach((pool, i) => {
        if (
          pool.status === 'success' &&
          excludePools?.has(pool.result) !== true
        )
          pools.set(pool.result, [
            CurvePoolType.Factory,
            currencyCombinations[i]!,
          ])
      })
      currencyCombinations = newFoundPools
        .map((pool, i) =>
          pool.status === 'success' ? currencyCombinations[i] : undefined,
        )
        .filter((c) => c !== undefined) as [Token, Token][]
    }
    ;(CURVE_NON_FACTORY_POOLS[this.chainId] ?? []).forEach((pool) => {
      if (excludePools?.has(pool[0]) !== true)
        pools.set(pool[0], [pool[1], pool[2]])
    })

    return pools
  }

  async getPoolRatio(
    pools: [string, [CurvePoolType, Type[]]][],
  ): Promise<(number[] | undefined)[]> {
    if (this.chainId === ChainId.ETHEREUM) {
      const ratios = await this.client.multicall({
        multicallAddress: this.client.chain?.contracts?.multicall3
          ?.address as '0x${string}',
        allowFailure: true,
        contracts: [
          {
            address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb', // ankr
            //chainId: this.chainId,
            abi: parseAbi(['function ratio() pure returns (uint256)'] as const),
            functionName: 'ratio',
          },
          {
            address: '0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593', // rETH
            //chainId: this.chainId,
            abi: parseAbi([
              'function getExchangeRate() pure returns (uint256)',
            ] as const),
            functionName: 'getExchangeRate',
          },
          {
            address: '0x39aa39c021dfbae8fac545936693ac917d5e7563', // cUSDC
            //chainId: this.chainId,
            abi: parseAbi([
              'function exchangeRateCurrent() pure returns (uint256)',
            ] as const),
            functionName: 'exchangeRateCurrent',
          },
          {
            address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', // cDAI
            //chainId: this.chainId,
            abi: parseAbi([
              'function exchangeRateCurrent() pure returns (uint256)',
            ] as const),
            functionName: 'exchangeRateCurrent',
          },
        ],
      })
      return pools.map(([poolAddress]) => {
        // collection of freaks
        switch (poolAddress.toLowerCase()) {
          case '0xa96a65c051bf88b4095ee1f2451c2a9d43f53ae2': {
            //ankrETH pool
            const _ratio = ratios[0].result
            return _ratio !== undefined ? [1, 1e18 / Number(_ratio)] : undefined
          }
          case '0xf9440930043eb3997fc70e1339dbb11f341de7a8': {
            // rETH pool
            const _ratio = ratios[1].result
            return _ratio !== undefined ? [1, Number(_ratio) / 1e18] : undefined
          }
          case '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56': {
            // compound pool cUSDC-cDAI
            const _ratio0 = ratios[2].result
            const _ratio1 = ratios[3].result
            return _ratio0 !== undefined && _ratio1 !== undefined
              ? [1, (Number(_ratio0) * 1e12) / Number(_ratio1)]
              : undefined
          }
          default:
            return [1, 1]
        }
      })
    } else return pools.map(() => [1, 1])
  }

  async getCurvePoolCodes(
    pools: Map<Address, [CurvePoolType, Type[]]>,
  ): Promise<PoolCode[]> {
    const poolArray = Array.from(pools.entries())
    const poolsMulticall = <
      T extends ContractFunctionParameters<
        (typeof curvePoolABI)[keyof typeof curvePoolABI]
      >['functionName'],
    >(
      functionName: T,
      args?: ContractFunctionParameters<
        (typeof curvePoolABI)[keyof typeof curvePoolABI],
        AbiStateMutability,
        T
      >['args'],
    ) => {
      return this.client.multicall({
        multicallAddress: this.client.chain?.contracts?.multicall3
          ?.address as '0x${string}',
        allowFailure: true,
        contracts: poolArray.map(([address, [poolType]]) => ({
          address: address as Address,
          // //chainId: this.chainId,
          abi: curvePoolABI[poolType],
          functionName: functionName,
          args,
        })) as any,
      })
    }
    // const poolContract = getContract({
    //   address: poolAddress as '0x${string}',
    //   abi: curvePoolABI[poolType],
    //   publicClient: this.client,
    // })

    const A = await poolsMulticall('A')
    const fee = await poolsMulticall('fee')
    const balance0 = await poolsMulticall('balances', [0n])
    const balance1 = await poolsMulticall('balances', [1n])
    const balance2 = await poolsMulticall('balances', [2n])
    const balance3 = await poolsMulticall('balances', [3n])
    const ratio = await this.getPoolRatio(poolArray)

    const poolCodes = poolArray.flatMap(([poolAddress, [, tokens]], i) => {
      const _fee = fee[i]!.result as bigint
      const _A = A[i]!.result as bigint
      const _balance0 = balance0[i]!.result as bigint
      const _balance1 = balance1[i]!.result as bigint
      const _balance2 = balance2[i]!.result as bigint
      const _balance3 = balance3[i]!.result as bigint
      const _ratio = ratio[i]
      if (
        _fee === undefined ||
        _A === undefined ||
        _balance0 === undefined ||
        _balance1 === undefined ||
        _ratio === undefined
      )
        return []
      const poolTines = createCurvePoolsForMultipool(
        poolAddress,
        tokens as RToken[],
        Number(_fee) / 1e10,
        Number(_A),
        [_balance0, _balance1, _balance2, _balance3].slice(0, tokens.length),
        _ratio,
      )

      return poolTines.map(
        (p) => new CurvePoolCode(p, this.getType(), this.getPoolProviderName()),
      )
    })

    return poolCodes.filter((p) => p !== undefined) as PoolCode[]
  }

  /**
   * Fetches relevant pools for the given tokens
   * @param t0 Token
   * @param t1 Token
   */
  override async fetchPoolsForToken(
    t0: Token,
    t1: Token,
    excludePools?: Set<string>,
  ): Promise<void> {
    const pools = await this.getPoolsForTokens(t0, t1, excludePools)
    this.foundPools = await this.getCurvePoolCodes(pools)
    //console.log(JSON.stringify(this.foundPools, undefined, '   '))
  }

  /**
   * Returns a list of PoolCode
   * @returns PoolCode[]
   */
  override getCurrentPoolList(): PoolCode[] {
    return this.foundPools
  }

  override stopFetchPoolsData(): void {
    // nothing at start - nothing at stop
  }
}
