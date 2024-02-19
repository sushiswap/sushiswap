import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Button, IconButton } from '@sushiswap/ui'
import Loading from 'app/loading'
import { Provider } from 'aptos'
import { ContentBlock } from 'components/ContentBlock'
import { Layout } from 'components/Layout'
import TradeInput from 'components/TradeInput'
import { createToast } from 'components/toast'
import { providerNetwork } from 'lib/constants'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import getTokenFromAddress from 'utils/getTokenFromAddress'
import { liquidityArgs } from 'utils/liquidityPayload'
import { useAccount } from 'utils/useAccount'
import { useTokenBalance } from 'utils/useTokenBalance'
import { getPoolPairs, usePoolPairs } from 'utils/utilFunctions'
import { AddLiquidityButton } from './AddLiquidityButton'
import { AddSectionReviewModal } from './AddSectionReviewModel'
import { usePoolActions, usePoolState } from './PoolProvider'

export function Add() {
  // const router = useRouter()
  const { isLoadingAccount } = useAccount()
  usePoolPairs()

  return (
    <>
      {isLoadingAccount && <Loading />}
      <Layout className="flex justify-center">
        <div className="flex flex-col gap-2">
          <Link
            className="flex items-center gap-4 mb-2 group"
            href="/pool"
            shallow={true}
          >
            <IconButton icon={ArrowLeftIcon} size="sm" name="arrow" />
            <span className="group-hover:opacity-[1] transition-all opacity-0 text-sm font-medium">
              Go back to pools list
            </span>
          </Link>
          <h1 className="mt-2 text-3xl font-medium">Add Liquidity</h1>
        </div>
        <div className="grid grid-cols-1 sm:w-[340px] md:w-[572px] gap-10">
          <div className="hidden md:block">
            <_Add />
          </div>
        </div>
      </Layout>
    </>
  )
}

const _Add: FC = () => {
  const {
    setToken0,
    setToken1,
    setAmount0,
    setAmount1,
    setisTransactionPending,
  } = usePoolActions()
  const {
    token0,
    token1,
    amount0,
    amount1,
    isPriceFetching,
    poolPairRatio,
    pairs,
  } = usePoolState()
  const { account, signAndSubmitTransaction, connected } = useWallet()
  const [error0, setError0] = useState('')
  const [error1, setError1] = useState('')

  type payloadType = {
    type: string
    type_arguments: string[]
    arguments: number[]
    function: string
  }

  const addLiquidity = async (close: () => void) => {
    const provider = new Provider(providerNetwork)
    const payload: payloadType = liquidityArgs(
      token0.address,
      token1.address,
      parseInt(String(Number(amount0) * 10 ** token0.decimals)),
      parseInt(String(Number(amount1) * 10 ** token1.decimals)),
    )
    setisTransactionPending(true)
    if (!account) return []
    try {
      const response: any = await signAndSubmitTransaction(payload)
      await provider.waitForTransaction(response?.hash)
      if (!response?.success) return
      const toastId = `completed:${response?.hash}`
      const summery = pairs
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
  }

  const { data: balance0, isLoading: isLoadingBalance0 } = useTokenBalance({
    account: account?.address as string,
    currency: token0.address,
  })
  const { data: balance1, isLoading: isLoadingBalance1 } = useTokenBalance({
    account: account?.address as string,
    currency: token1.address,
  })

  const tradeVal = useRef<HTMLInputElement>(null)
  const tradeVal1 = useRef<HTMLInputElement>(null)
  const onChangeToken0TypedAmount = useCallback(
    (value: string) => {
      PoolInputBalance0(value)
      setAmount0(value)
      if (pairs?.data) {
        if (value) {
          setAmount1(
            String(
              parseFloat(
                (parseFloat(value) * poolPairRatio).toFixed(token1.decimals),
              ),
            ),
          )
        } else {
          setAmount1('')
        }
      }
    },
    [poolPairRatio, balance0],
  )

  const searchParams = useSearchParams()
  const token0Address = searchParams.get('token0')
  const token1Address = searchParams.get('token1')

  useEffect(() => {
    const _token0 = getTokenFromAddress(token0Address)
    const _token1 = getTokenFromAddress(token1Address)
    if (_token0) setToken0(_token0)
    if (_token1) setToken1(_token1)
  }, [])

  const onChangeToken1TypedAmount = useCallback(
    (value: string) => {
      PoolInputBalance1(value)
      setAmount1(value)
      if (pairs?.data) {
        if (value) {
          setAmount0(
            String(
              parseFloat(
                (parseFloat(value) / poolPairRatio).toFixed(token0.decimals),
              ),
            ),
          )
        } else {
          setAmount0('')
        }
      }
    },
    [poolPairRatio, balance1],
  )

  useEffect(() => {
    onChangeToken0TypedAmount(String(amount0))
  }, [onChangeToken0TypedAmount, amount0])

  useEffect(() => {
    PoolInputBalance1(String(amount1))
  }, [amount1])

  const PoolInputBalance0 = (tradeVal: string) => {
    const regexPattern = /^[0-9]*(\.[0-9]*)?$/
    if (regexPattern.test(tradeVal)) {
      setAmount0(tradeVal)
    }
    if (connected && balance0) {
      const priceEst = balance0 / 10 ** token0.decimals < parseFloat(tradeVal)
      if (priceEst) {
        setError0('Exceeds Balance')
      } else {
        setError0('')
      }
    }
  }

  const PoolInputBalance1 = (tradeVal1: string) => {
    const regexPattern = /^[0-9]*(\.[0-9]*)?$/
    if (regexPattern.test(tradeVal1)) {
      setAmount1(tradeVal1)
    }
    if (connected && balance1) {
      const priceEst = balance1 / 10 ** token1.decimals < parseFloat(tradeVal1)
      if (priceEst) {
        setError1('Exceeds Balance')
      } else {
        setError1('')
      }
    }
  }

  const swapTokenIfAlreadySelected = () => {
    setToken0(token1)
    setToken1(token0)
  }

  return (
    <>
      <div className="flex flex-col order-3 gap-[64px] pb-40 sm:order-2">
        <ContentBlock
          title={
            <span className="text-gray-900 dark:text-white">Deposit.</span>
          }
        >
          <div className="flex flex-col gap-4">
            <TradeInput
              id={'liquidity-from'}
              token={token0}
              alteredSelected={token1}
              value={String(amount0)}
              setToken={setToken0}
              balance={balance0}
              error={error0}
              isLoadingPrice={isLoadingBalance0 || isPriceFetching}
              onUserInput={onChangeToken0TypedAmount}
              tradeVal={tradeVal}
              setAmount={setAmount0}
              type="INPUT"
              handleSwap={swapTokenIfAlreadySelected}
              className="border border-accent p-3 bg-white dark:bg-slate-800 rounded-xl"
            />
            <div className="flex items-center justify-center mt-[-24px] mb-[-24px] z-10">
              <div className="p-1 bg-white dark:bg-slate-900 border border-accent rounded-full">
                <PlusIcon
                  width={16}
                  height={16}
                  className="text-muted-foreground"
                />
              </div>
            </div>
            <TradeInput
              alteredSelected={token0}
              id={'liquidity-to'}
              token={token1}
              value={String(amount1)}
              setToken={setToken1}
              balance={balance1}
              error={error1}
              isLoadingPrice={isLoadingBalance1 || isPriceFetching}
              onUserInput={onChangeToken1TypedAmount}
              tradeVal={tradeVal1}
              setAmount={setAmount1}
              type="INPUT"
              handleSwap={swapTokenIfAlreadySelected}
              className="border border-accent p-3 bg-white dark:bg-slate-800 rounded-xl"
            />
            <AddLiquidityButton
              buttonError={error0 || error1}
              token1Value={String(amount0)}
            />
          </div>
        </ContentBlock>
        <AddSectionReviewModal>
          {({ close }) => (
            <Button
              size="xl"
              fullWidth
              onClick={() => {
                addLiquidity(close)
              }}
            >
              Add
            </Button>
          )}
        </AddSectionReviewModal>
      </div>
    </>
  )
}
