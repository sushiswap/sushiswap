'use client'

import { typographyVariants } from '@sushiswap/ui'

export const SimpleSwapHeader = () => {
  return (
    <div className="flex flex-col items-start gap-2 mb-4 sm:mt-10 mt-2">
      <h1 className={typographyVariants({ variant: 'h1' })}>Trade</h1>
      <div className="h-5" />
    </div>
  )
}
