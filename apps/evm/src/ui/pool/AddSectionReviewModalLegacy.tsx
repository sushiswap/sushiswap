import {
  DialogConfirm,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTitle,
  DialogTrigger,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui/components/button'
import { Dots } from '@sushiswap/ui/components/dots'
import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import {
  SushiSwapV2PoolState,
  UseSimulateContractParameters,
  getSushiSwapRouterContractConfig,
  useAccount,
  usePublicClient,
  useSimulateContract,
  useTransactionDeadline,
  useWaitForTransactionReceipt,
  useWriteContract,
} from '@sushiswap/wagmi'
import { SendTransactionReturnType } from '@sushiswap/wagmi/actions'
import { useApproved } from '@sushiswap/wagmi/systems/Checker/Provider'
import { FC, ReactNode, useCallback, useMemo } from 'react'
import { APPROVE_TAG_ADD_LEGACY } from 'src/lib/constants'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { gasMargin, slippageAmount } from 'sushi/calculate'
import { SushiSwapV2ChainId } from 'sushi/config'
import { BentoBoxChainId } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import { Address, UserRejectedRequestError } from 'viem'

import { AddSectionReviewModal } from './AddSectionReviewModal'

interface UseAddSushiSwapV2 {
  token0: Type | undefined
  token1: Type | undefined
  chainId: SushiSwapV2ChainId
  input0: Amount<Type> | undefined
  input1: Amount<Type> | undefined
  address: Address | undefined
  minAmount0: Amount<Type> | undefined
  minAmount1: Amount<Type> | undefined
  deadline: bigint | undefined
  mutation: {
    onSuccess: (data: SendTransactionReturnType) => void
    onError: (e: Error) => void
  }
}

function useWriteWithNative({
  token0,
  token1,
  chainId,
  input0,
  input1,
  address,
  minAmount0,
  minAmount1,
  deadline,
  mutation,
}: UseAddSushiSwapV2) {
  const prepare = useMemo(() => {
    if (
      !token0 ||
      !token1 ||
      !input0 ||
      !input1 ||
      !address ||
      !minAmount0 ||
      !minAmount1 ||
      !deadline
    ) {
      return undefined
    }

    if (minAmount0.equalTo(ZERO) || minAmount1.equalTo(ZERO)) {
      return undefined
    }

    // With native
    if (!token0.isNative && !token1.isNative) {
      return undefined
    }

    const value = BigInt(
      (token1.isNative ? input1 : input0).quotient.toString(),
    )
    const args = [
      (token1.isNative ? token0 : token1).wrapped.address,
      (token1.isNative ? input0 : input1).quotient,
      (token1.isNative ? minAmount0 : minAmount1).quotient,
      (token1.isNative ? minAmount1 : minAmount0).quotient,
      address,
      deadline,
    ] as const

    const contract = getSushiSwapRouterContractConfig(chainId)

    return {
      account: address,
      address: contract.address,
      chainId,
      abi: contract.abi,
      functionName: 'addLiquidityETH',
      args,
      value,
    } as const satisfies UseSimulateContractParameters
  }, [
    address,
    chainId,
    deadline,
    input0,
    input1,
    minAmount0,
    minAmount1,
    token0,
    token1,
  ])

  const { data: simulation } = useSimulateContract({
    ...(prepare as NonNullable<typeof prepare>),
    query: {
      enabled: Boolean(prepare),
    },
  })

  const {
    writeContractAsync,
    writeContract: _,
    ...rest
  } = useWriteContract({
    mutation,
  })

  const write = useMemo(() => {
    if (!writeContractAsync || !simulation) return undefined

    return async (confirm: () => void) => {
      try {
        await writeContractAsync({
          ...simulation.request,
          gas: simulation.request.gas
            ? gasMargin(simulation.request.gas)
            : undefined,
        })

        confirm()
      } catch {}
    }
  }, [writeContractAsync, simulation])

  return { ...rest, write }
}

function useWriteWithoutNative({
  token0,
  token1,
  chainId,
  input0,
  input1,
  address,
  minAmount0,
  minAmount1,
  deadline,
  mutation,
}: UseAddSushiSwapV2) {
  const prepare = useMemo(() => {
    if (
      !token0 ||
      !token1 ||
      !input0 ||
      !input1 ||
      !address ||
      !minAmount0 ||
      !minAmount1 ||
      !deadline
    ) {
      return undefined
    }

    if (minAmount0.equalTo(ZERO) || minAmount1.equalTo(ZERO)) {
      return undefined
    }

    // No native
    if (token0.isNative || token1.isNative) {
      return undefined
    }

    const args = [
      token0.wrapped.address,
      token1.wrapped.address,
      input0.quotient,
      input1.quotient,
      minAmount0.quotient,
      minAmount1.quotient,
      address,
      deadline,
    ] as const

    const contract = getSushiSwapRouterContractConfig(chainId)

    return {
      account: address,
      address: contract.address,
      chainId: chainId,
      abi: contract.abi,
      functionName: 'addLiquidity',
      args,
    } as const
  }, [
    address,
    chainId,
    deadline,
    input0,
    input1,
    minAmount0,
    minAmount1,
    token0,
    token1,
  ])

  const { data: simulation } = useSimulateContract({
    ...(prepare as NonNullable<typeof prepare>),
    query: {
      enabled: Boolean(prepare),
    },
  })

  const {
    writeContractAsync,
    writeContract: _,
    ...rest
  } = useWriteContract({
    mutation,
  })

  const write = useMemo(() => {
    if (!writeContractAsync || !simulation) return undefined

    return async (confirm: () => void) => {
      try {
        await writeContractAsync({
          ...simulation.request,
          gas: simulation.request.gas
            ? gasMargin(simulation.request.gas)
            : undefined,
        })

        confirm()
      } catch {}
    }
  }, [writeContractAsync, simulation])

  return { ...rest, write }
}

interface AddSectionReviewModalLegacyProps {
  poolState: SushiSwapV2PoolState
  poolAddress: Address | undefined
  chainId: SushiSwapV2ChainId
  token0: Type | undefined
  token1: Type | undefined
  input0: Amount<Type> | undefined
  input1: Amount<Type> | undefined
  children: ReactNode
  onSuccess: () => void
}

export const AddSectionReviewModalLegacy: FC<AddSectionReviewModalLegacyProps> =
  ({
    poolAddress,
    poolState,
    chainId,
    token0,
    token1,
    input0,
    input1,
    children,
    onSuccess: _onSuccess,
  }) => {
    const { data: deadline } = useTransactionDeadline({ chainId })
    const { address } = useAccount()
    const { approved } = useApproved(APPROVE_TAG_ADD_LEGACY)
    const [slippageTolerance] = useSlippageTolerance('addLiquidity')
    const client = usePublicClient()

    const onSuccess = useCallback(
      (hash: SendTransactionReturnType) => {
        _onSuccess()

        if (!token0 || !token1) return

        const ts = new Date().getTime()
        void createToast({
          account: address,
          type: 'mint',
          chainId,
          txHash: hash,
          promise: client.waitForTransactionReceipt({ hash }),
          summary: {
            pending: `Adding liquidity to the ${token0.symbol}/${token1.symbol} pair`,
            completed: `Successfully added liquidity to the ${token0.symbol}/${token1.symbol} pair`,
            failed: 'Something went wrong when adding liquidity',
          },
          timestamp: ts,
          groupTimestamp: ts,
        })
      },
      [client, chainId, token0, token1, address, _onSuccess],
    )

    const onError = useCallback((e: Error) => {
      if (e instanceof UserRejectedRequestError) {
        createErrorToast(e?.message, true)
      }
    }, [])

    const [minAmount0, minAmount1] = useMemo(() => {
      return [
        input0
          ? poolState === SushiSwapV2PoolState.NOT_EXISTS
            ? input0
            : Amount.fromRawAmount(
                input0.currency,
                slippageAmount(input0, slippageTolerance)[0],
              )
          : undefined,
        input1
          ? poolState === SushiSwapV2PoolState.NOT_EXISTS
            ? input1
            : Amount.fromRawAmount(
                input1.currency,
                slippageAmount(input1, slippageTolerance)[0],
              )
          : undefined,
      ]
    }, [poolState, input0, input1, slippageTolerance])

    const writeWithNative = useWriteWithNative({
      token0,
      token1,
      chainId,
      input0,
      input1,
      address,
      minAmount0,
      minAmount1,
      deadline,
      mutation: {
        onSuccess,
        onError,
      },
    })

    const writeWithoutNative = useWriteWithoutNative({
      token0,
      token1,
      chainId,
      input0,
      input1,
      address,
      minAmount0,
      minAmount1,
      deadline,
      mutation: {
        onSuccess,
        onError,
      },
    })

    // check shouldn't be necessary
    const write = writeWithNative.write || writeWithoutNative.write
    const data = writeWithNative.data || writeWithoutNative.data
    const isWritePending =
      writeWithNative.isLoading || writeWithoutNative.isLoading

    const { status } = useWaitForTransactionReceipt({ chainId, hash: data })

    return (
      <DialogProvider>
        <DialogReview>
          {({ confirm }) => (
            <>
              <DialogTrigger asChild>{children}</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add liquidity</DialogTitle>
                  <DialogDescription>
                    Please review your entered details.
                  </DialogDescription>
                </DialogHeader>
                <AddSectionReviewModal
                  chainId={chainId as BentoBoxChainId}
                  input0={input0}
                  input1={input1}
                />
                <DialogFooter>
                  <Button
                    size="xl"
                    disabled={isWritePending || !approved || !write}
                    loading={Boolean(!write)}
                    fullWidth
                    onClick={() => write?.(confirm)}
                    testId="confirm-add-v2-liquidity"
                  >
                    {isWritePending ? <Dots>Confirm transaction</Dots> : 'Add'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </>
          )}
        </DialogReview>
        <DialogConfirm
          chainId={chainId}
          status={status}
          testId="incentivize-confirmation-modal"
          successMessage="Successfully added liquidity"
          buttonText="Go to pool"
          buttonLink={`/pools/${chainId}:${poolAddress}`}
          txHash={data}
        />
      </DialogProvider>
    )
  }
