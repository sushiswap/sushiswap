import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { getPublicClient } from '@wagmi/core'
import { readContracts } from '@wagmi/core/actions'
import { TridentConstantPool } from 'sushi'
import {
  tridentConstantPoolAbi,
  tridentConstantPoolFactoryAbi,
} from 'sushi/abi'
import { TridentChainId } from 'sushi/config'
import { Amount, Currency, Token } from 'sushi/currency'
import { Address, getContract } from 'viem'
import { getTridentConstantPoolFactoryContract } from '../../../contracts'
import { pairsUnique } from './utils'

export enum TridentConstantPoolState {
  LOADING = 'Loading',
  NOT_EXISTS = 'Not exists',
  EXISTS = 'Exists',
  INVALID = 'Invalid',
}

interface PoolData {
  address: Address
  token0: Token
  token1: Token
}

export const getTridentConstantPools = async (
  chainId: TridentChainId,
  currencies: [Currency | undefined, Currency | undefined][],
  config: PublicWagmiConfig,
) => {
  const client = getPublicClient(config, { chainId })

  const contract = getContract({
    ...getTridentConstantPoolFactoryContract(chainId),
    client,
  })

  const _pairsUnique = pairsUnique(currencies)
  const _pairsUniqueAddr = _pairsUnique.map(
    ([t0, t1]) => [t0.address, t1.address] as const,
  )

  const callStatePoolsCount = await client.multicall({
    contracts: _pairsUniqueAddr.map((el) => ({
      chainId,
      address: contract?.address,
      abi: tridentConstantPoolFactoryAbi,
      functionName: 'poolsCount',
      args: el,
    })),
  })

  const callStatePoolsCountProcessed =
    callStatePoolsCount
      ?.map(
        (s, i) =>
          [i, s.status === 'success' ? s.result : 0n] as [number, bigint],
      )
      .filter(([, length]) => length)
      .map(
        ([i, length]) =>
          [
            _pairsUniqueAddr[i][0] as Address,
            _pairsUniqueAddr[i][1] as Address,
            0n,
            BigInt(length),
          ] as const,
      ) ?? []

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
          abi: tridentConstantPoolFactoryAbi,
          functionName: 'getPools',
          args,
        }) as const,
    ),
  })

  const pools: PoolData[] = []
  callStatePools?.forEach((s, i) => {
    if (s.result !== undefined)
      s.result.forEach((address) => {
        pools.push({
          address: address as Address,
          token0: pairsUniqueProcessed?.[i][0] as Token,
          token1: pairsUniqueProcessed?.[i][1] as Token,
        })
      })
  })

  const poolsAddresses = pools.map((p) => p.address as Address)

  const contracts = [
    ...poolsAddresses.map((address) => ({
      chainId,
      address,
      abi: tridentConstantPoolAbi,
      functionName: 'getReserves' as const,
    })),
    ...poolsAddresses.map((address) => ({
      chainId,
      address,
      abi: tridentConstantPoolAbi,
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
      return [TridentConstantPoolState.LOADING, null]
    }

    const [reserve0, reserve1, blockTimestampLast] = reservesAndFees[i]
      .result as [bigint, bigint, number]
    const swapFee = reservesAndFees[i + poolsAddresses.length].result as bigint

    return [
      TridentConstantPoolState.EXISTS,
      new TridentConstantPool(
        Amount.fromRawAmount(p.token0, reserve0),
        Amount.fromRawAmount(p.token1, reserve1),
        parseInt(swapFee.toString()),
        blockTimestampLast !== 0,
      ),
    ]
  })
}
