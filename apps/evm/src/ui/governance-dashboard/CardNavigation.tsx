'use client'

import 'swiper/swiper.css'
import 'swiper/css/navigation'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { classNames } from '@sushiswap/ui'
import React, { ReactNode, useReducer } from 'react'
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react'

interface CardNavigationProps {
  children: ReactNode
  slidesPerView: number
  spaceBetween: number
  containerStyle?: string
  itemCount: number
}

function SlideButtons({ show }: { show: { left: boolean; right: boolean } }) {
  const swiper = useSwiper()

  const BASE =
    'rounded-full h-10 w-10 flex items-center justify-center border border-blue/40 dark:border-slate-600 transition-colors ease-in'
  const ACTIVE =
    'bg-blue-100 dark:bg-slate-400 text-blue dark:text-slate-50 hover:bg-blue-300 dark:hover:bg-slate-200'
  const STALE =
    'bg-blue/80 dark:bg-slate-700 text-gray-50 dark:text-slate-400 hover:bg-blue-300 dark:hover:bg-slate-800'

  return (
    <>
      <div className="absolute inset-y-0 left-1 z-20 hidden h-full items-center md:flex">
        <button
          onClick={() => swiper.slidePrev()}
          className={classNames(BASE, ACTIVE, !show.left && 'invisible')}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-1 z-20 flex h-full items-center">
        <button
          onClick={() => swiper.slideNext()}
          className={classNames(
            BASE,
            show.left ? ACTIVE : STALE,
            !show.right && 'invisible',
          )}
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}

interface ButtonState {
  left: boolean
  right: boolean
}

const INITIAL_BUTTON_STATE = { left: false, right: true }

function reducer(_: ButtonState, position: 'start' | 'between' | 'end') {
  switch (position) {
    case 'between':
      return { left: true, right: true }
    case 'end':
      return { left: true, right: false }
    default:
    case 'start':
      return INITIAL_BUTTON_STATE
  }
}

export function CardNavigation({
  containerStyle,
  children,
  slidesPerView,
  spaceBetween,
  itemCount,
}: CardNavigationProps) {
  const [buttonState, setButtonState] = useReducer(
    reducer,
    INITIAL_BUTTON_STATE,
  )

  return (
    <div
      className={classNames(
        'relative h-fit flex overflow-hidden',
        containerStyle,
      )}
    >
      <Swiper
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        watchSlidesProgress
        onReachBeginning={() => setButtonState('start')}
        onFromEdge={() =>
          itemCount - slidesPerView > 0 && setButtonState('between')
        }
        onReachEnd={() =>
          itemCount - slidesPerView >= 0 && setButtonState('end')
        }
      >
        {itemCount - slidesPerView >= 0 && <SlideButtons show={buttonState} />}
        {children}
        {itemCount + 1 < slidesPerView
          ? Array.from({ length: slidesPerView - itemCount - 1 }).map(
              (_, index) => <SwiperSlide key={index} />,
            )
          : null}
        {/** empty slot */}
        <div className="hidden md:block">
          <SwiperSlide />
        </div>
        <div
          className={classNames(
            'pointer-events-none absolute right-0 top-0 z-10 h-full w-1/2 bg-gradient-to-r from-transparent to-[#F5F5F5] dark:to-[#101728]',
            !buttonState.right && 'hidden',
          )}
        />
      </Swiper>
    </div>
  )
}
