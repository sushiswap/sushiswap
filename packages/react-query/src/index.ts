import { captureException } from '@sentry/nextjs'
import {
  QueryCache,
  QueryClient,
  type QueryClientConfig,
} from '@tanstack/react-query'

const queryClientConfig = {
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof Error) {
        if (error.name === 'ConnectorNotConnectedError') return
      }
      captureException(error, { data: { query } })
    },
  }),
}

export const createQueryClient = (
  config: QueryClientConfig | undefined = queryClientConfig,
) => {
  return new QueryClient(config)
}

export * from './hooks'
