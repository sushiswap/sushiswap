'use client'

import { ThemeProvider } from '@sushiswap/ui'
import React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
