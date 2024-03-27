'use client'

import { Pool, Protocol } from '@sushiswap/client'
import { useIsMounted } from '@sushiswap/hooks'
import { Button } from '@sushiswap/ui/components/button'
import { Dots } from '@sushiswap/ui/components/dots'
import { createToast } from '@sushiswap/ui/components/toast'
import {
  TridentConstantPoolState,
  TridentStablePoolState,
  UseCallParameters,
  getTridentRouterContractConfig,
  useAccount,
  useBentoBoxTotals,
  useCall,
  usePublicClient,
  useSendTransaction,
  useTotalSupply,
  useTridentConstantPool,
  useTridentRouterContract,
  useTridentStablePool,
} from '@sushiswap/wagmi'
import { Checker } from '@sushiswap/wagmi/systems'
import {
  useApproved,
  useApprovedActions,
  useSignature,
  withCheckerRoot,
} from '@sushiswap/wagmi/systems/Checker/Provider'
import { FC, useCallback, useMemo, useState } from 'react'
import { APPROVE_TAG_REMOVE_TRIDENT } from 'src/lib/constants'
import {
  useTokensFromPool,
  useUnderlyingTokenBalanceFromPool,
} from 'src/lib/hooks'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import {
  LiquidityOutput,
  approveMasterContractAction,
  batchAction,
  burnLiquidityAction,
  sweepAction,
  unwrapWETHAction,
} from 'src/lib/pool/trident/actions'
import { slippageAmount } from 'sushi/calculate'
import { ChainId } from 'sushi/chain'
import { BentoBoxChainId, TridentChainId } from 'sushi/config'
import { Amount, Native } from 'sushi/currency'
import { Percent } from 'sushi/math'

import { SendTransactionReturnType } from 'viem'
import { usePoolPosition } from './PoolPositionProvider'
import { RemoveSectionWidget } from './RemoveSectionWidget'

interface RemoveSectionTridentProps {
  pool: Pool
}

export const RemoveSectionTrident: FC<RemoveSectionTridentProps> =
  withCheckerRoot(({ pool: _pool }) => {
    const chainId = _pool.chainId as BentoBoxChainId
    const client = usePublicClient()
    const { address, chain } = useAccount()
    const { token0, token1, liquidityToken } = useTokensFromPool(_pool)
    const isMounted = useIsMounted()
    const { approved } = useApproved(APPROVE_TAG_REMOVE_TRIDENT)
    const { signature } = useSignature(APPROVE_TAG_REMOVE_TRIDENT)
    const { setSignature } = useApprovedActions(APPROVE_TAG_REMOVE_TRIDENT)
    const contract = useTridentRouterContract(_pool.chainId as TridentChainId)
    const [slippageTolerance] = useSlippageTolerance('removeLiquidity')

    const [percentage, setPercentage] = useState<string>('0')
    const percentToRemove = useMemo(
      () => new Percent(percentage, 100),
      [percentage],
    )
    const tokens = useMemo(() => [token0, token1], [token0, token1])
    const { data: rebases } = useBentoBoxTotals({
      chainId: _pool.chainId as BentoBoxChainId,
      currencies: tokens,
    })
    const { balance } = usePoolPosition()

    const slpAmountToRemove = useMemo(() => {
      return balance?.multiply(percentToRemove)
    }, [balance, percentToRemove])

    // TODO: Standardize fee format
    const [tridentConstantPoolState, tridentConstantPool] =
      useTridentConstantPool(
        _pool.chainId as TridentChainId,
        token0,
        token1,
        _pool.swapFee * 10000,
        _pool.twapEnabled,
      )

    const [tridentStablePoolState, tridentStablePool] = useTridentStablePool(
      _pool.chainId as TridentChainId,
      token0,
      token1,
      _pool.swapFee * 10000,
      _pool.twapEnabled,
    )

    const [poolState, pool] = useMemo(() => {
      if (_pool.protocol === Protocol.BENTOBOX_STABLE)
        return [tridentStablePoolState, tridentStablePool]
      if (_pool.protocol === Protocol.BENTOBOX_CLASSIC)
        return [tridentConstantPoolState, tridentConstantPool]

      return [undefined, undefined]
    }, [
      _pool.protocol,
      tridentConstantPool,
      tridentConstantPoolState,
      tridentStablePool,
      tridentStablePoolState,
    ])

    const totalSupply = useTotalSupply(liquidityToken)

    const underlying = useUnderlyingTokenBalanceFromPool({
      reserve0: pool?.reserve0,
      reserve1: pool?.reserve1,
      totalSupply,
      balance: balance,
    })

    const [underlying0, underlying1] = underlying

    const currencyAToRemove = useMemo(
      () =>
        token0
          ? percentToRemove?.greaterThan('0') && underlying0
            ? Amount.fromRawAmount(
                token0,
                percentToRemove.multiply(underlying0.quotient).quotient || '0',
              )
            : Amount.fromRawAmount(token0, '0')
          : undefined,
      [token0, percentToRemove, underlying0],
    )

    const currencyBToRemove = useMemo(
      () =>
        token1
          ? percentToRemove?.greaterThan('0') && underlying1
            ? Amount.fromRawAmount(
                token1,
                percentToRemove.multiply(underlying1.quotient).quotient || '0',
              )
            : Amount.fromRawAmount(token1, '0')
          : undefined,
      [token1, percentToRemove, underlying1],
    )

    const [minAmount0, minAmount1] = useMemo(() => {
      return [
        currencyAToRemove
          ? Amount.fromRawAmount(
              currencyAToRemove.currency,
              slippageAmount(currencyAToRemove, slippageTolerance)[0],
            )
          : undefined,
        currencyBToRemove
          ? Amount.fromRawAmount(
              currencyBToRemove.currency,
              slippageAmount(currencyBToRemove, slippageTolerance)[0],
            )
          : undefined,
      ]
    }, [slippageTolerance, currencyAToRemove, currencyBToRemove])

    const onSuccess = useCallback(
      (hash: SendTransactionReturnType) => {
        setPercentage('0')
        setSignature(undefined)

        if (!chain?.id) return

        const ts = new Date().getTime()
        void createToast({
          account: address,
          type: 'burn',
          chainId: chain.id,
          txHash: hash,
          promise: client.waitForTransactionReceipt({ hash }),
          summary: {
            pending: `Removing liquidity from the ${token0.symbol}/${token1.symbol} pair`,
            completed: `Successfully removed liquidity from the ${token0.symbol}/${token1.symbol} pair`,
            failed: 'Something went wrong when removing liquidity',
          },
          timestamp: ts,
          groupTimestamp: ts,
        })
      },
      [client, address, chain, token0.symbol, token1.symbol, setSignature],
    )

    const prepare = useMemo(() => {
      try {
        if (
          !chain?.id ||
          !pool ||
          !token0 ||
          !token1 ||
          !_pool.chainId ||
          !contract ||
          !minAmount0 ||
          !minAmount1 ||
          !address ||
          !minAmount0 ||
          !minAmount1 ||
          !rebases?.[token0.wrapped.address] ||
          !rebases?.[token1.wrapped.address] ||
          !slpAmountToRemove
        )
          return undefined

        const liquidityOutput: LiquidityOutput[] = [
          {
            token: minAmount0.wrapped.currency.address,
            amount: minAmount0.toShare(rebases?.[token0.wrapped.address])
              .quotient,
          },
          {
            token: minAmount1.wrapped.currency.address,
            amount: minAmount1.toShare(rebases?.[token1.wrapped.address])
              .quotient,
          },
        ]

        let indexOfWETH = -1
        indexOfWETH =
          minAmount0.wrapped.currency.address ===
          Native.onChain(_pool.chainId).wrapped.address
            ? 0
            : indexOfWETH
        indexOfWETH =
          minAmount1.wrapped.currency.address ===
          Native.onChain(_pool.chainId).wrapped.address
            ? 1
            : indexOfWETH

        const actions = [
          approveMasterContractAction({ signature }),
          burnLiquidityAction({
            address: pool.liquidityToken.address,
            amount: slpAmountToRemove.quotient,
            recipient: indexOfWETH >= 0 ? contract.address : address,
            liquidityOutput,
            receiveToWallet: true,
          }),
        ]

        if (indexOfWETH >= 0) {
          actions.push(
            unwrapWETHAction({
              recipient: address,
            }),
            sweepAction({
              token: liquidityOutput[indexOfWETH === 0 ? 1 : 0].token,
              recipient: address,
              fromBento: false,
            }),
          )
        }

        return {
          account: address,
          to: contract.address,
          chainId: _pool.chainId as ChainId,
          data: batchAction({
            actions,
          }),
        } satisfies UseCallParameters
      } catch (_e: unknown) {
        return undefined
      }
    }, [
      chain?.id,
      pool,
      token0,
      token1,
      _pool.chainId,
      contract,
      minAmount0,
      minAmount1,
      address,
      rebases,
      slpAmountToRemove,
      signature,
    ])

    const { isError: isSimulationError } = useCall({
      ...prepare,
      query: {
        enabled: Boolean(approved && Number(percentage) > 0),
      },
    })

    const { sendTransactionAsync, isLoading: isWritePending } =
      useSendTransaction({
        mutation: {
          onSuccess,
        },
      })

    const send = useMemo(() => {
      if (!prepare || isSimulationError) return undefined

      return async () => {
        try {
          await sendTransactionAsync(prepare)
        } catch {}
      }
    }, [sendTransactionAsync, isSimulationError, prepare])

    return (
      <div>
        <RemoveSectionWidget
          isFarm={!!_pool.incentives && _pool.incentives.length > 0}
          chainId={_pool.chainId as ChainId}
          percentage={percentage}
          token0={token0}
          token1={token1}
          token0Minimum={minAmount0}
          token1Minimum={minAmount1}
          setPercentage={setPercentage}
        >
          <Checker.Connect size="default" variant="outline" fullWidth>
            <Checker.Guard
              size="default"
              variant="outline"
              guardText="Pool not found"
              guardWhen={
                isMounted &&
                !!poolState &&
                [
                  TridentConstantPoolState.NOT_EXISTS,
                  TridentConstantPoolState.INVALID,
                  TridentStablePoolState.NOT_EXISTS,
                  TridentStablePoolState.INVALID,
                ].includes(poolState)
              }
            >
              <Checker.Network
                size="default"
                variant="outline"
                fullWidth
                chainId={_pool.chainId as ChainId}
              >
                <Checker.Guard
                  size="default"
                  variant="outline"
                  guardWhen={+percentage <= 0}
                  guardText="Enter amount"
                >
                  <Checker.ApproveBentobox
                    size="default"
                    variant="outline"
                    tag={APPROVE_TAG_REMOVE_TRIDENT}
                    fullWidth
                    chainId={chainId}
                    id="remove-liquidity-trident-approve-bentobox"
                    masterContract={
                      getTridentRouterContractConfig(
                        _pool.chainId as TridentChainId,
                      ).address
                    }
                  >
                    <Checker.ApproveERC20
                      size="default"
                      variant="outline"
                      fullWidth
                      id="approve-remove-liquidity-slp"
                      amount={slpAmountToRemove}
                      contract={
                        getTridentRouterContractConfig(
                          _pool.chainId as TridentChainId,
                        ).address
                      }
                    >
                      <Checker.Success tag={APPROVE_TAG_REMOVE_TRIDENT}>
                        <Button
                          size="default"
                          onClick={send}
                          fullWidth
                          disabled={!approved || isWritePending || !send}
                          testId="remove-liquidity"
                        >
                          {isWritePending ? (
                            <Dots>Confirm transaction</Dots>
                          ) : (
                            'Remove Liquidity'
                          )}
                        </Button>
                      </Checker.Success>
                    </Checker.ApproveERC20>
                  </Checker.ApproveBentobox>
                </Checker.Guard>
              </Checker.Network>
            </Checker.Guard>
          </Checker.Connect>
        </RemoveSectionWidget>
      </div>
    )
  })
