import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  SlippageToleranceStorageKey,
  useSlippageTolerance,
} from '@sushiswap/hooks'
import { Button } from '@sushiswap/ui'
import { Dots } from '@sushiswap/ui'
import { Provider } from 'aptos'
import React, { useMemo, useState } from 'react'
import { DEFAULT_SLIPPAGE } from 'sushi/config'
import { networkNameToNetwork } from '~aptos/_common/config/chains'
import { formatNumberWithDecimals } from '~aptos/_common/lib/common/format-number-with-decimals'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { Token } from '~aptos/_common/lib/types/token'
import { Checker } from '~aptos/_common/ui/checker'
import { createToast } from '~aptos/_common/ui/toast'
import { Pool } from '~aptos/pool/lib/convert-pool-to-sushi-pool'
import { RemoveSectionWidget } from './RemoveSectionWidget'

interface Props {
  pool: Pool
  liquidityBalance: number | undefined
  token0: Token
  token1: Token
  balance: number
  underlying0: string | undefined
  underlying1: string | undefined
  totalSupply: string | undefined
  isFarm: boolean
}

export const RemoveSectionLegacy = ({
  pool,
  liquidityBalance,
  token0,
  token1,
  balance,
  underlying0,
  underlying1,
  totalSupply,
  isFarm,
}: Props) => {
  const [slippageTolerance] = useSlippageTolerance(
    SlippageToleranceStorageKey.RemoveLiquidity,
  )
  const slippagePercent = useMemo(() => {
    return (
      Math.floor(
        +(slippageTolerance === 'AUTO' || slippageTolerance === ''
          ? DEFAULT_SLIPPAGE
          : slippageTolerance) * 100,
      ) / 10000
    )
  }, [slippageTolerance])

  const [reserve0, reserve1] = useMemo(() => {
    return [pool?.reserve0, pool?.reserve1]
  }, [pool])

  const [percentage, setPercentage] = useState<string>('0')
  const [isTransactionPending, setisTransactionPending] =
    useState<boolean>(false)
  const { account, signAndSubmitTransaction } = useWallet()

  const currencyAToRemove = useMemo(() => {
    return token0
      ? underlying0 && liquidityBalance
        ? Math.floor(
            (Number(reserve0) *
              Math.floor((liquidityBalance * +percentage) / 100)) /
              Number(totalSupply),
          )
        : 0
      : undefined
  }, [percentage, token0, underlying0, totalSupply, liquidityBalance, reserve0])

  const currencyBToRemove = useMemo(() => {
    return token1
      ? underlying1 && liquidityBalance
        ? Math.floor(
            (Number(reserve1) *
              Math.floor((liquidityBalance * +percentage) / 100)) /
              Number(totalSupply),
          )
        : 0
      : undefined
  }, [percentage, token1, underlying1, totalSupply, liquidityBalance, reserve1])

  const [minAmount0, minAmount1] = useMemo(() => {
    return [
      currencyAToRemove
        ? slippagePercent === 0
          ? Math.floor(currencyAToRemove)
          : Math.floor(currencyAToRemove - currencyAToRemove * slippagePercent)
        : 0,
      currencyBToRemove
        ? slippagePercent === 0
          ? Math.floor(currencyBToRemove)
          : Math.floor(currencyBToRemove - currencyBToRemove * slippagePercent)
        : 0,
    ]
  }, [slippagePercent, currencyAToRemove, currencyBToRemove])

  const {
    network,
    contracts: { swap: swapContract },
  } = useNetwork()

  const removeLiquidityHandler = async () => {
    const provider = new Provider(networkNameToNetwork(network))
    if (!account?.address) return []
    setisTransactionPending(true)
    if (!liquidityBalance) return
    try {
      const response = await signAndSubmitTransaction({
        data: {
          typeArguments: [token0?.address, token1?.address],
          functionArguments: [
            Math.floor((liquidityBalance * +percentage) / 100),
            minAmount0,
            minAmount1,
          ],
          function: `${swapContract}::router::remove_liquidity`,
        },
      })
      await provider.waitForTransaction(response?.hash)
      if (!response?.output.success) return
      const toastId = `success:${response?.hash}`
      createToast({
        summery: `Successfully removed liquidity from the ${token0.symbol}/${token1.symbol} pair`,
        toastId: toastId,
      })
      setisTransactionPending(false)
      setPercentage('0')
    } catch (err) {
      console.log(err)
      const toastId = `failed:${Math.random()}`
      createToast({ summery: 'User rejected request', toastId: toastId })
    } finally {
      setisTransactionPending(false)
    }
  }
  return (
    <RemoveSectionWidget
      isFarm={isFarm}
      percentage={percentage}
      setPercentage={setPercentage}
      token0={token0}
      token1={token1}
      balance={balance}
      reserve0={reserve0}
      reserve1={reserve1}
      totalSupply={totalSupply}
      token0MinMinimum={formatNumberWithDecimals(
        minAmount0 as number,
        token0.decimals,
      )}
      token1MinMinimum={formatNumberWithDecimals(
        minAmount1 as number,
        token1.decimals,
      )}
    >
      <Checker.Connect variant="outline" fullWidth>
        <Button
          variant="outline"
          fullWidth
          disabled={Number(percentage) <= 0 || isTransactionPending}
          onClick={removeLiquidityHandler}
        >
          {isTransactionPending ? (
            <Dots>Confirm transaction</Dots>
          ) : Number(percentage) > 0 ? (
            <>Remove Liquidity</>
          ) : (
            <>Enter Amount</>
          )}
        </Button>
      </Checker.Connect>
    </RemoveSectionWidget>
  )
}
