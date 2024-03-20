'use client'

import { classNames } from '@sushiswap/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const BASE_PATH = '/governance-dashboard'
const TABS = [
  { title: 'Overview', path: BASE_PATH },
  { title: 'Finance', path: `${BASE_PATH}/finance` },
  { title: 'Governance', path: `${BASE_PATH}/governance` },
  { title: 'Token Holders', path: `${BASE_PATH}/token-holders` },
]

export function TabList() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-4 md:gap-8">
      {TABS.map((tab) => (
        <Link key={tab.path} href={tab.path}>
          <button
            className={classNames(
              '!border-b-2 pb-2 text-sm md:pb-4 md:text-base',
              pathname === tab.path
                ? 'dark:border-b-blue font-semibold dark:text-blue text-gray-50'
                : 'border-b-transparent hover:text-slate-50 text-gray-50',
            )}
          >
            {tab.title}
          </button>
        </Link>
      ))}
    </nav>
  )
}
