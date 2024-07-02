import { captureMessage } from '@sentry/node'
import {
  ADDITIONAL_BASES,
  BASES_TO_CHECK_TRADES_AGAINST,
  ExtractorSupportedChainId,
  STABLES,
} from 'sushi/config'
import { WNATIVE } from 'sushi/currency'
import { RPool, RToken, calcTokenAddressPrices } from 'sushi/tines'
import { ExtractorClient } from './ExtractorClient.js'
import { CHAIN_ID, ROUTER_CONFIG } from './config.js'
import { extractorClient } from './index.js'
//import { extractorClient } from './index.js'

export const Currency = {
  USD: 'USD',
  NATIVE: 'NATIVE',
  ETHEREUM: 'ETHEREUM',
  BITCOIN: 'BITCOIN',
} as const

export type Currency = (typeof Currency)[keyof typeof Currency]

export const priceUpdateInterval = 30 // SECONDS
export const prices: Record<Currency, Record<string, number>> = {
  [Currency.USD]: {},
  [Currency.NATIVE]: {},
  [Currency.ETHEREUM]: {},
  [Currency.BITCOIN]: {},
}

export function updatePrices(client: ExtractorClient, currency = Currency.USD) {
  try {
    const start = performance.now()
    const pools = client.getCurrentPoolCodes().map((pc) => pc.pool)
    prices[currency] = getPrices(CHAIN_ID, currency, pools)
    if (
      currency === Currency.USD &&
      ROUTER_CONFIG[CHAIN_ID]?.['checkPricesIncrementalModeCorrectness'] ===
        true
    ) {
      const [diff, checked] = checkPrices(
        prices[currency],
        extractorClient?.getPrices(),
        0.5,
      )
      if (diff > 1)
        captureMessage(
          `${CHAIN_ID}: Price check failed: ${diff.toFixed(
            1,
          )}% of prices differing more than 0.5%`,
        )
      console.log(
        `Price check: ${checked.toFixed(1)}% prices are common, ${diff.toFixed(
          1,
        )}% of prices differing more than 0.5%`,
      )
    } else
      console.log(
        `updatePrices(${currency}): ${pools.length} pools (${Math.round(
          performance.now() - start,
        )}ms cpu time)`,
      )
  } catch (e) {
    console.error('updatePrices error', e)
  } finally {
    setTimeout(() => updatePrices(client), priceUpdateInterval * 1_000)
  }
}

function getPrices(
  chainId: ExtractorSupportedChainId,
  currency: Currency,
  pools: RPool[],
) {
  const bases =
    currency === Currency.USD
      ? (STABLES[chainId] as unknown as RToken[])
      : [WNATIVE[chainId] as RToken]

  const minimumLiquidity = currency === Currency.USD ? 1000 : 1

  const baseTrusted = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
  const additionalTrusted = Object.values(
    ADDITIONAL_BASES[chainId] ?? [],
  ).flat()

  const prices = calculateTokenPrices(
    bases,
    pools,
    minimumLiquidity,
    baseTrusted.concat(additionalTrusted) as RToken[],
  )
  //comparePrices(prices, extractorClient?.getPrices(), [0.01, 0.001])
  return prices
}

function calculateTokenPrices(
  bases: RToken[],
  pools: RPool[],
  minimumLiquidity: number,
  trustedTokens: RToken[],
) {
  const prices: Map<string, Map<string, number>> = new Map()
  const allTokens: Set<string> = new Set()
  const bestPrices: Record<string, number> = {}

  bases.forEach((base) => {
    if (allTokens.has(base.address)) {
      // fast pricing using prices from the prev base. Tokensets should be the same
      try {
        const anotherBase = Array.from(prices.keys()).find(
          (b) => prices.get(b)?.get(base.address) !== undefined,
        )
        const currentBasePrice = prices
          .get(anotherBase as string)
          ?.get(base.address)
        if (currentBasePrice !== undefined && currentBasePrice > 1e-100) {
          const priceMap = prices.get(anotherBase as string) as Map<
            string,
            number
          >
          const currentPrices: [string, number][] = Array.from(
            priceMap.entries(),
          ).map(([tokenAddr, tokenPrice]) => [
            tokenAddr,
            tokenPrice / currentBasePrice,
          ])
          prices.set(base.address, new Map(currentPrices))
          return
        }
      } catch (_e) {} // just in case
    }
    const currentPrices = calcTokenAddressPrices(
      pools,
      base,
      minimumLiquidity * 10 ** base.decimals,
      trustedTokens,
      // true,
    )
    const currentPricesMap = new Map<string, number>()
    Object.entries(currentPrices).forEach(([address, price]) => {
      currentPricesMap.set(address, price)
      allTokens.add(address)
    })
    prices.set(base.address, currentPricesMap)
  })

  for (const token of allTokens) {
    const tokenPrices = Array.from(prices.keys())
      .map((t) => prices.get(t))
      .map((t) => t?.get(token))
      .filter(hasPrice)
    let price
    // Determine the price based on the number of available prices for the token
    if (tokenPrices.length === 0) {
      // Case 1: No prices available for the token
      price = 0
    } else if (tokenPrices.length === 1) {
      // Case 2: Only one price available for the token
      const single = tokenPrices[0]
      price = single
    } else if (tokenPrices.length === 2 && tokenPrices[0] && tokenPrices[1]) {
      // Case 3: Two prices available for the token, average them
      const price1 = tokenPrices[0]
      const price2 = tokenPrices[1]
      const average = (price1 + price2) / 2
      price = average
    } else {
      // Case 4: More than two prices available for the token, calculate the median
      const sortedPrices = tokenPrices.sort()
      const midIndex = Math.floor(sortedPrices.length / 2)
      const median1 = sortedPrices[midIndex - 1]
      const median2 = sortedPrices[midIndex]

      if (sortedPrices.length % 2 === 0 && median1 && median2) {
        // Case 4.1: Even number of prices, calculate the average of the two middle values
        const medianAverage = (median1 + median2) / 2
        price = medianAverage
      } else {
        // Case 4.2: Odd number of prices, take the middle value as the median
        const median = sortedPrices[midIndex]
        price = median
      }
    }

    // Assign the determined price to the bestPrices object for the current token
    if (price) {
      bestPrices[token] = price
    }
  }
  return bestPrices
}

const hasPrice = (input: number | undefined): input is number =>
  input !== undefined

// checks pricesEthalon and pricesCompared. Returns quantity of prices changed more than priceDifference %
function checkPrices(
  pricesEthalon: Record<string, number>,
  pricesCompared: Record<string, number> | undefined,
  priceDifference: number,
): [number, number] {
  if (pricesCompared === undefined) return [0, 0]
  const ethalonTokens = Object.keys(pricesEthalon)
  let totalNum = 0
  let diffNum = 0
  ethalonTokens.forEach((eT) => {
    const eP = pricesEthalon[eT] as number
    const cP = pricesCompared[eT]
    if (cP === undefined || eP === 0) return
    ++totalNum
    if (Math.abs(cP / eP - 1) * 100 > priceDifference) ++diffNum
  })
  return [
    totalNum > 0 ? (diffNum / totalNum) * 100 : 0,
    ethalonTokens.length > 0 ? (totalNum / ethalonTokens.length) * 100 : 0,
  ]
}

export function comparePrices(
  pricesEthalon: Record<string, number>,
  pricesCompared: Record<string, number> | undefined,
  levels: number[] = [],
) {
  if (pricesCompared === undefined) return
  const ethalonTokens = Object.keys(pricesEthalon)
  const comparedTokens = Object.keys(pricesCompared)
  const lengthDiff = comparedTokens.length - ethalonTokens.length
  if (lengthDiff > 0) console.log(`${lengthDiff} tokens more`)
  if (lengthDiff < 0) console.log(`${lengthDiff} tokens less`)
  let totalNum = 0
  let totalR = 0
  let totalShift = 0
  let maxR = 0
  const levelsEx = levels.map((_) => 0)
  ethalonTokens.forEach((eT) => {
    const eP = pricesEthalon[eT] as number
    const cP = pricesCompared[eT]
    if (cP === undefined) {
      //console.log(`No price for ${eT}`)
    } else {
      if (eP === 0) {
        if (cP > 1e-5) console.log(`Token ${eT} price mismatch ${eP} => ${cP}`)
      } else {
        const s = cP / eP - 1
        totalShift += s
        const r = Math.abs(s)
        ++totalNum
        totalR += r
        maxR = Math.max(r, maxR)
        levels.forEach((l, i) => {
          if (r > l) levelsEx[i] += 1
        })
      }
    }
  })
  console.log(
    `Compared prices: ${totalNum}/${ethalonTokens.length}, avg diff ${(
      (totalR / totalNum) *
      100
    ).toFixed(4)}%, avg shift ${((totalShift / totalNum) * 100).toFixed(
      4,
    )}%, max diff ${(maxR * 100).toFixed(4)}%, ${levels
      .map((l, i) => {
        return `>${l * 100}% - ${(
          ((levelsEx[i] as number) / totalNum) *
          100
        ).toFixed(1)}%`
      })
      .join(', ')}`,
  )
}
