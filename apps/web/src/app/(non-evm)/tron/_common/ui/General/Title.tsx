import { ReactNode } from 'react'

export const Title = ({
  children,
  className,
}: { children: ReactNode; className?: string }) => {
  return (
    <h1
      className={`text-5xl font-medium text-gray-900 dark:text-slate-50 sm:max-h-[44px] mb-4 ${
        className ?? ''
      }`}
    >
      {children}
    </h1>
  )
}
