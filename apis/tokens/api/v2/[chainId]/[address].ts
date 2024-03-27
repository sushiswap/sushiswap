import type { VercelRequest, VercelResponse } from '@vercel/node'

import { isChainId } from 'sushi/chain'
import { getToken } from '../../../lib/api/v2.js'
import { TokenApiSchema } from '../../../lib/schemas/chainId/address.js'

const handler = async (request: VercelRequest, response: VercelResponse) => {
  response.setHeader(
    'Cache-Control',
    's-maxage=900, stale-while-revalidate=86400',
  )

  const result = TokenApiSchema.safeParse(request.query)
  if (!result.success) {
    return response.status(400).json(result.error.format())
  }

  const { chainId, address } = result.data

  if (!isChainId(chainId)) {
    return response.status(400).send('Invalid chainId')
  }

  try {
    const token = await getToken(chainId, address)
    return response.status(200).json(token)
  } catch {
    return response.status(404).send('Not found')
  }
}

export default handler
