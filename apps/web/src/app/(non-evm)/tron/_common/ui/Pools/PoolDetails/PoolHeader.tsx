'use client'

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import {
  Button,
  Currency,
  LinkExternal,
  LinkInternal,
  SkeletonCircle,
  SkeletonText,
  typographyVariants,
} from '@sushiswap/ui'
import { useTokenInfo } from '~tron/_common/lib/hooks/useTokenInfo'
import { Icon } from '~tron/_common/ui/General/Icon'

export const PoolHeader = ({
  token0: _token0,
  token1: _token1,
  pairAddress,
  backUrl,
}: {
  token0: string
  token1: string
  pairAddress: string
  backUrl: string
}) => {
  const { data: token0, isLoading: isLoadingToken0 } = useTokenInfo({
    tokenAddress: _token0,
  })

  const { data: token1, isLoading: isLoadingToken1 } = useTokenInfo({
    tokenAddress: _token1,
  })

  const isLoading = isLoadingToken0 || isLoadingToken1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <LinkInternal
          href={backUrl}
          className="text-blue hover:underline text-sm"
        >
          ← Back
        </LinkInternal>
        {isLoading ? (
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center">
              <SkeletonCircle radius={40} />
              <SkeletonCircle radius={40} className="-ml-[13.33px]" />
            </div>
            <div className="w-[200px]">
              <SkeletonText fontSize="3xl" />
            </div>
          </div>
        ) : (
          <div className="relative flex items-center gap-3 max-w-[100vh]">
            <Currency.IconList iconWidth={36} iconHeight={36}>
              <Icon currency={token0} />
              <Icon currency={token1} />
            </Currency.IconList>
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
                href={`https://tronscan.org/#/contract/${pairAddress}`}
              >
                {token0?.symbol}/{token1?.symbol}
              </LinkExternal>
            </Button>
            <div className="bg-pink/20 text-pink text-sm px-2 py-1 font-semibold rounded-full mt-0.5">
              V2
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-y-5 gap-x-[32px] text-secondary-foreground mb-8 mt-1.5">
        <div className="flex items-center gap-1.5">
          <span className="tracking-tighter font-semibold">Fee</span>
          0.3%
        </div>
        <div className="flex items-center gap-1.5">
          <span className="tracking-tighter font-semibold">Network</span>
          Tron
        </div>
        {isLoading ? (
          <>
            <div className="w-48">
              <SkeletonText />
            </div>
            <div className="w-48">
              <SkeletonText />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="tracking-tighter font-semibold">
                {token0?.symbol}
              </span>
              <LinkExternal
                target="_blank"
                href={`https://tronscan.org/#/token20/${token0?.address}`}
              >
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="!font-medium !text-secondary-foreground"
                >
                  {`${token0?.address.slice(0, 6)}...${token0?.address.slice(
                    -4,
                  )}`}
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </Button>
              </LinkExternal>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="tracking-tighter font-semibold">
                {token1?.symbol}
              </span>
              <LinkExternal
                target="_blank"
                href={`https://tronscan.org/#/token20/${token1?.address}`}
              >
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="!font-medium !text-secondary-foreground"
                >
                  {`${token1?.address.slice(0, 6)}...${token1?.address.slice(
                    -4,
                  )}`}
                  <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                </Button>
              </LinkExternal>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
