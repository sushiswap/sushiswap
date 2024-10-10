import { GiftIcon } from '@heroicons/react-v1/outline'
import { Button, LinkInternal } from '@sushiswap/ui'
import { FC } from 'react'

export const Hero: FC = () => {
  return (
    <section className="flex flex-col gap-6">
      <span className="text-5xl font-bold">Manage Liquidity Positions</span>
      <div className="flex justify-between flex-wrap gap-6">
        <span className="text-xl w-[720px] text-muted-foreground">
          You can adjust and claim rewards for your liquidity positions on the
          connected network.
          <span className="invisible">
            For V2 pools, you can migrate to increase capital efficiency.
          </span>
        </span>
        <div className="flex flex-col w-full sm:w-[unset] gap-4">
          <Button asChild size="sm">
            <LinkInternal href="/tron/pool/add">
              I want to create a position
            </LinkInternal>
          </Button>
          <Button
            className="invisible"
            fullWidth
            asChild
            icon={GiftIcon}
            variant="secondary"
            size="sm"
          >
            <LinkInternal className="text-sm" href={`/tron/pool/incentivize`}>
              I want to incentivize a pool
            </LinkInternal>
          </Button>
        </div>
      </div>
    </section>
  )
}
