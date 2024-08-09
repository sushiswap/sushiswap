import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'

export const PortfolioClaimablesQuery = graphql(
  `
    query PortfolioClaimables($id: ID!) {
      portfolioClaimables(id: $id) {
        totalUSD
        v2PositionClaimables {
          position {
            id
            chainId
            chain
            protocol
            protocolId
            protocolLogoUrl
            address
            name
            swapFee
            token0 {
              id
              chain
              chainId
              name
              symbol
              decimals
              logoUrl
              protocolId
              price
              isVerified
              isCore
              isWallet
              timeAt
              amount
              amountUSD
            }
            token1 {
              id
              chain
              chainId
              name
              symbol
              decimals
              logoUrl
              protocolId
              price
              isVerified
              isCore
              isWallet
              timeAt
              amount
              amountUSD
            }
            amountUSD
            updatedAt
          }
          token {
            id
            chain
            chainId
            name
            symbol
            decimals
            logoUrl
            protocolId
            price
            isVerified
            isCore
            isWallet
            timeAt
            amount
            amountUSD
          }
        }
        v3PositionClaimables {
          position {
            id
            chainId
            chain
            protocol
            protocolId
            protocolLogoUrl
            address
            name
            swapFee
            positionId
            range
            fees {
              id
              chain
              chainId
              name
              symbol
              decimals
              logoUrl
              protocolId
              price
              isVerified
              isCore
              isWallet
              timeAt
              amount
              amountUSD
            }
            amountUSD
            updatedAt
          }
          token {
            id
            chain
            chainId
            name
            symbol
            decimals
            logoUrl
            protocolId
            price
            isVerified
            isCore
            isWallet
            timeAt
            amount
            amountUSD
          }
        }
        smartPositionClaimables {
          token {
            id
            chain
            chainId
            name
            symbol
            decimals
            logoUrl
            protocolId
            price
            isVerified
            isCore
            isWallet
            timeAt
            amount
            amountUSD
          }
          position {
            id
            chainId
            chain
            protocol
            protocolId
            protocolLogoUrl
            address
            name
            vaultAddress
            swapFee
            strategy
            amountUSD
            updatedAt
          }
        }
        furoClaimables {
          position {
            id
            chainId
            chain
            protocol
            protocolId
            protocolLogoUrl
            address
            name
            positionId
            updatedAt
          }
          token {
            id
            chain
            chainId
            name
            symbol
            decimals
            logoUrl
            protocolId
            price
            isVerified
            isCore
            isWallet
            timeAt
            amount
            amountUSD
          }
        }
      }
    }
`,
)

export type GetPortfolioClaimables = VariablesOf<
  typeof PortfolioClaimablesQuery
>

export async function getPortfolioClaimables(
  variables: GetPortfolioClaimables,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`

  const result = await request(
    { url, document: PortfolioClaimablesQuery, variables },
    options,
  )
  if (result) {
    return result.portfolioClaimables
  }

  throw new Error('No portfolio positions')
}

export type PortfolioClaimables = Awaited<
  ReturnType<typeof getPortfolioClaimables>
>

export type PortfolioV2Claim = PortfolioClaimables['v2PositionClaimables'][0]
export type PortfolioV3Claim = PortfolioClaimables['v3PositionClaimables'][0]
export type PortfolioSmartPositionClaim =
  PortfolioClaimables['smartPositionClaimables'][0]
export type PortfolioFuroClaim = PortfolioClaimables['furoClaimables'][0]

export type PortfolioFarmClaim =
  | PortfolioV2Claim
  | PortfolioV3Claim
  | PortfolioSmartPositionClaim

export type PortfolioClaim = PortfolioFarmClaim | PortfolioFuroClaim
