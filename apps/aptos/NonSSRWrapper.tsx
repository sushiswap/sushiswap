import dynamic from 'next/dynamic'
import { FC, ReactNode } from 'react'

const NonSSRWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <>{children}</>
)

// Temp solution until app dir
export default dynamic(() => Promise.resolve(NonSSRWrapper), {
  ssr: false,
})
