import { typographyVariants } from '@sushiswap/ui'

export const WidgetTitleV2 = () => {
  return (
    <div className="flex flex-col items-start gap-2 mb-4 sm:mt-10 mt-2">
      <h1 className={typographyVariants({ variant: 'h1' })}>Trade</h1>
    </div>
  )
}
