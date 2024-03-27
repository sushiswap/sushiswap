import { QueryKey, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

type UseWatchByIntervalKey = {
  key: QueryKey
  keys?: never
}

type UseWatchByIntervalKeys = {
  key?: never
  keys: QueryKey[]
}

type UseWatchByInterval = {
  interval: number
} & (UseWatchByIntervalKey | UseWatchByIntervalKeys)

export function useWatchByInterval({
  keys: _keys,
  key,
  interval,
}: UseWatchByInterval) {
  const keys = useMemo(() => {
    if (key) return [key]
    if (_keys) return _keys
    return []
  }, [_keys, key])

  const queryClient = useQueryClient()

  useEffect(() => {
    const int = setInterval(() => {
      keys.forEach((key) => {
        queryClient.invalidateQueries(key)
      })
    }, interval)

    return () => clearInterval(int)
  }, [keys, queryClient, interval])
}
