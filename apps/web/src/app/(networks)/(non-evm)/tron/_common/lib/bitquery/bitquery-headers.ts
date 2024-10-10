export const getBitqueryHeaders = () => {
  if (!process.env.BITQUERY_API_KEY) {
    throw new Error('BITQUERY_API_KEY is not set')
  }
  if (!process.env.BITQUERY_BEARER_TOKEN) {
    throw new Error('BITQUERY_BEARER_TOKEN is not set')
  }
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')
  headers.append('X-API-KEY', process.env.BITQUERY_API_KEY)
  headers.append('Authorization', `Bearer ${process.env.BITQUERY_BEARER_TOKEN}`)
  return headers
}
