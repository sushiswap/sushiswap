import { Button, Checkbox, DialogTrigger } from '@sushiswap/ui'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useMemo, useState } from 'react'
import { ROUTER_CONTRACT } from '~tron/_common/constants/contracts'
import { useAllowance } from '~tron/_common/lib/hooks/useAllowance'
import { useTokenBalance } from '~tron/_common/lib/hooks/useTokenBalance'
import { formatUnitsForInput } from '~tron/_common/lib/utils/formatters'
import { getIfWrapOrUnwrap } from '~tron/_common/lib/utils/helpers'
import { warningSeverity } from '~tron/_common/lib/utils/warning-severity'
import { useSwapState } from '~tron/swap/swap-provider'
import { ApproveToken } from '../Shared/ApproveToken'

export const ReviewSwapDialogTrigger = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false)
  const {
    token0,
    token1,
    amountIn,
    isTxnPending,
    priceImpactPercentage,
    route,
  } = useSwapState()
  const { address } = useWallet()
  const { data: allowanceAmount, refetch } = useAllowance({
    tokenAddress: token0?.address as string,
    ownerAddress: address as string,
    spenderAddress: ROUTER_CONTRACT,
  })
  const { data: tokenBalance, isLoading } = useTokenBalance({
    accountAddress: address,
    tokenAddress: token0.address,
  })

  const refreshAllowance = async () => {
    await refetch()
  }

  const hasInsufficientBalance = useMemo(() => {
    if (isLoading) return true
    return (
      Number(formatUnitsForInput(tokenBalance ?? '0', token0.decimals)) <
      Number(amountIn)
    )
  }, [tokenBalance, token0, amountIn, isLoading])

  const swapType = useMemo(() => {
    return getIfWrapOrUnwrap(token0, token1)
  }, [token0, token1])

  const noRoutes = swapType === 'swap' && route?.length === 0

  const allowanceFormatted = formatUnitsForInput(
    allowanceAmount ?? '0',
    token0?.decimals,
  )

  const insufficientLiquidity = priceImpactPercentage >= 100

  const buttonText = useMemo(() => {
    if (isTxnPending) {
      return 'Swapping'
    }
    if (!amountIn || amountIn === '0') {
      return 'Enter Amount'
    }
    if (hasInsufficientBalance) {
      return 'Insufficient Balance'
    }
    if (swapType === 'unwrap') {
      return 'Unwrap'
    }
    if (swapType === 'wrap') {
      return 'Wrap'
    }
    if (noRoutes) {
      return 'No Routes Found'
    }
    if (insufficientLiquidity) {
      return 'Insufficient Liquidity'
    }
    if (
      allowanceAmount &&
      Number(amountIn) > Number(allowanceFormatted) &&
      swapType === 'swap'
    ) {
      return 'Approve'
    }
    return 'Review Swap'
  }, [
    amountIn,
    allowanceAmount,
    hasInsufficientBalance,
    noRoutes,
    allowanceFormatted,
    swapType,
    insufficientLiquidity,
    isTxnPending,
  ])

  const userConfirmationNeeded = useMemo(() => {
    if (
      warningSeverity(priceImpactPercentage ?? 0) > 3 &&
      (buttonText === 'Review Swap' || buttonText === 'Approve')
    ) {
      return true
    }
    return false
  }, [priceImpactPercentage, buttonText])

  return (
    <>
      {buttonText === 'Approve' ? (
        <ApproveToken
          tokenToApprove={token0}
          amount={amountIn}
          spenderAddress={ROUTER_CONTRACT}
          onSuccess={refreshAllowance}
        />
      ) : (
        <DialogTrigger
          disabled={
            insufficientLiquidity ||
            (userConfirmationNeeded && !isChecked) ||
            !amountIn ||
            hasInsufficientBalance ||
            noRoutes
          }
          asChild
        >
          <Button size="xl" fullWidth>
            {buttonText}
          </Button>
        </DialogTrigger>
      )}
      {userConfirmationNeeded && !isChecked ? (
        <div
          onClick={() => setIsChecked(!isChecked)}
          onKeyDown={() => setIsChecked(!isChecked)}
          className="flex items-start px-4 py-3 mt-4 rounded-xl bg-red/20 dark:bg-red/40 cursor-pointer"
        >
          <Checkbox color="red" id="expert-checkbox" checked={isChecked} />
          <label
            htmlFor="expert-checkbox"
            className="ml-2 font-medium text-red-600 dark:text-red-300"
          >
            Price impact is too high. You will lose a big portion of your funds
            in this trade. Please tick the box if you would like to continue.
          </label>
        </div>
      ) : null}
    </>
  )
}
