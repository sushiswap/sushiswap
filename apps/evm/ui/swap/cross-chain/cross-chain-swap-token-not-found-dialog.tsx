'use client'

import { useCustomTokens } from '@sushiswap/hooks'
import {
  isTokenSecurityChainId,
  useTokenSecurity,
} from '@sushiswap/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Message,
  NetworkIcon,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { List } from '@sushiswap/ui/components/list/List'
import { useTokenWithCache } from '@sushiswap/wagmi/future/hooks'
import React, { useCallback, useMemo } from 'react'
import { shortenAddress } from 'sushi'
import { Chain } from 'sushi/chain'
import { Native, Token, defaultQuoteCurrency } from 'sushi/currency'

import { Icon } from '@sushiswap/ui/components/currency/Icon'
import { TokenSecurityView } from '@sushiswap/wagmi/future'
import { useDerivedStateCrossChainSwap } from './derivedstate-cross-chain-swap-provider'

export const CrossChainSwapTokenNotFoundDialog = () => {
  const {
    state: { chainId0, chainId1, token0, token1 },
    mutate: { setToken0, setToken1, setTokens },
  } = useDerivedStateCrossChainSwap()

  const { mutate: customTokensMutate, hasToken } = useCustomTokens()
  const { data: tokenFrom, isInitialLoading: tokenFromLoading } =
    useTokenWithCache({
      chainId: chainId0,
      address: token0?.wrapped.address,
      withStatus: true,
    })

  const { data: tokenTo, isInitialLoading: tokenToLoading } = useTokenWithCache(
    {
      chainId: chainId1,
      address: token1?.wrapped.address,
      withStatus: true,
    },
  )

  const token0NotInList = Boolean(
    tokenFrom?.status !== 'APPROVED' &&
      tokenFrom?.token &&
      !hasToken(tokenFrom?.token),
  )
  const token1NotInList = Boolean(
    tokenTo?.status !== 'APPROVED' &&
      tokenTo?.token &&
      !hasToken(tokenTo?.token),
  )

  const onImport = useCallback(
    ([token0, token1]: (Token | undefined)[]) => {
      const _tokens: Token[] = []
      if (tokenFrom?.status !== 'APPROVED' && token0) _tokens.push(token0)
      if (tokenTo?.status !== 'APPROVED' && token1) _tokens.push(token1)

      customTokensMutate('add', _tokens)

      if (token0) setToken0(token0)
      if (token1) setToken1(token1)
    },
    [
      customTokensMutate,
      setToken0,
      setToken1,
      tokenFrom?.status,
      tokenTo?.status,
    ],
  )

  const reset = useCallback(() => {
    setTokens(
      Native.onChain(chainId0),
      defaultQuoteCurrency[chainId1 as keyof typeof defaultQuoteCurrency],
    )
  }, [chainId0, chainId1, setTokens])

  const {
    data: tokenSecurityResponse,
    isInitialLoading: tokenSecurityLoading,
  } = useTokenSecurity({
    currencies: useMemo(
      () => [
        ...(token0NotInList && tokenFrom?.token ? [tokenFrom.token] : []),
        ...(token1NotInList && tokenTo?.token ? [tokenTo.token] : []),
      ],
      [token0NotInList, token1NotInList, tokenFrom?.token, tokenTo?.token],
    ),
    enabled: Boolean(
      !tokenFromLoading &&
        !tokenToLoading &&
        (token0NotInList || token1NotInList),
    ),
  })

  const honeypot = Boolean(
    (tokenFrom?.token &&
      tokenSecurityResponse?.[tokenFrom?.token?.address]?.is_honeypot) ||
      (tokenTo?.token &&
        tokenSecurityResponse?.[tokenTo?.token?.address]?.is_honeypot),
  )

  if (
    (isTokenSecurityChainId(chainId0) || isTokenSecurityChainId(chainId1)) &&
    tokenSecurityLoading
  )
    return null

  return (
    <Dialog
      open={Boolean(
        !tokenFromLoading &&
          !tokenToLoading &&
          (token0NotInList || token1NotInList),
      )}
      onOpenChange={(open) => !open && reset()}
    >
      <DialogContent className="!max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex gap-4 pb-2">
              {token0 && token0NotInList ? (
                <div className="relative pr-3">
                  <Icon currency={token0} width={44} height={44} />
                  <NetworkIcon
                    chainId={chainId0}
                    className="absolute bottom-0 right-0"
                    width={24}
                    height={24}
                  />
                </div>
              ) : null}
              {token1 && token1NotInList ? (
                <div className="relative pr-3">
                  <Icon currency={token1} width={44} height={44} />
                  <NetworkIcon
                    chainId={chainId1}
                    className="absolute bottom-0 right-0"
                    width={24}
                    height={24}
                  />
                </div>
              ) : null}
            </div>
            <span>
              Unknown token
              {(token0NotInList || !tokenFrom?.token) &&
              (token1NotInList || !tokenTo?.token)
                ? 's'
                : ''}
            </span>
          </DialogTitle>
          <DialogDescription className="!mr-0 !text-xs">
            Anyone can create a token, including creating fake versions of
            existing tokens that claim to represent projects. If you purchase
            this token, you may not be able to sell it back.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {token0 && token0NotInList && !tokenFrom?.token && (
            <List>
              {token1NotInList || !tokenTo?.token ? (
                <List.Label>Token 1</List.Label>
              ) : null}
              <List.Control>
                <p className="p-3 text-sm text-gray-900 dark:text-slate-50">
                  Could not retrieve token info for{' '}
                  <a
                    target="_blank"
                    href={Chain.from(chainId0)?.getTokenUrl(
                      token0.wrapped.address,
                    )}
                    className="text-blue font-medium"
                    rel="noreferrer"
                  >
                    {shortenAddress(token0.wrapped.address)}
                  </a>{' '}
                  are you sure this token is on {Chain.from(chainId0)?.name}?
                </p>
              </List.Control>
            </List>
          )}
          {token0NotInList && tokenFrom?.token && (
            <List>
              {token1NotInList || !tokenTo?.token ? (
                <List.Label>Token 1</List.Label>
              ) : null}
              <List.Control>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Name
                    </span>
                  }
                >
                  {tokenFrom.token.name}
                </List.KeyValue>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Symbol
                    </span>
                  }
                >
                  {tokenFrom.token.symbol}
                </List.KeyValue>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Address
                    </span>
                  }
                >
                  <a
                    target="_blank"
                    href={Chain.from(chainId0)?.getTokenUrl(
                      tokenFrom.token.address,
                    )}
                    className="text-blue"
                    rel="noreferrer"
                  >
                    {shortenAddress(tokenFrom.token.address)}
                  </a>
                </List.KeyValue>
              </List.Control>
            </List>
          )}
          {token0NotInList &&
          tokenFrom?.token &&
          isTokenSecurityChainId(tokenFrom.token.chainId) ? (
            <TokenSecurityView
              tokenSecurityResponse={tokenSecurityResponse}
              token={tokenFrom.token}
            />
          ) : null}
          {token1 && token1NotInList && !tokenTo?.token && (
            <List>
              {token0NotInList || !tokenFrom?.token ? (
                <List.Label>Token 2</List.Label>
              ) : null}
              <List.Control>
                <p className="p-3 text-sm text-gray-900 dark:text-slate-50">
                  Could not retrieve token info for{' '}
                  <a
                    target="_blank"
                    href={Chain.from(chainId1)?.getTokenUrl(
                      token1.wrapped.address,
                    )}
                    className="text-blue font-medium"
                    rel="noreferrer"
                  >
                    {shortenAddress(token1.wrapped.address)}
                  </a>{' '}
                  are you sure this token is on {Chain.from(chainId1)?.name}?
                </p>
              </List.Control>
            </List>
          )}
          {token1NotInList && tokenTo?.token && (
            <List>
              {token0NotInList || !tokenFrom?.token ? (
                <List.Label>Token 2</List.Label>
              ) : null}
              <List.Control>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Name
                    </span>
                  }
                >
                  {tokenTo.token.name}
                </List.KeyValue>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Symbol
                    </span>
                  }
                >
                  {tokenTo.token.symbol}
                </List.KeyValue>
                <List.KeyValue
                  title={
                    <span className="text-gray-900 dark:text-slate-50">
                      Address
                    </span>
                  }
                >
                  <a
                    target="_blank"
                    href={Chain.from(chainId1)?.getTokenUrl(
                      tokenTo.token.address,
                    )}
                    className="text-blue"
                    rel="noreferrer"
                  >
                    {shortenAddress(tokenTo.token.address)}
                  </a>
                </List.KeyValue>
              </List.Control>
            </List>
          )}
          {token1NotInList &&
          tokenTo?.token &&
          isTokenSecurityChainId(tokenTo.token.chainId) ? (
            <TokenSecurityView
              tokenSecurityResponse={tokenSecurityResponse}
              token={tokenTo.token}
            />
          ) : null}
        </div>
        <DialogFooter>
          {!honeypot &&
          ((token0NotInList && tokenFrom?.token) ||
            (token1NotInList && tokenTo?.token)) ? (
            <Button
              fullWidth
              size="xl"
              onClick={() => onImport([tokenFrom?.token, tokenTo?.token])}
            >
              I understand
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <Button fullWidth size="xl" onClick={reset}>
                Close
              </Button>
              <Message variant="destructive" size="sm">
                Sushi does not support honetpot tokens. This token contract
                cannot be imported!
              </Message>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
