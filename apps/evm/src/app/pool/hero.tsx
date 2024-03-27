'use client'

import { GiftIcon } from '@heroicons/react-v1/outline'
import { LinkExternal, LinkInternal, typographyVariants } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { Chip } from '@sushiswap/ui/components/chip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sushiswap/ui/components/dropdown-menu'
import { DiscordIcon } from '@sushiswap/ui/components/icons'
import { SelectIcon } from '@sushiswap/ui/components/select'
import { useAccount } from '@sushiswap/wagmi'
import { FC } from 'react'
import { ChainId } from 'sushi/chain'
import {
  SushiSwapV3ChainId,
  isSushiSwapV2ChainId,
  isSushiSwapV3ChainId,
} from 'sushi/config'

export const Hero: FC = () => {
  const { chain } = useAccount()
  const chainId = chain?.id || ChainId.ETHEREUM
  return (
    <section className="flex flex-col justify-between gap-12 lg:flex-row lg:items-start mb-12">
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
            <Button
              asChild
              size="lg"
              className="flex-1 w-full sm:flex-0 sm:w-[unset] rounded-r-none"
            >
              <LinkInternal
                href={
                  isSushiSwapV3ChainId(chainId as SushiSwapV3ChainId)
                    ? `/pool/add?chainId=${chainId}`
                    : isSushiSwapV2ChainId(chainId as SushiSwapV3ChainId)
                      ? `/pool/add/v2/${chainId}`
                      : ''
                }
              >
                I want to create a position
              </LinkInternal>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button asChild size="lg" className="rounded-l-none">
                  <SelectIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    disabled={
                      !isSushiSwapV3ChainId(chainId as SushiSwapV3ChainId)
                    }
                    asChild
                  >
                    <LinkInternal
                      href={`/pool/add?chainId=${chainId}`}
                      className="flex flex-col !items-start gap-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1 font-medium leading-none">
                        V3 Position
                        <Chip variant="secondary">
                          {isSushiSwapV3ChainId(chainId as SushiSwapV3ChainId)
                            ? 'New 🔥'
                            : 'Unavailable'}
                        </Chip>
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground">
                        Provide liquidity to a V3 liquidity pool.
                      </p>
                    </LinkInternal>
                  </DropdownMenuItem>
                  {isSushiSwapV2ChainId(chainId as ChainId) ? (
                    <DropdownMenuItem asChild>
                      <LinkInternal
                        href={`/pools/add/v2/${chainId}`}
                        className="flex flex-col !items-start gap-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-1 font-medium leading-none">
                          V2 Position
                        </div>
                        <p className="text-sm leading-snug text-muted-foreground">
                          Provide liquidity to a V2 liquidity pool.
                        </p>
                      </LinkInternal>
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            fullWidth
            asChild
            icon={GiftIcon}
            variant="secondary"
            size="lg"
          >
            <LinkInternal href="/pools/incentivize">
              I want to incentivize a pool
            </LinkInternal>
          </Button>
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
            <LinkExternal href="https://sushi.com/discord">
              Join our discord
            </LinkExternal>
          </Button>
        </div>
      </div>
    </section>
  )
}
