import { Token } from '~aptos/_common/lib/types/token'
import { computeExactOutput } from '../compute-exact-output'
import { computePriceImpact } from '../compute-price-impact'
import { Route, Vertex } from '../types'

interface GetBestRoute {
  amountIn: number
  vertices: Map<string, Vertex>
  tokenGraph: Map<string, string[]>
  tokenIn: Token
  tokenOut: Token
}

export function getBestRoute({
  amountIn,
  vertices,
  tokenGraph,
  tokenIn,
  tokenOut,
}: GetBestRoute): Route | null {
  const bestRoute = findBestRoute({
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    graph: tokenGraph,
    amountIn,
    vertices,
    maxDepth: 5, // The router doesn't support more than 4 hops
  })

  return bestRoute
}

interface CalculateAmountOut {
  route: string[]
  amountIn: number
  vertices: Map<string, Vertex>
}

function calculateAmountOut({
  amountIn,
  route,
  vertices,
}: CalculateAmountOut): Route | null {
  let lastOutput = 0

  const prices = []

  if (route.length < 6) {
    if (
      vertices.has(`${route[0]}|||${route[1]}`) ||
      vertices.has(`${route[1]}|||${route[0]}`)
    ) {
      const res_x =
        vertices.get(`${route[0]}|||${route[1]}`)?.res_x ||
        vertices.get(`${route[1]}|||${route[0]}`)!.res_y
      const res_y =
        vertices.get(`${route[0]}|||${route[1]}`)?.res_y ||
        vertices.get(`${route[1]}|||${route[0]}`)!.res_x
      lastOutput = computeExactOutput({ amountIn, res_x, res_y })
      prices.push(res_y / res_x)

      if (
        vertices.has(`${route[1]}|||${route[2]}`) ||
        vertices.has(`${route[2]}|||${route[1]}`)
      ) {
        const res_x =
          vertices.get(`${route[1]}|||${route[2]}`)?.res_x ||
          vertices.get(`${route[2]}|||${route[1]}`)!.res_y
        const res_y =
          vertices.get(`${route[1]}|||${route[2]}`)?.res_y ||
          vertices.get(`${route[2]}|||${route[1]}`)!.res_x
        lastOutput = computeExactOutput({
          amountIn: lastOutput,
          res_x,
          res_y,
        })
        prices.push(res_y / res_x)

        if (
          vertices.has(`${route[2]}|||${route[3]}`) ||
          vertices.has(`${route[3]}|||${route[2]}`)
        ) {
          const res_x =
            vertices.get(`${route[2]}|||${route[3]}`)?.res_x ||
            vertices.get(`${route[3]}|||${route[2]}`)!.res_y
          const res_y =
            vertices.get(`${route[2]}|||${route[3]}`)?.res_y ||
            vertices.get(`${route[3]}|||${route[2]}`)!.res_x
          lastOutput = computeExactOutput({
            amountIn: lastOutput,
            res_x,
            res_y,
          })
          prices.push(res_y / res_x)

          if (
            vertices.has(`${route[3]}|||${route[4]}`) ||
            vertices.has(`${route[4]}|||${route[3]}`)
          ) {
            const res_x =
              vertices.get(`${route[3]}|||${route[4]}`)?.res_x ||
              vertices.get(`${route[4]}|||${route[3]}`)!.res_y
            const res_y =
              vertices.get(`${route[3]}|||${route[4]}`)?.res_y ||
              vertices.get(`${route[4]}|||${route[3]}`)!.res_x
            lastOutput = computeExactOutput({
              amountIn: lastOutput,
              res_x,
              res_y,
            })
            prices.push(res_y / res_x)
          }
        }
      }
    }

    const midPrice = prices
      .slice(1)
      .reduce(
        (accumulator, currentValue) => accumulator * currentValue,
        prices[0],
      )

    const priceImpact = computePriceImpact({
      midPrice,
      amountIn,
      amountOut: lastOutput,
    })

    return {
      route: [...route],
      amountOut: lastOutput,
      priceImpact: priceImpact,
    }
  }

  return null
}

interface FindPossibleRoutes {
  tokenIn: string
  tokenOut: string
  graph: Map<string, string[]>
  visited?: Record<string, boolean>
  currentRoute?: string[]
  routes?: string[][]
  amountIn: number
  vertices: Map<string, Vertex>
  bestRoute?: { current: Route | null }
  maxDepth?: number
}

function findBestRoute({
  tokenIn,
  tokenOut,
  graph,
  visited = {},
  currentRoute = [],
  routes = [],
  amountIn,
  vertices,
  bestRoute = { current: null },
  maxDepth,
}: FindPossibleRoutes) {
  if (maxDepth && currentRoute.length > maxDepth) {
    return bestRoute.current
  }

  // Mark the current token as visited
  visited[tokenIn] = true

  // Add the current token to the current route
  currentRoute.push(tokenIn)

  // If the current token is the desired tokenOut, add the current route to the routes vertices
  if (tokenIn === tokenOut) {
    const route = calculateAmountOut({
      amountIn,
      route: currentRoute,
      vertices,
    })

    if (!bestRoute.current) {
      bestRoute.current = route
    } else if (route && route.amountOut > bestRoute.current.amountOut) {
      bestRoute.current = route
    }
  } else {
    // Iterate through the adjacent tokens of the current token
    if (tokenIn) {
      for (const adjacentToken of graph.get(tokenIn)!) {
        // If the adjacent token is not visited, recursively find possible routes
        if (!visited[adjacentToken]) {
          findBestRoute({
            tokenIn: adjacentToken,
            tokenOut,
            graph,
            visited,
            currentRoute,
            routes,
            amountIn,
            vertices,
            bestRoute,
            maxDepth,
          })
        }
      }
    }
  }

  // Remove the current token from the current route and mark it as unvisited
  currentRoute.pop()
  visited[tokenIn] = false

  return bestRoute.current
}
