import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { graphql } from '../../graphql'
import { SUSHI_REQUEST_HEADERS } from '../../request-headers'
import { request } from 'src/lib/request'

export const ApprovedCommunityTokensQuery = graphql(
  `
 query ApprovedCommunityTokens {
  approvedCommunityTokens {
    address
    chainId
    symbol
    name
    decimals
    approved
    logoUrl
  }
}
`,
)

export async function getApprovedCommunityTokens() {
  const url = `${SUSHI_DATA_API_HOST}/graphql`

  const result = await request({
    url,
    document: ApprovedCommunityTokensQuery,
    requestHeaders: SUSHI_REQUEST_HEADERS,
  })

  if (result) {
    return result.approvedCommunityTokens
  }

  throw new Error('No Approved Community Tokens found')
}

export type ApprovedCommunityTokens = Awaited<
  ReturnType<typeof getApprovedCommunityTokens>
>
