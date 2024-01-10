import {
  DEFAULT_LIST_OF_LISTS,
  SUSHI_DEFAULT_TOKEN_LIST,
  type TokenInfo,
  type TokenList,
} from 'sushi/token-list'
import { getAddress } from 'viem'
import { redis } from '../redis.js'

const REDIS_KEY_PREFIX = 'token-list-v2-'

export async function fetchTokenList(url: string) {
  const value = await redis.get<TokenList | null>(
    `${REDIS_KEY_PREFIX}-${url}`.toLowerCase(),
  )
  return [url, value] as [string, TokenList | null]
}

export async function fetchTokenLists() {
  return Promise.all(DEFAULT_LIST_OF_LISTS.map(fetchTokenList))
}

export async function fetchTokensFromLists() {
  const redisResult = await fetchTokenLists()

  const tokenLists = new Map<string, TokenList>(
    redisResult
      .filter(([_, v]) => v !== null)
      .map(([url, v]) => [url, v as TokenList]),
  )

  return merge(tokenLists)
}

function merge(tokenLists: Map<string, TokenList>) {
  const tokens = new Map<string, TokenInfo>()

  // Set sushi default tokens first, they will take precedence
  tokenLists.get(SUSHI_DEFAULT_TOKEN_LIST)?.tokens.forEach((token) => {
    try {
      const key = `${token.chainId}:${token.address.toLowerCase()}`
      tokens.set(key, {
        ...(token as TokenInfo),
        address: getAddress(token.address), // Token addresses are sometimes lowercase from token lists
      })
    } catch (_e) {}
  })

  tokenLists.forEach((tokenList, url) => {
    if (url === SUSHI_DEFAULT_TOKEN_LIST) return // skip because we already ran this
    tokenList?.tokens.forEach((token) => {
      const key = `${token.chainId}:${token.address.toLowerCase()}`
      if (!tokens.has(key)) {
        try {
          tokens.set(key, {
            ...(token as TokenInfo),
            address: getAddress(token.address), // Token addresses are sometimes lowercase from token lists
          })
        } catch (_e) {}
      }
    })
  })
  return Array.from(tokens.values())
}

export async function fetchTokensForChainIdFromLists(chainId: number) {
  const redisResult = await fetchTokenLists()

  const tokenLists = new Map<string, TokenList>(
    redisResult
      .filter(([_, v]) => v !== null)
      .map(([url, v]) => [url, v as TokenList]),
  )

  return mergeForChainId(chainId, tokenLists)
}

function mergeForChainId(chainId: number, tokenLists: Map<string, TokenList>) {
  const tokens = new Map<string, TokenInfo>()

  // Set sushi default tokens first, they will take precedence
  tokenLists
    .get(SUSHI_DEFAULT_TOKEN_LIST)
    ?.tokens.filter((token) => token.chainId === chainId)
    .forEach((token) => {
      try {
        tokens.set(token.address.toLowerCase(), {
          ...(token as TokenInfo),
          address: getAddress(token.address), // Token addresses are sometimes lowercase from token lists
        })
      } catch (_e) {}
    })

  tokenLists.forEach((tokenList, url) => {
    if (url === SUSHI_DEFAULT_TOKEN_LIST) return // skip because we already ran this
    tokenList?.tokens
      .filter((token) => token.chainId === chainId)
      .forEach((token) => {
        if (!tokens.has(token.address.toLowerCase())) {
          try {
            tokens.set(token.address.toLowerCase(), {
              ...(token as TokenInfo),
              address: getAddress(token.address), // Token addresses are sometimes lowercase from token lists
            })
          } catch (_e) {}
        }
      })
  })
  return Array.from(tokens.values())
}
