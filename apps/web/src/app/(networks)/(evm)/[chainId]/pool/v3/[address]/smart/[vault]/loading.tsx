import { SkeletonBox } from '@sushiswap/ui'
import React from 'react'

const SteerVaultLoadingPage = () => {
  return (
    <div className="w-full flex justify-center gap-4">
      <SkeletonBox className="h-[745px] w-[516px]" />
      <SkeletonBox className="h-[745px] w-[460px]" />
    </div>
  )
}

export default SteerVaultLoadingPage
