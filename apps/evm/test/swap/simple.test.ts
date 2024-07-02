// @ts-nocheck

import { test } from 'next/experimental/testmode/playwright.js'
import { ChainId } from 'sushi/chain'
import { Native, Token, USDC, USDT, WBTC } from 'sushi/currency'

import { SupportedChainId } from 'src/config'
import { SwapPage } from 'test/helpers/swap'
import {
  // createSnapshot,
  interceptAnvil,
  // loadSnapshot,
} from 'test/intercept-anvil'

if (
  typeof process.env.NEXT_PUBLIC_CHAIN_ID !== 'string' ||
  !process.env.NEXT_PUBLIC_CHAIN_ID
) {
  throw new Error('NEXT_PUBLIC_CHAIN_ID not set')
}

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) as SupportedChainId

const url = 'http://localhost:3000/swap'

const native = Native.onChain(chainId)
const wnative = native.wrapped

const polygonBridgedUsdc = new Token({
  chainId: ChainId.POLYGON,
  address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  symbol: 'USDC.e',
  name: 'USD Coin (PoS)',
  decimals: 6,
})

const usdc = chainId === ChainId.POLYGON ? polygonBridgedUsdc : USDC[chainId]
const usdt = USDT[chainId]
const wbtc = WBTC[chainId]
// let snapshot: string

test.beforeAll(async () => {
  // snapshot = await createSnapshot(chainId)
})

test.beforeEach(async ({ page, next }) => {
  page.on('pageerror', (error) => {
    console.error(error)
  })
  // await loadSnapshot(chainId, snapshot)

  await page.route('http://localhost:3000/api/swap', async (route) => {
    await route.fallback({ json: { maintenance: false } })
  })

  await page.route(
    'http://localhost:3000/api/balance/v0/**/*',
    async (route) => {
      await route.fulfill({ json: {} })
    },
  )

  await page.route('http://tokens.sushi.com/v0', async (route) => {
    await route.fulfill({
      json: [wnative, usdc, usdt, wbtc].map((token) => ({
        id: token.id,
        chainId: token.chainId,
        address: token.address.toLowerCase(),
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
      })),
    })
  })

  try {
    await interceptAnvil(page, next)
  } catch (_e) {
    throw new Error('error intercepting anvil', _e)
  }

  next.onFetch(() => {
    return 'continue'
  })
})

test('Wrap and unwrap', async ({ page }) => {
  test.slow()
  const swapPage = new SwapPage(page, chainId)
  await swapPage.goTo(url)
  await swapPage.connect()
  await swapPage.switchNetwork(chainId)
  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-wrap.json`)
  await swapPage.wrap(native, wnative, '10')

  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-unwrap.json`)
  await swapPage.wrap(wnative, native, '10')
})

test('swap Native to USDC, then USDC to NATIVE', async ({ page }) => {
  test.slow()
  const swapPage = new SwapPage(page, chainId)
  await swapPage.goTo(url)
  await swapPage.connect()
  await swapPage.switchNetwork(chainId)
  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-native-to-usdc.json`)
  await swapPage.swap(native, usdc, '100')

  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-usdc-to-native.json`)
  await swapPage.maxSwap(usdc, native)
})

test('swap Native to USDT, then USDT to NATIVE', async ({ page }) => {
  test.slow()
  const swapPage = new SwapPage(page, chainId)
  await swapPage.goTo(url)
  await swapPage.connect()
  await swapPage.switchNetwork(chainId)
  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-native-to-usdt.json`)
  await swapPage.swap(native, usdt, '100')

  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-usdt-to-native.json`)
  await swapPage.maxSwap(usdt, native)
})

test('Swap Native to USDC, USDC to USDT then USDT to NATIVE', async ({
  page,
}) => {
  test.slow()
  const swapPage = new SwapPage(page, chainId)
  await swapPage.goTo(url)
  await swapPage.connect()
  await swapPage.switchNetwork(chainId)
  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-native-to-usdc.json`)
  await swapPage.swap(native, usdc, '100')

  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-usdc-to-usdt.json`)
  await swapPage.maxSwap(usdc, usdt)

  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-usdt-to-native.json`)
  await swapPage.maxSwap(usdt, native)
})

test('Swap Native to WBTC', async ({ page }) => {
  test.slow()
  const swapPage = new SwapPage(page, chainId)
  await swapPage.goTo(url)
  await swapPage.connect()
  await swapPage.switchNetwork(chainId)

  await swapPage.mockSwapApi(`test/swap/mock/${chainId}-native-to-wbtc.json`)
  await swapPage.swap(native, wbtc, '7000')
})
