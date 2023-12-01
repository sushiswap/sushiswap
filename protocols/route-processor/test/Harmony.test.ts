import { DataFetcher, Router } from '@sushiswap/router'
import { RouteStatus } from '@sushiswap/tines'
import { expect } from 'chai'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { ChainId } from 'sushi/chain'
import { Native, Token, Type } from 'sushi/currency'
import { createPublicClient } from 'viem'
import { http, Address } from 'viem'
import { hardhat } from 'viem/chains'

import { RouteProcessor3__factory } from '../typechain'

const RouteProcessorAddr = '0xBBDe1d67297329148Fe1ED5e6B00114842728e65' // new Route Processor

const DAI = new Token({
  chainId: ChainId.HARMONY,
  address: '0xEf977d2f931C1978Db5F6747666fa1eACB0d0339',
  decimals: 18,
  symbol: 'DAI',
  name: 'Dai Stablecoin',
})

async function makeSwap(
  dataFetcher: DataFetcher,
  signer: Signer,
  fromToken: Type,
  toToken: Type,
  _from: string,
  to: Address,
  amountIn: bigint,
): Promise<number | undefined> {
  await dataFetcher.fetchPoolsForToken(fromToken, toToken)
  const pcMap = dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)
  const route = Router.findBestRoute(
    pcMap,
    ChainId.HARMONY,
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
      //{ value: rpParams.value?.toString() }
      { value: rpParams.value?.toString(), gasPrice: 1000e9 }, // this fixes the issue...
    )
    return parseInt(res.toString())
  }
}

describe.skip('Harmony', async () => {
  const chainId = ChainId.HARMONY
  const provider = new ethers.providers.JsonRpcProvider(
    'https://api.harmony.one',
    1666600000,
  )
  const client = createPublicClient({
    chain: {
      ...hardhat,
      contracts: {
        multicall3: {
          address: '0xcA11bde05977b3631167028862bE2a173976CA11',
          blockCreated: 24185753,
        },
      },
      pollingInterval: 1_000,
    },
    transport: http('https://api.harmony.one'),
  })

  const dataFetcher = new DataFetcher({ chainId, client })
  dataFetcher.startDataFetching()

  it('ONE => DAI', async () => {
    const fromToken = Native.onChain(chainId)
    const toToken = DAI
    const user = '0x8f54C8c2df62c94772ac14CcFc85603742976312'
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(
      dataFetcher,
      signer,
      fromToken,
      toToken,
      user,
      user,
      BigInt(1e18),
    )
  })

  it('DAI => ONE', async () => {
    const fromToken = DAI
    const toToken = Native.onChain(chainId)
    const user = '0x8f54C8c2df62c94772ac14CcFc85603742976312' // has DAI and approved 1e18 to the RP
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(
      dataFetcher,
      signer,
      fromToken,
      toToken,
      user,
      user,
      BigInt(1e18),
    )
  })
})
