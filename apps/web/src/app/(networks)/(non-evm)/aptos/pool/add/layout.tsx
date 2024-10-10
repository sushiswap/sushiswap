import { Container, typographyVariants } from '@sushiswap/ui'

import { BackButton } from '~aptos/pool/ui/back-button'

export const metadata = {
  title: 'Pool 💦',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Container maxWidth="5xl" className="py-10 px-4">
        <div className="flex flex-col gap-2">
          <div className="relative flex items-center gap-3">
            <BackButton
              variant="ghost"
              name="back"
              className="xl:absolute xl:ml-[-56px]"
            />
            <h1 className={typographyVariants({ variant: 'h3' })}>
              Add Liquidity
            </h1>
          </div>
          <p className={typographyVariants({ variant: 'muted' })}>
            Create a new pool or create a liquidity position on an existing
            pool.
          </p>
        </div>
      </Container>
      <section className="flex flex-col flex-1">
        <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-accent pt-4 pb-10 h-full">
          <Container maxWidth="5xl" className="px-4">
            {children}
          </Container>
        </div>
      </section>
    </>
  )
}
