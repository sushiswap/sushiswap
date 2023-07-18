'use client'

import { useTheme } from 'next-themes'

export const useIsDarkMode = (): boolean => {
  const { resolvedTheme } = useTheme()

  return resolvedTheme === 'dark'
}
