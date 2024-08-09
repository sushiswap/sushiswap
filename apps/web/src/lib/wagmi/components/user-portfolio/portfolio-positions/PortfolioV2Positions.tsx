import { PortfolioV2Position } from '@sushiswap/graph-client/data-api'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Currency,
} from '@sushiswap/ui'
import React, { FC } from 'react'
import { ChainId } from 'sushi/chain'
import { formatUSD } from 'sushi/format'
import { PortfolioInfoRow } from '../PortfolioInfoRow'

interface PortfolioV2PositionssProps {
  positions: PortfolioV2Position[]
}

export const PortfolioV2Positions: FC<PortfolioV2PositionssProps> = ({
  positions,
}) => (
  <AccordionItem value="v2" className="!border-0">
    <AccordionTrigger className="px-5 underline-offset-2">
      {`V2 Positions (${positions.length})`}
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
              <div className="text-xs text-muted-foreground">V2-0.30%</div>
            </React.Fragment>
          }
          rightContent={
            <span className="text-sm font-medium overflow-hidden overflow-ellipsis">
              {formatUSD(position.amountUSD)}
            </span>
          }
        />
      ))}
    </AccordionContent>
  </AccordionItem>
)
