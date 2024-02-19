'use client'

import { Toggle } from '@sushiswap/ui'
import React, { FC, useCallback, useState, useTransition } from 'react'
import { usePoolFilters, useSetPoolFilters } from './PoolFiltersProvider'

export const TableFiltersFarmsOnly: FC = () => {
  const [isPending, startTransition] = useTransition()
  const { farmsOnly } = usePoolFilters()
  const setFilters = useSetPoolFilters()
  const [checked, setChecked] = useState(farmsOnly)

  const toggle = useCallback(
    (checked: boolean) => {
      setChecked(checked)
      startTransition(() => {
        setFilters((prev) => ({ ...prev, farmsOnly: !prev.farmsOnly }))
      })
    },
    [setFilters],
  )

  return (
    <Toggle
      variant="outline"
      onPressedChange={toggle}
      pressed={isPending ? checked : farmsOnly}
      size="sm"
    >
      <span>🧑‍🌾</span> Farms only
    </Toggle>
  )
}
