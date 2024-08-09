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
    await page.route('https://tokens.sushi.com/v0', async (route) => {
      // const response = await route.fetch()
      // const json = await response.json()
      await route.fulfill({
        json: [FAKE_TOKEN].map((token) => ({
          id: token.id,
          chainId: token.chainId,
          address: token.address.toLowerCase(),
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
        })),
      })
    })
  } catch (error) {
    console.error('error mockking token api', error)
  }

  // TEMP: Mock V2 POOL..
  await page.route(
    'https://data.sushi.com', // TODO: update url
    async (route) => {
      await route.fulfill({
        json: {
          data: {
            v2Pool: {
              id: '137:0x3221022e37029923ace4235d812273c5a42c322d',
              chainId: 42161,
              name: 'WMATIC / FT',
              address: '0x3221022e37029923ace4235d812273c5a42c322d',
              createdAt: '1630455405',
              swapFee: 0.003,
              protocol: 'SUSHISWAP_V2',
              token0: {
                id: '137:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                chainId: 137,
                decimals: 18,
                name: 'Wrapped Matic',
                symbol: 'WMATIC',
              },
              token1: FAKE_TOKEN,
              source: 'SUBGRAPH',
              reserve0: '14632715635223519232',
              reserve1: '66374911905262165000000',
              liquidity: '736541498034438406144',
              volumeUSD: 56162969.922308594,
              liquidityUSD: 71429.02585542823,
              token0Price: 0.0002204555187373958,
              token1Price: 4536.062448004257,
              volumeUSD1d: 1444.4034653156996,
              feeUSD1d: 4.333210395940114,
              txCount1d: 104,
              feeApr1d: 0.022142564252791732,
              totalApr1d: 0.022142564252791732,
              volumeUSD1dChange: -0.43870093251068154,
              feeUSD1dChange: -0.4387009325124158,
              txCount1dChange: -0.11864406779661019,
              liquidityUSD1dChange: 0.01395086513190713,
              incentiveApr: 0,
              isIncentivized: false,
              wasIncentivized: false,
              incentives: [],
            },
          },
        },
      })
    },
  )

  await page.route('http://localhost:3000/api/**/*', async (route) => {
    await route.abort()
  })
  await page.route('http://localhost:3000/pool/api/**/*', async (route) => {
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
    await poolPage.switchNetwork(chainId)

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

    // await poolPage.removeLiquidityV3(FAKE_TOKEN) // TODO: enable once you can determine what the position ID will be
  })
})

test.describe('V2', () => {
  test.skip(!isSushiSwapV2ChainId(chainId))

  test('Create, add & remove', async ({ page, next }) => {
    test.slow()
    const poolPage = new PoolPage(page, chainId)

    const url = BASE_URL.concat(`/${chainId.toString()}/pool/v2/add`)
    await poolPage.goTo(url)
    await poolPage.connect()
    await poolPage.switchNetwork(chainId)

    await poolPage.mockPoolApi(
      next,
      poolPage.nativeToken.wrapped,
      FAKE_TOKEN,
      Fee.DEFAULT,
      'SUSHISWAP_V2',
    )

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
