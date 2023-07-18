'use client'

import { Listbox } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { classNames } from '@sushiswap/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

const SORT_OPTIONS = {
  key: 'sortForumPosts',
  options: [
    { title: 'Recent Activity', key: 'activity' },
    { title: 'Published Lately', key: 'created' },
    { title: 'Hottest Topics', key: 'default' },
  ],
}

export function GovernanceSorting() {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams ?? '')

  const selectedSortOption =
    SORT_OPTIONS.options.find((o) => o.key === params.get(SORT_OPTIONS.key)) ?? SORT_OPTIONS.options[0]

  function sortForumPosts(sortKey: string) {
    params.set(SORT_OPTIONS.key, sortKey)
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Listbox value={selectedSortOption} onChange={(sortBy) => sortForumPosts(sortBy.key)}>
      {({ open }) => (
        <div className="relative mt-1 w-full text-sm font-medium dark:text-slate-300">
          <Listbox.Button className="relative flex h-[42px] w-full items-center justify-between gap-2 rounded-lg bg-slate-200 dark:bg-slate-800 px-3 text-left">
            <span className="block truncate">Sort By: {selectedSortOption.title}</span>
            <ChevronDownIcon
              className={classNames('h-5 w-5 dark:text-slate-400 transition-all', open ? 'rotate-180' : 'rotate-0')}
              aria-hidden="true"
            />{' '}
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 w-full rounded-lg bg-slate-200 dark:bg-slate-800 py-1">
            {SORT_OPTIONS.options.map((option) => (
              <Listbox.Option
                key={option.key}
                value={option}
                className="flex h-9 items-center rounded-lg px-3 hover:cursor-default hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                {option.title}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  )
}
