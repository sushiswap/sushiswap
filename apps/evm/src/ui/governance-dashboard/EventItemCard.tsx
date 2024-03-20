'use client'

import { MapPinIcon } from '@heroicons/react/24/solid'
import { CalendarIcon } from '@sushiswap/ui'
import React from 'react'

import { SushiEvent } from '../../lib/governance-dashboard'

export function EventItemCard(props: SushiEvent) {
  const { title, date, location, imgUrl, eventUrl } = props

  return (
    <a href={eventUrl} target="_blank" rel="noreferrer" className="group">
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60">
        <div className="h-[160px] w-full bg-slate-200 transition-transform ease-in-out group-hover:scale-105">
          <img
            src={imgUrl}
            alt="event-img"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-8 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">
            {title}
          </h3>
          <footer className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <CalendarIcon width={14} height={14} />
              {date}
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon width={14} height={14} />
              {location}
            </div>
          </footer>
        </div>
      </div>
    </a>
  )
}
