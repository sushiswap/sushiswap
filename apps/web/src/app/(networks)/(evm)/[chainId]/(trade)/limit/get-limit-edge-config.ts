import { get } from '@vercel/edge-config'

interface LimitEdgeConfig {
  maintenance: boolean
}

const getLimitEdgeConfig = async () => {
  return get<LimitEdgeConfig>('limit')
}

export { type LimitEdgeConfig, getLimitEdgeConfig }
