import React from 'react'

import { getNotionTokenNetflow } from '../../../lib/governance-dashboard'
import { TokenNetflowChart } from './TokenNetflowChart'

export async function TokenNetflow() {
  const tokenNetflowData = await getNotionTokenNetflow()

  return (
    <div className="h-full w-full rounded-lg bg-white dark:bg-[#1A2031] p-5">
      <div className="flex items-center gap-[14px]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-sm bg-[#BF60EE]" />
          <label className="text-sm text-slate-500 dark:text-slate-400">
            Outflow
          </label>
        </div>
        <div className="h-4 rounded-full border border-gray-50/20 bg-gray-50/20" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-sm bg-blue" />
          <label className="text-sm text-slate-500 dark:text-slate-400">
            Inflow
          </label>
        </div>
      </div>
      <h3 className="mt-3 text-xl font-semibold">Token Netflow</h3>
      <div className="mt-10 w-full text-xs">
        <TokenNetflowChart tokenNetflowData={tokenNetflowData} />
      </div>
    </div>
  )
}
