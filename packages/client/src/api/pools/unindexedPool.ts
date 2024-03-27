import { Protocol } from '@sushiswap/database'
import {
  erc20Abi,
  tridentConstantPoolAbi,
  tridentStablePoolAbi,
  uniswapV2PairAbi,
  v3baseAbi,
} from 'sushi/abi'
import { publicClientConfig } from 'sushi/config'
import { type Address, type PublicClient, createPublicClient } from 'viem'

import { getChainIdAddressFromId } from 'sushi/format'
import { type getPoolFromDB } from './pool'

interface GetPoolArgs {
  client: PublicClient
  address: Address
  protocol?: Protocol
}

interface Pool {
  tokens: Address[]
  totalSupply: string
  swapFee: number
  twapEnabled: boolean
  protocol: Protocol
}

async function getTokenInfo({ client, address }: GetPoolArgs) {
  const [name, symbol, decimals] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: address,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address: address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address: address,
        abi: erc20Abi,
        functionName: 'name',
      },
    ],
  })

  return { address, name, symbol, decimals }
}

async function getV2Pool({ client, address }: GetPoolArgs): Promise<Pool> {
  const [token0, token1, totalSupply] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: address,
        abi: uniswapV2PairAbi,
        functionName: 'token0',
      },
      {
        address: address,
        abi: uniswapV2PairAbi,
        functionName: 'token1',
      },
      {
        address: address,
        abi: uniswapV2PairAbi,
        functionName: 'totalSupply',
      },
    ],
  })

  return {
    tokens: [token0, token1],
    totalSupply: totalSupply.toString(),
    swapFee: 0.003,
    twapEnabled: true,
    protocol: Protocol.SUSHISWAP_V2,
  }
}

async function getTridentStablePool({
  client,
  address,
}: GetPoolArgs): Promise<Pool> {
  const [token0, token1, totalSupply, swapFee] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: address,
        abi: tridentStablePoolAbi,
        functionName: 'token0',
      },
      {
        address: address,
        abi: tridentStablePoolAbi,
        functionName: 'token1',
      },
      {
        address: address,
        abi: tridentStablePoolAbi,
        functionName: 'totalSupply',
      },
      {
        address: address,
        abi: tridentStablePoolAbi,
        functionName: 'swapFee',
      },
    ],
  })

  return {
    tokens: [token0, token1],
    totalSupply: totalSupply.toString(),
    // 30 => 0.003%
    swapFee: Number(swapFee) / 10000,
    twapEnabled: false,
    protocol: Protocol.BENTOBOX_STABLE,
  }
}

async function getTridentConstantPool({
  client,
  address,
}: GetPoolArgs): Promise<Pool> {
  const [token0, token1, totalSupply, swapFee, reserves] =
    await client.multicall({
      allowFailure: false,
      contracts: [
        {
          address: address,
          abi: tridentConstantPoolAbi,
          functionName: 'token0',
        },
        {
          address: address,
          abi: tridentConstantPoolAbi,
          functionName: 'token1',
        },
        {
          address: address,
          abi: tridentConstantPoolAbi,
          functionName: 'totalSupply',
        },
        {
          address: address,
          abi: tridentConstantPoolAbi,
          functionName: 'swapFee',
        },
        {
          address: address,
          abi: tridentConstantPoolAbi,
          functionName: 'getReserves',
        },
      ],
    })

  const twapEnabled = reserves[2] > 0

  return {
    tokens: [token0, token1],
    totalSupply: totalSupply.toString(),
    // 30 => 0.003%
    swapFee: Number(swapFee) / 10000,
    twapEnabled,
    protocol: Protocol.BENTOBOX_CLASSIC,
  }
}

async function getV3Pool({ client, address }: GetPoolArgs): Promise<Pool> {
  const [token0, token1, liquidity, fee] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'token0',
      },
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'token1',
      },
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'liquidity',
      },
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'fee',
      },
    ],
  })
  return {
    tokens: [token0, token1],
    totalSupply: liquidity.toString(),
    // 500 is 0.05%. divide it by 1M to get the 0.0005 format
    swapFee: fee / 1_000_000,
    twapEnabled: true,
    protocol: Protocol.SUSHISWAP_V3,
  }
}

// Thought ReturnType would be enough, needed to wrap it to make TS happy
export async function getUnindexedPool(
  poolId: string,
): Promise<Awaited<ReturnType<typeof getPoolFromDB>>> {
  const { chainId, address } = getChainIdAddressFromId(poolId)

  if (chainId in publicClientConfig === false)
    throw new Error('Invalid chain id.')

  const cfg = publicClientConfig[chainId as keyof typeof publicClientConfig]

  const client = createPublicClient({
    chain: cfg.chain,
    transport: cfg.transport,
  }) as PublicClient

  let lpTokenName: string
  try {
    const { name } = await getTokenInfo({ client, address })
    lpTokenName = name
  } catch (_e) {
    lpTokenName = 'V3'
  }

  let poolFetcher: (args: GetPoolArgs) => Promise<Pool>
  switch (lpTokenName) {
    case 'Sushi Stable LP Token':
      poolFetcher = getTridentStablePool
      break
    case 'Sushi Constant Product LP Token':
      poolFetcher = getTridentConstantPool
      break
    case 'SushiSwap LP Token':
      poolFetcher = getV2Pool
      break
    default:
      poolFetcher = getV3Pool
  }

  const pool = await poolFetcher({ client, address })

  const tokens = await Promise.all(
    pool.tokens.map((token) => getTokenInfo({ client, address: token })),
  )

  const poolName = tokens.map(({ symbol }) => symbol).join('-')

  const [token0, token1] = tokens as [
    (typeof tokens)[number],
    (typeof tokens)[number],
  ]

  return {
    id: poolId,
    address,
    name: poolName,
    chainId: Number(chainId),
    token0: {
      id: `${chainId}:${token0.address.toLowerCase()}`,
      address: token0.address.toLowerCase(),
      symbol: token0.symbol,
      name: token0.name,
      decimals: token0.decimals,
    },
    token1: {
      id: `${chainId}:${token1.address.toLowerCase()}`,
      address: token1.address.toLowerCase(),
      symbol: token1.symbol,
      name: token1.name,
      decimals: token1.decimals,
    },
    hasEnabledSteerVault: false,
    hadEnabledSteerVault: false,
    steerVaults: [],
    liquidityUSD: '0',
    volumeUSD: '0',
    feesUSD: '0',
    liquidityUSDChange1h: 0,
    liquidityUSDChange1d: 0,
    liquidityUSDChange1w: 0,
    liquidityUSDChange1m: 0,
    feeApr1h: 0,
    feeApr1d: 0,
    feeApr1w: 0,
    feeApr1m: 0,
    totalApr1h: 0,
    totalApr1d: 0,
    totalApr1w: 0,
    totalApr1m: 0,
    incentiveApr: 0,
    isIncentivized: false,
    wasIncentivized: false,
    volume1h: '0',
    volume1d: '0',
    volume1w: '0',
    volume1m: '0',
    volumeChange1h: 0,
    volumeChange1d: 0,
    volumeChange1w: 0,
    volumeChange1m: 0,
    fees1h: '0',
    fees1d: '0',
    fees1w: '0',
    fees1m: '0',
    feesChange1h: 0,
    feesChange1d: 0,
    feesChange1w: 0,
    feesChange1m: 0,
    isBlacklisted: false,
    incentives: [],
    ...pool,
  } as Awaited<ReturnType<typeof getPoolFromDB>>
}
