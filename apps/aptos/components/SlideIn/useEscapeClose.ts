import { useEffect } from 'react'

type UseEscapeClose = (cb: () => void) => void
export const useEscapeClose: UseEscapeClose = (cb) => {
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.code === 'Escape') {
        cb()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
