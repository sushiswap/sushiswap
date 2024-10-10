import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Provider } from 'aptos'
import { networkNameToNetwork } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { createToast } from '~aptos/_common/ui/toast'

import { useIsMounted } from '@sushiswap/hooks'
import { Button, Dots } from '@sushiswap/ui'
import {
  Card,
  Message,
  Widget,
  WidgetDescription,
  WidgetFooter,
  WidgetHeader,
  WidgetTitle,
} from '@sushiswap/ui'
import { FC, useState } from 'react'
import { Pool } from '~aptos/pool/lib/convert-pool-to-sushi-pool'

interface AddSectionStakeProps {
  pool: Pool
  balance: number
  decimals: number
  lpTokenName: string | undefined
}

export const RemoveSectionUnstake: FC<AddSectionStakeProps> = ({
  pool,
  balance,
  decimals,
  lpTokenName,
}) => {
  const isMounted = useIsMounted()
  if (!isMounted) return <></>
  return (
    <_RemoveSectionUnstake
      pool={pool}
      balance={balance}
      decimals={decimals}
      lpTokenName={lpTokenName}
    />
  )
}

export const _RemoveSectionUnstake: FC<AddSectionStakeProps> = ({
  pool,
  balance,
  decimals,
  lpTokenName,
}) => {
  const [value, setValue] = useState(0)
  const toRemove = Number(value / 100) * balance

  const {
    network,
    contracts: { swap: swapContract, masterchef: masterchefContract },
  } = useNetwork()

  const { signAndSubmitTransaction } = useWallet()
  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)
  const withdrawLiquidity = async () => {
    if (!masterchefContract || !decimals) return

    const provider = new Provider(networkNameToNetwork(network))
    setTransactionPending(true)

    try {
      const response = await signAndSubmitTransaction({
        data: {
          typeArguments: [`${swapContract}::swap::LPToken<${pool.id}>`],
          functionArguments: [parseInt(String(Number(value) * 10 ** decimals))],
          function: `${masterchefContract}::masterchef::withdraw`,
        },
      })
      await provider.waitForTransaction(response?.hash)
      //return from here if response is failed
      if (!response?.output.success) return
      const toastId = `completed:${response?.hash}`
      createToast({
        summery: `Successfully unstaked ${toRemove} ${lpTokenName} tokens`,
        toastId: toastId,
      })
    } catch (err) {
      console.log(err)
      const toastId = `failed:${Math.random()}`
      createToast({
        summery: `Something went wrong when unstaking ${lpTokenName} tokens`,
        toastId: toastId,
      })
    } finally {
      setTransactionPending(false)
    }
  }

  return (
    <Widget id="stakeLiquidity" variant="empty">
      <WidgetHeader>
        <WidgetTitle>Unstake Liquidity</WidgetTitle>
        <WidgetDescription>
          Unstake your liquidity tokens first if you mean to remove your
          liquidity position
        </WidgetDescription>
      </WidgetHeader>
      {balance <= 0 ? (
        <Message variant="warning" size="sm" className="mb-4">
          We could not find any staked LP tokens for unstaking.
        </Message>
      ) : null}
      <div className={balance <= 0 ? 'opacity-40 pointer-events-none' : ''}>
        <div className="flex flex-col gap-6">
          <Card variant="outline" className="p-6">
            <div className="flex justify-between gap-4">
              <div>
                <h1 className="py-1 text-3xl text-gray-900 dark:text-slate-50">
                  {value}%
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  fullWidth
                  size="sm"
                  variant={value === 25 ? 'default' : 'secondary'}
                  onClick={() => setValue(25)}
                  testId="unstake-25"
                >
                  25%
                </Button>
                <Button
                  fullWidth
                  size="sm"
                  variant={value === 50 ? 'default' : 'secondary'}
                  onClick={() => setValue(50)}
                  testId="unstake-50"
                >
                  50%
                </Button>
                <Button
                  fullWidth
                  size="sm"
                  variant={value === 75 ? 'default' : 'secondary'}
                  onClick={() => setValue(75)}
                  testId="unstake-75"
                >
                  75%
                </Button>
                <Button
                  fullWidth
                  size="sm"
                  variant={value === 100 ? 'default' : 'secondary'}
                  onClick={() => setValue(100)}
                  testId="unstake-max"
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="px-1 pt-2 pb-3">
              <input
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                type="range"
                min="1"
                max="100"
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
              />
            </div>
          </Card>
        </div>
        <WidgetFooter>
          {toRemove > balance ? (
            <Button fullWidth size="default" disabled testId="stake-liquidity">
              Insufficient Balance
            </Button>
          ) : (
            <Button
              onClick={Number(value) > 0 ? withdrawLiquidity : () => {}}
              fullWidth
              size="default"
              disabled={isTransactionPending || !value}
              testId="unstake-liquidity"
            >
              {isTransactionPending ? (
                <Dots>Confirm transaction</Dots>
              ) : (
                'Unstake Liquidity'
              )}
            </Button>
          )}
        </WidgetFooter>
      </div>
    </Widget>
  )
}
