'use client'

import { Button, Dots } from '@sushiswap/ui'
import { useMemo, useState } from 'react'
import { APPROVE_TAG_STAKE } from 'src/lib/constants'
import { useBarDeposit } from 'src/lib/wagmi/hooks/bar/useBarDeposit'
import { Checker } from 'src/lib/wagmi/systems/Checker'
import {
  CheckerProvider,
  useApproved,
} from 'src/lib/wagmi/systems/Checker/Provider'
import { ChainId } from 'sushi/chain'
import { SUSHI, XSUSHI_ADDRESS, tryParseAmount } from 'sushi/currency'
import { ZERO } from 'sushi/math'
import { StakeSectionWidget } from './StakeSectionWidget'

const _StakeSection = () => {
  const { approved } = useApproved(APPROVE_TAG_STAKE)

  const [input, setInput] = useState('')

  const parsedInput = useMemo(() => {
    return tryParseAmount(input, SUSHI[ChainId.ETHEREUM])
  }, [input])

  const { write, isPending: isWritePending } = useBarDeposit({
    amount: parsedInput,
    enabled: Boolean(approved && parsedInput?.greaterThan(ZERO)),
  })

  return (
    <StakeSectionWidget
      input={input}
      parsedInput={parsedInput}
      onInput={setInput}
    >
      <Checker.Connect size="xl" fullWidth>
        <Checker.Network
          size="xl"
          fullWidth
          chainId={ChainId.ETHEREUM}
          hoverCardContent={
            <span className="text-xs text-muted-foreground text-center w-full">
              {`Sushi Bar is only available on Ethereum Mainnet. You are
                connected to an unsupported network.`}
            </span>
          }
        >
          <Checker.Amounts
            size="xl"
            fullWidth
            chainId={ChainId.ETHEREUM}
            amount={parsedInput}
          >
            <Checker.ApproveERC20
              size="xl"
              id="approve-sushi"
              className="whitespace-nowrap"
              fullWidth
              amount={parsedInput}
              contract={XSUSHI_ADDRESS[ChainId.ETHEREUM]}
            >
              <Checker.Success tag={APPROVE_TAG_STAKE}>
                <Button
                  size="xl"
                  onClick={() => write?.().then(() => setInput(''))}
                  fullWidth
                  disabled={isWritePending || !approved || !write}
                  testId="stake-sushi"
                >
                  {isWritePending ? <Dots>Confirm transaction</Dots> : 'Stake'}
                </Button>
              </Checker.Success>
            </Checker.ApproveERC20>
          </Checker.Amounts>
        </Checker.Network>
      </Checker.Connect>
    </StakeSectionWidget>
  )
}

export const StakeSection = () => {
  return (
    <CheckerProvider>
      <_StakeSection />
    </CheckerProvider>
  )
}
