import { allChains, allProviders } from '@sushiswap/wagmi-config'
import type { Address } from '@wagmi/core'
import {
  configureChains,
  createConfig,
  erc20ABI,
  fetchBalance,
  readContracts,
} from '@wagmi/core'
import zip from 'lodash.zip'
import { z } from 'zod'

const { publicClient } = configureChains(allChains, allProviders)
createConfig({
  autoConnect: true,
  publicClient,
})

const querySchema = z.object({
  chainId: z.coerce
    .number()
    .int()
    .gte(0)
    .lte(2 ** 256),
  address: z.coerce.string(),
  tokens: z.array(z.coerce.string()).optional(),
})

const tokensSchema = z.array(z.coerce.string())

export const revalidate = 10

export async function GET(
  _req: Request,
  {
    params,
  }: { params: { chainId: string; address: string; tokens?: string[] } },
) {
  const { chainId, address } = querySchema.parse(params)

  const data = await (
    await fetch(`https://tokens.sushi.com/v2/${chainId}/addresses`, {
      next: { revalidate: 3600 },
    })
  ).json()
  const tokens = tokensSchema.parse(data)

  const balance = await fetchBalance({
    chainId,
    address: address as Address,
  })

  const balances = await readContracts({
    allowFailure: true,
    contracts: tokens.map(
      (token) =>
        ({
          chainId,
          address: token as Address,
          abi: erc20ABI,
          args: [address as Address],
          functionName: 'balanceOf',
        }) as const,
    ),
  })

  const zipped = zip(
    tokens,
    balances.map((balance) => balance?.result || 0n),
  )

  const body = {
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': balance.value.toString(),
    ...Object.fromEntries(
      zipped
        .filter(([, balance]) => balance !== 0n)
        .map(([token, balance]) => [token, balance?.toString()]),
    ),
  }
  return Response.json(body, {
    headers: {
      'Cache-Control': 's-maxage=1, stale-while-revalidate=59',
    },
  })
}
