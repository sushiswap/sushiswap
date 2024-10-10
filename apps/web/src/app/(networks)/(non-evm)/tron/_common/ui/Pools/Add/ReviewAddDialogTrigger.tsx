import { Button, ButtonProps, DialogTrigger } from '@sushiswap/ui'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useMemo } from 'react'
import { ROUTER_CONTRACT } from '~tron/_common/constants/contracts'
import { useAllowance } from '~tron/_common/lib/hooks/useAllowance'
import { useTokenBalance } from '~tron/_common/lib/hooks/useTokenBalance'
import { formatUnitsForInput } from '~tron/_common/lib/utils/formatters'
import { ApproveToken } from '~tron/_common/ui/Shared/ApproveToken'
import { usePoolState } from '../pool-provider'

export const ReviewAddDialogTrigger = (props: ButtonProps) => {
  const { token0, token1, isTxnPending, amountInToken0, amountInToken1 } =
    usePoolState()
  const { address } = useWallet()

  const { data: token0Balance, isLoading: isLoadingToken0Balance } =
    useTokenBalance({
      accountAddress: address,
      tokenAddress: token0?.address,
    })

  const { data: token1Balance, isLoading: isLoadingToken1Balance } =
    useTokenBalance({
      accountAddress: address,
      tokenAddress: token1?.address,
    })

  const { data: token0AllowanceAmount, refetch: refetchToken0Allowance } =
    useAllowance({
      tokenAddress: token0?.address as string,
      ownerAddress: address as string,
      spenderAddress: ROUTER_CONTRACT,
    })

  const { data: token1AllowanceAmount, refetch: refetchToken1Allowance } =
    useAllowance({
      tokenAddress: token1?.address as string,
      ownerAddress: address as string,
      spenderAddress: ROUTER_CONTRACT,
    })

  const hasInsufficientToken0Balance = useMemo(() => {
    if (isLoadingToken0Balance) return true
    return (
      Number(
        formatUnitsForInput(token0Balance ?? '0', token0?.decimals ?? 18),
      ) < Number(amountInToken0)
    )
  }, [token0Balance, token0, amountInToken0, isLoadingToken0Balance])

  const hasInsufficientToken1Balance = useMemo(() => {
    if (isLoadingToken1Balance) return true
    return (
      Number(
        formatUnitsForInput(token1Balance ?? '0', token1?.decimals ?? 18),
      ) < Number(amountInToken1)
    )
  }, [token1Balance, token1, amountInToken1, isLoadingToken1Balance])

  const token0AllowanceFormatted = formatUnitsForInput(
    token0AllowanceAmount ?? '0',
    token0?.decimals ?? 18,
  )

  const token1AllowanceFormatted = formatUnitsForInput(
    token1AllowanceAmount ?? '0',
    token1?.decimals ?? 18,
  )

  const hasInsufficientToken0Allowance = useMemo(() => {
    return (
      !!token1AllowanceAmount &&
      Number(token0AllowanceFormatted) < Number(amountInToken0)
    )
  }, [token0AllowanceFormatted, amountInToken0, token1AllowanceAmount])

  const hasInsufficientToken1Allowance = useMemo(() => {
    return (
      !!token1AllowanceAmount &&
      Number(token1AllowanceFormatted) < Number(amountInToken1)
    )
  }, [token1AllowanceFormatted, amountInToken1, token1AllowanceAmount])

  const invalidAmount = useMemo(() => {
    return (
      amountInToken0 === '' ||
      amountInToken1 === '' ||
      Number(amountInToken0) === 0 ||
      Number(amountInToken1) === 0
    )
  }, [amountInToken0, amountInToken1])

  const buttonText = useMemo(() => {
    if (isTxnPending) {
      return 'Adding Liquidity'
    }
    if (invalidAmount) {
      return 'Enter Amount'
    }
    if (hasInsufficientToken0Balance) {
      return `Insufficient ${token0?.symbol} Balance`
    }
    if (hasInsufficientToken1Balance) {
      return `Insufficient ${token1?.symbol} Balance`
    }
    if (hasInsufficientToken0Allowance) {
      return `Approve ${token0?.symbol} Token`
    }
    if (hasInsufficientToken1Allowance) {
      return `Approve ${token1?.symbol} Token`
    }

    return 'Add Liquidity'
  }, [
    hasInsufficientToken0Balance,
    hasInsufficientToken1Balance,
    hasInsufficientToken0Allowance,
    hasInsufficientToken1Allowance,
    invalidAmount,
    token0,
    token1,
    isTxnPending,
  ])

  if (buttonText === `Approve ${token0?.symbol} Token`) {
    return (
      <ApproveToken
        tokenToApprove={token0!}
        amount={amountInToken0}
        spenderAddress={ROUTER_CONTRACT}
        onSuccess={async () => {
          await refetchToken0Allowance()
        }}
        buttonProps={props}
      />
    )
  }

  if (buttonText === `Approve ${token1?.symbol} Token`) {
    return (
      <ApproveToken
        tokenToApprove={token1!}
        amount={amountInToken1}
        spenderAddress={ROUTER_CONTRACT}
        onSuccess={async () => {
          await refetchToken1Allowance()
        }}
        buttonProps={props}
      />
    )
  }

  return (
    <DialogTrigger
      disabled={
        invalidAmount ||
        hasInsufficientToken0Balance ||
        hasInsufficientToken1Balance ||
        isTxnPending
      }
      asChild
    >
      <Button loading={isTxnPending} {...props}>
        {buttonText}
      </Button>
    </DialogTrigger>
  )
}
