// @ts-nocheck

import { Page } from '@playwright/test'
import { expect, test } from 'next/experimental/testmode/playwright'
import { DAI, Native, SUSHI, Type, USDC, USDT, WBTC } from 'sushi/currency'
import { zeroAddress } from 'viem'

import { SupportedChainId } from 'src/config'
import { interceptAnvil } from 'test/intercept-anvil'

type InputType = 'INPUT' | 'OUTPUT'

if (typeof process.env.NEXT_PUBLIC_CHAIN_ID !== 'string') {
  new Error('NEXT_PUBLIC_CHAIN_ID not set')
}

const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) as SupportedChainId

const url = 'http://localhost:3000/swap'

const native = Native.onChain(chainId)
const wnative = native.wrapped

const usdc = USDC[chainId]
const usdt = USDT[chainId]
const _dai = DAI[chainId]
const _sushi = SUSHI[chainId]
const wbtc = WBTC[chainId]

// test.beforeAll(async () => {
//   console.log('beforeAll swap tests')
// })

test.beforeEach(async ({ page, next }) => {
  page.on('pageerror', (error) => {
    console.error(error)
  })

  await page.route('http://localhost:3000/api/**/*', async (route) => {
    await route.abort()
  })

  await page.route('https://tokens.sushi.com/v2', async (route) => {
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
  } catch (error) {
    console.error('error intercepting anvil', error)
  }

  next.onFetch(() => {
    return 'continue'
  })

  await page.goto(url)
  await switchNetwork(page, chainId)
})

// test.afterAll(async () => {})
// test.afterEach(async ({ page }) => {})

test('Wrap and unwrap', async ({ page }) => {
  test.slow()
  await wrap(page, native, wnative, '10')
  await wrap(page, wnative, native, '10')
})

// test('Swap Native to SUSHI, then SUSHI to NATIVE', async ({ page }) => {
//   test.slow()
//   await swap(page, native, sushi, '10')
//   await maxSwap(page, sushi, native)
// })

test('Swap Native to USDC, then USDC to NATIVE', async ({ page }) => {
  test.slow()

  await swap(page, native, usdc, '100')
  await maxSwap(page, usdc, native)
})

test('Swap Native to USDT, then USDT to NATIVE', async ({ page }) => {
  test.slow()

  await swap(page, native, usdt, '100')
  await maxSwap(page, usdt, native)
})

test('Swap Native to USDC, USDC to USDT then USDT to NATIVE', async ({
  page,
}) => {
  test.slow()

  await swap(page, native, usdc, '100')
  await maxSwap(page, usdc, usdt)
  await maxSwap(page, usdt, native)
})

// test('Swap Native to USDC, USDC to DAI, DAI to USDT then USDT to NATIVE ', async ({ page }) => {
//   await swap(page, native, usdc, '100')
//   await maxSwap(page, usdc, dai)
//   await maxSwap(page, dai, usdt)
//   await maxSwap(page, usdt, native)
// })

test('Swap Native to WBTC', async ({ page }) => {
  test.slow()
  await swap(page, native, wbtc, '1')
})

async function wrap(
  page: Page,
  inputCurrency: Type,
  outputCurrency: Type,
  amount: string,
) {
  await handleToken(page, inputCurrency, 'INPUT')
  await handleToken(page, outputCurrency, 'OUTPUT')
  await inputAmount(page, amount)

  if (!inputCurrency.isNative) {
    const approveButton = page.locator('[testdata-id=approve-erc20-button]', {
      hasText: `Approve ${inputCurrency.symbol}`,
    })
    await expect(approveButton).toBeVisible()
    await expect(approveButton).toBeEnabled()

    await page
      .locator('[testdata-id=approve-erc20-button]', {
        hasText: `Approve ${inputCurrency.symbol}`,
      })
      .click()

    const expectedApprovingText = `Approving ${inputCurrency.symbol}`
    expect(page.getByText(expectedApprovingText)).toBeVisible()

    const expectedApproveText = `Successfully approved ${inputCurrency.symbol}`
    expect(page.getByText(expectedApproveText)).toBeVisible()
  }

  const swapButton = page.locator('[testdata-id=swap-button]')
  await expect(swapButton).toBeVisible()
  await expect(swapButton).toBeEnabled()
  await expect(swapButton).toHaveText(
    inputCurrency.isNative ? 'Wrap' : 'Unwrap',
  )
  await swapButton.click()

  const confirmSwapButton = page.locator('[testdata-id=confirm-swap-button]')
  await expect(confirmSwapButton).toBeVisible()
  await expect(confirmSwapButton).toBeEnabled()
  await confirmSwapButton.click()

  // If this text is duplicated elsewhere it could false positive
  const expectedText = new RegExp(
    `(${inputCurrency.isNative ? 'Wrap' : 'Unwrap'} .* ${
      inputCurrency.symbol
    } to .* ${outputCurrency.symbol})`,
  )
  expect(page.getByText(expectedText)).toBeVisible()

  const makeAnotherSwap = page.locator(
    '[testdata-id=make-another-swap-button]',
    {
      hasText: 'Make another swap',
    },
  )
  await expect(makeAnotherSwap).toBeVisible()
  await expect(makeAnotherSwap).toBeEnabled()
  await makeAnotherSwap.click()
}

async function swap(
  page: Page,
  inputCurrency: Type,
  outputCurrency: Type,
  amount: string,
) {
  await handleToken(page, inputCurrency, 'INPUT')
  await handleToken(page, outputCurrency, 'OUTPUT')
  await inputAmount(page, amount)

  const swapFromBalance = page.locator('[testdata-id=swap-from-balance-button]')
  await expect(swapFromBalance).toBeVisible()
  await expect(swapFromBalance).toBeEnabled()
  const swapFromBalanceBefore = await swapFromBalance.textContent()

  const swapToBalance = page.locator('[testdata-id=swap-to-balance-button]')
  await expect(swapToBalance).toBeVisible()
  const swapToBalanceBefore = await swapToBalance.textContent()

  await approve(page, inputCurrency)

  const swapButton = page.locator('[testdata-id=swap-button]')
  await expect(swapButton).toBeVisible()

  // const priceImpactCheckbox = page.locator(
  //   '[testdata-id=price-impact-checkbox]',
  // )
  // while (!(await swapButton.isEnabled())) {
  //   if (
  //     (await priceImpactCheckbox.isVisible()) &&
  //     !(await priceImpactCheckbox.isChecked())
  //   ) {
  //     await priceImpactCheckbox.check()
  //   }
  // }

  await swapButton.isEnabled()

  await swapButton.click()

  const confirmSwap = page.locator('[testdata-id=confirm-swap-button]')
  // const confirmSwap = page.getByRole('button', { name: `Swap ${inputCurrency.symbol} for ${outputCurrency.symbol}` })
  await expect(confirmSwap).toBeVisible()
  await expect(confirmSwap).toBeEnabled()
  await confirmSwap.click()

  // If this text is duplicated elsewhere it could false positive
  const expectedSwappingText = new RegExp(
    `(Swapping .* ${inputCurrency.symbol}.* for .* ${outputCurrency.symbol}.*.)`,
  )
  expect(page.getByText(expectedSwappingText)).toBeVisible()

  // If this text is duplicated elsewhere it could false positive
  const expectedSwapText = new RegExp(
    `(Swap .* ${inputCurrency.symbol}.* for .* ${outputCurrency.symbol}.*.)`,
  )
  expect(page.getByText(expectedSwapText)).toBeVisible()

  // Make another swap
  const makeAnotherSwap = page.locator('[testdata-id=make-another-swap-button]')
  await expect(makeAnotherSwap).toBeVisible()
  await expect(makeAnotherSwap).toBeEnabled()
  await makeAnotherSwap.click()

  // Compare against cached balances to ensure there is at least a change...
  await expect(swapFromBalance).not.toHaveText(swapFromBalanceBefore as string)
  const swapFromBalanceAfter = await swapFromBalance.textContent()
  expect(swapFromBalanceBefore).not.toEqual(swapFromBalanceAfter)

  await expect(swapToBalance).not.toHaveText(swapToBalanceBefore as string)
  const swapToBalanceAfter = await swapToBalance.textContent()
  expect(swapToBalanceBefore).not.toEqual(swapToBalanceAfter)
}

async function maxSwap(page: Page, inputCurrency: Type, outputCurrency: Type) {
  await handleToken(page, inputCurrency, 'INPUT')
  await handleToken(page, outputCurrency, 'OUTPUT')

  await maxInput(page)

  // Cache balances before swap
  const swapFromBalance = page.locator('[testdata-id=swap-from-balance-button]')
  await expect(swapFromBalance).toBeVisible()
  await expect(swapFromBalance).toBeEnabled()
  const swapFromBalanceBefore = await swapFromBalance.textContent()
  const swapToBalance = page.locator('[testdata-id=swap-to-balance-button]')
  await expect(swapToBalance).toBeVisible()
  const swapToBalanceBefore = await swapToBalance.textContent()

  await approve(page, inputCurrency)

  const swapButton = page.locator('[testdata-id=swap-button]')
  await expect(swapButton).toBeVisible()

  const priceImpactCheckbox = page.locator(
    '[testdata-id=price-impact-checkbox]',
  )
  while (!(await swapButton.isEnabled())) {
    if (
      (await priceImpactCheckbox.isVisible()) &&
      !(await priceImpactCheckbox.isChecked())
    ) {
      await priceImpactCheckbox.check()
    }
  }

  await expect(swapButton).toBeEnabled()
  await swapButton.click()

  const confirmSwap = page.locator('[testdata-id=confirm-swap-button]')
  // const confirmSwap = page.getByRole('button', { name: `Swap ${inputCurrency.symbol} for ${outputCurrency.symbol}` })
  await expect(confirmSwap).toBeVisible()
  await expect(confirmSwap).toBeEnabled()
  await confirmSwap.click()

  const expectedSwappingText = new RegExp(
    `(Swapping .* ${inputCurrency.symbol}.* for .* ${outputCurrency.symbol}.*.)`,
  )
  expect(page.getByText(expectedSwappingText)).toBeVisible()

  const expectedSwapText = new RegExp(
    `(Swap .* ${inputCurrency.symbol}.* for .* ${outputCurrency.symbol}.*.)`,
  )
  expect(page.getByText(expectedSwapText)).toBeVisible()

  // Make another swap
  const makeAnotherSwap = page.locator('[testdata-id=make-another-swap-button]')
  await expect(makeAnotherSwap).toBeVisible()
  await expect(makeAnotherSwap).toBeEnabled()
  await makeAnotherSwap.click()

  // Compare against cached balances to ensure there is at least a change...
  await expect(swapFromBalance).not.toHaveText(swapFromBalanceBefore as string)
  const swapFromBalanceAfter = await swapFromBalance.textContent()
  expect(swapFromBalanceBefore).not.toEqual(swapFromBalanceAfter)

  await expect(swapToBalance).not.toHaveText(swapToBalanceBefore as string)
  const swapToBalanceAfter = await swapToBalance.textContent()
  expect(swapToBalanceBefore).not.toEqual(swapToBalanceAfter)
}

async function approve(page: Page, currency: Type) {
  if (!currency.isNative) {
    const approveButton = page.locator('[testdata-id=approve-erc20-button]', {
      hasText: `Approve ${currency.symbol}`,
    })
    await expect(approveButton).toBeVisible()
    await expect(approveButton).toBeEnabled()
    await approveButton.click()
    // .then(() => console.log(`Approved ${inputCurrency.symbol}`))
    // .catch(() => console.log(`${inputCurrency.symbol} already approved or not needed`))

    const expectedApprovingText = `Approving ${currency.symbol}`
    await expect(page.getByText(expectedApprovingText)).toBeVisible()

    const expectedApproveText = `Successfully approved ${currency.symbol}`
    await expect(page.getByText(expectedApproveText)).toBeVisible()
  }
}

async function handleToken(page: Page, currency: Type, type: InputType) {
  const selectorInfix = `${type === 'INPUT' ? 'from' : 'to'}`

  // Open token list
  const tokenSelector = page.locator(
    `[testdata-id=swap-${selectorInfix}-button]`,
  )
  await expect(tokenSelector).toBeVisible()
  await expect(tokenSelector).toBeEnabled()
  await tokenSelector.click()

  const tokenSearch = page.locator(
    `[testdata-id=swap-${selectorInfix}-token-selector-address-input]`,
  )
  await expect(tokenSearch).toBeVisible()
  await expect(tokenSearch).toBeEnabled()
  await tokenSearch.fill(currency.symbol as string)

  const tokenToSelect = page.locator(
    `[testdata-id=swap-${selectorInfix}-token-selector-row-${
      currency.isNative ? zeroAddress : currency.address.toLowerCase()
    }]`,
  )
  await expect(tokenToSelect).toBeVisible()
  // await expect(tokenSearch).toBeEnabled()

  await tokenToSelect.click()
  await expect(tokenSelector).toContainText(currency.symbol as string)
}

async function maxInput(page: Page) {
  const maxButton = page.locator('[testdata-id=swap-from-balance-button]')
  await expect(maxButton).toBeVisible()
  await expect(maxButton).toBeEnabled()
  await maxButton.click()
}

async function inputAmount(page: Page, amount: string) {
  const input0 = page.locator('[testdata-id=swap-from-input]')
  // Inputs are not rendered until the trade is found
  await expect(input0).toBeVisible()
  await expect(input0).toBeEnabled()
  await input0.fill(amount)
}

async function switchNetwork(page: Page, chainId: number) {
  const networkSelector = page.locator('[testdata-id=network-selector-button]')
  await expect(networkSelector).toBeVisible()
  await expect(networkSelector).toBeEnabled()
  await networkSelector.click()

  const networkToSelect = page.locator(
    `[testdata-id=network-selector-${chainId}]`,
  )
  await expect(networkToSelect).toBeVisible()
  await expect(networkToSelect).toBeEnabled()
  await networkToSelect.click()

  const fromToken = page.locator('[testdata-id=swap-from-button]')
  await expect(fromToken).toHaveText(native.symbol)
}
