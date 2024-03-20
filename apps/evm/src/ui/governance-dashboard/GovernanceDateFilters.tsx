'use client'

import { Listbox } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { classNames } from '@sushiswap/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { DATE_FILTERS } from '../../lib/governance-dashboard'

export function GovernanceDateFilters() {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams ?? '')

  const selectedDateFilter =
    DATE_FILTERS.options.find((o) => o.key === params.get(DATE_FILTERS.key)) ??
    DATE_FILTERS.options[3]

  function filterDate(filterKey: string) {
    filterKey === 'all'
      ? params.delete(DATE_FILTERS.key)
      : params.set(DATE_FILTERS.key, filterKey)
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <Listbox
      value={selectedDateFilter}
      onChange={(dateFilter) => filterDate(dateFilter.key)}
    >
      {({ open }) => (
        <div className="relative mt-1 w-full text-sm font-medium dark:text-slate-300">
          <Listbox.Button className="relative flex h-[42px] w-full items-center justify-between gap-2 rounded-lg bg-slate-200 dark:bg-slate-800 px-3 text-left">
            <span className="min-w-max">
              Filter By: {selectedDateFilter.title}
            </span>
            <ChevronDownIcon
              className={classNames(
                'h-5 w-5 dark:text-slate-400 transition-all',
                open ? 'rotate-180' : 'rotate-0',
              )}
              aria-hidden="true"
            />
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 w-full rounded-lg bg-slate-200 dark:bg-slate-800 py-1">
            {DATE_FILTERS.options.map((option) => (
              <Listbox.Option
                key={option.title}
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
