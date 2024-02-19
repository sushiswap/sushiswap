import { classNames } from '@sushiswap/ui'
import React, { FC, ReactNode } from 'react'

export interface DialogActionProps {
  className?: string
  children: ReactNode | ReactNode[]
}

const DialogActions: FC<DialogActionProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(
        className,
        'h-[68px] items-center absolute left-0 right-0 bottom-0 px-3 flex flex-row-reverse gap-3',
      )}
    >
      {children}
    </div>
  )
}

export default DialogActions
