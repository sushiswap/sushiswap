'use client'

import { Container } from '@sushiswap/ui'
import { Breadcrumb } from '@sushiswap/ui'
import { useParams } from 'next/navigation'
import { PoolHeader } from '../../../components/PoolSection/PoolHeader'
import { usePool } from '../../../utils/usePool'

export default function Layout({
  children,
}: { children: React.ReactNode; params: { id: string } }) {
  const router = useParams()
  const tokenAddress = decodeURIComponent(router?.id)
  const { data: pool } = usePool(tokenAddress)

  return (
    <>
      <Container maxWidth="5xl" className="px-4">
        <Breadcrumb />
      </Container>
      <Container maxWidth="5xl" className="pt-10 px-4">
        {pool ? <PoolHeader row={pool} /> : null}
      </Container>
      <section className="flex flex-col flex-1 mt-4">
        <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-10 pb-20 h-full">
          {children}
        </div>
      </section>
    </>
  )
}
