import { Container } from '@sushiswap/ui'
import { headers } from 'next/headers'
import { PoolHeader } from '~aptos/_common/components/PoolSection/PoolHeader'

export default function Layout({
  children,
  params,
}: { children: React.ReactNode; params: { address: string } }) {
  const address = decodeURIComponent(params.address)

  const headersList = headers()
  const referer = headersList.get('referer')

  return (
    <>
      <Container maxWidth="5xl" className="pt-10 px-4">
        <PoolHeader
          backUrl={
            referer?.includes('/pool')
              ? referer?.toString()
              : `/aptos/explore/pools`
          }
          address={address}
        />
      </Container>
      <section className="flex flex-col flex-1 mt-4">
        <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent py-10 h-full">
          {children}
        </div>
      </section>
    </>
  )
}
