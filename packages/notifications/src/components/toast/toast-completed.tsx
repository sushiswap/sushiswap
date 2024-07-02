import type { FC } from 'react'
import { Chain } from 'sushi/chain'

import type { ResolvedNotification } from '../../types'
import { ToastContent } from './toast-content'

interface ToastCompleted extends ResolvedNotification {
  onDismiss(): void
}

export const ToastCompleted: FC<ToastCompleted> = ({
  type: _type,
  href,
  chainId,
  txHash,
  onDismiss: _onDismiss,
  summary,
}) => {
  const txUrl = href
    ? href
    : txHash
      ? Chain.from(chainId)?.getTxUrl(txHash)
      : ''
  return (
    <>
      <ToastContent href={txUrl} summary={summary} />
    </>
  )
}
