import { Page } from '@playwright/test'
import { NextFixture } from 'next/experimental/testmode/playwright'
import { http, Address, createTestClient } from 'viem'
import { foundry } from 'viem/chains'

const url = `http://127.0.0.1:8545/${process.env['TEST_PARALLEL_INDEX']}`

export const interceptAnvil = async (page: Page, next: NextFixture) => {
  await page.route('http://127.0.0.1:8545', async (route, request) => {
    // console.log(
    //   `intercept anvil request url ${request.url()} and re-write to ${url}`,
    // )
    const response = await route.fetch({
      ...request,
      method: request.method(),
      headers: request.headers(),
      url,
    })
    await route.fulfill({ response })
  })

  next.onFetch((request) => {
    if (request.url === 'http://127.0.0.1:8545/') {
      // console.log(
      //   `intercept anvil request url ${request.url} and re-write to ${url}`
      // )
      return fetch(url, request)
    }
  })
}

export async function createSnapshot(chainId: number): Promise<Address> {
  const client = createTestClient({
    chain: {
      ...foundry,
      id: chainId,
    },
    mode: 'anvil',
    transport: http(url),
  })
  return await client.snapshot()
}

export async function loadSnapshot(chainId: number, snapshot: Address) {
  const client = createTestClient({
    chain: {
      ...foundry,
      id: chainId,
    },
    mode: 'anvil',
    transport: http(url),
  })
  await client.revert({ id: snapshot })
  console.log(`reset state to snapshot id: ${snapshot}`)
}
