'use client'

import { useSearchParams } from 'next/navigation'
import { z } from 'zod'

export const useTypedSearchParams = <T extends z.Schema>(schema: T) => {
  const searchParams = useSearchParams()
  return schema.parse(Object.fromEntries(searchParams.entries())) as z.infer<
    typeof schema
  >
}
