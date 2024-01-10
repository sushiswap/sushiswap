import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { fetchTokensForChainIdFromLists } from '../../../lib/api/v1.js'

const schema = z.object({
  chainId: z.coerce
    .number()
    .int()
    .gte(0)
    .lte(2 ** 256),
})

const handler = async (request: VercelRequest, response: VercelResponse) => {
  response.setHeader(
    'Cache-Control',
    's-maxage=1800, stale-while-revalidate=3600',
  )
  const { chainId } = schema.parse(request.query)

  const tokenList = await fetchTokensForChainIdFromLists(chainId)
  return response.status(200).json(tokenList)
}

export default handler
