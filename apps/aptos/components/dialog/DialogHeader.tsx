import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { IconButton, classNames } from '@sushiswap/ui'
import React, { FC, ReactNode } from 'react'

export interface DialogHeaderProps {
  title: string | ReactNode
  onClose?(): void
  onBack?(): void
  className?: string
  border?: boolean
  children?: ReactNode | ReactNode[]
}

const DialogHeader: FC<DialogHeaderProps> = ({
  title,
  onBack,
  onClose,
  border = true,
  className,
  children,
}) => {
  return (
    <div
      className={classNames(
        className,
        border ? 'border-b border-slate-200/5' : '',
        'grid grid-cols-[40px_auto_40px] items-center absolute top-0 left-0 right-0 px-3 h-12',
      )}
    >
      {onBack ? (
        <IconButton
          icon={ChevronLeftIcon}
          name="back"
          className="flex items-center justify-center w-6 h-6 gap-2 cursor-pointer"
          onClick={onBack}
        />
      ) : (
        <div />
      )}

      <span className="text-lg flex justify-center font-medium leading-6 text-slate-100">
        {title}
      </span>

      <div className="flex justify-end">
        {children ? (
          children
        ) : onClose ? (
          <IconButton
            icon={XMarkIcon}
            name="close"
            className="cursor-pointer"
            onClick={onClose}
          />
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}

export default DialogHeader
