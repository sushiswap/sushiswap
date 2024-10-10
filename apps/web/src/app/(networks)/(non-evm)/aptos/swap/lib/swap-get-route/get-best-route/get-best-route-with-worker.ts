import { getBestRoute } from './get-best-route'

export async function getBestRouteWithWorker(
  ...args: Parameters<typeof getBestRoute>
): Promise<ReturnType<typeof getBestRoute>> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./get-best-route-worker.ts', import.meta.url),
    )
    worker.postMessage(args)
    worker.onmessage = (event) => {
      worker.terminate()
      resolve(event.data)
    }
    worker.onerror = (error) => {
      worker.terminate()
      reject(error)
    }
  })
}
