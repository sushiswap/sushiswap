import { test } from 'next/experimental/testmode/playwright'
import { SupportedChainId } from 'src/config'
import {
  SushiSwapV3FeeAmount,
  isSushiSwapV2ChainId,
  isSushiSwapV3ChainId,
} from 'sushi/config'
import { Native, Token } from 'sushi/currency'
import { Fee } from 'sushi/dex'
import { createERC20 } from 'test/erc20'
import { PoolPage } from 'test/helpers/pool'
import { interceptAnvil } from 'test/intercept-anvil'

if (typeof process.env.NEXT_PUBLIC_CHAIN_ID !== 'string') {
  new Error('NEXT_PUBLIC_CHAIN_ID not set')
}

const CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID as string,
) as SupportedChainId
const NATIVE_TOKEN = Native.onChain(CHAIN_ID)

let FAKE_TOKEN: Token

// let MOCK_TOKEN_1_DP: Token
// let MOCK_TOKEN_6_DP: Token
// let MOCK_TOKEN_8_DP: Token
// let MOCK_TOKEN_18_DP: Token
// const EVM_APP_BASE_URL =
//   process.env['NEXT_PUBLIC_EVM_APP_BASE_URL'] ||
//   (process.env['NEXT_PUBLIC_VERCEL_URL']
//     ? `https://${process.env['NEXT_PUBLIC_VERCEL_URL']}`
//     : 'http://localhost:3000')
const BASE_URL = 'http://localhost:3000/pool'

test.beforeAll(async () => {
  // console.log('beforeAll pool tests')

  try {
    FAKE_TOKEN = await createERC20({
      chainId: CHAIN_ID,
      name: 'FakeToken',
      symbol: 'FT',
      decimals: 18,
    })
    // MOCK_TOKEN_1_DP = await createERC20({
    //   chainId: CHAIN_ID,
    //   name: 'MOCK_TOKEN_1_DP',
    //   symbol: '1_DP',
    //   decimals: 1,
    // })
    // MOCK_TOKEN_6_DP = await createERC20({
    //   chainId: CHAIN_ID,
    //   name: 'MOCK_TOKEN_6_DP',
    //   symbol: '6_DP',
    //   decimals: 6,
    // })
    // MOCK_TOKEN_8_DP = await createERC20({
    //   chainId: CHAIN_ID,
    //   name: 'MOCK_TOKEN_8_DP',
    //   symbol: '8_DP',
    //   decimals: 8,
    // })
    // MOCK_TOKEN_18_DP = await createERC20({
    //   chainId: CHAIN_ID,
    //   name: 'MOCK_TOKEN_18_DP',
    //   symbol: '18_DP',
    //   decimals: 18,
    // })
  } catch (error) {
    console.error(
      'error creating fake token',
      {
        chainId: CHAIN_ID,
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
  test.skip(!isSushiSwapV3ChainId(CHAIN_ID))
  test('Create, add both sides, single side each token & remove', async ({
    page,
    next,
  }) => {
    test.slow()
    const url = BASE_URL.concat('/add').concat(`?chainId=${CHAIN_ID}`)
    const poolPage = new PoolPage(page, CHAIN_ID)

    await poolPage.mockPoolApi(
      next,
      poolPage.nativeToken.wrapped,
      FAKE_TOKEN,
      SushiSwapV3FeeAmount.HIGH,
      'SUSHISWAP_V3',
    )

    await poolPage.goTo(url)
    await poolPage.connect()
    await poolPage.switchNetwork(CHAIN_ID)

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

    await poolPage.removeLiquidityV3(FAKE_TOKEN)
  })
})

test.describe('V2', () => {
  test.skip(!isSushiSwapV2ChainId(CHAIN_ID))

  test('Create, add & remove', async ({ page, next }) => {
    test.slow()
    const poolPage = new PoolPage(page, CHAIN_ID)

    const url = BASE_URL.concat(`/add/v2/${CHAIN_ID}`)
    await poolPage.goTo(url)
    await poolPage.connect()
    await poolPage.switchNetwork(CHAIN_ID)
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
