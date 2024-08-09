'use client'

import { V2Pool } from '@sushiswap/graph-client/data-api'
import { useCustomTokens } from '@sushiswap/hooks'
import { Message } from '@sushiswap/ui'
import { FC, useMemo } from 'react'
import { useTokenWithCache } from 'src/lib/wagmi/hooks/tokens/useTokenWithCache'
import { ChainId } from 'sushi/chain'
import { shortenAddress } from 'sushi/format'

interface UnknownTokenAlert {
  pool: V2Pool
}

const tokenName = (token: V2Pool['token0']) =>
  token.name ? `${token.name} (${token.symbol})` : shortenAddress(token.address)

export const UnknownTokenAlert: FC<UnknownTokenAlert> = ({ pool }) => {
  const { token0, token1 } = pool

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
    <Message size="sm" variant="warning">
      {`${
        token0NotInList && token1NotInList
          ? `${tokenName(token0)} & ${tokenName(token1)} are unknown.`
          : `${tokenName(token0NotInList ? token0 : token1)} is unknown.`
      } Please conduct your own research before interacting with ${
        token0NotInList && token1NotInList ? 'these tokens.' : 'this token.'
      }`}
    </Message>
  )
}
