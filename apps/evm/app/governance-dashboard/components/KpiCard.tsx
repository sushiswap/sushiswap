import React, { ReactNode } from 'react'

interface Kpi {
  title: ReactNode
  value: ReactNode
  additional?: ReactNode
}

export function KpiCard(props: Kpi, index: number) {
  const { title, value, additional } = props
  return (
    <dl className="rounded-lg bg-white dark:bg-[#1A2031] p-5" key={index}>
      <dt className="text-sm text-slate-500 dark:text-slate-400">{title}</dt>
      <dd className="mt-2 text-xl font-semibold">{value}</dd>
      {additional}
    </dl>
  )
}
