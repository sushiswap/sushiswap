import {
  createFailedToast,
  createInfoToast,
  createSuccessToast,
} from '@sushiswap/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useMemo } from 'react'
import { WTRX } from '~tron/_common/constants/token-list'
import { useSwapDispatch, useSwapState } from '~tron/swap/swap-provider'

import { Button, Dots } from '@sushiswap/ui'
import { useTronWeb } from '~tron/_common/lib/hooks/useTronWeb'
import { parseUnits } from '~tron/_common/lib/utils/formatters'
import {
  cleanArgs,
  getArgsForSwap,
  getDeadline,
  getIfWrapOrUnwrap,
  getRouterFunctionSelectors,
  getTransactionInfo,
  parseTxnError,
  safeGasEstimates,
} from '~tron/_common/lib/utils/helpers'
import { getTronscanTxnLink } from '~tron/_common/lib/utils/tronscan-helpers'

export const SwapButton = ({
  closeModal,
  minOutput,
}: { closeModal: () => void; minOutput: string }) => {
  const queryClient = useQueryClient()
  const { token0, token1, isTxnPending, amountIn, amountOut, route } =
    useSwapState()
  const {
    setIsTxnPending,
    setAmountIn,
    setAmountOut,
    setPriceImpactPercentage,
  } = useSwapDispatch()
  const { tronWeb } = useTronWeb()
  const { address, signTransaction } = useWallet()

  const swapType = useMemo(() => {
    return getIfWrapOrUnwrap(token0, token1)
  }, [token0, token1])

  const swapToken = async () => {
    if (!address) return
    let txId = ''
    try {
      setIsTxnPending(true)
      const parsedAmountIn = parseUnits(amountIn, token0?.decimals)
      const parsedAmountOut = parseUnits(amountOut, token1?.decimals)

      if (swapType === 'wrap') {
        const { transaction } =
          await tronWeb.transactionBuilder.triggerSmartContract(
            WTRX.address, //contract address
            'deposit()', //function name
            { callValue: parsedAmountIn }, // options
            [], //parameters
            address, //issuerAddress
          )
        const signedTransation = await signTransaction(transaction)
        const _result = await tronWeb.trx.sendRawTransaction(signedTransation)
        console.log('_result', _result)
        if (!_result.result && 'code' in _result) {
          throw new Error(parseTxnError(_result.code))
        }
        txId = _result?.txid
        createInfoToast({
          summary: 'Wrapping TRX...',
          type: 'swap',
          account: address as string,
          chainId: 1,
          groupTimestamp: Date.now(),
          timestamp: Date.now(),
          txHash: txId,
          href: getTronscanTxnLink(txId),
        })
      } else if (swapType === 'unwrap') {
        const { transaction } =
          await tronWeb.transactionBuilder.triggerSmartContract(
            WTRX.address, //contract address
            'withdraw(uint256)', //function name
            {}, // options
            [{ type: 'uint256', value: parsedAmountIn }], //parameters
            address, //issuerAddress
          )
        const signedTransation = await signTransaction(transaction)
        const _result = await tronWeb.trx.sendRawTransaction(signedTransation)
        console.log('_result', _result)
        if (!_result.result && 'code' in _result) {
          throw new Error(parseTxnError(_result.code))
        }

        txId = _result?.txid
        createInfoToast({
          summary: 'Unwrapping WTRX...',
          type: 'swap',
          account: address as string,
          chainId: 1,
          groupTimestamp: Date.now(),
          timestamp: Date.now(),
          txHash: txId,
          href: getTronscanTxnLink(txId),
        })
      } else {
        const methodNames = getRouterFunctionSelectors(route)
        console.log('methodNames', methodNames)
        const deadline = getDeadline()
        const parsedAmountOutMin = parseUnits(minOutput, token1?.decimals)

        const args = []
        for (let i = 0; i < methodNames.length; i++) {
          const _args = getArgsForSwap(
            methodNames[i],
            parsedAmountIn,
            parsedAmountOut,
            parsedAmountIn,
            parsedAmountOutMin,
            route,
            address,
            deadline,
            address,
          )
          args.push(_args)
        }
        console.log('args', args)

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
        const _result = await tronWeb.trx.sendRawTransaction(signedTransation)

        if (!_result.result && 'code' in _result) {
          throw new Error(parseTxnError(_result.code))
        }
        txId = _result?.txid
        createInfoToast({
          summary: 'Swap initiated...',
          type: 'swap',
          account: address as string,
          chainId: 1,
          groupTimestamp: Date.now(),
          timestamp: Date.now(),
          txHash: txId,
          href: getTronscanTxnLink(txId),
        })
      }

      const transactionInfo = await getTransactionInfo(tronWeb, txId)
      if (transactionInfo?.receipt?.result !== 'SUCCESS') {
        throw new Error('Transaction failed')
      }
      //create success toast
      createSuccessToast({
        summary: 'Swap successful',
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
            'An error occurred while trying to swap'
      //create error toast
      createFailedToast({
        summary: errorMessage,
        type: 'swap',
        account: address as string,
        chainId: 1,
        groupTimestamp: Date.now(),
        timestamp: Date.now(),
        href: txId ? getTronscanTxnLink(txId) : undefined,
      })
      console.log(error)

      setIsTxnPending(false)
    }
  }

  const onSuccess = () => {
    setAmountIn('')
    setAmountOut('')
    setPriceImpactPercentage(0)
    setIsTxnPending(false)
    closeModal()

    queryClient.invalidateQueries({
      queryKey: [
        'useTokenBalance',
        { accountAddress: address, tokenAddress: token0?.address },
      ],
    })

    queryClient.invalidateQueries({
      queryKey: [
        'useTokenBalance',
        { accountAddress: address, tokenAddress: token1?.address },
      ],
    })
  }

  return (
    <Button
      disabled={isTxnPending}
      color="blue"
      fullWidth
      size="xl"
      onClick={swapToken}
    >
      {isTxnPending ? (
        <Dots>Confirming Swap</Dots>
      ) : (
        <>
          Swap {token0?.symbol} For {token1?.symbol}
        </>
      )}
    </Button>
  )
}
