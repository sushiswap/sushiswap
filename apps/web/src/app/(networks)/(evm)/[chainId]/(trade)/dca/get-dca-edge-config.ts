import { get } from '@vercel/edge-config'

interface DCAEdgeConfig {
  maintenance: boolean
}

const getDCAEdgeConfig = async () => {
  return get<DCAEdgeConfig>('dca')
}

export { type DCAEdgeConfig, getDCAEdgeConfig }
