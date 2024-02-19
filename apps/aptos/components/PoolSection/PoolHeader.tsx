import { LinkExternal, classNames, typographyVariants } from '@sushiswap/ui'
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@sushiswap/ui'
import { Icon } from 'components/Icon'
import { IconList } from 'components/IconList'
import { providerNetwork } from 'lib/constants'
import { FC } from 'react'
import { formatPercent } from 'sushi'
import { Pool } from 'utils/usePools'
import { useTokensFromPools } from 'utils/useTokensFromPool'

interface PoolHeader {
  row: Pool
}

const CONTRACT_ADDRESS =
  process.env['NEXT_PUBLIC_SWAP_CONTRACT'] ||
  process.env['NEXT_PUBLIC_SWAP_CONTRACT']

export const PoolHeader: FC<PoolHeader> = ({ row }) => {
  const { token0, token1 } = useTokensFromPools(row)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center gap-3 max-w-[100vh]">
          <IconList iconWidth={36} iconHeight={36}>
            <Icon currency={token0} />
            <Icon currency={token1} />
          </IconList>
          <Button
            asChild
            variant="link"
            className={typographyVariants({
              variant: 'h1',
              className:
                'sm:!text2-xl sm:!text-4xl !font-bold text-gray-900 dark:text-slate-50 truncate overflow-x-auto',
            })}
          >
            <LinkExternal
              className="flex flex-col !no-underline group"
              href={`https://explorer.aptoslabs.com/account/${CONTRACT_ADDRESS}/coins?network=${providerNetwork}`}
            >
              {token0.symbol}/{token1.symbol}
            </LinkExternal>
          </Button>
          <div
            className={classNames(
              'bg-pink/20 text-pink',
              'text-sm px-2 py-1 font-semibold rounded-full mt-0.5',
            )}
          >
            V2
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-y-5 gap-x-[32px] text-secondary-foreground mb-8 mt-1.5">
        <div className="flex items-center gap-1.5">
          <span className="tracking-tighter font-semibold">APR</span>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted underline-offset-2">
                  {formatPercent(0)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                The APR displayed is algorithmic and subject to change.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="tracking-tighter font-semibold">Network</span>
          Aptos
        </div>
      </div>
    </div>
  )
}
