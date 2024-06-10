import { Container, LinkInternal, typographyVariants } from '@sushiswap/ui'
import { HotJar } from '@sushiswap/ui/components/scripts'

import { Header } from './header'
import { Providers } from './providers'

import { GlobalStatsCharts } from 'src/ui/analytics/global-stats-charts'

import { PathnameButton } from 'src/ui/pool'

export const metadata = {
  title: 'Analytics',
}

export default function AnalyticsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <>
      <Providers>
        <Header />
        <Container maxWidth="full" className="lg:mx-auto h-full">
          <div className="pb-4 mt-10 mb-4 lg:mb-40 xl:mt-20">
            <Container maxWidth="7xl" className="px-4 py-10">
              <div className="flex flex-col">
                <h1 className={typographyVariants({ variant: 'h1' })}>
                  Analytics.
                </h1>
                <p
                  className={typographyVariants({
                    variant: 'lead',
                    className: 'max-w-[500px]',
                  })}
                >
                  Providing liquidity to a pool allows you to earn a percentage
                  of the pools traded volume as well as any extra rewards if the
                  pool is incentivized.
                </p>
              </div>
              <div className="mt-10">
                <GlobalStatsCharts />
              </div>
            </Container>
            <Container maxWidth="7xl" className="px-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <LinkInternal shallow={true} scroll={false} href={'/analytics'}>
                  <PathnameButton
                    id="all-pools"
                    pathname={'/analytics'}
                    asChild
                    size="sm"
                  >
                    Pools
                  </PathnameButton>
                </LinkInternal>
                {/* <LinkInternal
                  shallow={true}
                  scroll={false}
                  href={'/analytics/pay'}
                >
                  <PathnameButton
                    id="my-positions"
                    pathname={'/analytics/pay'}
                    asChild
                    size="sm"
                  >
                    Sushi Pay
                  </PathnameButton>
                </LinkInternal> */}
                {/* <LinkInternal
                  shallow={true}
                  scroll={false}
                  href={'/analytics/vault'}
                >
                  <PathnameButton
                    id="my-rewards"
                    pathname={'/analytics/vault'}
                    asChild
                    size="sm"
                  >
                    Sushi Vault
                  </PathnameButton>
                </LinkInternal> */}
              </div>
            </Container>
            <section className="flex flex-col flex-1">
              <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-4 pb-20 h-full">
                {children}
              </div>
            </section>
          </div>
        </Container>
      </Providers>
      <HotJar />
    </>
  )
}
