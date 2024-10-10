import { Page, expect } from '@playwright/test'
import { NextFixture } from 'next/experimental/testmode/playwright'
import { NativeAddress } from 'src/lib/constants'
import {
  SUSHISWAP_V2_FACTORY_ADDRESS,
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SushiSwapV2ChainId,
  SushiSwapV3ChainId,
  SushiSwapV3FeeAmount,
} from 'sushi/config'
import { Native, Token, Type } from 'sushi/currency'
import {
  computeSushiSwapV2PoolAddress,
  computeSushiSwapV3PoolAddress,
} from 'sushi/pool'
import { BaseActions } from './base' // Adjust the import path as necessary

interface CreateV3PoolArgs {
  token0: Type
  token1: Type
  startPrice: string
  minPrice: string
  maxPrice: string
  amount: string
  amountBelongsToToken0: boolean
}

interface AddV3LiquidityArgs {
  token0: Type
  token1: Type
  minPrice: string
  maxPrice: string
  amount: string
  amountBelongsToToken0: boolean
}

interface CreateV2PoolArgs {
  token0: Type
  token1: Type
  amount0: string
  amount1: string
}
interface AddV2LiquidityArgs {
  token0: Type
  token1: Type
  amount0: string
  amount1: string
}
const BASE_URL = 'http://localhost:3000'

export class PoolPage extends BaseActions {
  readonly chainId: number
  readonly nativeToken: Native
  constructor(page: Page, chainId: number) {
    super(page)
    this.chainId = chainId
    this.nativeToken = Native.onChain(chainId)
  }

  async goTo(url: string) {
    await this.page.goto(url)
  }

  async createV3Pool(args: CreateV3PoolArgs) {
    await this.handleToken(args.token0, 'FIRST')
    await this.handleToken(args.token1, 'SECOND')
    const feeOptionSelector = this.page.locator(
      '[testdata-id=fee-option-10000]',
    )
    await expect(feeOptionSelector).toBeEnabled()
    await feeOptionSelector.click()
    await expect(feeOptionSelector).toHaveAttribute('data-state', 'on')

    const startPriceInput = this.page.locator('[testdata-id=start-price-input]')
    await startPriceInput.isVisible()
    await startPriceInput.isEnabled()
    await startPriceInput.fill(args.startPrice, { timeout: 15_000 })

    // Fill min price
    const minPriceInput = this.page.locator('[testdata-id=min-price-input]')
    await minPriceInput.fill(args.minPrice)
    // Fill max price
    const maxPriceInput = this.page.locator('[testdata-id=max-price-input]')
    await maxPriceInput.fill(args.maxPrice)

    const tokenOrderNumber = args.amountBelongsToToken0 ? 0 : 1
    await this.page
      .locator(`[testdata-id=add-liquidity-token${tokenOrderNumber}-input]`)
      .fill(args.amount)

    await this.switchNetwork(this.chainId)

    if (
      (args.amountBelongsToToken0 && !args.token0.isNative) ||
      (!args.amountBelongsToToken0 && !args.token1.isNative)
    ) {
      const approveTokenLocator = this.page.locator(
        `[testdata-id=${`approve-erc20-${tokenOrderNumber}-button`}]`,
      )
      await expect(approveTokenLocator).toBeVisible()
      await expect(approveTokenLocator).toBeEnabled()
      await approveTokenLocator.click()
    }
    const previewLocator = this.page.locator(
      '[testdata-id=add-liquidity-preview-button]',
    )
    await expect(previewLocator).toBeVisible({ timeout: 10_000 })
    await expect(previewLocator).toBeEnabled()
    await previewLocator.click()
    await this.page
      .locator('[testdata-id=confirm-add-liquidity-button]')
      .click()

    const expectedText = `(Created the ${args.token0.symbol}/${args.token1.symbol} liquidity pool)`
    const regex = new RegExp(expectedText)
    expect(this.page.getByText(regex))
  }

  async createV2Pool(args: CreateV2PoolArgs) {
    await this.handleToken(args.token0, 'FIRST')
    await this.handleToken(args.token1, 'SECOND')

    const input0 = this.page.locator('[testdata-id=add-liquidity-token0-input]')
    await expect(input0).toBeEnabled()
    await input0.fill(args.amount0)
    expect(input0).toHaveValue(args.amount0)

    const input1 = this.page.locator('[testdata-id=add-liquidity-token1-input]')
    await expect(input1).toBeEnabled()
    await input1.fill(args.amount1)
    expect(input1).toHaveValue(args.amount1)

    await this.switchNetwork(this.chainId)

    const approveTokenId = `approve-token-${
      args.token0.isNative ? 1 : 0
    }-button`
    const approveTokenLocator = this.page.locator(
      `[testdata-id=${approveTokenId}]`,
    )
    await expect(approveTokenLocator).toBeVisible()
    await expect(approveTokenLocator).toBeEnabled()
    await approveTokenLocator.click()

    const reviewSelector = '[testdata-id=add-liquidity-button]'
    const reviewButton = this.page.locator(reviewSelector)
    await expect(reviewButton).toBeVisible()
    await expect(reviewButton).toBeEnabled()
    await reviewButton.click({ timeout: 2_000 })

    const confirmButton = this.page.locator(
      '[testdata-id=confirm-add-v2-liquidity-button]',
    )
    await expect(confirmButton).toBeVisible()
    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    const expectedText = `(Successfully added liquidity to the ${args.token0.symbol}/${args.token1.symbol} pair)`
    const regex = new RegExp(expectedText)
    expect(this.page.getByText(regex))
  }

  async addLiquidityV2(args: AddV2LiquidityArgs) {
    await this.handleToken(args.token0, 'FIRST')
    await this.handleToken(args.token1, 'SECOND')

    // Only fill in the token that is not native if we are adding liquidity to an existing pool.
    const input = this.page.locator(
      `[testdata-id=add-liquidity-token${args.token0.isNative ? 1 : 0}-input]`,
    )
    await expect(input).toHaveAttribute('data-state', 'active')
    await expect(input).toBeEnabled()
    await input.fill(args.token0.isNative ? args.amount1 : args.amount0)
    expect(input).toHaveValue(
      args.token0.isNative ? args.amount1 : args.amount0,
    )

    const approveTokenId = `approve-token-${
      args.token0.isNative ? 1 : 0
    }-button`
    const approveTokenLocator = this.page.locator(
      `[testdata-id=${approveTokenId}]`,
    )
    await expect(approveTokenLocator).toBeVisible()
    await expect(approveTokenLocator).toBeEnabled()
    await approveTokenLocator.click()

    const reviewSelector = '[testdata-id=add-liquidity-button]'
    const reviewButton = this.page.locator(reviewSelector)
    await expect(reviewButton).toBeVisible()
    await expect(reviewButton).toBeEnabled()
    await reviewButton.click({ timeout: 2_000 })

    const confirmButton = this.page.locator(
      '[testdata-id=confirm-add-v2-liquidity-button]',
    )
    await expect(confirmButton).toBeVisible()
    await expect(confirmButton).toBeEnabled()
    await confirmButton.click()

    const expectedText = `(Successfully added liquidity to the ${args.token0.symbol}/${args.token1.symbol} pair)`
    const regex = new RegExp(expectedText)
    expect(this.page.getByText(regex))
  }

  async addLiquidityV3(args: AddV3LiquidityArgs) {
    await this.handleToken(args.token0, 'FIRST')
    await this.handleToken(args.token1, 'SECOND')
    const feeOptionSelector = this.page.locator(
      '[testdata-id=fee-option-10000]',
    )
    await expect(feeOptionSelector).toBeEnabled()
    await feeOptionSelector.click()
    await expect(feeOptionSelector).toHaveAttribute('data-state', 'on')

    // Fill min price
    const minPriceInput = this.page.locator('[testdata-id=min-price-input]')
    await minPriceInput.fill(args.minPrice)
    // await expect(minPriceInput).not.toHaveValue(minPriceValueBefore)

    // Fill max price
    const maxPriceInput = this.page.locator('[testdata-id=max-price-input]')

    await maxPriceInput.fill(args.maxPrice)
    // await expect(maxPriceInput).not.toHaveValue(maxPriceValueBefore)

    const tokenOrderNumber = args.amountBelongsToToken0 ? 0 : 1
    await this.page
      .locator(`[testdata-id=add-liquidity-token${tokenOrderNumber}-input]`)
      .fill(args.amount)

    if (
      (args.amountBelongsToToken0 && !args.token0.isNative) ||
      (!args.amountBelongsToToken0 && !args.token1.isNative)
    ) {
      const approveTokenLocator = this.page.locator(
        `[testdata-id=${`approve-erc20-${tokenOrderNumber}-button`}]`,
      )
      await expect(approveTokenLocator).toBeVisible()
      await expect(approveTokenLocator).toBeEnabled()
      await approveTokenLocator.click()
    }
    const previewLocator = this.page.locator(
      '[testdata-id=add-liquidity-preview-button]',
    )
    await expect(previewLocator).toBeVisible({ timeout: 10_000 })
    await expect(previewLocator).toBeEnabled()
    await previewLocator.click()
    await this.page
      .locator('[testdata-id=confirm-add-liquidity-button]')
      .click()

    const expectedText = `(Successfully added liquidity to the ${args.token0.symbol}/${args.token1.symbol} pair)`

    const regex = new RegExp(expectedText)
    expect(this.page.getByText(regex))
  }

  async removeLiquidityV3(fakeToken: Token) {
    const poolAddress = computeSushiSwapV3PoolAddress({
      factoryAddress:
        SUSHISWAP_V3_FACTORY_ADDRESS[this.chainId as SushiSwapV3ChainId],
      tokenA: this.nativeToken.wrapped,
      tokenB: fakeToken,
      fee: SushiSwapV3FeeAmount.HIGH,
    })
    const url = BASE_URL.concat(
      `/${this.chainId.toString()}/pool/v3/${poolAddress.toLowerCase()}/positions`,
    )
    await this.page.goto(url)
    await this.connect()

    const concentratedPositionTableSelector = this.page.locator(
      '[testdata-id=concentrated-positions-loading-0]',
    )
    await expect(concentratedPositionTableSelector).not.toBeVisible()

    const firstPositionSelector = this.page.locator(
      '[testdata-id=concentrated-positions-0-0-td]',
    )
    await expect(firstPositionSelector).toBeVisible()
    await firstPositionSelector.click()
    const removeLiquidityTabSelector = this.page.locator(
      '[testdata-id=remove-tab]',
    )
    await expect(removeLiquidityTabSelector).toBeVisible()
    await removeLiquidityTabSelector.click()

    await this.switchNetwork(this.chainId)

    await this.page.locator('[testdata-id=liquidity-max-button]').click()
    const handleLiquidityLocator = this.page.locator(
      '[testdata-id=remove-or-add-liquidity-button]',
    )
    await expect(handleLiquidityLocator).toBeVisible()
    await expect(handleLiquidityLocator).toBeEnabled() // needed, not sure why, my guess is that a web3 call hasn't finished and button shouldn't be enabled yet.
    await handleLiquidityLocator.click()

    const confirmLiquidityLocator = this.page.locator(
      '[testdata-id=confirm-remove-liquidity-button]',
    )
    await expect(confirmLiquidityLocator).toBeVisible()
    await expect(confirmLiquidityLocator).toBeEnabled() // needed, not sure why, my guess is that a web3 call hasn't finished and button shouldn't be enabled yet.
    await confirmLiquidityLocator.click({ timeout: 5_000 })

    const regex = /('(Successfully removed liquidity from the .* pair)')/
    expect(this.page.getByText(regex))
  }

  async removeLiquidityV2(fakeToken: Token) {
    const poolAddress = computeSushiSwapV2PoolAddress({
      factoryAddress:
        SUSHISWAP_V2_FACTORY_ADDRESS[this.chainId as SushiSwapV2ChainId],
      tokenA: this.nativeToken.wrapped,
      tokenB: fakeToken,
    })

    const url = BASE_URL.concat(
      `/${this.chainId.toString()}/pool/v2/${poolAddress.toLowerCase()}/remove`,
    )
    await this.page.goto(url)
    await this.connect()

    // const removeLiquidityTabSelector = page.locator('[testdata-id=remove-tab]')
    // await expect(removeLiquidityTabSelector).toBeVisible()
    // await removeLiquidityTabSelector.click()

    const removeMaxButtonSelector = this.page.locator(
      '[testdata-id=remove-liquidity-max-button]',
    )
    await expect(removeMaxButtonSelector).toBeVisible()
    await removeMaxButtonSelector.click()

    await this.switchNetwork(this.chainId)

    const selectApprovalTypeId = 'select-approval-type-button'
    const selectApprovalTypeLocator = this.page.locator(
      `[testdata-id=${selectApprovalTypeId}]`,
    )
    await expect(selectApprovalTypeLocator).toBeVisible()
    await selectApprovalTypeLocator.click()

    const selectApproveId = 'approval-type-approve-button'
    const selectApproveLocator = this.page.locator(
      `[testdata-id=${selectApproveId}]`,
    )
    await expect(selectApproveLocator).toBeVisible()
    await selectApproveLocator.click()

    const approveSlpId = 'approve-remove-liquidity-slp-button'
    const approveSlpLocator = this.page.locator(`[testdata-id=${approveSlpId}]`)
    await expect(approveSlpLocator).toBeVisible()
    await expect(approveSlpLocator).toBeEnabled()
    await approveSlpLocator.click()

    const removeLiquidityLocator = this.page.locator(
      '[testdata-id=remove-liquidity-button]',
    )

    await expect(removeLiquidityLocator).toBeVisible()
    await expect(removeLiquidityLocator).toBeEnabled()
    await removeLiquidityLocator.click()

    const regex = /('(Successfully removed liquidity from the .* pair)')/
    expect(this.page.getByText(regex))
  }

  // Private helper methods for internal class use
  private async handleToken(currency: Type, order: 'FIRST' | 'SECOND') {
    const selectorInfix = `token${order === 'FIRST' ? 0 : 1}`
    const tokenSelector = this.page.locator(
      `[testdata-id=${selectorInfix}-select-button]`,
    )
    await expect(tokenSelector).toBeVisible()
    await tokenSelector.click()

    if (currency.isNative) {
      const chipToSelect = this.page.locator(
        `[testdata-id=token-selector-chip-${NativeAddress}]`,
      )
      await expect(chipToSelect).toBeVisible()

      await chipToSelect.click()
      await expect(tokenSelector).toContainText(currency.symbol as string)
    } else {
      // const tokenSearch = this.page.locator(
      //   `[testdata-id=token-selector-address-input]`,
      // )
      // await expect(tokenSearch).toBeVisible()
      // await expect(tokenSearch).toBeEnabled()
      // await tokenSearch.fill(currency.address)

      const tokenToSelect = this.page.locator(
        `[testdata-id=token-selector-row-${currency.address.toLowerCase()}]`,
      )
      await expect(tokenToSelect).toBeVisible()

      await tokenToSelect.click()
      await expect(tokenSelector).toContainText(currency.symbol as string)
    }
  }

  async mockPoolApi(
    next: NextFixture,
    token0: Token,
    token1: Token,
    fee: number,
    protocol: 'SUSHISWAP_V2' | 'SUSHISWAP_V3',
  ) {
    next.onFetch(async (request) => {
      // console.log('REQUEST', request.url.toLowerCase())

      const [tokenA, tokenB] = token0.sortsBefore(token1)
        ? [token0, token1]
        : [token1, token0] // does safety checks

      let address

      if (protocol === 'SUSHISWAP_V3') {
        address = computeSushiSwapV3PoolAddress({
          factoryAddress:
            SUSHISWAP_V3_FACTORY_ADDRESS[this.chainId as SushiSwapV3ChainId],
          tokenA,
          tokenB,
          fee: fee,
        }).toLowerCase()
      } else if (protocol === 'SUSHISWAP_V2') {
        address = computeSushiSwapV2PoolAddress({
          factoryAddress:
            SUSHISWAP_V2_FACTORY_ADDRESS[this.chainId as SushiSwapV2ChainId],
          tokenA,
          tokenB,
        }).toLowerCase()
      } else {
        console.error('>>>>>>>>> UNKNOWN PROTOCOL')
        throw Error('Unknown protocol')
      }
      const mockPool =
        protocol === 'SUSHISWAP_V2'
          ? {
              data: {
                v2Pool: {
                  id: `${this.chainId}:${address}`.toLowerCase(),
                  chainId: this.chainId,
                  name: 'WMATIC / FT',
                  address,
                  createdAt: '1630455405',
                  protocol,
                  // swapFee: fee / (protocol === 'SUSHISWAP_V3' ? 1000000 : 10000),
                  swapFee: fee / 10000,

                  token0: {
                    id: `${tokenA.chainId}:${tokenA.address}`.toLowerCase(),
                    address: tokenA.address.toLowerCase(),
                    name: tokenA.name,
                    symbol: tokenA.symbol,
                    decimals: tokenA.decimals,
                    chainId: tokenA.chainId,
                  },
                  token1: {
                    id: `${tokenB.chainId}:${tokenB.address}`.toLowerCase(),
                    address: tokenB.address.toLowerCase(),
                    name: tokenB.name,
                    symbol: tokenB.symbol,
                    decimals: tokenB.decimals,
                    chainId: tokenB.chainId,
                  },
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
            }
          : {
              data: {
                v3Pool: {
                  id: `${this.chainId}:${address}`.toLowerCase(),
                  chainId: this.chainId,
                  name: 'WMATIC / FT',
                  address,
                  createdAt: '1630455405',
                  protocol,
                  swapFee: fee / 1_000_000,

                  token0: {
                    id: `${tokenA.chainId}:${tokenA.address}`.toLowerCase(),
                    address: tokenA.address.toLowerCase(),
                    name: tokenA.name,
                    symbol: tokenA.symbol,
                    decimals: tokenA.decimals,
                    chainId: tokenA.chainId,
                  },
                  token1: {
                    id: `${tokenB.chainId}:${tokenB.address}`.toLowerCase(),
                    address: tokenB.address.toLowerCase(),
                    name: tokenB.name,
                    symbol: tokenB.symbol,
                    decimals: tokenB.decimals,
                    chainId: tokenB.chainId,
                  },
                  source: 'SUBGRAPH',
                  reserve0: '97138000822798992',
                  reserve1: '251532847196719',
                  liquidity: '190259449333200569961',
                  sqrtPrice: '77543082754135133119551574769',
                  tick: '-430',
                  observationIndex: '0',
                  feeGrowthGlobal0X128: '1913748811595781336300706674643883',
                  feeGrowthGlobal1X128: '1490989199114543008131607233327172',
                  volumeUSD: 124770.3303415501,
                  liquidityUSD: 327.7942814599597,
                  token0Price: 1.0439339999465262,
                  token1Price: 0.9579149640218858,
                  volumeUSD1d: 0,
                  feeUSD1d: 0,
                  txCount1d: 0,
                  feeApr1d: 0,
                  totalApr1d: 0,
                  volumeUSD1dChange: 0,
                  feeUSD1dChange: 0,
                  txCount1dChange: 0,
                  liquidityUSD1dChange: 0,
                  incentiveApr: 0,
                  hadSmartPool: false,
                  hasSmartPool: false,
                  isIncentivized: false,
                  wasIncentivized: false,
                  incentives: [],
                  vaults: [],
                },
              },
            }

      if (request.url.toLowerCase().endsWith('/graphql')) {
        console.log({ request })
        const requestBody = await request.json()
        const operationName = requestBody.operationName
        console.log({ operationName })

        if (operationName === 'TrendingTokens') {
          return new Response(
            JSON.stringify({
              data: {
                trendingTokens: [],
              },
            }),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        }

        if (operationName === 'TokenList') {
          return new Response(
            JSON.stringify({
              data: {
                trendingTokens: [
                  {
                    ...tokenA,
                    approved: true,
                  },
                  {
                    ...tokenB,
                    approved: true,
                  },
                ],
              },
            }),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        }

        if (operationName === 'TokenListBalances') {
          return new Response(
            JSON.stringify({
              data: {
                tokenListBalances: [
                  {
                    ...tokenA,
                    approved: true,
                    balance: '10000000000000000000000',
                  },
                  {
                    ...tokenB,
                    approved: true,
                    balance: '10000000000000000000000',
                  },
                ],
              },
            }),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        }
        if (operationName.includes('Pool')) {
          return new Response(JSON.stringify(mockPool), {
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      }
    })
  }
}
