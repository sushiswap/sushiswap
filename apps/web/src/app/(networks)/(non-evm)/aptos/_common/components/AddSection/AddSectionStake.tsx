import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Transition } from '@headlessui/react'
import { Button, Dots } from '@sushiswap/ui'
import { Provider } from 'aptos'
import { FC, Fragment, useState } from 'react'
import { networkNameToNetwork } from '~aptos/_common/config/chains'
import { useNetwork } from '~aptos/_common/lib/common/use-network'
import { Token } from '~aptos/_common/lib/types/token'
import { createToast } from '~aptos/_common/ui/toast'
import { Pool } from '~aptos/pool/lib/convert-pool-to-sushi-pool'
import { AddSectionStakeWidget } from './AddSectionStakeWidget'

interface AddSectionStakeProps {
  pool: Pool
  title?: string
  token0: Token
  token1: Token
  balance: number
  decimals: number | undefined
  lpTokenName: string | undefined
  price: number
}

export const AddSectionStake: FC<{
  title?: string
  token0: Token
  token1: Token
  balance: number
  decimals: number | undefined
  lpTokenName: string | undefined
  price: number
  pool: Pool
}> = ({
  title,
  token0,
  token1,
  balance,
  decimals,
  lpTokenName,
  price,
  pool,
}) => {
  return (
    <Transition
      appear
      show={true}
      enter="transition duration-300 origin-center ease-out"
      enterFrom="transform scale-90 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform opacity-100"
      leaveTo="transform opacity-0"
    >
      <_AddSectionStake
        pool={pool}
        title={title}
        token0={token0}
        token1={token1}
        balance={balance}
        decimals={decimals}
        lpTokenName={lpTokenName}
        price={price}
      />
    </Transition>
  )
}

const _AddSectionStake: FC<AddSectionStakeProps> = ({
  title,
  token0,
  token1,
  balance,
  decimals,
  lpTokenName,
  price,
  pool,
}) => {
  const [hover, setHover] = useState(false)
  const [value, setValue] = useState('')
  const { signAndSubmitTransaction } = useWallet()

  const {
    network,
    contracts: { swap: swapContract, masterchef: masterchefContract },
  } = useNetwork()

  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)

  const depositeLiquidity = async () => {
    if (!masterchefContract || decimals === undefined) return

    const provider = new Provider(networkNameToNetwork(network))
    setTransactionPending(true)

    try {
      const response = await signAndSubmitTransaction({
        data: {
          typeArguments: [`${swapContract}::swap::LPToken<${pool.id}>`],
          functionArguments: [parseInt(String(Number(value) * 10 ** decimals))],
          function: `${masterchefContract}::masterchef::deposit`,
        },
      })
      await provider.waitForTransaction(response?.hash)
      //return from here if response is failed
      if (!response?.output.success) return
      const toastId = `completed:${response?.hash}`
      createToast({
        summery: `Successfully staked ${value} ${lpTokenName} tokens`,
        toastId: toastId,
      })
      setTransactionPending(false)
    } catch (err) {
      console.log(err)
      const toastId = `failed:${Math.random()}`
      createToast({
        summery: `Something went wrong when staking ${lpTokenName} tokens`,
        toastId: toastId,
      })
    } finally {
      setTransactionPending(false)
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Transition
        show={Boolean(hover && balance <= 0)}
        as={Fragment}
        enter="transition duration-300 origin-center ease-out"
        enterFrom="transform opacity-0"
        enterTo="transform opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform opacity-100"
        leaveTo="transform opacity-0"
      >
        <div className="border dark:border-slate-200/5 border-gray-900/5 flex justify-center items-center z-[100] absolute inset-0 backdrop-blur bg-black bg-opacity-[0.24] rounded-2xl">
          <span className="bg-white bg-opacity-[0.12] rounded-full p-2 px-3 text-sm font-semibold">
            No liquidity tokens found, did you add liquidity first?
          </span>
        </div>
      </Transition>
      <div className={''}>
        <AddSectionStakeWidget
          title={title}
          value={value}
          setValue={setValue}
          token0={token0}
          token1={token1}
          balance={balance}
          price={price}
        >
          <Button
            onClick={Number(value) > 0 ? depositeLiquidity : () => {}}
            fullWidth
            size="default"
            disabled={isTransactionPending || !value}
            testId="stake-liquidity"
          >
            {Number(value) > balance ? (
              <Button size="xl" disabled testId="stake-liquidity">
                Insufficient Balance
              </Button>
            ) : (
              <Button
                onClick={Number(value) > 0 ? depositeLiquidity : () => {}}
                fullWidth
                size="xl"
                disabled={isTransactionPending || !value}
                testId="stake-liquidity"
              >
                {isTransactionPending ? (
                  <Dots>Confirm transaction</Dots>
                ) : (
                  'Stake Liquidity'
                )}
              </Button>
            )}
          </Button>
        </AddSectionStakeWidget>
      </div>
    </div>
  )
}
