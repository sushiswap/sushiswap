import type { FC } from 'react'
import { Chain } from 'sushi/chain'

import type { ResolvedNotification } from '../../types'
import { ToastContent } from './toast-content'

interface ToastFailed extends ResolvedNotification {
  onDismiss(): void
}

export const ToastFailed: FC<ToastFailed> = ({
  href,
  type: _type,
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
