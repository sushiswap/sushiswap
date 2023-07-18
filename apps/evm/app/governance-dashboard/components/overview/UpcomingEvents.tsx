'use client'

import { useBreakpoint, useIsMounted } from '@sushiswap/hooks'
import React from 'react'
import { SwiperSlide } from 'swiper/react'

import { SushiEvent } from '../../lib'
import { CardNavigation } from '../CardNavigation'
import { EventItemCard } from '../EventItemCard'

export function UpcomingEvents({ events }: { events: SushiEvent[] }) {
  const { isMd } = useBreakpoint('md')
  const isMounted = useIsMounted()
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold dark:text-slate-200">Upcoming Events</h2>
      <CardNavigation slidesPerView={isMounted && isMd ? 3 : 1} spaceBetween={24} itemCount={events.length}>
        {events.map((event, index) => (
          <SwiperSlide key={index}>
            <EventItemCard {...event} />
          </SwiperSlide>
        ))}
      </CardNavigation>
    </section>
  )
}
