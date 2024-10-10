import {
  RP2ClaimChainIds,
  RP2MerkleTreeClaimSchema,
  RP2MerkleTreeSchema,
} from 'src/lib/wagmi/hooks/exploits/constants'
import { RP2MerkleTree } from 'src/lib/wagmi/hooks/exploits/rp2-merkle-trees'
import { RP2ClaimChainId } from 'src/lib/wagmi/hooks/exploits/types'
import type { Address } from 'viem'
import { z } from 'zod'

const querySchema = z.object({
  account: z.coerce.string().transform((account) => account as Address),
})

function findClaims(account: Address) {
  return RP2ClaimChainIds.reduce<
    [RP2ClaimChainId, z.TypeOf<typeof RP2MerkleTreeClaimSchema>][]
  >((acc, cur) => {
    const claims = RP2MerkleTreeSchema.parse(RP2MerkleTree[cur]).claims.filter(
      (el) => el.user.toLowerCase() === account?.toLowerCase(),
    )

    claims.forEach((claim) => {
      acc.push([cur, claim])
    })

    return acc
  }, [])
}

export type Claims = ReturnType<typeof findClaims>

export const revalidate = Infinity

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { account } = querySchema.parse(Object.fromEntries(searchParams))

  const body = findClaims(account)

  return Response.json(body)
}
