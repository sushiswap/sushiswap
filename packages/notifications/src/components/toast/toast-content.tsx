'use client'

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { TimeAgo } from '@sushiswap/ui'
import { type FC, type ReactNode, useState } from 'react'

interface ToastContent {
  icon?: ReactNode
  summary: ReactNode | ReactNode[]
  code?: boolean
  href?: string | undefined
}

export const ToastContent: FC<ToastContent> = ({
  icon,
  href,
  summary,
  code = false,
}) => {
  const [date] = useState(new Date())

  return (
    <div className="p-4 flex gap-4 items-start">
      {icon && <div className="mt-0.5">{icon}</div>}
      <div className="flex flex-col gap-1 overflow-hidden">
        {!code ? (
          <>
            <span className="font-semibold mb-1 text-sm text-gray-900 dark:text-slate-200">
              {summary}
            </span>
            {href && (
              <a
                href={href}
                target="_blank"
                className="flex items-center text-sm font-medium gap-2 text-gray-700 dark:text-slate-400"
                rel="noreferrer"
              >
                View on explorer{' '}
                <ArrowTopRightOnSquareIcon
                  width={16}
                  height={16}
                  strokeWidth={2}
                />
              </a>
            )}
            <span className="text-[10px] font-medium text-gray-600 dark:text-slate-400">
              <TimeAgo value={date} />
            </span>
          </>
        ) : (
          <div className="scroll bg-gray-100 dark:bg-black/20 p-2 px-3 rounded-lg border border-slate-200/10 text-[10px] text-gray-900 dark:text-slate-200 break-all max-h-[80px] overflow-y-auto">
            <code>{summary}</code>
          </div>
        )}
      </div>
    </div>
  )
}
