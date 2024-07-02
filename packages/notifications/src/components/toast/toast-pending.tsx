import { Dots } from '@sushiswap/ui'
import type { FC } from 'react'
import { Chain } from 'sushi/chain'

import type { ResolvedNotification } from '../../types'
import { ToastContent } from './toast-content'

interface ToastPending extends ResolvedNotification {
  onDismiss(): void
}

export const ToastPending: FC<ToastPending> = ({
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
      <ToastContent href={txUrl} summary={<Dots>{summary}</Dots>} />
    </>
  )
}
