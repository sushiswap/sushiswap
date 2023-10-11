import classNames from 'classnames'
import React, { ReactNode } from 'react'

import { PolymorphicComponentProps } from '../../types'
import { SkeletonCircle, SkeletonText } from '../skeleton'

interface Props {
  title: ReactNode
  subtitle?: ReactNode
  onClick?(): void
  value?: ReactNode
  loading?: boolean
}

export type ListItemProps<
  P extends React.ElementType,
  C extends React.ElementType,
> = {
  icon?: P
  iconProps: React.ComponentProps<P> & {
    width?: number
    height?: number
    className?: string
  }
} & PolymorphicComponentProps<C, Props>

export type ListItemComponent = <
  P extends React.ElementType = 'svg',
  C extends React.ElementType = 'button',
>(
  props: ListItemProps<P, C>,
) => React.ReactElement | null

export const ListItem: ListItemComponent = ({
  as,
  icon: Icon,
  iconProps,
  subtitle,
  title,
  onClick,
  className,
  value,
  loading = false,
  ...rest
}) => {
  const Component = as || 'button'

  return (
    <Component
      {...rest}
      type="button"
      onClick={onClick}
      className={classNames(
        className,
        subtitle ? 'items-start' : 'items-center',
        'relative flex gap-4 px-3 py-3 w-full cursor-pointer',
      )}
    >
      {loading ? (
        <>
          {Icon && <SkeletonCircle radius={iconProps?.width ?? 18} />}
          <div className="flex flex-col gap-0.5 items-start w-full">
            <SkeletonText fontSize="sm" />
            {subtitle && <SkeletonText fontSize="xs" />}
          </div>
        </>
      ) : (
        <>
          {Icon && (
            <div
              style={{
                minWidth: iconProps?.width ?? 18,
                minHeight: iconProps?.height ?? 18,
                paddingTop: subtitle ? 1 : 0,
              }}
            >
              {React.createElement(Icon, {
                width: 18,
                height: 18,
                strokeWidth: 2,
                ...iconProps,
                className: classNames(
                  iconProps?.className,
                  'text-blue-500 rounded-full',
                ),
              })}
            </div>
          )}
          <div className="flex flex-col gap-0.5 items-start">
            <span className="text-sm font-medium dark:text-slate-200">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] text-gray-700 dark:text-slate-400 text-left">
                {subtitle}
              </span>
            )}
          </div>
          {typeof value === 'string' ? (
            <span className="text-xs text-gray-500 dark:text-slate-500">
              {value}
            </span>
          ) : (
            value
          )}
        </>
      )}
    </Component>
  )
}
