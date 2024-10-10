import { getTokenList } from '@sushiswap/graph-client/data-api'
import { Ratelimit } from '@upstash/ratelimit'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from 'src/lib/rate-limit'
import { Position, formatPercent } from 'sushi'
import { ChainId } from 'sushi/chain'
import {
  SushiSwapV3ChainId,
  SushiSwapV3FeeAmount,
  isSushiSwapV3ChainId,
} from 'sushi/config'
import { Token } from 'sushi/currency'
import { getAddress } from 'viem'
import { z } from 'zod'
import { CORS } from '../../cors'
import { getPool } from './getPool'
import { getPosition } from './getPosition'

async function getPrices({
  chainId,
}: {
  chainId: ChainId
}): Promise<Record<string, number>> {
  return fetch(`https://api.sushi.com/price/v1/${chainId}`, {
    next: { revalidate: 0 },
  })
    .then((res) => res.json())
    .catch((e) => {
      console.error('Error fetching token prices', chainId, e)
      throw e
    })
}

const schema = z.object({
  chainId: z.coerce
    .number()
    .refine((chainId) => isSushiSwapV3ChainId(chainId as ChainId), {
      message: 'Invalid chainId',
    })
    .transform((chainId) => {
      return chainId as SushiSwapV3ChainId
    }),
  positionId: z.coerce.bigint().positive(),
})

export const revalidate = 30
export const maxDuration = 10

export async function GET(request: NextRequest) {
  const ratelimit = rateLimit(Ratelimit.slidingWindow(200, '5 m'))
  if (ratelimit) {
    const { remaining } = await ratelimit.limit(request.ip || '127.0.0.1')
    if (!remaining) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }

  const { searchParams } = new URL(request.url)
  const result = schema.safeParse(Object.fromEntries(searchParams))

  if (!result.success) {
    return NextResponse.json(JSON.parse(result.error.message), { status: 400 })
  }

  const args = result.data

  try {
    const position = await getPosition({
      chainId: args.chainId,
      tokenId: args.positionId,
    })

    const [[token0], [token1]] = await Promise.all([
      getTokenList({ chainId: args.chainId, search: position.token0 }),
      getTokenList({ chainId: args.chainId, search: position.token1 }),
    ])

    const [{ pool, poolAddress }, prices] = await Promise.all([
      getPool({
        chainId: args.chainId,
        token0: new Token(token0),
        token1: new Token(token1),
        feeAmount: position.fee as SushiSwapV3FeeAmount,
      }),
      getPrices({ chainId: args.chainId }),
    ])

    const { amount0, amount1 } = new Position({
      pool,
      liquidity: position.liquidity.toString(),
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
    })

    const token0PriceUSD = prices[getAddress(token0.address)] || 0
    const token1PriceUSD = prices[getAddress(token1.address)] || 0

    const amount0USD = Number(amount0.toFixed(token0.decimals)) * token0PriceUSD
    const amount1USD = Number(amount1.toFixed(token1.decimals)) * token1PriceUSD

    const positionValueUSD = amount0USD + amount1USD

    const fees0USD =
      (Number(position.fees.amount0) / 10 ** token0.decimals) * token0PriceUSD
    const fees1USD =
      (Number(position.fees.amount1) / 10 ** token1.decimals) * token1PriceUSD

    const unclaimedFeesValueUSD = fees0USD + fees1USD

    const totalValueUSD = positionValueUSD + unclaimedFeesValueUSD

    const data = {
      poolAddress,
      owner: position.owner,
      token0: {
        id: token0.id,
        chainId: args.chainId,
        address: token0.address,
        symbol: token0.symbol,
        decimals: token0.decimals,
        priceUSD: token0PriceUSD,
      },
      token1: {
        id: token1.id,
        chainId: args.chainId,
        address: token1.address,
        symbol: token1.symbol,
        decimals: token1.decimals,
        priceUSD: token1PriceUSD,
      },
      poolFeeAmount: formatPercent(position.fee / 1000000),
      position: {
        amount0: String(amount0.quotient),
        amount0Formatted: Number(amount0.quotient) / 10 ** token0.decimals,
        amount0USD: amount0USD,
        amount1: String(amount1.quotient),
        amount1Formatted: Number(amount1.quotient) / 10 ** token1.decimals,
        amount1USD: amount1USD,
      },
      fees: {
        amount0: String(position.fees.amount0),
        amount0Formatted: Number(position.fees.amount0) / 10 ** token0.decimals,
        amount0USD: fees0USD,
        amount1: String(position.fees.amount1),
        amount1Formatted: Number(position.fees.amount1) / 10 ** token1.decimals,
        amount1USD: fees1USD,
      },
      positionValueUSD,
      unclaimedFeesValueUSD,
      totalValueUSD,
      range: {
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
      },
      inRange:
        pool.tickCurrent >= position.tickLower &&
        pool.tickCurrent <= position.tickUpper,
    }

    return NextResponse.json(data, { headers: CORS })
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }
}
