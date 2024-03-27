'use client'

import { useMediaQuery } from 'react-responsive'
export { useMediaQuery } from 'react-responsive'

export const useIsSmScreen = () => {
  return useMediaQuery({ query: '(max-width: 640px)' })
}
