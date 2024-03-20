'use client'

import { useIsMounted } from '@sushiswap/hooks'
import { classNames } from '@sushiswap/ui'
import { useBreakpoint } from '@sushiswap/ui/lib'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { SwiperSlide } from 'swiper/react'

import {
  DATE_FILTERS,
  GOV_STATUS,
  GovernanceItem,
  GovernanceStatus,
} from '../../../lib/governance-dashboard'
import { CardNavigation } from '../CardNavigation'
import { FilterButton } from '../FilterButton'
import { GovernanceDateFilters } from '../GovernanceDateFilters'
import { GovernanceItemCard } from '../GovernanceItemCard'
import { GovernanceTypeFilter } from '../GovernanceTypeFilter'

export function LatestPosts({
  posts,
}: { posts: Record<GovernanceStatus, GovernanceItem[]> }) {
  const [selectedGovType, setSelectedGovType] =
    useState<GovernanceStatus>('IMPLEMENTATION')
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams ?? '')
  const { isMd } = useBreakpoint('md')
  const isMounted = useIsMounted()

  function filterDate(filterKey: string) {
    params.set(DATE_FILTERS.key, filterKey)
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <div className="relative z-10 flex items-center justify-between">
          <h2 className="pl-1 text-2xl font-bold dark:text-slate-200">
            Latest @ Sushi
          </h2>
          <div className="md:hidden">
            <GovernanceDateFilters />
          </div>

          <div className="hidden gap-2 md:flex">
            {DATE_FILTERS.options.map((filter) => (
              <FilterButton
                isActive={
                  (params.get(DATE_FILTERS.key) ?? 'all') === filter.key
                }
                key={filter.key}
                onClick={() => filterDate(filter.key)}
              >
                {filter.title}
              </FilterButton>
            ))}
          </div>
        </div>
        <div className="md:hidden">
          <GovernanceTypeFilter
            selectedGovType={selectedGovType}
            setSelectedGovType={setSelectedGovType}
          />
        </div>
      </div>

      <div className="grid w-full gap-6 md:grid-cols-[1fr,2fr]">
        <div className="hidden md:block">
          {Object.entries(GOV_STATUS).map(([key, status], i) => (
            <div
              className={classNames(
                'relative rounded-t-2xl hover:cursor-pointer',
                selectedGovType === key
                  ? 'bg-gradient-to-r from-[#0993EC] to-[#F338C3] px-0.5 pt-0.5'
                  : 'eae-in-out transition-transform hover:-translate-y-1',
                i && '-mt-4',
              )}
              key={key}
              onClick={() => setSelectedGovType(key as GovernanceStatus)}
              style={{ zIndex: i + 1 }}
            >
              <div className="flex items-center justify-between gap-10 rounded-t-2xl bg-gradient-to-b from-white to-[#F4F5F6] dark:from-[#212939] dark:to-[#101728] px-5 py-5 pb-10">
                <div className="flex items-center gap-2">
                  <div
                    className={classNames('h-3 w-3 rounded-sm', status.color)}
                  />
                  <span className="font-medium">{status.title}</span>
                </div>
                <div className="flex h-6 w-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-500/60 text-xs font-semibold text-slate-600 dark:text-white">
                  {posts[key as GovernanceStatus].length}
                </div>
              </div>
            </div>
          ))}
        </div>
        {Object.keys(posts).map(
          (key) =>
            key === selectedGovType &&
            (posts[key].length ? (
              <CardNavigation
                key={key}
                slidesPerView={isMounted && isMd ? 2 : 1}
                spaceBetween={12}
                containerStyle="p-1"
                itemCount={posts[key].length}
              >
                {posts[key].map((item: GovernanceItem, index: number) => (
                  <SwiperSlide key={index}>
                    <GovernanceItemCard {...item} />
                  </SwiperSlide>
                ))}
              </CardNavigation>
            ) : (
              <p
                key={key}
                className="font-bold text-xl flex items-center justify-center"
              >
                No posts found
              </p>
            )),
        )}
      </div>
    </section>
  )
}
