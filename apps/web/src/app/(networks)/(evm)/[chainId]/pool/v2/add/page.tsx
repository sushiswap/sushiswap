'use client'

import { PlusIcon } from '@heroicons/react-v1/solid'
import { FormSection } from '@sushiswap/ui'
import { Button } from '@sushiswap/ui'
import { Loader } from '@sushiswap/ui'
import { useRouter } from 'next/navigation'
import React, {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DISABLED_CHAIN_IDS } from 'src/config'
import { APPROVE_TAG_ADD_LEGACY } from 'src/lib/constants'
import { isSushiSwapV2Pool } from 'src/lib/functions'
import { ChainId, ChainKey, TESTNET_CHAIN_IDS } from 'sushi/chain'
import {
  SUSHISWAP_V2_ROUTER_ADDRESS,
  SUSHISWAP_V2_SUPPORTED_CHAIN_IDS,
  defaultCurrency,
  defaultQuoteCurrency,
  isSushiSwapV2ChainId,
  isWNativeSupported,
} from 'sushi/config'
import { Amount, Type, tryParseAmount } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import { SushiSwapV2Pool } from 'sushi/pool/sushiswap-v2'
import { SWRConfig } from 'swr'

import { Web3Input } from 'src/lib/wagmi/components/web3-input'
import { SushiSwapV2PoolState } from 'src/lib/wagmi/hooks/pools/hooks/useSushiSwapV2Pools'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import { CheckerProvider } from 'src/lib/wagmi/systems/Checker/Provider'
import { PoolFinder } from 'src/lib/wagmi/systems/PoolFinder/PoolFinder'
import { AddSectionPoolShareCardV2 } from 'src/ui/pool/AddSectionPoolShareCardV2'
import { AddSectionReviewModalLegacy } from 'src/ui/pool/AddSectionReviewModalLegacy'
import { SelectNetworkWidget } from 'src/ui/pool/SelectNetworkWidget'
import { SelectTokensWidget } from 'src/ui/pool/SelectTokensWidget'
import notFound from '../../../not-found'

export default function Page({ params }: { params: { chainId: string } }) {
  const chainId = +params.chainId as ChainId
  if (!isSushiSwapV2ChainId(chainId)) {
    return notFound(chainId)
  }

  const router = useRouter()
  const [token0, setToken0] = useState<Type | undefined>(
    defaultCurrency[chainId as keyof typeof defaultCurrency],
  )
  const [token1, setToken1] = useState<Type | undefined>(
    defaultQuoteCurrency[chainId as keyof typeof defaultQuoteCurrency],
  )

  useEffect(() => {
    setToken0(defaultCurrency[chainId as keyof typeof defaultCurrency])
    setToken1(
      defaultQuoteCurrency[chainId as keyof typeof defaultQuoteCurrency],
    )
  }, [chainId])

  return (
    <SWRConfig>
      <PoolFinder
        components={
          <PoolFinder.Components>
            <PoolFinder.SushiSwapV2Pool
              chainId={chainId}
              token0={token0}
              token1={token1}
              enabled={isSushiSwapV2ChainId(chainId)}
            />
          </PoolFinder.Components>
        }
      >
        {({ pool: [poolState, pool] }) => {
          const title =
            !token0 || !token1 ? (
              'Select Tokens'
            ) : [SushiSwapV2PoolState.LOADING].includes(
                poolState as SushiSwapV2PoolState,
              ) ? (
              <div className="h-[20px] flex items-center justify-center">
                <Loader width={14} />
              </div>
            ) : [SushiSwapV2PoolState.EXISTS].includes(
                poolState as SushiSwapV2PoolState,
              ) ? (
              'Add Liquidity'
            ) : (
              'Create Pool'
            )

          return (
            <_Add
              chainId={chainId}
              setChainId={(chainId) => {
                if (!isSushiSwapV2ChainId(chainId)) return
                router.push(`/${ChainKey[chainId]}/pool/v2/add`)
              }}
              pool={pool as SushiSwapV2Pool | null}
              poolState={poolState as SushiSwapV2PoolState}
              title={title}
              token0={token0}
              token1={token1}
              setToken0={setToken0}
              setToken1={setToken1}
            />
          )
        }}
      </PoolFinder>
    </SWRConfig>
  )
}

interface AddProps {
  chainId: ChainId
  setChainId(chainId: ChainId): void
  pool: SushiSwapV2Pool | null
  poolState: SushiSwapV2PoolState
  title: ReactNode
  token0: Type | undefined
  token1: Type | undefined
  setToken0: Dispatch<SetStateAction<Type | undefined>>
  setToken1: Dispatch<SetStateAction<Type | undefined>>
}

const _Add: FC<AddProps> = ({
  chainId,
  setChainId,
  pool,
  poolState,
  title,
  token0,
  token1,
  setToken0,
  setToken1,
}) => {
  const [independendField, setIndependendField] = useState(0)

  const [{ input0, input1 }, setTypedAmounts] = useState<{
    input0: string
    input1: string
  }>({ input0: '', input1: '' })

  const [parsedInput0, parsedInput1] = useMemo(() => {
    if (!token0 || !token1) return [undefined, undefined]

    return [
      tryParseAmount(input0, token0) || Amount.fromRawAmount(token0, 0),
      tryParseAmount(input1, token1) || Amount.fromRawAmount(token1, 0),
    ]
  }, [input0, input1, token0, token1])

  const noLiquidity = useMemo(() => {
    return pool?.reserve0.equalTo(ZERO) && pool.reserve1.equalTo(ZERO)
  }, [pool])

  const onChangeToken0TypedAmount = useCallback(
    (value: string) => {
      setIndependendField(0)
      if (poolState === SushiSwapV2PoolState.NOT_EXISTS || noLiquidity) {
        setTypedAmounts((prev) => ({
          ...prev,
          input0: value,
        }))
      } else if (token0 && pool) {
        setTypedAmounts({
          input0: value,
          input1: '',
        })
      }
    },
    [noLiquidity, pool, poolState, token0],
  )

  const onChangeToken1TypedAmount = useCallback(
    (value: string) => {
      setIndependendField(1)
      if (poolState === SushiSwapV2PoolState.NOT_EXISTS || noLiquidity) {
        setTypedAmounts((prev) => ({
          ...prev,
          input1: value,
        }))
      } else if (token1 && pool) {
        setTypedAmounts({
          input0: '',
          input1: value,
        })
      }
    },
    [noLiquidity, pool, poolState, token1],
  )

  const networks = useMemo(
    () =>
      SUSHISWAP_V2_SUPPORTED_CHAIN_IDS.filter(
        (chainId) =>
          !TESTNET_CHAIN_IDS.includes(
            chainId as (typeof TESTNET_CHAIN_IDS)[number],
          ) &&
          !DISABLED_CHAIN_IDS.includes(
            chainId as (typeof DISABLED_CHAIN_IDS)[number],
          ),
      ),
    [],
  )

  const _setToken0 = useCallback(
    (token: Type | undefined) => {
      if (token?.id === token1?.id) return
      setIndependendField(1)
      setTypedAmounts((prev) => ({ ...prev, input0: '' }))
      setToken0(token)
    },
    [setToken0, token1],
  )

  const _setToken1 = useCallback(
    (token: Type | undefined) => {
      if (token?.id === token0?.id) return
      setIndependendField(0)
      setTypedAmounts((prev) => ({ ...prev, input1: '' }))
      setToken1(token)
    },
    [setToken1, token0],
  )

  useEffect(() => {
    // Includes !!pool
    if (
      pool?.reserve0.greaterThan(0) &&
      pool.reserve1.greaterThan(0) &&
      token0 &&
      token1
    ) {
      if (independendField === 0) {
        const parsedAmount = tryParseAmount(input0, token0)
        setTypedAmounts({
          input0,
          input1: parsedAmount
            ? pool.priceOf(token0.wrapped).quote(parsedAmount.wrapped).toExact()
            : '',
        })
      }

      if (independendField === 1) {
        const parsedAmount = tryParseAmount(input1, token1)
        setTypedAmounts({
          input0: parsedAmount
            ? pool.priceOf(token1.wrapped).quote(parsedAmount.wrapped).toExact()
            : '',
          input1,
        })
      }
    }
  }, [independendField, pool, input0, input1, token0, token1])

  return (
    <>
      <SelectNetworkWidget
        networks={networks}
        selectedNetwork={chainId}
        onSelect={setChainId}
      />
      <SelectTokensWidget
        chainId={chainId}
        token0={token0}
        token1={token1}
        setToken0={_setToken0}
        setToken1={_setToken1}
        includeNative={isWNativeSupported(chainId)}
      />
      <FormSection
        title="Deposit"
        description="Select the amount of tokens you want to deposit"
      >
        <div className="flex flex-col gap-4">
          <Web3Input.Currency
            id="add-liquidity-token0"
            type="INPUT"
            className="p-3 bg-white dark:bg-slate-800 rounded-xl"
            chainId={chainId}
            value={input0}
            onChange={onChangeToken0TypedAmount}
            onSelect={_setToken0}
            currency={token0}
            disabled={
              !token0 ||
              poolState === SushiSwapV2PoolState.LOADING ||
              poolState === SushiSwapV2PoolState.INVALID
            }
            loading={poolState === SushiSwapV2PoolState.LOADING}
            allowNative={isWNativeSupported(chainId)}
          />
          <div className="left-0 right-0 mt-[-24px] mb-[-24px] flex items-center justify-center">
            <button
              type="button"
              className="z-10 p-2 bg-gray-100 rounded-full dark:bg-slate-900"
            >
              <PlusIcon
                strokeWidth={3}
                className="w-4 h-4 dark:text-slate-400 text-slate-600"
              />
            </button>
          </div>
          <Web3Input.Currency
            id="add-liquidity-token1"
            type="INPUT"
            className="p-3 bg-white dark:bg-slate-800 rounded-xl"
            chainId={chainId}
            value={input1}
            onChange={onChangeToken1TypedAmount}
            onSelect={_setToken1}
            currency={token1}
            disabled={
              !token1 ||
              poolState === SushiSwapV2PoolState.LOADING ||
              poolState === SushiSwapV2PoolState.INVALID
            }
            loading={poolState === SushiSwapV2PoolState.LOADING}
            allowNative={isWNativeSupported(chainId)}
          />
          <AddSectionPoolShareCardV2
            pool={pool}
            poolState={poolState}
            input0={parsedInput0}
            input1={parsedInput1}
          />
          <CheckerProvider>
            <Checker.Connect fullWidth>
              <Checker.Network fullWidth chainId={chainId}>
                <Checker.Amounts
                  fullWidth
                  chainId={chainId}
                  amounts={[parsedInput0, parsedInput1]}
                >
                  {(!pool || isSushiSwapV2Pool(pool)) &&
                    isSushiSwapV2ChainId(chainId) && (
                      <>
                        <Checker.ApproveERC20
                          id="approve-token-0"
                          className="whitespace-nowrap"
                          fullWidth
                          amount={parsedInput0}
                          contract={SUSHISWAP_V2_ROUTER_ADDRESS[chainId]}
                        >
                          <Checker.ApproveERC20
                            id="approve-token-1"
                            className="whitespace-nowrap"
                            fullWidth
                            amount={parsedInput1}
                            contract={SUSHISWAP_V2_ROUTER_ADDRESS[chainId]}
                          >
                            <Checker.Success tag={APPROVE_TAG_ADD_LEGACY}>
                              <AddSectionReviewModalLegacy
                                poolAddress={pool?.liquidityToken.address}
                                poolState={poolState as SushiSwapV2PoolState}
                                chainId={chainId}
                                token0={token0}
                                token1={token1}
                                input0={parsedInput0}
                                input1={parsedInput1}
                                onSuccess={() => {
                                  setTypedAmounts({ input0: '', input1: '' })
                                }}
                              >
                                <Button
                                  size="xl"
                                  fullWidth
                                  testId="add-liquidity"
                                >
                                  {title}
                                </Button>
                              </AddSectionReviewModalLegacy>
                            </Checker.Success>
                          </Checker.ApproveERC20>
                        </Checker.ApproveERC20>
                      </>
                    )}
                </Checker.Amounts>
              </Checker.Network>
            </Checker.Connect>
          </CheckerProvider>
        </div>
      </FormSection>
    </>
  )
}
