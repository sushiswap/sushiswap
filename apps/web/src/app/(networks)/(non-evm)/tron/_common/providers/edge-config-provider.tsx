'use client'

import once from 'lodash.once'
import { createContext, useContext } from 'react'

interface EdgeConfigProviderProps<T> {
  config: T
  children: React.ReactNode
}

const createEdgeConfigContext = once(<T = unknown>() => {
  return createContext<T | null>(null)
})

const useEdgeConfig = <T = unknown>() => {
  const context = useContext(createEdgeConfigContext<T>())
  if (!context) {
    throw new Error('useEdgeConfig must be used within a EdgeConfigProvider')
  }

  return context
}

const EdgeProvider = <T = unknown>({
  config,
  children,
}: EdgeConfigProviderProps<T>) => {
  const EdgeContext = createEdgeConfigContext<T>()
  return <EdgeContext.Provider value={config}>{children}</EdgeContext.Provider>
}

export { EdgeProvider, useEdgeConfig }
