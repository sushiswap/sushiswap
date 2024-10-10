import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'
import { SUSHI_REQUEST_HEADERS } from '../../request-headers'
import { request } from 'src/lib/request'

export const PendingTokensQuery = graphql(
  `
 query PendingTokens {
  pendingTokens {
    token {
      id
      chainId
      address
      name
      symbol
      decimals
    }
    tweetUrl
    logoUrl
    reasoning
    createdAt
    metrics {
      age
      volumeUSD24h
      marketcapUSD
      holders
    }
    security {
      isOpenSource
      isProxy
      isMintable
      canTakeBackOwnership
      ownerChangeBalance
      hiddenOwner
      selfDestruct
      externalCall
      gasAbuse
      buyTax
      sellTax
      cannotBuy
      cannotSellAll
      slippageModifiable
      isHoneypot
      transferPausable
      isBlacklisted
      isWhitelisted
      isAntiWhale
      tradingCooldown
      isTrueToken
      isAirdropScam
      trustList
      isBuyable
      isFakeToken
      isSellLimit
      holderCount
    }
  }
}
`,
)

export async function getPendingTokens() {
  const url = `${SUSHI_DATA_API_HOST}/graphql`

  const result = await request({
    url,
    document: PendingTokensQuery,
    requestHeaders: SUSHI_REQUEST_HEADERS,
  })

  if (result) {
    return result.pendingTokens
  }

  throw new Error('No pendings found')
}

export type PendingTokens = Awaited<ReturnType<typeof getPendingTokens>>
