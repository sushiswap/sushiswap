import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchTokensFromLists } from '../../lib/api/v1.js'

const handler = async (_request: VercelRequest, response: VercelResponse) => {
  response.setHeader(
    'Cache-Control',
    's-maxage=1800, stale-while-revalidate=3600',
  )
  const tokenList = await fetchTokensFromLists()
  return response.status(200).json(tokenList)
}

export default handler
