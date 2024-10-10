'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogProvider,
  DialogReview,
  DialogTrigger,
  List,
} from '@sushiswap/ui'
import { Provider } from 'aptos'
import { FC, ReactNode, useCallback } from 'react'
import { formatUSD } from 'sushi/format'
import { networkNameToNetwork } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { useStablePrice } from '~aptos/_common/lib/common/use-stable-price'
import { CurrencyIcon } from '~aptos/_common/ui/currency/currency-icon'
import { createToast } from '~aptos/_common/ui/toast'
import { getAddLiquidityPayload } from '~aptos/pool/lib/get-add-liquidity-payload'
import {
  usePoolActions,
  usePoolState,
} from '~aptos/pool/ui/pool/add/pool-add-provider/pool-add-provider'

interface Props {
  children: ReactNode
}

export const AddSectionReviewModal: FC<Props> = ({ children }) => {
  const {
    contracts: { swap: swapContract },
    network,
  } = useNetwork()
  const { signAndSubmitTransaction } = useWallet()

  const {
    token0,
    token1,
    amount0,
    amount1,
    poolReserves,
    slippageAmount0,
    slippageAmount1,
  } = usePoolState()
  const { setisTransactionPending, setAmount0, setAmount1 } = usePoolActions()

  const token0Price = useStablePrice({ currency: token0 })
  const token1Price = useStablePrice({ currency: token1 })

  const addLiquidity = useCallback(
    async (close: () => void) => {
      const provider = new Provider(networkNameToNetwork(network))

      const payload = getAddLiquidityPayload(
        swapContract,
        token0.address,
        token1.address,
        parseInt(String(Number(amount0) * 10 ** token0.decimals)),
        parseInt(String(Number(amount1) * 10 ** token1.decimals)),
        parseInt(String(Number(slippageAmount0) * 10 ** token0.decimals)),
        parseInt(String(Number(slippageAmount1) * 10 ** token1.decimals)),
      )

      setisTransactionPending(true)
      try {
        const response = await signAndSubmitTransaction(payload)
        await provider.waitForTransaction(response?.hash)
        if (!response?.output.success) return
        const toastId = `completed:${response?.hash}`
        const summery = poolReserves
          ? `Successfully added liquidity to the ${token0.symbol}/${token1.symbol} pair`
          : `Created the ${token0.symbol}/${token1.symbol} liquidity pool`
        createToast({
          summery: summery,
          toastId: toastId,
        })
        setisTransactionPending(false)
        close()
        setAmount0('')
        setAmount1('')
      } catch (_e) {
        const toastId = `failed:${Math.random()}`
        createToast({ summery: 'User rejected request', toastId: toastId })
      } finally {
        setisTransactionPending(false)
      }
    },
    [
      swapContract,
      network,
      token0,
      token1,
      setAmount0,
      setAmount1,
      setisTransactionPending,
      signAndSubmitTransaction,
      amount0,
      amount1,
      slippageAmount0,
      slippageAmount1,
      poolReserves,
    ],
  )

  const value0 = amount0 && token0Price ? Number(amount0) * token0Price : 0
  const value1 = amount1 && token1Price ? Number(amount1) * token1Price : 0

  return (
    <DialogProvider>
      <DialogReview>
        {({ confirm }) => (
          <>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogHeader>Add Liquidity</DialogHeader>
                <DialogDescription>
                  Please review your entered details.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <List>
                  <List.Control>
                    <List.KeyValue
                      flex
                      title={token0.symbol}
                      className="!items-start"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <CurrencyIcon
                            currency={token0}
                            width={26}
                            height={26}
                          />
                          {amount0} {token0.symbol}
                        </div>
                        <span className="text-xs font-normal text-gray-600 dark:text-slate-400">
                          {formatUSD(value0)}
                        </span>
                      </div>
                    </List.KeyValue>
                    <List.KeyValue
                      flex
                      title={token1.symbol}
                      className="!items-start"
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <CurrencyIcon
                            currency={token1}
                            width={26}
                            height={26}
                          />
                          {amount1} {token1.symbol}
                        </div>
                        <span className="text-xs font-normal text-gray-600 dark:text-slate-400">
                          {formatUSD(value1)}
                        </span>
                      </div>
                    </List.KeyValue>
                  </List.Control>
                </List>
              </div>
              <DialogFooter>
                <Button
                  disabled={false}
                  loading={false}
                  onClick={() => addLiquidity(confirm)}
                  fullWidth
                  size="xl"
                >
                  Add Liquidity
                </Button>
              </DialogFooter>
            </DialogContent>
          </>
        )}
      </DialogReview>
    </DialogProvider>
  )
}
