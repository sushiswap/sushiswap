'use client'

import { ThemeProvider } from 'next-themes'
import { FC, ReactNode } from 'react'

interface BaseProvidersProps {
  children: ReactNode | ReactNode[]
  forcedTheme?: string
}

export const BaseProviders: FC<BaseProvidersProps> = ({
  children,
  forcedTheme,
}) => {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      forcedTheme={forcedTheme}
    >
      <div id="network-check-portal" />
      {children}
      <div id="popover-portal" />
      <div id="footer-portal" />
    </ThemeProvider>
  )
}
