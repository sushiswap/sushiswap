import { Address } from 'viem'
import { Token } from '../currency/Token.js'
import { RPool, RToken, calcTokenAddressPrices } from '../tines/index.js'
import { PoolEdge, TokenVert, makePoolTokenGraph } from './PoolTokenGraph.js'

// for debugging
const DEBUG_COMPARE_FULL_RECALC_WITH_TINES_PRICES = false
const DEBUG_PARTIAL_UPDATE_AFTER_FULL_RECALC_CHECK = 0 // 0% pools for update - no check
const DEBUG_COMPARE_PARTIAL_UPDATE_WITH_TINES_PRICES = false

const FULL_RECALC_INTERVAL = 6 * 3600 * 1000
const MIN_PRICABLE_LIQUIDITY = 0.8
const MIN_VALUABLE_PRICE_CHANGE = 1.001 // don't recalc prices if change is lesser than 0.1%

function makePricesRecalcForPool(
  oldPoolPrice: number,
  newPoolPrice: number,
  sensability = MIN_VALUABLE_PRICE_CHANGE,
): boolean {
  if (oldPoolPrice === 0) return newPoolPrice !== 0
  const diff = newPoolPrice / oldPoolPrice
  return diff > sensability || diff < 1 / sensability
}

class TokenInfo {
  address: Address
  decExp: number
  token: RToken
  parent: TokenInfo | undefined
  children: TokenInfo[] = []
  direction: boolean
  poolPrice: number
  poolAddress?: Address | undefined
  poolLiquidity?: number | undefined
  totalSuccessors = 0
  changedPoolIndex?: number

  constructor(
    token: RToken,
    direction: boolean,
    poolPrice: number,
    parent?: TokenInfo,
    poolAddress?: Address,
    poolLiquidity?: number,
  ) {
    this.token = token
    this.address = token.address as Address
    this.decExp = 10 ** token.decimals
    this.direction = direction
    this.poolPrice = poolPrice
    this.parent = parent
    if (parent) parent.children.push(this)
    this.poolAddress = poolAddress
    this.poolLiquidity = poolLiquidity
  }
}

// Calculates prices. 2 modes: full recalculate and incremental recalculating having only changed pools
export class IncrementalPricer {
  readonly baseTokens: TokenInfo[] // pricing start
  readonly baseTokenPrices: number[] // prices of baseTokens
  readonly trustedTokenSet: Set<Address>
  readonly trustedTokensForTinesCheck: RToken[]
  readonly minLiquidity: number // min liquidity pool should have to be used in pricing

  readonly poolTokenMap: Map<string, TokenInfo> = new Map() // pool.uniqueID() => TokenInfo
  readonly tokenMap: Map<Address, TokenInfo> = new Map() // token.address => TokenInfo
  prices: Record<string, number> = {} // calculated prices token.address => <token price>
  pricesSize = 0 // the number of calculated prices

  lastfullPricesRecalcDate = 0
  fullPricesRecalcFlag = false

  constructor(
    baseTokens: Token[], // also are trusted
    prices: number[],
    trustedTokens: Token[],
    minLiquidity: number,
  ) {
    this.baseTokens = new Array(baseTokens.length)
    this.baseTokenPrices = prices.slice()
    baseTokens.forEach((t, i) => {
      this.baseTokens[i] = new TokenInfo(t as RToken, true, 1)
    })
    this.trustedTokenSet = new Set()
    const trustedTokenMap = new Map<Address, RToken>()
    trustedTokens.forEach((t) => {
      this.trustedTokenSet.add(t.address)
      trustedTokenMap.set(t.address, t as RToken)
    })
    baseTokens.forEach((t) => {
      this.trustedTokenSet.add(t.address)
      trustedTokenMap.set(t.address, t as RToken)
    })
    this.trustedTokensForTinesCheck = Array.from(trustedTokenMap.values())
    this.minLiquidity = minLiquidity
  }

  updatePrices(
    updatedPools: RPool[],
    allPoolsOnDemand: () => RPool[],
    logging = false,
  ): number {
    if (this.isFullPricesRecalcNeeded())
      return this._fullPricesRecalculation(allPoolsOnDemand(), logging)
    else {
      const res = this._updatePricesForPools(
        updatedPools,
        DEBUG_COMPARE_PARTIAL_UPDATE_WITH_TINES_PRICES ? 0.9 : undefined,
      )
      if (DEBUG_COMPARE_PARTIAL_UPDATE_WITH_TINES_PRICES) {
        const baseToken = this.baseTokens.find(
          (b) => this.prices[b.address] === 1,
        ) as TokenInfo
        checkNotEqual(
          baseToken,
          undefined,
          'Prices partial upd error: no basetoken found',
        )
        const tinesPrices = calcTokenAddressPrices(
          allPoolsOnDemand(),
          baseToken.token,
          this.minLiquidity * baseToken.decExp,
          this.trustedTokensForTinesCheck,
        )
        comparePrices(
          'Prices partial upd',
          this.prices,
          this.pricesSize,
          tinesPrices,
        )
        // const common = compareCommonPrices(
        //   'Prices partial upd',
        //   this.prices,
        //   tinesPrices,
        // )
        // checkEqual(
        //   Object.keys(tinesPrices).length,
        //   common,
        //   'Prices partial upd num',
        // )
      }
      return res
    }
  }

  reasoning(token: Address): string[] {
    let ti = this.tokenMap.get(token)
    if (ti === undefined) return ['Token is not priced']
    const lines: string[] = []
    while (ti !== undefined) {
      const parentDecExp = ti.parent?.decExp ?? ti.decExp
      lines.push(
        `Token ${ti.token.symbol} (${ti.address}) price is ${
          this.prices[ti.address]
        }$`,
      )
      if (ti.poolAddress !== undefined) {
        lines.push(
          `Pool ${ti.poolAddress} liquidity ${Math.round(
            ti.poolLiquidity ?? 0,
          )}$ price ${(ti.poolPrice / parentDecExp) * ti.decExp}`,
        )
      }
      ti = ti.parent
    }
    return lines.reverse()
  }

  isFullPricesRecalcNeeded() {
    return (
      this.fullPricesRecalcFlag ||
      Date.now() - this.lastfullPricesRecalcDate > FULL_RECALC_INTERVAL
    )
  }

  private _fullPricesRecalculation(pools: RPool[], logging = false): number {
    this.poolTokenMap.clear()
    this.tokenMap.clear()
    this.prices = {}
    this.pricesSize = 0

    const baseVerts = makePoolTokenGraph(
      pools,
      this.baseTokens.map((t) => t.address),
    )
    const sortedBaseVerts = this._sortBaseVerts(baseVerts)
    sortedBaseVerts.forEach(([baseVert, baseIndex], i) => {
      if (this.prices[baseVert.address] !== undefined) return // the token is already priced

      const baseToken = this.baseTokens[baseIndex] as TokenInfo
      const baseTokenPrice = this.baseTokenPrices[baseIndex] as number

      const nextEdges: PoolEdge[] = []
      if (logging)
        console.log(
          `Pricing: Initial token ${baseVert.token.symbol} price=${baseTokenPrice}`,
        )
      baseVert.obj = baseToken
      this._addVertice(nextEdges, baseVert, baseTokenPrice / baseVert.decExp)

      while (nextEdges.length > 0) {
        const bestEdge = nextEdges.pop() as PoolEdge
        let vFrom = bestEdge.token0
        let vTo = bestEdge.token1
        let direction = true
        if (vTo.price !== undefined) {
          if (vFrom.price !== undefined) continue // token already priced
          const tmp = vFrom
          vFrom = vTo
          vTo = tmp
          direction = false
        }
        const p = bestEdge.pool.calcCurrentPriceWithoutFee(!direction)
        if (logging)
          console.log(
            `Pricing: + Token ${vTo.token.symbol} price=${
              p * vTo.decExp * (vFrom.price as number)
            }` +
              ` from ${vFrom.token.symbol} pool=${bestEdge.pool.address} liquidity=${bestEdge.poolLiquidity}`,
          )
        vTo.obj = new TokenInfo(
          vTo.token,
          direction,
          p,
          vFrom.obj as TokenInfo,
          bestEdge.pool.address,
          bestEdge.poolLiquidity,
        )
        this.poolTokenMap.set(bestEdge.pool.uniqueID(), vTo.obj as TokenInfo)
        this._addVertice(nextEdges, vTo, p * (vFrom.price as number))
        // console.log(
        //   `Pool create ${bestEdge.pool.address} token ${vTo.address} price=${
        //     p * (vFrom.price as number) * vTo.decExp
        //   } liquidity=${bestEdge.poolLiquidity}`,
        // )
      }

      this._updateTotalSuccessor(baseToken)
      this.lastfullPricesRecalcDate = Date.now()
      this.fullPricesRecalcFlag = false

      if (DEBUG_COMPARE_FULL_RECALC_WITH_TINES_PRICES && i === 0) {
        const tinesPrices = calcTokenAddressPrices(
          pools,
          baseToken.token,
          this.minLiquidity * baseToken.decExp,
          this.trustedTokensForTinesCheck,
        )
        comparePrices(
          'Prices full recalc',
          this.prices,
          this.pricesSize,
          tinesPrices,
        )
      }
    })

    if (DEBUG_PARTIAL_UPDATE_AFTER_FULL_RECALC_CHECK) {
      const pricesBefore = { ...this.prices }
      const pricesSizeBefore = this.pricesSize
      const pn = Math.round(
        (pools.length * DEBUG_PARTIAL_UPDATE_AFTER_FULL_RECALC_CHECK) / 100,
      )
      const newPools = pools.slice(0, pn)
      const updatePrices = this._updatePricesForPools(newPools, 0.9) // sensability <1 means update prices for all pools
      checkNotEqual(updatePrices, 0, 'Prices upd check error')
      checkEqual(pricesSizeBefore, this.pricesSize)
      comparePrices('Prices upd', pricesBefore, pricesSizeBefore, this.prices)
      this.prices = pricesBefore
      this.pricesSize = pricesSizeBefore
    }

    return this.pricesSize
  }

  // sorts baseVerts: the best the first
  private _sortBaseVerts(
    baseVerts: (TokenVert | undefined)[],
  ): [TokenVert, number][] {
    const tmp = baseVerts
      .map((b, i) => {
        if (b === undefined) return
        const price = this.baseTokenPrices[i] as number
        const reserve = b.pools.reduce(
          (a, p) => a + price * Number(p.reserve(b)),
          0,
        )
        const decExp = this.baseTokens[i]?.decExp as number
        return [(reserve * price) / decExp, [b, i]] as [
          number,
          [TokenVert, number],
        ]
      })
      .filter((p) => p !== undefined) as [number, [TokenVert, number]][]
    return tmp.sort((a, b) => b[0] - a[0]).map((a) => a[1])
  }

  private _updateTotalSuccessor(token: TokenInfo): number {
    let count = 0
    for (let i = token.children.length - 1; i >= 0; --i)
      count += this._updateTotalSuccessor(token.children[i] as TokenInfo)
    token.totalSuccessors = count
    return count + 1
  }

  private _addVertice(nextEdges: PoolEdge[], v: TokenVert, price: number) {
    v.price = price
    this.tokenMap.set(v.address, v.obj as TokenInfo)
    this.prices[v.address] = price * v.decExp
    ++this.pricesSize
    // if (nextEdges.length === 0) {
    //   // optimization ???
    //   nextEdges = v.pools
    //     .filter((edge) => {
    //       if (v.getNeibour(edge).price !== undefined) return false // token already priced
    //       const liquidity = price * Number(edge.reserve(v))
    //       edge.poolLiquidity = liquidity
    //       return (
    //         liquidity >= this.minLiquidity ||
    //         edge.pool.alwaysAppropriateForPricing()
    //       )
    //     })
    //     .sort((a, b) => a.poolLiquidity - b.poolLiquidity)
    // }
    if (!this.trustedTokenSet.has(v.address)) return // don't add tokens through untrusted tokens
    for (let i = v.pools.length - 1; i >= 0; --i) {
      const edge = v.pools[i] as PoolEdge
      if (v.getNeibour(edge).price !== undefined) continue // token already priced
      const liquidity = price * Number(edge.reserve(v))
      edge.poolLiquidity = liquidity
      if (
        liquidity >= this.minLiquidity ||
        edge.pool.alwaysAppropriateForPricing()
      ) {
        let low = 0
        let up = nextEdges.length
        while (low < up) {
          const middle = (low + up) >> 1
          const diff = (nextEdges[middle]?.poolLiquidity as number) - liquidity
          if (diff > 0) up = middle
          else if (diff < 0) low = middle + 1
          else {
            low = middle
            break
          }
        }
        nextEdges.splice(low, 0, edge)
      }
    }
  }

  private _updatePricesForPools(
    pools: RPool[],
    sensability = MIN_VALUABLE_PRICE_CHANGE,
  ) {
    // Auxiliary
    const tokens: (TokenInfo | undefined)[] = new Array(pools.length)
    let changedPrices = 0

    // set changedPoolIndex for all tokens with changed price + create new priced tokens
    for (let i = pools.length - 1; i >= 0; --i) {
      const pool = pools[i] as RPool
      tokens[i] = undefined // not price-making pool or duplicated pool
      const token = this.poolTokenMap.get(pool.uniqueID())
      if (token) {
        if (!this._isPoolStillPricable(pool, token)) {
          if (token.totalSuccessors === 0) {
            this._deleteChildlessToken(pool, token)
            continue
          }
          this.fullPricesRecalcFlag = true
        }
        if (token.changedPoolIndex === undefined) {
          const newPoolPrice = pool.calcCurrentPriceWithoutFee(!token.direction)
          if (
            makePricesRecalcForPool(token.poolPrice, newPoolPrice, sensability)
          ) {
            tokens[i] = token
            token.changedPoolIndex = i
            // console.log(
            //   `Pool update ${
            //     pool.address
            //   } price=${newPoolPrice} r0=${pool.getReserve0()} r1=${pool.getReserve1()}`,
            // )
          }
        }
      } else if (this._checkAndAddNewToken(pool) !== undefined) {
        // maybe create new priced token
        ++changedPrices
      }
    }

    for (let i = pools.length - 1; i >= 0; --i) {
      if (tokens[i] === undefined) continue // just for optimization

      // finding firstChangedToken
      let firstChangedToken: TokenInfo | undefined = undefined
      for (
        let token: TokenInfo | undefined = tokens[i];
        token !== undefined;
        token = token.parent
      ) {
        if (token?.changedPoolIndex !== undefined) firstChangedToken = token
      }

      // update price for firstChangedToken and all dependent tokens
      if (firstChangedToken) {
        this._updatePricesForToken(firstChangedToken, 1, pools, tokens)
        changedPrices += firstChangedToken.totalSuccessors + 1
      }
    }

    return changedPrices
  }

  // recursive function for token and subtokens prices updating
  private _updatePricesForToken(
    token: TokenInfo,
    priceMultiplicator: number,
    pools: RPool[],
    tokens: (TokenInfo | undefined)[],
  ) {
    const poolIndex = token.changedPoolIndex
    if (poolIndex !== undefined) {
      // update priceMultiplicator and poolPrice
      const newPoolPrice = pools[poolIndex]?.calcCurrentPriceWithoutFee(
        !token.direction,
      ) as number
      priceMultiplicator = (priceMultiplicator / token.poolPrice) * newPoolPrice
      tokens[poolIndex] = undefined
      // @ts-ignore
      token.changedPoolIndex = undefined
      token.poolPrice = newPoolPrice
    }

    // update price
    this.prices[token.address] *= priceMultiplicator

    for (let i = token.children.length - 1; i >= 0; --i)
      this._updatePricesForToken(
        token.children[i] as TokenInfo,
        priceMultiplicator,
        pools,
        tokens,
      )
  }

  private _isPoolStillPricable(pool: RPool, tokenInfo: TokenInfo) {
    let token
    let reserve
    if (tokenInfo.direction) {
      token = pool.token0
      reserve = Number(pool.getReserve0())
    } else {
      token = pool.token1
      reserve = Number(pool.getReserve1())
    }
    const price = this.prices[token.address] as number
    const liquidity = (reserve * price) / 10 ** token.decimals
    tokenInfo.poolLiquidity = liquidity
    const minLiquidityK = DEBUG_COMPARE_PARTIAL_UPDATE_WITH_TINES_PRICES
      ? 1
      : MIN_PRICABLE_LIQUIDITY
    if (liquidity < this.minLiquidity * minLiquidityK) {
      // console.log(
      //   `Pool ${pool.address} is not pricable (price: ${
      //     tokenInfo.poolPrice
      //   } => ${pool.calcCurrentPriceWithoutFee(
      //     !tokenInfo.direction,
      //   )}), r0=${pool.getReserve0()}, r1=${pool.getReserve1()} ${liquidity}`,
      // )
      return false
    }
    return true
  }

  private _checkAndAddNewToken(pool: RPool): TokenInfo | undefined {
    const price0 = this.prices[pool.token0.address]
    const price1 = this.prices[pool.token1.address]
    if (price1 === undefined) {
      if (price0 === undefined) return // both tokens are unpriced
      if (!this.trustedTokenSet.has(pool.token0.address as Address)) return
      const liquidity =
        (Number(pool.reserve0) * price0) / 10 ** pool.token0.decimals
      if (liquidity < this.minLiquidity) return // too low liquidity for pricing
      return this._addNewToken(pool, true, price0, liquidity)
    } else {
      if (price0 !== undefined) return // both tokens are priced
      if (!this.trustedTokenSet.has(pool.token1.address as Address)) return
      const liquidity =
        (Number(pool.reserve1) * price1) / 10 ** pool.token1.decimals
      if (liquidity < this.minLiquidity) return // too low liquidity for pricing
      return this._addNewToken(pool, false, price1, liquidity)
    }
  }

  private _addNewToken(
    pool: RPool,
    direction: boolean,
    priceFrom: number,
    liquidity: number,
  ): TokenInfo {
    const [tokenFrom, tokenTo] = direction
      ? [pool.token0, pool.token1]
      : [pool.token1, pool.token0]
    const tokenFromInfo = this.tokenMap.get(
      tokenFrom.address as Address,
    ) as TokenInfo
    const poolPrice = pool.calcCurrentPriceWithoutFee(!direction)
    const tokenToInfo: TokenInfo = new TokenInfo(
      tokenTo,
      direction,
      poolPrice,
      tokenFromInfo,
      pool.address,
      liquidity,
    )
    this.poolTokenMap.set(pool.uniqueID(), tokenToInfo)
    this.tokenMap.set(tokenTo.address as Address, tokenToInfo)
    this.prices[tokenTo.address as Address] =
      (priceFrom / tokenFromInfo.decExp) * poolPrice * tokenToInfo.decExp
    ++this.pricesSize
    // console.log(
    //   `Pool added ${
    //     pool.address
    //   } price=${poolPrice} r0=${pool.getReserve0()} r1=${pool.getReserve1()}`,
    // )
    return tokenToInfo
  }

  private _deleteChildlessToken(pool: RPool, token: TokenInfo) {
    this.poolTokenMap.delete(pool.uniqueID())
    this.tokenMap.delete(token.address)
    delete this.prices[token.address]
    --this.pricesSize
    const place = token.parent?.children.indexOf(token)
    if (place !== undefined && place >= 0)
      token.parent?.children.splice(place, 1)
    token.parent = undefined
  }
}

function comparePrices(
  errMsg: string,
  prices0: Record<string, number>,
  prices0Length: number,
  prices1: Record<string, number>,
  precision = 1e-10,
) {
  const tokens0 = Object.keys(prices0)
  checkEqual(tokens0.length, prices0Length, errMsg, 'pricesSize is incorrect')
  tokens0.forEach((t) => {
    const price0 = prices0?.[t] as number
    const price1 = prices1?.[t]
    if (
      price1 === undefined ||
      (price0 === 0 && price1 !== 0) ||
      Math.abs(price1 / price0 - 1) > precision
    )
      console.error(
        `${errMsg}: token ${t} wrong prices: ${price0} != ${price1}`,
      )
  })
  Object.keys(prices1).forEach((t) => {
    if (prices0[t] === undefined) {
      console.error(
        `${errMsg}: token ${t} wrong prices: ${prices0[t]} != ${prices1[t]}`,
      )
    }
  })
}

export function compareCommonPrices(
  errMsg: string,
  prices0: Record<string, number>,
  prices1: Record<string, number>,
  precision = 1e-10,
): number {
  const tokens0 = Object.keys(prices0)
  let quantity = 0
  tokens0.forEach((t) => {
    if (prices1[t] === undefined) return
    ++quantity
    const price0 = prices0?.[t] as number
    const price1 = prices1?.[t] as number
    if (
      (price0 === 0 && price1 !== 0) ||
      Math.abs(price1 / price0 - 1) > precision
    )
      console.error(
        `${errMsg}: token ${t} wrong prices: ${price0} != ${price1}`,
      )
  })
  return quantity
}

function checkEqual<T>(v0: T, v1: T, ...errMsg: string[]) {
  if (v0 !== v1) console.error(`${errMsg.join(': ')}: ${v0} != ${v1}`)
}

function checkNotEqual<T>(v0: T, v1: T, ...errMsg: string[]) {
  if (v0 === v1) console.error(`${errMsg.join(': ')}: ${v0} != ${v1}`)
}
