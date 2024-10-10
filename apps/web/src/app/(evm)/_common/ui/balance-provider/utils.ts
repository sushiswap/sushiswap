import { getChainIdAddressFromId } from 'sushi'
import { STALE_TIME, STALE_WHILE_REVALIDATE } from './config'
import { Balance, TokenId } from './types'

export function getTokenIds(tokenIds: TokenId | TokenId[]) {
  const array = Array.isArray(tokenIds) ? tokenIds : [tokenIds]

  return array.map(getTokenId)
}

export function getTokenId(tokenId: TokenId) {
  return typeof tokenId === 'string'
    ? getChainIdAddressFromId(tokenId)
    : tokenId
}

export function isBalanceStale(balance: Balance) {
  return balance.lastUpdated + STALE_TIME < Date.now()
}

export function isBalanceStaleWhileRevalidate(balance: Balance) {
  return balance.lastUpdated + STALE_WHILE_REVALIDATE < Date.now()
}
