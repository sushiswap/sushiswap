'use client'

import React, { ReactNode } from 'react'

export function ChartTooltip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded bg-slate-100 dark:bg-slate-700 p-3 shadow-md shadow-slate-200 dark:shadow-slate-800">
      {children}
    </div>
  )
}
