import { RouteProcessor2ChainId } from 'sushi/config'
import { getIdFromChainIdAddress } from 'sushi/format'
import type { Token } from 'sushi/types'
import { type Address } from 'viem'
import { createConfig } from 'wagmi'
import { getToken } from 'wagmi/actions'
import { z } from 'zod'

import { publicWagmiConfig } from 'src/lib/wagmi/config/public'
import rp2Approvals from 'src/lib/wagmi/hooks/exploits/data/rp2-approvals.json'

const querySchema = z.object({
  account: z.coerce.string().transform((account) => account as Address),
})

const rp2ApprovalsItemSchema = z.object({
  address: z.string().transform((el) => el as Address),
  transactionHash: z.string(),
  spender: z.string().transform((el) => el as Address),
  owner: z.string().transform((el) => el as Address),
  value: z.number(),
})

const rp2ApprovalsSchema = z.record(
  z.coerce.number().transform((el) => el as RouteProcessor2ChainId),
  z.array(rp2ApprovalsItemSchema),
)

async function checkApprovals(account: Address) {
  const approvals = rp2ApprovalsSchema.parse(rp2Approvals)
  const items = Object.entries(approvals)
  const tokens: Token[] = []

  for (let i = 0; i < items.length; i++) {
    const [key, value] = items[i]
    const chainId = +key as RouteProcessor2ChainId

    for (let j = 0; j < value.length; j++) {
      const item = value[j]
      if (item.owner.toLowerCase() === account.toLowerCase()) {
        const resp = await getToken(createConfig(publicWagmiConfig), {
          address: item.address,
          chainId,
        })
        const { decimals, address: tokenAddress, symbol, name } = resp
        const token = {
          id: getIdFromChainIdAddress(chainId, tokenAddress),
          chainId,
          address: tokenAddress,
          symbol: symbol || '',
          name: name || '',
          decimals,
        }

        if (!tokens.map((el) => el.id).includes(token.id)) {
          tokens.push(token)
        }
      }
    }
  }

  return tokens
}

export type Approvals = Awaited<ReturnType<typeof checkApprovals>>

export const revalidate = 60

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { account } = querySchema.parse(Object.fromEntries(searchParams))

  const body = await checkApprovals(account)

  return Response.json(body)
}
