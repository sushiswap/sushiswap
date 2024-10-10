import { ChainId } from 'sushi/chain'
import { getAddress, isAddress } from 'viem'
import { z } from 'zod'

const ZpdAddress = z
  .string()
  .refine((val) => (val ? isAddress(val) : false), 'Invalid address')

export const ApplyForTokenListTokenSchema = z.object({
  address: ZpdAddress.transform((address) => getAddress(address)),
  chainId: z.coerce
    .number()
    .transform((chainId) => chainId as ChainId)
    .default(ChainId.ETHEREUM),
  logoUrl: z.string().url(),
  tweetUrl: z.string().url().startsWith('https://x.com/').optional(),
})

export type ApplyForTokenListTokenSchemaType = z.infer<
  typeof ApplyForTokenListTokenSchema
>
