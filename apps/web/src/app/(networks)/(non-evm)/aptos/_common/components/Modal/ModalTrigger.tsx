import { FC, ReactNode } from 'react'
import { useModal } from './ModalProvider'

export interface ModalTriggerProps {
  tag: string
  children({
    open,
    close,
  }: { open(): void; close(): void; isOpen: boolean }): ReactNode
}

export const ModalTrigger: FC<ModalTriggerProps> = ({ children, tag }) => {
  const { open, close, isOpen } = useModal(tag)
  return <>{children({ open, close, isOpen })}</>
}
