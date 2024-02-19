import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { IconButton, classNames } from '@sushiswap/ui'
import { FC } from 'react'

export interface Header {
  title: string
  onBack?(): void
  onClose?(): void
  border?: boolean
  arrowDirection?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export const Header: FC<Header> = ({
  className,
  title,
  border = true,
  onBack,
  onClose,
  arrowDirection = 'left',
}) => {
  return (
    <div
      className={classNames(
        className,
        border ? 'border-b border-slate-200/5' : '',
        'grid grid-cols-[40px_auto_40px] absolute top-0 left-0 right-0 px-3 h-[48px]',
      )}
    >
      {onBack ? (
        <IconButton
          icon={
            arrowDirection === 'left'
              ? ChevronLeftIcon
              : arrowDirection === 'right'
                ? ChevronRightIcon
                : arrowDirection === 'top'
                  ? ChevronUpIcon
                  : ChevronDownIcon
          }
          iconProps={{ className: 'cursor-pointer' }}
          name="back"
          className="flex items-center justify-center gap-2 cursor-pointer"
          onClick={onBack}
        />
      ) : (
        <div />
      )}
      <span
        className={classNames(
          'flex items-center justify-center gap-4 text-lg font-medium leading-6',
        )}
      >
        {title}
      </span>
      {onClose ? (
        <div className="flex items-center justify-end">
          <IconButton
            icon={XMarkIcon}
            name="close"
            className="flex items-center justify-end cursor-pointer"
            onClick={onClose}
          />
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}
