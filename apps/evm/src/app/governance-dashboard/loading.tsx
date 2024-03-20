'use client'

import { SkeletonBox } from '@sushiswap/ui/components/skeleton'
import React from 'react'

export default function Loading() {
  return (
    <div className="space-y-10">
      <div className="flex justify-between gap-24">
        <SkeletonBox className="h-10 w-64 rounded-lg" />
        <SkeletonBox className="h-10 w-40 rounded-lg" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <SkeletonBox className="h-40 w-full rounded-lg" />
          <SkeletonBox className="h-8 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <SkeletonBox className="h-40 w-full rounded-lg" />
          <SkeletonBox className="h-8 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <SkeletonBox className="h-40 w-full rounded-lg" />
          <SkeletonBox className="h-8 w-full rounded-lg" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <SkeletonBox className="h-32 w-full rounded-lg" />
        <SkeletonBox className="h-32 w-full rounded-lg" />
        <SkeletonBox className="h-32 w-full rounded-lg" />
        <SkeletonBox className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}
