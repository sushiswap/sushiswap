import { getBitqueryHeaders } from './bitquery-headers'

export const getOptions = (query: string) => {
  const headers = getBitqueryHeaders()
  return {
    method: 'POST',
    headers,
    body: query,
    redirect: 'follow' as RequestRedirect,
  }
}
