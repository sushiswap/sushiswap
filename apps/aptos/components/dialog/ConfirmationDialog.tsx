'use client'

import { Button, Dots, Loader } from '@sushiswap/ui'
import { CheckMarkIcon } from '@sushiswap/ui/components/icons/CheckmarkIcon'
import { FailedMarkIcon } from '@sushiswap/ui/components/icons/FailedMarkIcon'
import { FC, ReactNode } from 'react'
import { Chain, ChainId } from 'sushi/dist/chain'
import { Dialog } from './Dialog'

export enum ConfirmationDialogState {
  Undefined = 0,
  Pending = 1,
  Success = 2,
  Failed = 3,
  Sign = 4,
}

interface ConfirmationDialog {
  txHash: string | undefined
  chainId: ChainId
  state: ConfirmationDialogState
  open: boolean
  setOpen(open: boolean): void
  onComplete(): void
  isWritePending: boolean
  successMessage: ReactNode
  buttonSuccessMessage: string
  buttonSuccessLink?: string
  testId?: string
}

export const ConfirmationDialog: FC<ConfirmationDialog> = ({
  txHash,
  chainId,
  state,
  open,
  setOpen,
  isWritePending,
  successMessage,
  buttonSuccessMessage,
  buttonSuccessLink,
  testId,
}) => {
  return (
    <Dialog open={open} unmount={false} onClose={() => setOpen(false)}>
      <Dialog.Content>
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="py-5">
            {state === ConfirmationDialogState.Pending || isWritePending ? (
              <Loader size={100} strokeWidth={1} className="!text-blue" />
            ) : state === ConfirmationDialogState.Success ? (
              <CheckMarkIcon width={100} height={100} />
            ) : (
              <FailedMarkIcon width={100} height={100} />
            )}
          </div>
          <div className="flex flex-col items-center">
            {state === ConfirmationDialogState.Sign ? (
              <h1 className="flex flex-wrap items-center justify-center gap-1 text-lg font-medium leading-normal">
                Please sign order with your wallet.
              </h1>
            ) : state === ConfirmationDialogState.Pending ? (
              <h1 className="flex flex-wrap items-center justify-center gap-1 text-lg font-medium leading-normal">
                Waiting for your{' '}
                <a
                  target="_blank"
                  href={txHash ? Chain.from(chainId)?.getTxUrl(txHash) : ''}
                  className="cursor-pointer text-blue hover:underline"
                  rel="noreferrer"
                >
                  <Dots>transaction</Dots>
                </a>{' '}
                to be confirmed on the blockchain.
              </h1>
            ) : state === ConfirmationDialogState.Success ? (
              successMessage
            ) : (
              <h1 className="flex flex-wrap items-center justify-center gap-1 text-lg font-semibold">
                <span className="text-red">Oops!</span> Your{' '}
                <span className="cursor-pointer text-blue hover:underline">
                  transaction
                </span>{' '}
                failed
              </h1>
            )}
          </div>
          <Button
            {...(buttonSuccessLink
              ? { as: 'a', href: buttonSuccessLink }
              : { onClick: () => setOpen(false) })}
            fullWidth
            color="blue"
            variant="outline"
            size="xl"
            testId={testId}
          >
            {state === ConfirmationDialogState.Success
              ? buttonSuccessMessage
              : state === ConfirmationDialogState.Failed
                ? 'Try again'
                : 'Close'}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
