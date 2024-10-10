import { SkeletonText } from '@sushiswap/ui'

type DollarAmountDisplayProps = {
  isLoading: boolean
  error?: string
  value: string
}
export const DollarAmountDisplay = ({
  isLoading,
  error,
  value,
}: DollarAmountDisplayProps) => {
  const [big, portion] = (value ? `${Number(value).toFixed(2)}` : '0.00').split(
    '.',
  )

  if (isLoading) {
    return (
      <div className="w-[90px] flex items-center">
        <SkeletonText fontSize="lg" className="w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="font-medium text-lg py-1 select-none text-red">{error}</p>
    )
  }

  return (
    <p className="font-medium text-lg flex items-baseline select-none text-gray-500 dark:text-slate-400">
      $ {big}.<span className="text-sm font-semibold">{portion}</span>
    </p>
  )
}
