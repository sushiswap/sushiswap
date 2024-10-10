import { Container, SkeletonBox } from '@sushiswap/ui'
import React from 'react'

export default function SimpleSwapLoading() {
  return (
    <Container maxWidth="lg" className="px-4">
      <div className="flex flex-col gap-4">
        <div />
        <div className="flex flex-col gap-2 mb-4 sm:mt-10 mt-2">
          <SkeletonBox className="w-[140px] h-[53px]" />
          <SkeletonBox className="h-[20px] w-[280px] invisible" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="h-[36px] w-[61px]" />
          <SkeletonBox className="h-[36px] w-[56px] invisible" />
          <SkeletonBox className="h-[36px] w-[54px] invisible" />
          <SkeletonBox className="h-[36px] w-[136px] invisible" />
        </div>
        <div className="flex flex-col gap-2.5">
          <SkeletonBox className="w-full h-[142px]" />
          <SkeletonBox className="w-full h-[142px]" />
        </div>
        <SkeletonBox className="w-full h-[52px]" />
      </div>
    </Container>
  )
}
