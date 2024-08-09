import { PortfolioWalletToken } from '@sushiswap/graph-client/data-api'
import { FormattedNumber, classNames } from '@sushiswap/ui'
import React, { FC } from 'react'
import { ChainId } from 'sushi/chain'
import { formatPercent, formatUSD } from 'sushi/format'
import { PortfolioInfoRow } from '../PortfolioInfoRow'

interface PortfolioTokensListProps {
  tokens: PortfolioWalletToken[]
}

export const PortfolioTokensList: FC<PortfolioTokensListProps> = ({
  tokens,
}) => (
  <div className="overflow-y-auto h-full cursor-default">
    {tokens.map((token) => {
      return (
        <PortfolioInfoRow
          id={`${token.chainId}:${token.id}`}
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
                {token.name ?? token.symbol}
              </div>
              <div className="text-xs text-muted-foreground overflow-hidden overflow-ellipsis">
                <FormattedNumber number={token.amount.toString()} />{' '}
                {token.symbol}
              </div>
            </React.Fragment>
          }
          rightContent={
            <React.Fragment>
              <div className="text-sm font-medium overflow-hidden overflow-ellipsis">
                {formatUSD(token.amountUSD)}
              </div>
              <div
                className={classNames(
                  'text-xs',
                  token.price24hChange > 0
                    ? 'text-green'
                    : token.price24hChange < 0
                      ? 'text-red'
                      : 'text-muted-foreground',
                )}
              >
                {`${token.price24hChange > 0 ? '+' : ''}${formatPercent(
                  token.price24hChange,
                )}`}
              </div>
            </React.Fragment>
          }
        />
      )
    })}
  </div>
)
