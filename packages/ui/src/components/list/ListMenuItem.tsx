'use client'

import { Transition } from '@headlessui/react'
import { ArrowSmallRightIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import React, { Fragment, ReactNode, useState } from 'react'

import {
  ExtractProps,
  IconComponent,
  PolymorphicComponentProps,
} from '../../types'

interface Props {
  disabled?: boolean
  title: ReactNode
  subtitle?: ReactNode
  hoverIcon?: IconComponent
  hoverIconProps?: Omit<React.ComponentProps<'svg'>, 'width' | 'height'> & {
    width: number
    height: number
  }
}

export type ListMenuItemProps<
  P extends React.ElementType,
  C extends React.ElementType,
> = {
  icon?: P
  iconProps?: ExtractProps<P> & {
    width?: number
    height?: number
    className?: string
  }
} & PolymorphicComponentProps<C, Props>

export type ListMenuItemComponent = <
  P extends React.ElementType = 'svg',
  C extends React.ElementType = 'button',
>(
  props: ListMenuItemProps<P, C>,
) => React.ReactElement | null

export const ListMenuItem: ListMenuItemComponent = ({
  as,
  icon: Icon,
  iconProps,
  subtitle,
  title,
  onClick,
  hoverIcon: HoverIcon,
  hoverIconProps,
  className,
  disabled = false,
  ...rest
}) => {
  const Component = as || 'button'

  const [hover, setHover] = useState(false)
  return (
    <Component
      {...rest}
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className={classNames(
        className,
        disabled ? 'opacity-40 !pointer-events-none cursor-default' : '',
        subtitle ? 'items-start' : 'items-center',
        'hover:bg-muted relative flex gap-4 px-3 py-3 w-full cursor-pointer rounded-xl',
      )}
    >
      {Icon && (
        <div
          style={{
            minWidth: iconProps?.width ?? 18,
            minHeight: iconProps?.height ?? 18,
            paddingTop: subtitle ? 1 : 0,
          }}
        >
          {React.createElement(Icon, {
            ...iconProps,
            width: 18,
            height: 18,
            strokeWidth: 2,
            className: classNames(iconProps?.className, 'text-blue-500'),
          })}
        </div>
      )}
      <div className="flex flex-col gap-0.5 items-start">
        <span className="text-sm font-medium text-gray-900 dark:text-slate-200">
          {title}
        </span>
        {subtitle && (
          <span className="text-sm font-normal text-gray-600 dark:text-slate-400 text-left">
            {subtitle}
          </span>
        )}
      </div>
      <Transition
        as={Fragment}
        show={hover}
        enter="ease-in-out duration-300"
        enterFrom="translate-x-[10px] opacity-0"
        enterTo="translate-x-[-8px] opacity-100"
        leave="ease-in-out duration-300"
        leaveFrom="translate-x-[-8px] opacity-100"
        leaveTo="translate-x-[10px] opacity-0"
        unmount={false}
      >
        <div className="absolute right-0 top-0 bottom-0 flex justify-center items-center">
          {HoverIcon ? (
            <HoverIcon
              {...hoverIconProps}
              width={hoverIconProps?.width ?? 20}
              height={hoverIconProps?.height ?? 20}
            />
          ) : (
            <ArrowSmallRightIcon
              {...hoverIconProps}
              width={hoverIconProps?.width ?? 24}
              height={hoverIconProps?.height ?? 24}
              strokeWidth={hoverIconProps?.strokeWidth ?? 5}
              fill="currentColor"
              className={classNames(hoverIconProps?.className, '!text-blue')}
            />
          )}
        </div>
      </Transition>
    </Component>
  )
}
