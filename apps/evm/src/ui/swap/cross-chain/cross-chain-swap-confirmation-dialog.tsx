import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import { Button, SquidIcon, classNames } from '@sushiswap/ui'
import { Currency } from '@sushiswap/ui/components/currency'
import { Dots } from '@sushiswap/ui/components/dots'
import { CheckMarkIcon } from '@sushiswap/ui/components/icons/CheckmarkIcon'
import { FailedMarkIcon } from '@sushiswap/ui/components/icons/FailedMarkIcon'
import { Loader } from '@sushiswap/ui/components/loader'
import { FC, ReactNode } from 'react'
import {
  SushiXSwap2Adapter,
  TransactionType,
} from 'src/lib/swap/useCrossChainTrade/SushiXSwap2'
import { Chain } from 'sushi/chain'
import { STARGATE_TOKEN } from 'sushi/config'
import { shortenAddress } from 'sushi/format'
import {
  useCrossChainSwapTrade,
  useDerivedStateCrossChainSwap,
} from './derivedstate-cross-chain-swap-provider'

interface ConfirmationDialogContent {
  txHash?: string
  dstTxHash?: string
  bridgeUrl?: string
  adapter?: SushiXSwap2Adapter
  dialogState: { source: StepState; bridge: StepState; dest: StepState }
}

export const ConfirmationDialogContent: FC<ConfirmationDialogContent> = ({
  txHash,
  bridgeUrl,
  adapter,
  dstTxHash,
  dialogState,
}) => {
  const {
    state: { chainId0, chainId1, token0, token1, recipient },
  } = useDerivedStateCrossChainSwap()
  const { data: trade } = useCrossChainSwapTrade()

  const swapOnDest =
    trade?.transactionType &&
    [TransactionType.BridgeAndSwap, TransactionType.CrossChainSwap].includes(
      trade.transactionType,
    )

  if (dialogState.source === StepState.Sign) {
    return <>Please sign order with your wallet.</>
  }

  if (dialogState.source === StepState.Pending) {
    return (
      <>
        Waiting for your{' '}
        <Button asChild size="sm" variant="link">
          <a
            target="_blank"
            rel="noreferrer noopener noreferer"
            href={txHash ? Chain.from(chainId0)?.getTxUrl(txHash) : ''}
          >
            transaction
          </a>
        </Button>{' '}
        to be confirmed on {Chain.from(chainId0)?.name}
      </>
    )
  }

  if (dialogState.source === StepState.Failed) {
    return (
      <>
        <span className="text-red">Oops!</span> Your{' '}
        <span className="text-blue hover:underline cursor-pointer">
          transaction
        </span>{' '}
        failed
      </>
    )
  }

  if (dialogState.bridge === StepState.Pending) {
    return (
      <>
        Bridging{' '}
        <Button asChild size="sm" variant="link">
          <a
            target="_blank"
            rel="noreferrer noopener noreferer"
            href={bridgeUrl}
            className={classNames(
              !bridgeUrl ? 'cursor-wait' : '',
              'flex items-center gap-1',
            )}
          >
            <Dots>to the destination chain</Dots>
            <ArrowTopRightOnSquareIcon width={16} height={16} />
          </a>
        </Button>{' '}
        <span className="flex items-center gap-1">
          powered by{' '}
          {adapter === SushiXSwap2Adapter.Stargate ? (
            <>
              <div className="min-h-4 min-w-4">
                <Currency.Icon
                  currency={STARGATE_TOKEN}
                  width={16}
                  height={16}
                />
              </div>{' '}
              Stargate
            </>
          ) : (
            <>
              <div className="min-h-4 min-w-4">
                <SquidIcon width={16} height={16} />
              </div>{' '}
              Squid
            </>
          )}
        </span>
      </>
    )
  }

  if (dialogState.dest === StepState.PartialSuccess) {
    return (
      <>
        We {`couldn't`} swap {trade?.dstBridgeToken?.symbol} into{' '}
        {token1?.symbol}, {trade?.dstBridgeToken?.symbol} has been send to{' '}
        {recipient ? (
          <Button asChild size="sm" variant="link">
            <a
              target="_blank"
              rel="noreferrer noopener noreferer"
              href={Chain.from(chainId1)?.getAccountUrl(recipient)}
            >
              <Dots>{shortenAddress(recipient)}</Dots>
            </a>
          </Button>
        ) : (
          'recipient'
        )}
      </>
    )
  }

  if (dialogState.dest === StepState.Success) {
    if (swapOnDest) {
      return (
        <>
          You sold{' '}
          <Button asChild size="sm" variant="link">
            <a
              target="_blank"
              rel="noreferrer noopener noreferer"
              href={txHash ? Chain.from(chainId0)?.getTxUrl(txHash) : ''}
            >
              {trade?.amountIn?.toSignificant(6)} {token0?.symbol}
            </a>
          </Button>{' '}
          for{' '}
          <Button asChild size="sm" variant="link">
            <a
              target="_blank"
              rel="noreferrer noopener noreferer"
              href={dstTxHash ? Chain.from(chainId1)?.getTxUrl(dstTxHash) : ''}
            >
              {trade?.amountOut?.toSignificant(6)} {token1?.symbol}
            </a>
          </Button>
        </>
      )
    } else {
      return (
        <>
          Sent{' '}
          <Button asChild size="sm" variant="link">
            <a
              target="_blank"
              rel="noreferrer noopener noreferer"
              href={dstTxHash ? Chain.from(chainId1)?.getTxUrl(dstTxHash) : ''}
            >
              {trade?.amountOut?.toSignificant(6)} {token1?.symbol}
            </a>
          </Button>{' '}
          to {recipient ? shortenAddress(recipient) : 'recipient'}
        </>
      )
    }
  }

  return <span />
}

export enum StepState {
  Sign = 0,
  NotStarted = 1,
  Pending = 2,
  PartialSuccess = 3,
  Success = 4,
  Failed = 5,
}

export const initState = (state: {
  source: StepState
  bridge: StepState
  dest: StepState
}) => {
  return (
    state.source === StepState.NotStarted &&
    state.bridge === StepState.NotStarted &&
    state.dest === StepState.NotStarted
  )
}

export const pendingState = (state: {
  source: StepState
  bridge: StepState
  dest: StepState
}) => {
  return !finishedState(state) && !failedState(state) && !initState(state)
}

export const finishedState = (state: {
  source: StepState
  bridge: StepState
  dest: StepState
}) => {
  if (state.source === StepState.Failed) return true
  return [
    StepState.Success,
    StepState.Failed,
    StepState.PartialSuccess,
  ].includes(state.dest)
}

export const failedState = (state: {
  source: StepState
  bridge: StepState
  dest: StepState
}) => {
  return state.source === StepState.Failed
}

const Completed = ({ partial }: { partial: boolean }) => {
  return (
    <div className="flex w-10 h-10 justify-center items-center">
      <CheckMarkIcon
        width={40}
        height={40}
        className={partial ? '!text-yellow' : ''}
      />
    </div>
  )
}

const Failed = () => {
  return (
    <div className="flex w-10 h-10 justify-center items-center">
      <FailedMarkIcon width={40} height={40} />
    </div>
  )
}

const Loading = () => (
  <Loader
    circleClassName="!text-blue/[0.15]"
    className="!text-blue"
    size={40}
  />
)

const Pending: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="text-lg w-10 h-10 rounded-full flex justify-center items-center bg-gray-300 text-gray-500 dark:bg-slate-800 dark:text-slate-400 font-semibold">
      {children}
    </div>
  )
}

export const Divider = () => {
  return (
    <div className="h-10 flex justify-center items-center">
      <div className="h-0.5 w-10 bg-gray-200 dark:bg-slate-800 rounded-full" />
    </div>
  )
}

export const GetStateComponent = ({
  state,
  index,
}: { state: StepState; index: number }) => {
  if (state === StepState.NotStarted) return <Pending>{index}</Pending>
  if (state === StepState.Sign) return <Loading />
  if (state === StepState.Pending) return <Loading />
  if (state === StepState.Success) return <Completed partial={false} />
  if (state === StepState.Failed) return <Failed />
  return <Completed partial={true} />
}
