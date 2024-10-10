import { Page, expect } from '@playwright/test'
import { createERC20 } from 'test/erc20'

export class BaseActions {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async connect() {
    const connectSelector = this.page
      .locator('[testdata-id=connect-button]')
      .first()
    await expect(connectSelector).toBeVisible()
    await expect(connectSelector).toBeEnabled()
    await connectSelector.click({ delay: 500 })
  }

  async selectNetwork(chainId: number) {
    const networkToSelect = this.page.locator(
      `[testdata-id=network-selector-${chainId}]`,
    )
    await expect(networkToSelect).toBeVisible()
    await expect(networkToSelect).toBeEnabled()
    await networkToSelect.click()
  }

  async switchNetwork(chainId: number) {
    const switchNetworkBtn = this.page.locator(
      `[testdata-id=switch-network-${chainId}-button]`,
    )
    await expect(switchNetworkBtn).toBeVisible()
    await expect(switchNetworkBtn).toBeEnabled()
    await switchNetworkBtn.click()
  }

  async deployFakeToken(details: {
    chainId: number
    name: string
    symbol: string
    decimals: number
  }) {
    let fakeToken
    try {
      fakeToken = await createERC20({
        chainId: details.chainId,
        name: details.name,
        symbol: details.symbol,
        decimals: details.decimals,
      })
      console.log(`Token created: ${details.name} (${details.symbol})`)
      return fakeToken
    } catch (error) {
      console.error('Error creating fake token', details, error)
      throw new Error('Failed to create fake token')
    }
  }
}
