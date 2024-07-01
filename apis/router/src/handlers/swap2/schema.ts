import { RouterLiquiditySource } from 'sushi/router'
import type { Address } from 'viem'
import z from 'zod'

// Swap 2.0
// maxPriceImpact - max current price impact (during route planning). Default - no control
// maxSlippage - max slippage (during route processing). Default - 0.5%
export const querySchema4_2 = z.object({
  tokenIn: z.string(),
  tokenOut: z.string(),
  amount: z.string().transform((amount) => BigInt(amount)),
  gasPrice: z.optional(
    z.coerce
      .number()
      .int('gasPrice should be integer')
      .gt(0, 'gasPrice should be positive'),
  ),
  source: z.optional(z.nativeEnum(RouterLiquiditySource)),
  to: z
    .optional(z.string())
    .transform((to) => (to ? (to as Address) : undefined)),
  preferSushi: z.optional(z.coerce.boolean()),
  maxPriceImpact: z.optional(
    z.coerce
      .number()
      .lt(1, 'maxPriceImpact should be lesser than 1')
      .gt(0, 'maxPriceImpact should be positive'),
  ),
  maxSlippage: z.optional(
    z.coerce
      .number()
      .lt(1, 'maxSlippage should be lesser than 1')
      .gt(0, 'maxSlippage should be positive'),
  ),
})
