import {
  createFailedToast,
  createInfoToast,
  createSuccessToast,
} from '@sushiswap/notifications'
import { Button, ButtonProps } from '@sushiswap/ui'
import { useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useMemo } from 'react'
import { ROUTER_CONTRACT } from '~tron/_common/constants/contracts'
import { PAIR_DECIMALS } from '~tron/_common/constants/pair-decimals'
import { useAllowance } from '~tron/_common/lib/hooks/useAllowance'
import { useTronWeb } from '~tron/_common/lib/hooks/useTronWeb'
import { formatUnitsForInput } from '~tron/_common/lib/utils/formatters'
import {
  cleanArgs,
  getArgsForRemoveLiquidity,
  getDeadline,
  getRemoveLiquidityFunctionSelector,
  getTransactionInfo,
  parseTxnError,
  safeGasEstimates,
} from '~tron/_common/lib/utils/helpers'
import { getTronscanTxnLink } from '~tron/_common/lib/utils/tronscan-helpers'
import { ApproveToken } from '~tron/_common/ui/Shared/ApproveToken'
import { WalletConnector } from '~tron/_common/ui/WalletConnector/WalletConnector'
import { usePoolState } from '../pool-provider'
import { useRemoveLiqDispatch, useRemoveLiqState } from './pool-remove-provider'

export const RemoveButton = (props: ButtonProps) => {
  const queryClient = useQueryClient()
  const { address, connected, signTransaction } = useWallet()
  const isConnected = address && connected
  const {
    percentage,
    isTxnPending,
    lpToRemove,
    minAmountToken0,
    minAmountToken1,
  } = useRemoveLiqState()
  const { setIsTxnPending, setPercentage } = useRemoveLiqDispatch()
  const { token0, token1, pairAddress } = usePoolState()
  const { tronWeb } = useTronWeb()
  const { data: allowanceAmount, refetch } = useAllowance({
    tokenAddress: pairAddress as string,
    ownerAddress: address as string,
    spenderAddress: ROUTER_CONTRACT,
  })

  const removeLiquidity = async () => {
    if (
      !isConnected ||
      !address ||
      !token0 ||
      !token1 ||
      !lpToRemove ||
      !minAmountToken0 ||
      !minAmountToken1
    ) {
      return
    }
    try {
      setIsTxnPending(true)
      const methodNames = getRemoveLiquidityFunctionSelector(token0, token1)
      const deadline = getDeadline()
      const args = []
      for (let i = 0; i < methodNames.length; i++) {
        const _args = getArgsForRemoveLiquidity(
          methodNames[i],
          token0.address,
          token1.address,
          lpToRemove,
          minAmountToken0,
          minAmountToken1,
          address,
          deadline,
        )
        args.push(_args)
      }
      console.log(args)
      const estimates = await safeGasEstimates(tronWeb, args)
      console.log('estimates', estimates)
      const safeGasEstimate = estimates.findIndex(
        (predicate) => predicate !== undefined,
      )
      console.log('safeGasEstimate', safeGasEstimate)
      if (safeGasEstimate === -1) {
        throw new Error('Failed to estimate energy. Transaction will fail.')
      }
      const argsForTransaction = cleanArgs(args[safeGasEstimate])
      console.log('argsForTransaction', argsForTransaction)

      const { transaction } =
        await tronWeb.transactionBuilder.triggerSmartContract(
          ...argsForTransaction,
        )
      const signedTransation = await signTransaction(transaction)
      const result = await tronWeb.trx.sendRawTransaction(signedTransation)

      if (!result.result && 'code' in result) {
        throw new Error(parseTxnError(result.code))
      }
      const txId = result?.txid

      createInfoToast({
        summary: `Removing liquidity from the ${token0.symbol}/${token1.symbol} pair.`,
        type: 'swap',
        account: address as string,
        chainId: 1,
        groupTimestamp: Date.now(),
        timestamp: Date.now(),
        txHash: txId,
        href: getTronscanTxnLink(txId),
      })

      const transactionInfo = await getTransactionInfo(tronWeb, txId)
      if (transactionInfo?.receipt?.result !== 'SUCCESS') {
        throw new Error('Transaction failed')
      }

      //create success toast
      createSuccessToast({
        summary: 'Successfully removed liquidity!',
        txHash: txId,
        type: 'swap',
        account: address as string,
        chainId: 1,
        groupTimestamp: Date.now(),
        timestamp: Date.now(),
        href: getTronscanTxnLink(txId),
      })
      onSuccess()
    } catch (error) {
      const errorMessage =
        typeof error === 'string'
          ? error
          : (error as Error)?.message ??
            'An error occurred while trying to remove liquidity.'
      //create error toast
      createFailedToast({
        summary: errorMessage,
        type: 'swap',
        account: address as string,
        chainId: 1,
        groupTimestamp: Date.now(),
        timestamp: Date.now(),
      })
      console.log(error)
      setIsTxnPending(false)
    }
  }

  const onSuccess = () => {
    setPercentage(0)
    setIsTxnPending(false)
    queryClient.invalidateQueries({
      queryKey: [
        'useTokenBalance',
        { accountAddress: address, tokenAddress: pairAddress },
      ],
    })
  }

  const allowanceFormatted = formatUnitsForInput(
    allowanceAmount ?? '0',
    token0?.decimals ?? 18,
  )

  const buttonText = useMemo(() => {
    if (isTxnPending) {
      ;('Removing')
    }
    if (percentage === 0) {
      return 'Enter Amount'
    }
    if (
      allowanceAmount &&
      Number(formatUnitsForInput(lpToRemove, PAIR_DECIMALS)) >
        Number(allowanceFormatted)
    ) {
      return 'Approve'
    }
    return 'Remove'
  }, [
    percentage,
    isTxnPending,
    allowanceFormatted,
    allowanceAmount,
    lpToRemove,
  ])

  if (!isConnected) {
    return <WalletConnector {...props} />
  }

  if (buttonText === 'Approve') {
    return (
      <ApproveToken
        tokenToApprove={{
          address: pairAddress as string,
          decimals: PAIR_DECIMALS,
          symbol: 'SLP',
          name: 'SushiSwap LP',
        }}
        amount={formatUnitsForInput(lpToRemove, PAIR_DECIMALS)}
        spenderAddress={ROUTER_CONTRACT}
        onSuccess={async () => {
          await refetch()
        }}
        buttonProps={props}
      />
    )
  }

  return (
    <Button
      onClick={removeLiquidity}
      disabled={percentage === 0 || isTxnPending}
      {...props}
    >
      {buttonText}
    </Button>
  )
}
