'use client'

import { ChevronDownIcon } from '@heroicons/react-v1/solid'
import { classNames } from '@sushiswap/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

interface Entry {
  name: string
  slug: string
  url: string
}

interface SidebarEntry {
  entry: Entry
  isActive: boolean
}

function SidebarEntry({ entry, isActive }: SidebarEntry) {
  return (
    <div
      className={classNames(
        'font-medium max-w-fit',
        isActive
          ? 'dark:text-gray-100'
          : 'dark:text-gray-400 text-[#7F7F7F] dark:hover:text-gray-300',
      )}
    >
      <Link href={entry.url} prefetch={true}>
        {entry.name}
      </Link>
    </div>
  )
}

export interface Sidebar {
  entries: Entry[]
  param: string
}

export function SidebarMobile({ entries, param }: Sidebar) {
  const [open, setOpen] = useState(false)

  const active = useParams()[param]
  const activeEntry = entries.find((entry) => entry.slug === active)

  return (
    <div
      className={classNames(
        'font-semibold text-sm transition-[height] border py-4 px-[18px] rounded-lg',
        'border-[#BFBFBF] bg-[#F2F2F2]',
        'dark:border-[#4D5562] dark:bg-[#252B3A]',
      )}
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
        onKeyUp={() => setOpen(!open)}
      >
        <span>{activeEntry?.name || ''}</span>
        <div
          className={classNames(
            open && 'rotate-180',
            'transition-all text-[#4D5562] h-6 w-6',
          )}
        >
          <ChevronDownIcon />
        </div>
      </div>
      <div
        className={classNames(
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          'transition-[grid-template-rows] grid [&>*]:overflow-hidden',
        )}
      >
        <div className="space-y-4">
          <div className="h-3" />
          {entries.map((entry) => (
            <div
              key={entry.name}
              onClick={() => setOpen(!open)}
              onKeyUp={() => setOpen(!open)}
            >
              <SidebarEntry entry={entry} isActive={entry.slug === active} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SidebarDesktop({ entries, param }: Sidebar) {
  const active = useParams()[param]

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <SidebarEntry
          key={entry.name}
          entry={entry}
          isActive={entry.slug === active}
        />
      ))}
    </div>
  )
}
