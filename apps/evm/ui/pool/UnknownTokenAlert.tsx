'use client'

import { ChainId } from 'sushi/chain'
import { Pool } from '@sushiswap/client'
import { shortenAddress } from 'sushi'
import { useCustomTokens } from '@sushiswap/hooks'
import { isTokenSecurityChainId } from '@sushiswap/react-query'
import { GoPlusLabsIcon, Message } from '@sushiswap/ui'
import { useTokenWithCache } from '@sushiswap/wagmi/future/hooks'
import { FC, useMemo } from 'react'
import { TaxTokenDialog } from './TaxTokenDialog'

interface UnknownTokenAlert {
  pool: Pool
}

const tokenName = (token: Pool['token0']) =>
  token.name ? `${token.name} (${token.symbol})` : shortenAddress(token.address)

export const UnknownTokenAlert: FC<UnknownTokenAlert> = ({ pool }) => {
  const { token0, token1, protocol } = pool

  const { hasToken } = useCustomTokens()

  const { data: tokenFrom } = useTokenWithCache({
    chainId: pool.chainId as ChainId,
    address: token0.address,
    withStatus: true,
  })

  const { data: tokenTo } = useTokenWithCache({
    chainId: pool.chainId as ChainId,
    address: token1.address,
    withStatus: true,
  })

  const token0NotInList = useMemo(
    () =>
      Boolean(
        tokenFrom?.status !== 'APPROVED' &&
          tokenFrom?.token &&
          !hasToken(tokenFrom?.token),
      ),
    [hasToken, tokenFrom?.status, tokenFrom?.token],
  )

  const token1NotInList = useMemo(
    () =>
      Boolean(
        tokenTo?.status !== 'APPROVED' &&
          tokenTo?.token &&
          !hasToken(tokenTo?.token),
      ),
    [hasToken, tokenTo?.status, tokenTo?.token],
  )

  if (!(token0NotInList || token1NotInList)) return <></>

  return (
    <>
      {protocol === 'SUSHISWAP_V3' &&
      tokenTo?.token &&
      tokenFrom?.token &&
      isTokenSecurityChainId(tokenFrom.token.chainId) ? (
        <TaxTokenDialog token0={tokenFrom.token} token1={tokenTo.token} />
      ) : null}
      <Message size="sm" variant="warning" className="relative">
        {`${
          token0NotInList && token1NotInList
            ? `${tokenName(token0)} & ${tokenName(token1)} are unknown.`
            : `${tokenName(token0NotInList ? token0 : token1)} is unknown.`
        } Please conduct your own research before interacting with ${
          token0NotInList && token1NotInList ? 'these tokens.' : 'this token.'
        }`}
        {protocol === 'SUSHISWAP_V3' && tokenFrom?.token?.chainId && isTokenSecurityChainId(tokenFrom.token.chainId) ? (
          <div className="text-right whitespace-nowrap absolute bottom-2 right-2">
            <span className="text-xs">Token security powered by GoPlus</span>
            <GoPlusLabsIcon width={16} height={20} className="inline-flex" />
          </div>
        ) : null}
      </Message>
    </>
  )
}
