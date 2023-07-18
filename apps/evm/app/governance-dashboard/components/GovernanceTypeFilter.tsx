'use client'

import { Listbox } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { classNames } from '@sushiswap/ui'
import React from 'react'

import { GOV_STATUS, GovernanceStatus } from '../lib'

export function GovernanceTypeFilter({
  selectedGovType,
  setSelectedGovType,
}: {
  selectedGovType: GovernanceStatus
  setSelectedGovType: (type: GovernanceStatus) => void
}) {
  return (
    <Listbox value={selectedGovType} onChange={setSelectedGovType}>
      {({ open }) => (
        <div className="relative mt-1 text-sm font-medium dark:text-slate-300">
          <Listbox.Button className="flex h-10 w-full items-center justify-between rounded-lg bg-slate-200 dark:bg-slate-800 px-3">
            <div className="flex items-center gap-2">
              <div className={classNames('h-3 w-3 rounded-sm', GOV_STATUS[selectedGovType].color)} />
              {GOV_STATUS[selectedGovType].title}
            </div>
            <ChevronDownIcon
              className={classNames('h-5 w-5 text-slate-400 transition-all', open ? 'rotate-180' : 'rotate-0')}
            />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-slate-200 dark:bg-slate-800 p-1">
            {Object.entries(GOV_STATUS).map(([key, status]) => (
              <Listbox.Option
                key={key}
                value={status.id}
                className="flex h-9 items-center gap-2 rounded-lg px-2 py-1 hover:cursor-default hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                <div className={classNames('h-3 w-3 rounded-sm', status.color)} />
                {status.title}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  )
}
