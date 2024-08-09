import { PortfolioV3Position } from '@sushiswap/graph-client/data-api'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Currency,
  classNames,
} from '@sushiswap/ui'
import { BagIcon } from '@sushiswap/ui/icons/BagIcon'
import React, { FC } from 'react'
import { ChainId } from 'sushi/chain'
import { formatUSD } from 'sushi/format'
import { PortfolioInfoRow } from '../PortfolioInfoRow'

interface PortfolioV3PositionsProps {
  positions: PortfolioV3Position[]
}

export const PortfolioV3Positions: FC<PortfolioV3PositionsProps> = ({
  positions,
}) => (
  <AccordionItem value="v3" className="!border-0">
    <AccordionTrigger className="px-5 underline-offset-2">
      {`V3 Positions (${positions.length})`}
    </AccordionTrigger>
    <AccordionContent className="cursor-default">
      {positions.map((position) => (
        <PortfolioInfoRow
          id={`${position.chainId}:${position.id}`}
          chainId={position.chainId as ChainId}
          icon={
            <Currency.IconList iconWidth={24} iconHeight={24}>
              <img
                className="rounded-full"
                src={position.token0.logoUrl}
                alt={position.token0.symbol}
              />
              <img
                className="rounded-full"
                src={position.token1.logoUrl}
                alt={position.token1.symbol}
              />
            </Currency.IconList>
          }
          leftContent={
            <React.Fragment>
              <div className="text-sm font-medium overflow-hidden overflow-ellipsis">
                {position.name}
              </div>
              <div className="flex items-center gap-x-1">
                <div className="text-muted-foreground text-xs">{`V3-${
                  position.swapFee * 100
                }%`}</div>
                <div
                  className={classNames(
                    position.range === 'OUT_OF_RANGE'
                      ? 'bg-yellow/10'
                      : position.range === 'IN_RANGE'
                        ? 'bg-green/10'
                        : 'bg-muted-foreground',
                    'px-2 py-1 flex items-center gap-1 rounded-full',
                  )}
                >
                  <div
                    className={classNames(
                      position.range === 'OUT_OF_RANGE'
                        ? 'bg-yellow'
                        : position.range === 'IN_RANGE'
                          ? 'bg-green'
                          : 'bg-muted-foreground/10',
                      'w-3 h-3 rounded-full',
                    )}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {position.range === 'OUT_OF_RANGE'
                      ? 'Out of Range'
                      : position.range === 'IN_RANGE'
                        ? 'In Range'
                        : 'Unknown'}
                  </span>
                </div>
              </div>
            </React.Fragment>
          }
          rightContent={
            <React.Fragment>
              <div className="text-sm font-medium overflow-hidden overflow-ellipsis">
                {formatUSD(position.amountUSD)}
              </div>
              <div className="text-xs text-muted-foreground flex gap-x-0.5 items-center justify-end overflow-hidden overflow-ellipsis">
                <BagIcon width={10} height={9} />
                {formatUSD(
                  position.fees.reduce((sum, fee) => sum + fee.amountUSD, 0),
                )}
              </div>
            </React.Fragment>
          }
        />
      ))}
    </AccordionContent>
  </AccordionItem>
)
