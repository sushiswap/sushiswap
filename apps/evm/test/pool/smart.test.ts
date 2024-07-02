// import {
//   Page,
//   // NextFixture,
//   expect,
//   test,
// } from 'next/experimental/testmode/playwright.js'
// import { SupportedChainId } from 'src/config'
// import { ChainId } from 'sushi/chain'
// import { prepareERC20Balance as setupERC20Balance } from 'test/erc20'
// import { interceptAnvil } from 'test/intercept-anvil'

// if (typeof process.env.NEXT_PUBLIC_CHAIN_ID !== 'string') {
//   new Error('NEXT_PUBLIC_CHAIN_ID not set')
// }
// const BASE_URL = 'http://localhost:3000/pool'

// const CHAIN_ID = Number(
//   process.env.NEXT_PUBLIC_CHAIN_ID as string,
// ) as SupportedChainId

// test.beforeEach(async ({ page }) => {
//   test.skip(CHAIN_ID !== ChainId.POLYGON)

//   try {
//     await interceptAnvil(page)
//   } catch (error) {
//     console.error('error intercepting anvil', error)
//   }
//   await setupERC20Balance({
//     chainId: CHAIN_ID,
//   })
// })

// test.beforeEach(async ({ page, next }) => {
//   page.on('pageerror', (error) => {
//     console.error(error)
//   })

// next.onFetch(() => {
//   return 'continue'
// })

//   await page.goto(BASE_URL)
//   await switchNetwork(page, CHAIN_ID)
// })

// test.afterAll(async () => {})
// test.afterEach(async () => {})

// // TODO: need to setup config to target specific pools depending on the network, however, the user need to change as well if more networks are added

// test('Create and remove smart pool position', async ({ page }) => {
//   test.slow()
//   await addSmartPoolPosition(page)
//   await page.goto(BASE_URL)
//   await removeSmartPoolPosition(page)
// })

// async function addSmartPoolPosition(page: Page) {
//   const poolId = '137-0x3361bf42cca22dc5fe37c7bd2c6a7284db440dfc'
//   await page.locator('[testdata-id=smart-pools-button]').click()

//   const smartPoolRowLocator = page.locator(
//     `[testdata-id=smart-pools-table-${poolId}]`,
//   )
//   await expect(smartPoolRowLocator).toBeVisible()
//   await smartPoolRowLocator.click()

//   await page.locator('[testdata-id=add-liquidity-token0-input]').fill('0.00005')

//   const approveToken0Locator = page.locator(
//     '[testdata-id=approve-erc20-0-button]',
//   )
//   await expect(approveToken0Locator).toBeVisible()
//   await expect(approveToken0Locator).toBeEnabled()
//   await approveToken0Locator.click()

//   const approveToken1Locator = page.locator(
//     '[testdata-id=approve-erc20-1-button]',
//   )
//   await expect(approveToken1Locator).toBeVisible()
//   await expect(approveToken1Locator).toBeEnabled()
//   await approveToken1Locator.click()

//   const reviewLocator = page.locator(
//     '[testdata-id=add-steer-liquidity-preview-button]',
//   )
//   await expect(reviewLocator).toBeVisible()
//   await expect(reviewLocator).toBeEnabled()
//   await reviewLocator.click()

//   const confirmLocator = page.locator(
//     '[testdata-id=confirm-add-liquidity-button]',
//   )
//   await expect(confirmLocator).toBeVisible()
//   await expect(confirmLocator).toBeEnabled()
//   await confirmLocator.click()

//   const expectedText = '(Successfully added liquidity to the .* smart pool)'
//   const regex = new RegExp(expectedText)
//   await expect(page.getByText(regex)).toBeVisible()
// }

// async function removeSmartPoolPosition(page: Page) {
//   // FIXME: Currently disabled until we can make the smart positions table show the position.
//   // await page.locator('[testdata-id=my-positions-button]').click()
//   // await page.locator('[testdata-id=sushiswap-smart]').click()

//   // const concentratedPositionTableSelector = page.locator(
//   //   '[testdata-id=smart-positions-loading-0]',
//   // )
//   // await expect(concentratedPositionTableSelector).not.toBeVisible()

//   // const firstPositionSelector = page.locator(
//   //   '[testdata-id=smart-positions-0-0-td]',
//   // )
//   // await expect(firstPositionSelector).toBeVisible()
//   // await firstPositionSelector.click()

//   const poolId = '137-0x3361bf42cca22dc5fe37c7bd2c6a7284db440dfc'
//   await page.locator('[testdata-id=smart-pools-button]').click()
//   await switchNetwork(page, CHAIN_ID)

//   const smartPoolRowLocator = page.locator(
//     `[testdata-id=smart-pools-table-${poolId}]`,
//   )
//   await expect(smartPoolRowLocator).toBeVisible()
//   await smartPoolRowLocator.click()

//   const removeLiquidityTabSelector = page.locator('[testdata-id=remove-tab]')
//   await expect(removeLiquidityTabSelector).toBeVisible()
//   await removeLiquidityTabSelector.click()

//   await page.locator('[testdata-id=liquidity-max-button]').click()

//   const removeLiquidityLocator = page.locator(
//     '[testdata-id=remove-or-add-steer-liquidity-button]',
//   )

//   await expect(removeLiquidityLocator).toBeVisible()
//   await expect(removeLiquidityLocator).toBeEnabled()
//   await removeLiquidityLocator.click()

//   const regex = new RegExp(
//     '(Successfully removed liquidity from the .* smart pool)',
//   )
//   await expect(page.getByText(regex)).toBeVisible()
// }

// async function switchNetwork(page: Page, chainId: number) {
//   const networkSelector = page.locator('[testdata-id=network-selector-button]')
//   await expect(networkSelector).toBeVisible()
//   await expect(networkSelector).toBeEnabled()
//   await networkSelector.click()

//   const networkToSelect = page.locator(
//     `[testdata-id=network-selector-${chainId}]`,
//   )
//   await expect(networkToSelect).toBeVisible()
//   await expect(networkToSelect).toBeEnabled()
//   await networkToSelect.click()
// }
