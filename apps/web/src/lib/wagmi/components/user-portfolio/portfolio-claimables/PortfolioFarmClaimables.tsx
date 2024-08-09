import { PortfolioFarmClaim } from '@sushiswap/graph-client/data-api'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  FormattedNumber,
} from '@sushiswap/ui'
import { FC } from 'react'
import React from 'react'
import { ChainId } from 'sushi/chain'
import { formatUSD } from 'sushi/format'
import { PortfolioInfoRow } from '../PortfolioInfoRow'

interface PortfolioFarmClaimablesProps {
  claimables: PortfolioFarmClaim[]
}

export const PortfolioFarmClaimables: FC<PortfolioFarmClaimablesProps> = ({
  claimables,
}) => (
  <AccordionItem value="alm" className="!border-0">
    <AccordionTrigger className="px-5 underline-offset-2">
      {`Farms (${claimables.length})`}
    </AccordionTrigger>
    <AccordionContent className="cursor-default">
      {claimables.map(({ position, token }) => (
        <PortfolioInfoRow
          id={`${position.chainId}:${position.id}`}
          chainId={token.chainId as ChainId}
          icon={
            <img
              className="rounded-full"
              src={token.logoUrl}
              width={28}
              height={28}
              alt={token.symbol ?? token.name}
            />
          }
          leftContent={
            <React.Fragment>
              <div className="text-sm font-medium overflow-hidden overflow-ellipsis">
                {token.name}
              </div>
              <div className="text-muted-foreground text-xs overflow-hidden overflow-ellipsis">
                {`${
                  position.protocol === 'SUSHISWAP_V2'
                    ? 'V2'
                    : position.protocol === 'SUSHISWAP_V3'
                      ? 'V3'
                      : position.protocol
                }-${position.swapFee * 100}%-${position.name.replace(
                  ' / ',
                  '-',
                )}`}
              </div>
            </React.Fragment>
          }
          rightContent={
            <React.Fragment>
              <div className="text-sm font-medium overflow-hidden overflow-ellipsis">
                {formatUSD(token.amountUSD)}
              </div>
              <div className="text-xs text-muted-foreground overflow-hidden overflow-ellipsis">
                <FormattedNumber number={token.amount.toString()} />{' '}
                {token.symbol}
              </div>
            </React.Fragment>
          }
        />
      ))}
    </AccordionContent>
  </AccordionItem>
)
