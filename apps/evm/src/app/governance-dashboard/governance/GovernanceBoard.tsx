'use client'

import { classNames } from '@sushiswap/ui'
import React, { useState } from 'react'

import {
  GOV_STATUS,
  GovernanceItem,
  GovernanceStatus,
} from '../../../lib/governance-dashboard'
import {
  GovernanceItemCard,
  GovernanceTypeFilter,
} from '../../../ui/governance-dashboard'

function isValidGovernanceType(govType: string): govType is GovernanceStatus {
  return govType in GOV_STATUS
}

export function GovernanceBoard({
  governanceItemsMapping,
}: {
  governanceItemsMapping: Record<
    'IMPLEMENTATION' | 'PROPOSAL' | 'DISCUSSION',
    GovernanceItem[]
  >
}) {
  const [selectedGovType, setSelectedGovType] =
    useState<GovernanceStatus>('IMPLEMENTATION')

  return (
    <>
      <div className="hidden grid-cols-3 gap-12 md:grid">
        {Object.entries(governanceItemsMapping).map(([key, items]) => (
          <div key={key} className="space-y-5">
            <div className="flex items-center gap-2 pl-2.5">
              <div
                className={classNames(
                  'h-3 w-3 rounded-sm',
                  isValidGovernanceType(key) && GOV_STATUS[key].color,
                )}
              />
              <h3 className="font-medium">
                {isValidGovernanceType(key) ? GOV_STATUS[key].title : ''}
              </h3>
            </div>

            {items.length ? (
              <div className="grid gap-2">
                {items.map((item, index) => (
                  <GovernanceItemCard key={index} {...item} />
                ))}
              </div>
            ) : (
              <p key={key} className="font-medium pl-2.5 italic">
                No results
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-4 md:hidden">
        <GovernanceTypeFilter
          selectedGovType={selectedGovType}
          setSelectedGovType={setSelectedGovType}
        />
        <div className="grid gap-2">
          {governanceItemsMapping[selectedGovType].map((item, index) => (
            <GovernanceItemCard key={index} {...item} />
          ))}
        </div>
      </div>
    </>
  )
}
