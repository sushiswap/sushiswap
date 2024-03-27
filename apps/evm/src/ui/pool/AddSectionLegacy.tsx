'use client'

import { Pool } from '@sushiswap/client'
import { useIsMounted } from '@sushiswap/hooks'
import { Button } from '@sushiswap/ui'
import {
  SushiSwapV2PoolState,
  getSushiSwapRouterContractConfig,
  useSushiSwapV2Pool,
} from '@sushiswap/wagmi'
import { Checker } from '@sushiswap/wagmi/systems'
import { CheckerProvider } from '@sushiswap/wagmi/systems/Checker/Provider'
import { FC, useCallback, useMemo, useState } from 'react'
import { APPROVE_TAG_ADD_LEGACY } from 'src/lib/constants'
import { type ChainId } from 'sushi/chain'
import { SushiSwapV2ChainId } from 'sushi/config'
import { tryParseAmount } from 'sushi/currency'
import { useTokensFromPool } from '../../lib/hooks'

import { AddSectionReviewModalLegacy } from './AddSectionReviewModalLegacy'
import { AddSectionWidget } from './AddSectionWidget'

export const AddSectionLegacy: FC<{ pool: Pool }> = ({ pool: _pool }) => {
  const chainId = _pool.chainId as SushiSwapV2ChainId
  const isMounted = useIsMounted()
  const { token0, token1 } = useTokensFromPool(_pool)
  const [{ input0, input1 }, setTypedAmounts] = useState<{
    input0: string
    input1: string
  }>({ input0: '', input1: '' })
  const {
    data: [poolState, pool],
  } = useSushiSwapV2Pool(_pool.chainId as SushiSwapV2ChainId, token0, token1)

  const [parsedInput0, parsedInput1] = useMemo(() => {
    return [tryParseAmount(input0, token0), tryParseAmount(input1, token1)]
  }, [input0, input1, token0, token1])

  const onChangeToken0TypedAmount = useCallback(
    (value: string) => {
      if (poolState === SushiSwapV2PoolState.NOT_EXISTS) {
        setTypedAmounts((prev) => ({
          ...prev,
          input0: value,
        }))
      } else if (token0 && pool) {
        const parsedAmount = tryParseAmount(value, token0)
        setTypedAmounts({
          input0: value,
          input1: parsedAmount
            ? pool.priceOf(token0.wrapped).quote(parsedAmount.wrapped).toExact()
            : '',
        })
      }
    },
    [pool, poolState, token0],
  )

  const onChangeToken1TypedAmount = useCallback(
    (value: string) => {
      if (poolState === SushiSwapV2PoolState.NOT_EXISTS) {
        setTypedAmounts((prev) => ({
          ...prev,
          input1: value,
        }))
      } else if (token1 && pool) {
        const parsedAmount = tryParseAmount(value, token1)
        setTypedAmounts({
          input0: parsedAmount
            ? pool.priceOf(token1.wrapped).quote(parsedAmount.wrapped).toExact()
            : '',
          input1: value,
        })
      }
    },
    [pool, poolState, token1],
  )

  const amounts = useMemo(
    () => [parsedInput0, parsedInput1],
    [parsedInput1, parsedInput0],
  )

  return (
    <CheckerProvider>
      <AddSectionWidget
        isFarm={!!_pool.incentives && _pool.incentives.length > 0}
        chainId={_pool.chainId as ChainId}
        input0={input0}
        input1={input1}
        token0={token0}
        token1={token1}
        onInput0={onChangeToken0TypedAmount}
        onInput1={onChangeToken1TypedAmount}
      >
        <Checker.Connect size="default" variant="outline" fullWidth>
          <Checker.Guard
            size="default"
            variant="outline"
            guardWhen={
              isMounted &&
              [
                SushiSwapV2PoolState.NOT_EXISTS,
                SushiSwapV2PoolState.INVALID,
              ].includes(poolState)
            }
            guardText="Pool not found"
          >
            <Checker.Network
              size="default"
              variant="outline"
              fullWidth
              chainId={_pool.chainId as ChainId}
            >
              <Checker.Amounts
                size="default"
                variant="outline"
                fullWidth
                chainId={_pool.chainId as ChainId}
                amounts={amounts}
              >
                <Checker.ApproveERC20
                  size="default"
                  variant="outline"
                  id="approve-token-0"
                  className="whitespace-nowrap"
                  fullWidth
                  amount={parsedInput0}
                  contract={getSushiSwapRouterContractConfig(chainId).address}
                >
                  <Checker.ApproveERC20
                    size="default"
                    variant="outline"
                    id="approve-token-1"
                    className="whitespace-nowrap"
                    fullWidth
                    amount={parsedInput1}
                    contract={getSushiSwapRouterContractConfig(chainId).address}
                  >
                    <Checker.Success tag={APPROVE_TAG_ADD_LEGACY}>
                      <AddSectionReviewModalLegacy
                        poolAddress={pool?.liquidityToken.address}
                        poolState={poolState}
                        chainId={_pool.chainId as SushiSwapV2ChainId}
                        token0={token0}
                        token1={token1}
                        input0={parsedInput0}
                        input1={parsedInput1}
                        onSuccess={() => {
                          setTypedAmounts({ input0: '', input1: '' })
                        }}
                      >
                        <Button size="default" fullWidth>
                          Add Liquidity
                        </Button>
                      </AddSectionReviewModalLegacy>
                    </Checker.Success>
                  </Checker.ApproveERC20>
                </Checker.ApproveERC20>
              </Checker.Amounts>
            </Checker.Network>
          </Checker.Guard>
        </Checker.Connect>
      </AddSectionWidget>
    </CheckerProvider>
  )
}
