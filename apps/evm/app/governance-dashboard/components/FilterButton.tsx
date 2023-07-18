import { classNames } from '@sushiswap/ui'
import React, { ReactNode } from 'react'

export function FilterButton(props: { children: ReactNode; isActive: boolean; onClick: () => void }) {
  const { children, isActive, onClick } = props
  return (
    <button
      className={classNames(
        'h-10 rounded-full px-4 text-sm font-medium focus:ring-1 hover:ring-blue-600 dark:hover:ring-slate-600 ring-1 ring-blue/40 dark:ring-slate-700/40 transition ease-in-out text-blue dark:text-gray-50',
        isActive && 'bg-blue/10 dark:bg-slate-700/40'
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
