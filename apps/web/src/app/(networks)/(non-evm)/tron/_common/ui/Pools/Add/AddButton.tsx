import {
  SlippageToleranceStorageKey,
  useSlippageTolerance,
} from '@sushiswap/hooks'
import {
  createFailedToast,
  createInfoToast,
  createSuccessToast,
} from '@sushiswap/notifications'
import { Button, ButtonProps } from '@sushiswap/ui'
import { useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useMemo } from 'react'
import { useTronWeb } from '~tron/_common/lib/hooks/useTronWeb'
import { parseUnits } from '~tron/_common/lib/utils/formatters'
import {
  cleanArgs,
  getArgsForAddLiquidity,
  getDeadline,
  getLiquidityFunctionSelector,
  getTransactionInfo,
  parseTxnError,
  safeGasEstimates,
} from '~tron/_common/lib/utils/helpers'
import { getTronscanTxnLink } from '~tron/_common/lib/utils/tronscan-helpers'
import { usePoolDispatch, usePoolState } from '../pool-provider'

export const AddButton = ({
  closeModal,
  buttonProps,
}: { closeModal: () => void; buttonProps?: ButtonProps }) => {
  const queryClient = useQueryClient()

  const {
    token0,
    token1,
    isTxnPending,
    amountInToken0,
    amountInToken1,
    pairAddress,
  } = usePoolState()
  const { setIsTxnPending, setAmountInToken0, setAmountInToken1 } =
    usePoolDispatch()
  const { address, signTransaction } = useWallet()
  const { tronWeb } = useTronWeb()
  const [slippageTolerance] = useSlippageTolerance(
    SlippageToleranceStorageKey.AddLiquidity,
  )
  const slippage =
    slippageTolerance === 'AUTO' ? 0.005 : Number(slippageTolerance) / 100

  const pairExists = !!pairAddress

  const minAmountToken0 = useMemo(() => {
    if (!amountInToken0) return ''
    const output = Number(amountInToken0) * (1 - slippage)
    return output.toString()
  }, [slippage, amountInToken0])

  const minAmountToken1 = useMemo(() => {
    if (!amountInToken1) return ''
    const output = Number(amountInToken1) * (1 - slippage)
    return output.toString()
  }, [slippage, amountInToken1])

  const addLiquidity = async () => {
    if (!token0 || !token1 || !amountInToken0 || !amountInToken1 || !address)
      return
    try {
      setIsTxnPending(true)
      const methodName = getLiquidityFunctionSelector(token0, token1)
      const deadline = getDeadline()
      const parsedAmount0 = parseUnits(amountInToken0, token0.decimals)
      const parsedAmount1 = parseUnits(amountInToken1, token1.decimals)
      const parsedMinAmount0 = parseUnits(minAmountToken0, token0.decimals)
      const parsedMinAmount1 = parseUnits(minAmountToken1, token1.decimals)

      const args = getArgsForAddLiquidity(
        methodName,
        token0.address,
        token1.address,
        parsedAmount0,
        parsedAmount1,
        parsedMinAmount0,
        parsedMinAmount1,
        address,
        deadline,
      )
      console.log('args', args)
      const estimates = await safeGasEstimates(tronWeb, [args])
      console.log(estimates)
      const safeGasEstimate = estimates.findIndex(
        (predicate) => predicate !== undefined,
      )
      console.log('safeGasEstimate', safeGasEstimate)

      if (safeGasEstimate === -1) {
        throw new Error('Failed to estimate energy. Transaction will fail.')
      }
      const feeLimit = pairExists ? undefined : 3000000000 //3000 trx since contract will need to be deployed
      const cleanedArgs = cleanArgs(args, feeLimit)
      console.log('cleanedArgs', cleanedArgs)
      const { transaction } =
        await tronWeb.transactionBuilder.triggerSmartContract(...cleanedArgs)
      const signedTransation = await signTransaction(transaction)

      const result = await tronWeb.trx.sendRawTransaction(signedTransation)

      if (!result.result && 'code' in result) {
        throw new Error(parseTxnError(result.code))
      }
      const txId = result?.txid

      createInfoToast({
        summary: 'Add liquidity initiated...',
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
        summary: 'Add liquidity successful',
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
            'An error occurred while trying to add liquidity'
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
    setIsTxnPending(false)
    setAmountInToken0('')
    setAmountInToken1('')
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
      loading={isTxnPending}
      onClick={addLiquidity}
      {...buttonProps}
    >
      {isTxnPending ? 'Adding Liquidity' : 'Add Liquidity'}
    </Button>
  )
}
