'use client'

import { parseArgs } from '@sushiswap/client'
import { useRouter } from 'next/navigation'
import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
} from 'react'
import { SushiSwapProtocol } from 'sushi'
import { z } from 'zod'

import { useTypedSearchParams } from '../../lib/hooks'
import { POOL_TYPES } from './TableFiltersPoolType'

type FilterContext = z.TypeOf<typeof poolFiltersSchema>

const FilterContext = createContext<FilterContext | undefined>(undefined)

export type PoolFilters = Omit<FilterContext, 'setFilters'>

interface PoolsFiltersProvider {
  children?: ReactNode
  passedFilters?: Partial<PoolFilters>
}

export const poolFiltersSchema = z.object({
  tokenSymbols: z.coerce.string().transform((symbols) => {
    return symbols.split(',').filter((symbol) => symbol !== '')
  }),
  protocols: z
    .string()
    .transform((protocols) =>
      protocols !== null && protocols !== ','
        ? (protocols.split(',') as SushiSwapProtocol[])
        : [],
    ),
  farmsOnly: z
    .string()
    .transform((bool) => (bool ? bool === 'true' : undefined)),
  smartPoolsOnly: z
    .string()
    .transform((bool) => (bool ? bool === 'true' : undefined)),
})

export const PoolsFiltersProvider: FC<PoolsFiltersProvider> = ({
  children,
}) => {
  const urlFilters = useTypedSearchParams(poolFiltersSchema.partial())
  const { tokenSymbols, protocols, farmsOnly, smartPoolsOnly } = urlFilters

  return (
    <FilterContext.Provider
      value={useMemo(
        () => ({
          tokenSymbols: tokenSymbols ? tokenSymbols : [],
          protocols: protocols ? protocols : POOL_TYPES,
          farmsOnly: farmsOnly ? farmsOnly : false,
          smartPoolsOnly: smartPoolsOnly ? smartPoolsOnly : false,
        }),
        [farmsOnly, protocols, tokenSymbols, smartPoolsOnly],
      )}
    >
      {children}
    </FilterContext.Provider>
  )
}

export const usePoolFilters = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('Hook can only be used inside Filter Context')
  }

  return context
}

export const useSetPoolFilters = () => {
  const { push } = useRouter()
  const urlFilters = useTypedSearchParams(poolFiltersSchema.partial())

  const setFilters: Dispatch<SetStateAction<typeof urlFilters>> = (filters) => {
    if (typeof filters === 'function') {
      void push(parseArgs(filters(urlFilters)))
    } else {
      void push(parseArgs(filters))
    }
  }

  return setFilters
}
