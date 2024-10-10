import {
  Button,
  LinkExternal,
  LinkInternal,
  typographyVariants,
} from '@sushiswap/ui'
import { DiscordIcon } from '@sushiswap/ui/icons/DiscordIcon'
import { FC } from 'react'

export const Hero: FC = () => {
  return (
    <section className="flex flex-col justify-between gap-12 lg:flex-row">
      <div className="flex flex-col items-center flex-grow gap-6 lg:items-start">
        <div className="flex flex-col">
          <h1 className={typographyVariants({ variant: 'h1' })}>
            Put your funds to work <br />
            by providing liquidity.
          </h1>
          <p
            className={typographyVariants({
              variant: 'lead',
              className: 'max-w-[500px]',
            })}
          >
            When you add liquidity to a pool, you can receive a share of its
            trading volume and potentially snag extra rewards when there are
            incentives involved!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-[unset] gap-4">
          <div className="flex items-center w-full">
            <Button asChild size="lg">
              <LinkInternal href="/aptos/pool/add">
                I want to create a position
              </LinkInternal>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 lg:items-end">
        <div className="flex flex-col items-center gap-1 lg:items-end">
          <span className="font-semibold lg:text-sm">
            Looking for a partnership with Sushi?
          </span>
          <Button
            className="flex-1 w-full sm:flex-0 sm:w-[unset]"
            variant="link"
            size="sm"
            asChild
          >
            <LinkInternal href="/partner">Apply here</LinkInternal>
          </Button>
        </div>
        <div className="flex flex-col items-center gap-1 lg:items-end">
          <span className="font-semibold lg:text-sm">Need Help?</span>
          <Button icon={DiscordIcon} variant="link" size="sm" asChild>
            <LinkExternal href="https://discord.gg/NVPXN4e">
              Join our discord
            </LinkExternal>
          </Button>
        </div>
      </div>
    </section>
  )
}
