import { DataFetcher, LiquidityProviders, Router } from '@sushiswap/router'
import { RouteStatus } from '@sushiswap/tines'
import { expect } from 'chai'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { ChainId } from 'sushi/chain'
import { Native, SUSHI, Type } from 'sushi/currency'
import { createPublicClient } from 'viem'
import { http } from 'viem'
import { hardhat } from 'viem/chains'

import { RouteProcessor3__factory } from '../typechain'

const RouteProcessorAddr = '0x05689fCfeE31FCe4a67FbC7Cab13E74F80A4E288' // new Route Processor

async function makeSwap(
  dataFetcher: DataFetcher,
  signer: Signer,
  fromToken: Type,
  toToken: Type,
  _from: string,
  to: string,
  amountIn: bigint,
): Promise<number | undefined> {
  await dataFetcher.fetchPoolsForToken(fromToken, toToken)
  const pcMap = dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)
  const route = Router.findBestRoute(
    pcMap,
    ChainId.ARBITRUM_NOVA,
    fromToken,
    amountIn,
    toToken,
    50e9,
  )
  expect(route?.status).equal(RouteStatus.Success)
  if (route && pcMap) {
    const rpParams = Router.routeProcessor2Params(
      pcMap,
      route,
      fromToken,
      toToken,
      to,
      RouteProcessorAddr,
    )
    const RouteProcessorFactory =
      await ethers.getContractFactory<RouteProcessor3__factory>(
        'RouteProcessor3',
        signer,
      )
    const RouteProcessor = RouteProcessorFactory.attach(RouteProcessorAddr)
    const res = await RouteProcessor.callStatic.processRoute(
      rpParams.tokenIn,
      rpParams.amountIn,
      rpParams.tokenOut,
      rpParams.amountOutMin,
      rpParams.to,
      rpParams.routeCode,
      { value: rpParams.value?.toString() },
    )
    return parseInt(res.toString())
  }
}

describe('Arbitrum Nova RP3', async () => {
  const chainId = ChainId.ARBITRUM_NOVA
  const provider = new ethers.providers.JsonRpcProvider(
    'https://nova.arbitrum.io/rpc',
    42170,
  )
  const client = createPublicClient({
    chain: {
      ...hardhat,
      contracts: {
        multicall3: {
          address: '0x4d81f45fcde2B1C9A93Bde5495dc3553bbEC8EFa',
          blockCreated: 400008,
        },
      },
    },
    transport: http('https://nova.arbitrum.io/rpc'),
  })

  const dataFetcher = new DataFetcher({ chainId, client })
  dataFetcher.startDataFetching([LiquidityProviders.SushiSwapV2])

  it('ETH => SUSHI', async () => {
    const fromToken = Native.onChain(ChainId.ARBITRUM_NOVA)
    const toToken = SUSHI[ChainId.ARBITRUM_NOVA]
    const user = '0x8f54C8c2df62c94772ac14CcFc85603742976312'
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(
      dataFetcher,
      signer,
      fromToken,
      toToken,
      user,
      user,
      BigInt(1e17),
    )
  })

  it('SUSHI => ETH', async () => {
    const fromToken = SUSHI[ChainId.ARBITRUM_NOVA]
    const toToken = Native.onChain(ChainId.ARBITRUM_NOVA)
    const user = '0x8f54C8c2df62c94772ac14CcFc85603742976312' // has SUSHI and approved 1e18 to the RP
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(
      dataFetcher,
      signer,
      fromToken,
      toToken,
      user,
      user,
      BigInt(1e17),
    )
  })
})
