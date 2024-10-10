import { getBestRoute } from './get-best-route'

self.onmessage = async ({
  data: args,
}: MessageEvent<Parameters<typeof getBestRoute>>) => {
  try {
    const result = getBestRoute(...args)
    self.postMessage(result)
  } catch (e) {
    self.postMessage(e)
  }
}
