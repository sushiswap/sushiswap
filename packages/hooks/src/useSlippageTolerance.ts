'use client'

import { useLocalStorage } from './useLocalStorage'

export const useSlippageTolerance = (key?: string, defaultValue?: string) =>
  useLocalStorage(key || 'swapSlippage', defaultValue || '0.5')
