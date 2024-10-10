import { FC } from 'react'
import { ModalConfirm, ModalConfirmProps } from './ModalConfirm'
import { ModalPanel, ModalPanelProps } from './ModalPanel'
import { ModalProvider, ModalProviderProps } from './ModalProvider'
import { ModalReview, ModalReviewProps } from './ModalReview'
import { ModalTrigger, ModalTriggerProps } from './ModalTrigger'

type Modal = {
  Panel: FC<ModalPanelProps>
  Provider: FC<ModalProviderProps>
  Trigger: FC<ModalTriggerProps>
  Review: FC<ModalReviewProps>
  Confirm: FC<ModalConfirmProps>
}

export const Modal: Modal = {
  Panel: ModalPanel,
  Provider: ModalProvider,
  Trigger: ModalTrigger,
  Review: ModalReview,
  Confirm: ModalConfirm,
}
