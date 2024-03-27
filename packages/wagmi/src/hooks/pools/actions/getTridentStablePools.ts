import { TridentStablePool } from 'sushi'
import { tridentStablePoolAbi, tridentStablePoolFactoryAbi } from 'sushi/abi'
import { TridentChainId } from 'sushi/config'
import { Amount, Currency, Token } from 'sushi/currency'

import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { Address, getContract } from 'viem'
import { getPublicClient, readContracts } from 'wagmi/actions'
import { getTridentStablePoolFactoryContract } from '../../../contracts'
import { pairsUnique } from './utils'

export enum TridentStablePoolState {
  LOADING = 'Loading',
  NOT_EXISTS = 'Not Exists',
  EXISTS = 'Exists',
  INVALID = 'Invalid',
}

interface PoolData {
  address: Address
  token0: Token
  token1: Token
}

export const getTridentStablePools = async (
  chainId: TridentChainId,
  currencies: [Currency | undefined, Currency | undefined][],
  totals: Map<string, { base: bigint; elastic: bigint }>,
  config: PublicWagmiConfig,
) => {
  const client = getPublicClient(config, { chainId })

  const contract = getContract({
    ...getTridentStablePoolFactoryContract(chainId),
    client,
  })

  const _pairsUnique = pairsUnique(currencies)
  const _pairsUniqueAddr = _pairsUnique.map(
    ([t0, t1]) => [t0.address, t1.address] as const,
  )

  const callStatePoolsCount = await readContracts(config, {
    contracts: _pairsUniqueAddr.map(
      (el) =>
        ({
          chainId,
          address: contract?.address,
          abi: tridentStablePoolFactoryAbi,
          functionName: 'poolsCount',
          args: el,
        }) as const,
    ),
  })

  const callStatePoolsCountProcessed = callStatePoolsCount
    ?.map(
      (s, i) => [i, s.status === 'success' ? s.result : 0n] as [number, bigint],
    )
    .filter(([, length]) => length)
    .map(
      ([i, length]) =>
        [
          _pairsUniqueAddr[i][0],
          _pairsUniqueAddr[i][1],
          0n,
          BigInt(length),
        ] as const,
    )

  const pairsUniqueProcessed = callStatePoolsCount
    ?.map(
      (s, i) => [i, s.status === 'success' ? s.result : 0n] as [number, bigint],
    )
    .filter(([, length]) => length)
    .map(([i]) => [_pairsUnique[i][0], _pairsUnique[i][1]])

  const callStatePools = await readContracts(config, {
    contracts: callStatePoolsCountProcessed.map(
      (args) =>
        ({
          chainId,
          address: contract?.address,
          abi: tridentStablePoolFactoryAbi,
          functionName: 'getPools',
          args,
        }) as const,
    ),
  })

  const pools: PoolData[] = []
  callStatePools?.forEach((s, i) => {
    if (s.result)
      s.result.forEach((address) =>
        pools.push({
          address,
          token0: pairsUniqueProcessed?.[i][0],
          token1: pairsUniqueProcessed?.[i][1],
        }),
      )
  })

  const poolsAddresses = pools.map((p) => p.address)

  const contracts = [
    ...poolsAddresses.map((address) => ({
      chainId,
      address,
      abi: tridentStablePoolAbi,
      functionName: 'getReserves' as const,
    })),
    ...poolsAddresses.map((address) => ({
      chainId,
      address,
      abi: tridentStablePoolAbi,
      functionName: 'swapFee' as const,
    })),
  ]

  const reservesAndFees = await readContracts(config, {
    contracts,
  })

  return pools.map((p, i) => {
    if (
      !reservesAndFees?.[i].result ||
      !reservesAndFees?.[i + poolsAddresses.length].result
    ) {
      return [TridentStablePoolState.LOADING, null]
    }

    const total0 = totals.get(p.token0.address)
    const total1 = totals.get(p.token1.address)
    const [reserve0, reserve1] = reservesAndFees[i].result as [bigint, bigint]
    const swapFee = reservesAndFees[i + poolsAddresses.length].result as bigint

    if (!reserve0 || !reserve1 || !total0 || !total1)
      return [TridentStablePoolState.LOADING, null]
    return [
      TridentStablePoolState.EXISTS,
      new TridentStablePool(
        Amount.fromRawAmount(p.token0, reserve0),
        Amount.fromRawAmount(p.token1, reserve1),
        parseInt(swapFee.toString()),
        { base: total0.base, elastic: total0.elastic },
        { base: total1.base, elastic: total1.elastic },
      ),
    ]
  })
}
