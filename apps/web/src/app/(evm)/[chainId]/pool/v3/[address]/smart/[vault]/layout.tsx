import { getVault } from '@sushiswap/graph-client/data-api'
import { Container, LinkInternal } from '@sushiswap/ui'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import React from 'react'

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { chainId: string; vault: string; address: string }
}) {
  const vault = await unstable_cache(
    async () =>
      await getVault({
        chainId: Number(params.chainId),
        vaultAddress: params.vault,
      }),
    ['vault', `${params.chainId}:${params.vault}`],
    { revalidate: 60 * 15 },
  )()

  if (!vault) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4">
      <Container maxWidth="5xl" className="px-2 sm:px-4">
        {vault.isDeprecated && (
          <div className="text-center text-red dark:text-red-600 w-full">
            <div className=" font-medium">This vault is deprecated.</div>
            <div className="text-sm">
              {"It will not accrue any fees and won't be readjusted."}
            </div>
          </div>
        )}
        <LinkInternal
          href={`/${params.chainId}/pool/v3/${params.address}/smart`}
          className="text-sm text-blue hover:underline"
        >
          ← Strategies
        </LinkInternal>
      </Container>
      <Container maxWidth="screen-3xl" className="px-2 sm:px-4">
        {children}
      </Container>
    </div>
  )
}
