import {
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  LinkInternal,
} from '@sushiswap/ui'
import React from 'react'

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { chainId: string; address: string }
}) {
  return (
    <div className="flex flex-col gap-2">
      <Container maxWidth="5xl" className="px-2 sm:px-4">
        <LinkInternal
          href={`/${params.chainId}/pool/v3/${params.address}`}
          className="text-blue hover:underline text-sm"
        >
          ← Pool details
        </LinkInternal>
        <CardHeader className="!px-0 !pb-0">
          <CardTitle>Available Strategies</CardTitle>
          <CardDescription>
            Choose one of the following strategies:
          </CardDescription>
        </CardHeader>
      </Container>
      {children}
    </div>
  )
}
