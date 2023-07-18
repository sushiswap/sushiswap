'use client'

import { classNames } from '@sushiswap/ui'
import React from 'react'
import { GovernanceItem } from '../lib'

export function GovernanceItemCard(props: GovernanceItem) {
  const { type, title, isActive, url, category } = props
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <div className="!h-fit rounded-lg border border-slate-300 dark:border-slate-700/60 p-4 transition ease-in-out hover:border-slate-600">
        <div className="flex items-center gap-2">
          <div className={classNames('h-2 w-2 rounded-sm', type.color)} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{type.title}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 h-12">{title}</h3>

        <div className="mt-4 flex gap-2">
          {type.id === 'IMPLEMENTATION' ? (
            isActive ? (
              <div className="flex h-6 w-fit items-center rounded-full bg-[#34D39933] dark:bg-[#243C2E] px-2 text-xs text-[#34D399]">
                Active
              </div>
            ) : (
              <div className="flex h-6 w-fit items-center rounded-full bg-[#2371FF1A] dark:bg-[#26304B] px-2 text-xs text-blue">
                Closed
              </div>
            )
          ) : null}
          <div className="flex h-6 w-fit items-center rounded-full bg-slate-400 dark:bg-slate-700 px-2 text-xs text-gray-50 dark:text-slate-300">
            {category}
          </div>
        </div>
      </div>
    </a>
  )
}
