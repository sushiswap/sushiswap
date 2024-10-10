import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { type ChainId } from 'sushi'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'
import { SUSHI_REQUEST_HEADERS } from '../../request-headers'
import type { ChainIdVariable } from 'src/lib/types/chainId'

export const TokenAnalysisQuery = graphql(
  `
  query TokenAnalysis($chainId: Int!, $address: Bytes!) {
    tokenAnalysis(chainId: $chainId, address: $address) {
      token {
        id
        chainId
        address
        name
        symbol
        decimals
      }
      isExisting
      isPending
      isPassingRequirements
      reasoning
      metrics {
        age
        volumeUSD24h
        marketcapUSD
        holders
      }
      requirements {
        minimumAge
        minimumVolumeUSD24h
        minimumMarketcapUSD
        minimumHolders
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

export type GetTokenAnalysis = VariablesOf<typeof TokenAnalysisQuery> &
  ChainIdVariable<ChainId>

/**
 * NOTE: This is not intended to be used anywhere else other than the token listing page, do not replace this with goplusapi requests.
 * @param variables
 * @param options
 * @returns
 */
export async function getTokenAnalysis(
  variables: GetTokenAnalysis,
  options?: RequestOptions,
) {
  const url = `${SUSHI_DATA_API_HOST}/graphql`

  const result = await request(
    {
      url,
      document: TokenAnalysisQuery,
      variables,
      requestHeaders: SUSHI_REQUEST_HEADERS,
    },
    options,
  )

  if (result) {
    return result.tokenAnalysis
  }

  throw new Error('No token analysis found')
}

export type TokenAnalysis = Awaited<ReturnType<typeof getTokenAnalysis>>
