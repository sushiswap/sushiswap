import { NextRequest } from 'next/server'
import { getAllPrices } from 'src/lib/get-all-prices'

import { z } from 'zod'

const Currency = {
  USD: 'USD',
  NATIVE: 'NATIVE',
} as const

const schema = z.object({
  currency: z
    .nativeEnum(Currency)
    .nullable()
    .transform((transform) => transform ?? Currency.USD),
})

export const revalidate = 600

export async function GET(request: NextRequest) {
  const result = schema.safeParse({
    currency: request.nextUrl.searchParams.get('currency'),
  })
  if (!result.success) {
    return Response.json(result.error.format(), { status: 400 })
  }
  const prices = await getAllPrices()
  return Response.json(prices, {
    headers: {
      'Cache-Control': 'max-age=60, stale-while-revalidate=600',
    },
  })
}
