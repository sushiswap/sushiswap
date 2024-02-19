import { classNames } from '@sushiswap/ui'
import React, { FC, ReactNode } from 'react'

export interface OverlayActionProps {
  className?: string
  children: ReactNode | ReactNode[]
}

export const Actions: FC<OverlayActionProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(
        className,
        'h-[68px] items-center justify-center absolute left-0 right-0 bottom-0 px-3 flex flex-col sm:flex-row-reverse gap-3',
      )}
    >
      {children}
    </div>
  )
}
