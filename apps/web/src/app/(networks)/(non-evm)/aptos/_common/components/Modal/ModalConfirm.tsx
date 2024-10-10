import { Dialog as HeadlessDialog } from '@headlessui/react'
import { ExtractProps } from '@sushiswap/ui'
import React, { FC } from 'react'
import { ModalPanel } from './ModalPanel'
import { ModalType } from './ModalProvider'

export type ModalConfirmProps = Omit<
  ExtractProps<typeof HeadlessDialog>,
  'open' | 'onClose'
> & {
  tag: string
  afterLeave?(): void
  children: ({ close }: { close: () => void }) => React.ReactNode
  variant?: 'transparent' | 'opaque'
}

export const ModalConfirm: FC<ModalConfirmProps> = (props) => {
  return (
    <ModalPanel {...props} modalType={ModalType.Confirm}>
      {({ close }) => props.children({ close })}
    </ModalPanel>
  )
}
