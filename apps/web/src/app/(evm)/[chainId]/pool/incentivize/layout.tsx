import { Container, typographyVariants } from '@sushiswap/ui'
import { BackButton } from 'src/ui/pool/BackButton'

export const metadata = {
  title: 'Pool 💦',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth="5xl" className="py-10 px-4">
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center gap-3">
          <BackButton
            variant="ghost"
            name="back"
            className="xl:absolute xl:ml-[-56px]"
          />
          <h1 className={typographyVariants({ variant: 'h3' })}>
            Incentivize Liquidity
          </h1>
        </div>
        <p className={typographyVariants({ variant: 'muted' })}>
          Add rewards to a pool to incentivize liquidity providers joining in.
        </p>
      </div>
      <section>{children}</section>
    </Container>
  )
}
