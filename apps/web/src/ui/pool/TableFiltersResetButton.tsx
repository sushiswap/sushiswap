'use client'

import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '@sushiswap/ui'
import React, { FC, useCallback, useMemo, useState, useTransition } from 'react'

import { usePoolFilters, useSetPoolFilters } from './PoolsFiltersProvider'
import { POOL_TYPES } from './TableFiltersPoolType'

export const TableFiltersResetButton: FC = () => {
  const [isPending, startTransition] = useTransition()
  const { protocols, tokenSymbols, farmsOnly, smartPoolsOnly } =
    usePoolFilters()
  const setFilters = useSetPoolFilters()

  const types = useMemo(
    () => (protocols.length === POOL_TYPES.length ? [] : protocols),
    [protocols],
  )
  const [show, setShow] = useState(
    (types?.length ?? 0) + (tokenSymbols?.length ?? 0) > 0 ||
      farmsOnly ||
      smartPoolsOnly,
  )

  const reset = useCallback(() => {
    setShow(false)
    startTransition(() => {
      setFilters({
        protocols: undefined,
        tokenSymbols: undefined,
        farmsOnly: undefined,
        smartPoolsOnly: undefined,
      })
    })
  }, [setFilters])

  if (
    isPending
      ? show
      : (types?.length ?? 0) + (tokenSymbols?.length ?? 0) > 0 ||
        farmsOnly ||
        smartPoolsOnly
  ) {
    return (
      <Button
        onClick={reset}
        icon={XMarkIcon}
        iconPosition="end"
        variant="outline"
        size="sm"
      >
        Reset
      </Button>
    )
  }

  return null
}
