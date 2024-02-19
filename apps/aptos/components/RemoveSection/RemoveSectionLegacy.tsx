import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useSlippageTolerance } from '@sushiswap/hooks'
import { Dots } from '@sushiswap/ui'
import { Provider } from 'aptos'
import WalletSelector from 'components/WalletSelector'
import { createToast } from 'components/toast'
import { providerNetwork } from 'lib/constants'
import React, { useMemo, useState } from 'react'
import { Token } from 'utils/tokenType'
import { Pool } from 'utils/usePools'
import { formatNumber } from 'utils/utilFunctions'
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
const CONTRACT_ADDRESS =
  process.env['SWAP_CONTRACT'] || process.env['NEXT_PUBLIC_SWAP_CONTRACT']

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
  const [slippageTolerance] = useSlippageTolerance('removeLiquidity')
  const slippagePercent = useMemo(() => {
    return (
      Math.floor(
        +(slippageTolerance === 'AUTO' || slippageTolerance === ''
          ? '0.5'
          : slippageTolerance) * 100,
      ) / 10000
    )
  }, [slippageTolerance])

  const [reserve0, reserve1] = useMemo(() => {
    return [pool?.data?.balance_x?.value, pool?.data?.balance_y?.value]
  }, [pool])

  const [percentage, setPercentage] = useState<string>('')
  const [isTransactionPending, setisTransactionPending] =
    useState<boolean>(false)
  const { account, signAndSubmitTransaction, connected } = useWallet()

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

  const removeLiquidityHandler = async () => {
    const provider = new Provider(providerNetwork)
    if (!account?.address) return []
    setisTransactionPending(true)
    if (!liquidityBalance) return
    try {
      const response = await signAndSubmitTransaction({
        type: 'entry_function_payload',
        type_arguments: [token0?.address, token1?.address],
        arguments: [
          Math.floor((liquidityBalance * +percentage) / 100),
          minAmount0,
          minAmount1,
        ],
        function: `${CONTRACT_ADDRESS}::router::remove_liquidity`,
      })
      await provider.waitForTransaction(response?.hash)
      if (!response?.success) return
      const toastId = `success:${response?.hash}`
      createToast({
        summery: `Successfully removed liquidity from the ${token0.symbol}/${token1.symbol} pair`,
        toastId: toastId,
      })
      setisTransactionPending(false)
      setPercentage('')
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
      token0MinMinimum={formatNumber(minAmount0 as number, token0.decimals)}
      token1MinMinimum={formatNumber(minAmount1 as number, token1.decimals)}
    >
      <>
        {connected ? (
          <button
            type="button"
            className={`btn w-full flex items-center justify-center gap-2 cursor-pointer transition-all bg-blue hover:bg-blue-600 active:bg-blue-700 text-white px-6 h-[52px] rounded-xl text-base font-semibold ${
              Number(percentage) <= 0 || isTransactionPending
                ? 'pointer-events-none relative opacity-[0.4] overflow-hidden'
                : ''
            }`}
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
          </button>
        ) : (
          <WalletSelector />
        )}
      </>
    </RemoveSectionWidget>
  )
}
