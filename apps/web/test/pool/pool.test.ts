import { test } from 'next/experimental/testmode/playwright.js'
import {
  SushiSwapV3FeeAmount,
  isSushiSwapV2ChainId,
  isSushiSwapV3ChainId,
} from 'sushi/config'
import { Native, Token } from 'sushi/currency'
import { Fee } from 'sushi/dex'
import { chainId } from 'test/constants'
import { createERC20 } from 'test/erc20'
import { PoolPage } from 'test/helpers/pool'
import { interceptAnvil } from 'test/intercept-anvil'

const NATIVE_TOKEN = Native.onChain(chainId)

let FAKE_TOKEN: Token
const BASE_URL = 'http://localhost:3000'

test.beforeAll(async () => {
  // console.log('beforeAll pool tests')

  try {
    FAKE_TOKEN = await createERC20({
      chainId,
      name: 'FakeToken',
      symbol: 'FT',
      decimals: 18,
    })
  } catch (error) {
    console.error(
      'error creating fake token',
      {
        chainId,
        name: 'FakeToken',
        symbol: 'FT',
        decimals: 18,
      },
      error,
    )

    // Test won't pass anyway
    throw error
  }
})

test.beforeEach(async ({ page, next }) => {
  page.on('pageerror', (error) => {
    console.error(error)
  })

  if (!FAKE_TOKEN) {
    throw new Error("FAKE_TOKEN doesn't exist")
  }

  try {
    await page.route(`**/price/v1/${chainId}`, async (route) => {
      // const response = await route.fetch()
      // const json = await response.json()
      await route.fulfill({
        json: {},
      })
    })
  } catch (error) {
    console.error('error mockking token api', error)
  }

  await page.route('http://localhost:3000/api/**/*', async (route) => {
    await route.abort()
  })

  try {
    await interceptAnvil(page, next)
  } catch (error) {
    console.error('error intercepting anvil', error)
  }

  next.onFetch(() => {
    return 'continue'
  })
})

// test.afterEach(async ({ page }) => {
//   await page.unrouteAll({ behavior: 'ignoreErrors' })
// })

// Tests will only work for polygon atm
test.describe('V3', () => {
  test.skip(!isSushiSwapV3ChainId(chainId))
  test('Create, add both sides, single side each token & remove', async ({
    page,
    next,
  }) => {
    test.slow()
    const url = BASE_URL.concat(`/${chainId.toString()}/pool/v3/add`)
    const poolPage = new PoolPage(page, chainId)

    await poolPage.mockPoolApi(
      next,
      poolPage.nativeToken.wrapped,
      FAKE_TOKEN,
      SushiSwapV3FeeAmount.HIGH,
      'SUSHISWAP_V3',
    )

    await poolPage.goTo(url)
    await poolPage.connect()

    await poolPage.createV3Pool({
      token0: NATIVE_TOKEN,
      token1: FAKE_TOKEN,
      startPrice: '0.5',
      minPrice: '0.1',
      maxPrice: '0.9',
      amount: '0.0001',
      amountBelongsToToken0: false,
    })

    await poolPage.addLiquidityV3({
      token0: NATIVE_TOKEN,
      token1: FAKE_TOKEN,
      minPrice: '0.2',
      maxPrice: '0.4',
      amount: '0.0001',
      amountBelongsToToken0: false,
    })

    await poolPage.removeLiquidityV3(FAKE_TOKEN) // TODO: enable once you can determine what the position ID will be
  })
})

test.describe('V2', () => {
  test.skip(!isSushiSwapV2ChainId(chainId))

  test('Create, add & remove', async ({ page, next }) => {
    test.slow()
    const poolPage = new PoolPage(page, chainId)

    const url = BASE_URL.concat(`/${chainId.toString()}/pool/v2/add`)

    await poolPage.mockPoolApi(
      next,
      poolPage.nativeToken.wrapped,
      FAKE_TOKEN,
      Fee.DEFAULT,
      'SUSHISWAP_V2',
    )

    await poolPage.goTo(url)
    await poolPage.connect()

    await poolPage.createV2Pool({
      token0: NATIVE_TOKEN,
      token1: FAKE_TOKEN,
      amount0: '1',
      amount1: '1',
    })

    await poolPage.addLiquidityV2({
      token0: NATIVE_TOKEN,
      token1: FAKE_TOKEN,
      amount0: '10',
      amount1: '10',
    })

    await poolPage.removeLiquidityV2(FAKE_TOKEN)
  })
})
