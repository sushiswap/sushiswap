import { getTokensWithoutKey } from './useTokens'

export default function getTokenFromAddress(address: string | null) {
  const tokens = getTokensWithoutKey()
  if (!address) return
  return tokens.find((token) => token.address === address)
}
