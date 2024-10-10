import { CogIcon } from '@heroicons/react-v1/outline'
import { SlippageToleranceStorageKey, TTLStorageKey } from '@sushiswap/hooks'
import { createErrorToast, createToast } from '@sushiswap/notifications'
import {
  LiquidityEventName,
  LiquiditySource,
  sendAnalyticsEvent,
  useTrace,
} from '@sushiswap/telemetry'
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
  IconButton,
  SettingsModule,
  SettingsOverlay,
} from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { Dots } from '@sushiswap/ui'
import { FC, ReactNode, useCallback, useMemo } from 'react'
import { APPROVE_TAG_ADD_LEGACY } from 'src/lib/constants'
import { NativeAddress } from 'src/lib/constants'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { getSushiSwapRouterContractConfig } from 'src/lib/wagmi/hooks/contracts/useSushiSwapRouter'
import { SushiSwapV2PoolState } from 'src/lib/wagmi/hooks/pools/hooks/useSushiSwapV2Pools'
import {
  getDefaultTTL,
  useTransactionDeadline,
} from 'src/lib/wagmi/hooks/utils/hooks/useTransactionDeadline'
import { useApproved } from 'src/lib/wagmi/systems/Checker/Provider'
import { gasMargin, slippageAmount } from 'sushi/calculate'
import { ChainKey } from 'sushi/chain'
import { SushiSwapV2ChainId } from 'sushi/config'
import { BentoBoxChainId } from 'sushi/config'
import { Amount, Type } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import {
  Address,
  SendTransactionReturnType,
  UserRejectedRequestError,
} from 'viem'
import {
  UseSimulateContractParameters,
  usePublicClient,
  useWriteContract,
} from 'wagmi'
import { useSimulateContract } from 'wagmi'
import { useAccount } from 'wagmi'
import { useWaitForTransactionReceipt } from 'wagmi'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'
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
    const { data: deadline } = useTransactionDeadline({
      storageKey: TTLStorageKey.AddLiquidity,
      chainId,
    })
    const { address } = useAccount()
    const { approved } = useApproved(APPROVE_TAG_ADD_LEGACY)
    const [slippageTolerance] = useSlippageTolerance(
      SlippageToleranceStorageKey.AddLiquidity,
    )
    const client = usePublicClient()
    const trace = useTrace()

    const { refetchChain: refetchBalances } = useRefetchBalances()

    const onSuccess = useCallback(
      (hash: SendTransactionReturnType) => {
        _onSuccess()

        if (!token0 || !token1) return

        sendAnalyticsEvent(LiquidityEventName.REMOVE_LIQUIDITY_SUBMITTED, {
          chain_id: chainId,
          txHash: hash,
          address,
          source: LiquiditySource.V2,
          label: [token0.symbol, token1.symbol].join('/'),
          token0_address: token0.isNative ? NativeAddress : token0.address,
          token0_amount: input0?.quotient,
          token1_address: token1.isNative ? NativeAddress : token1.address,
          token1_amount: input1?.quotient,
          create_pool: poolState === SushiSwapV2PoolState.NOT_EXISTS,
          ...trace,
        })

        const receipt = client.waitForTransactionReceipt({ hash })
        receipt.then(() => {
          refetchBalances(chainId)
        })

        const ts = new Date().getTime()
        void createToast({
          account: address,
          type: 'mint',
          chainId,
          txHash: hash,
          promise: receipt,
          summary: {
            pending: `Adding liquidity to the ${token0.symbol}/${token1.symbol} pair`,
            completed: `Successfully added liquidity to the ${token0.symbol}/${token1.symbol} pair`,
            failed: 'Something went wrong when adding liquidity',
          },
          timestamp: ts,
          groupTimestamp: ts,
        })
      },
      [
        refetchBalances,
        client,
        chainId,
        token0,
        token1,
        address,
        _onSuccess,
        trace,
        poolState,
        input0,
        input1,
      ],
    )

    const onError = useCallback((e: Error) => {
      if (!(e.cause instanceof UserRejectedRequestError)) {
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
      writeWithNative.isPending || writeWithoutNative.isPending

    const { status } = useWaitForTransactionReceipt({ chainId, hash: data })

    return (
      <DialogProvider>
        <DialogReview>
          {({ confirm }) => (
            <>
              <DialogTrigger asChild>{children}</DialogTrigger>
              <DialogContent>
                <div className="flex justify-between">
                  <DialogHeader>
                    <DialogTitle>Add liquidity</DialogTitle>
                    <DialogDescription>
                      Please review your entered details.
                    </DialogDescription>
                  </DialogHeader>
                  <SettingsOverlay
                    options={{
                      slippageTolerance: {
                        storageKey: SlippageToleranceStorageKey.AddLiquidity,
                        title: 'Add Liquidity Slippage',
                      },
                      transactionDeadline: {
                        storageKey: TTLStorageKey.AddLiquidity,
                        defaultValue: getDefaultTTL(chainId).toString(),
                      },
                    }}
                    modules={[
                      SettingsModule.SlippageTolerance,
                      SettingsModule.TransactionDeadline,
                    ]}
                  >
                    <IconButton
                      name="Settings"
                      icon={CogIcon}
                      variant="secondary"
                      className="mr-12"
                    />
                  </SettingsOverlay>
                </div>
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
          buttonLink={`/${ChainKey[chainId]}/pools/v2/${poolAddress}`}
          txHash={data}
        />
      </DialogProvider>
    )
  }
