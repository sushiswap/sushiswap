import type { VariablesOf } from 'gql.tada'

import { request, type RequestOptions } from 'src/lib/request'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'

export const PortfolioPositionsQuery = graphql(
  `
query PortfolioPositions($id: ID!) {
  portfolioLiquidityPositions(id: $id) {
    totalUSD
    v2Positions {
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
    v3Positions {
      id
      chainId
      chain
      protocol
      protocolId
      protocolLogoUrl
      address
      name
      
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
    smartPositions {
      id
      chainId
      chain
      protocol
      protocolId
      protocolLogoUrl
      
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
      address
      name
      vaultAddress
      swapFee
      strategy
      amountUSD
      updatedAt
    }
  }
}
`,
)

export type GetPortfolioPositions = VariablesOf<typeof PortfolioPositionsQuery>

export async function getPortfolioPositions(
  variables: GetPortfolioPositions,
  options?: RequestOptions,
) {
  const url = `https://${SUSHI_DATA_API_HOST}`

  const result = await request(
    { url, document: PortfolioPositionsQuery, variables },
    options,
  )
  if (result) {
    return result.portfolioLiquidityPositions
  }

  throw new Error('No portfolio positions')
}

export type PortfolioPositions = Awaited<
  ReturnType<typeof getPortfolioPositions>
>

export type PortfolioV2Position = PortfolioPositions['v2Positions'][0]
export type PortfolioV3Position = PortfolioPositions['v3Positions'][0]
export type PortfolioSmartPosition = PortfolioPositions['smartPositions'][0]

export type PortfolioPosition =
  | PortfolioV2Position
  | PortfolioV3Position
  | PortfolioSmartPosition
