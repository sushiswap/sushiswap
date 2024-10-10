import { NextRequest } from 'next/server'
import { SushiXSwap2Adapter } from 'src/lib/swap/cross-chain'
import { getCrossChainTrade } from 'src/lib/swap/cross-chain/actions/getCrossChainTrade'
import { getCrossChainTrades } from 'src/lib/swap/cross-chain/actions/getCrossChainTrades'
import { ChainId } from 'sushi/chain'
import { SushiXSwap2ChainId, isSushiXSwap2ChainId } from 'sushi/config'
import { getAddress } from 'viem'
import { z } from 'zod'

const schema = z.object({
  adapter: z.optional(z.nativeEnum(SushiXSwap2Adapter)),
  srcChainId: z.coerce
    .number()
    .refine((chainId) => isSushiXSwap2ChainId(chainId as ChainId), {
      message: `srchChainId must exist in SushiXSwapV2ChainId`,
    })
    .transform((chainId) => chainId as SushiXSwap2ChainId),
  dstChainId: z.coerce
    .number()
    .refine((chainId) => isSushiXSwap2ChainId(chainId as ChainId), {
      message: `dstChainId must exist in SushiXSwapV2ChainId`,
    })
    .transform((chainId) => chainId as SushiXSwap2ChainId),
  tokenIn: z.string().transform((token) => getAddress(token)),
  tokenOut: z.string().transform((token) => getAddress(token)),
  amount: z.string().transform((amount) => BigInt(amount)),
  srcGasPrice: z.optional(
    z.coerce
      .number()
      .int('gasPrice should be integer')
      .gt(0, 'gasPrice should be positive')
      .transform((gasPrice) => BigInt(gasPrice)),
  ),
  dstGasPrice: z.optional(
    z.coerce
      .number()
      .int('gasPrice should be integer')
      .gt(0, 'gasPrice should be positive')
      .transform((gasPrice) => BigInt(gasPrice)),
  ),
  from: z
    .optional(z.string())
    .transform((from) => (from ? getAddress(from) : undefined)),
  recipient: z
    .optional(z.string())
    .transform((to) => (to ? getAddress(to) : undefined)),
  preferSushi: z.optional(z.coerce.boolean()),
  maxSlippage: z.coerce
    .number()
    .lt(1, 'maxPriceImpact should be lesser than 1')
    .gt(0, 'maxPriceImpact should be positive'),
})

export const revalidate = 600

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())

  const { adapter, ...parsedParams } = schema.parse(params)

  const getCrossChainTradeParams = {
    ...parsedParams,
    slippagePercentage: (parsedParams.maxSlippage * 100).toString(),
  }

  const crossChainSwap = await (typeof adapter === 'undefined'
    ? getCrossChainTrades(getCrossChainTradeParams)
    : getCrossChainTrade({ adapter, ...getCrossChainTradeParams }))

  return Response.json(crossChainSwap, {
    headers: {
      'Cache-Control': 'max-age=60, stale-while-revalidate=600',
    },
  })
}
