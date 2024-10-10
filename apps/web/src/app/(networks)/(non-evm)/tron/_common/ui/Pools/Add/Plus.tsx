import { PlusIcon } from '@heroicons/react-v1/solid'
import { classNames } from '@sushiswap/ui'

const themes = {
  default: '',
  outline: 'border border-accent bg-white dark:bg-slate-900',
} as const

export const Plus = ({
  theme = 'default',
}: { theme?: keyof typeof themes }) => {
  return (
    <div className="left-0 right-0 mt-[-24px] mb-[-24px] flex items-center justify-center">
      <div
        className={classNames(
          'z-10 p-2 bg-gray-100 rounded-full dark:bg-slate-900',
          themes[theme],
        )}
      >
        <PlusIcon
          strokeWidth={3}
          className="w-4 h-4 dark:text-slate-400 text-slate-600"
        />
      </div>
    </div>
  )
}
