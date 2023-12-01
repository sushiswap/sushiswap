import { DataFetcher, Router } from '@sushiswap/router'
import { RouteStatus } from '@sushiswap/tines'
import { expect } from 'chai'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { ChainId } from 'sushi/chain'
import { Native, Token, Type, USDC, WNATIVE } from 'sushi/currency'
import { createPublicClient } from 'viem'
import { http, Address } from 'viem'
import { hardhat } from 'viem/chains'

//const RouteProcessorAddr = '0x9B3fF703FA9C8B467F5886d7b61E61ba07a9b51c'
const RouteProcessorAddr = '0xf267704dd1393c26b39a6d41f49bea233b34f722' // new Route Processor

const cUSDC = new Token({
  chainId: ChainId.CELO,
  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  decimals: 18,
  symbol: 'cUSD',
  name: 'Celo Dollar',
})

async function makeSwap(
  dataFetcher: DataFetcher,
  signer: Signer,
  fromToken: Type,
  toToken: Type,
  _from: Address,
  to: Address,
  amountIn: bigint,
): Promise<number | undefined> {
  await dataFetcher.fetchPoolsForToken(fromToken, toToken)
  const pcMap = dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)
  const route = Router.findBestRoute(
    pcMap,
    ChainId.CELO,
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
    const RouteProcessorFactory = await ethers.getContractFactory(
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
    // console.log(parseInt(res.toString()))
    return parseInt(res.toString())
  }
}

describe('Celo RP3', async () => {
  const chainId = ChainId.CELO
  const provider = new ethers.providers.JsonRpcProvider(
    'https://forno.celo.org',
    42220,
  )
  const client = createPublicClient({
    chain: {
      ...hardhat,
      contracts: {
        multicall3: {
          address: '0xca11bde05977b3631167028862be2a173976ca11',
          blockCreated: 13112599,
        },
      },
      pollingInterval: 1_000,
    },
    transport: http('https://forno.celo.org'),
  })

  const dataFetcher = new DataFetcher({ chainId, client })
  dataFetcher.startDataFetching()

  it('CELO => USDC', async () => {
    const fromToken = Native.onChain(chainId)
    const toToken = USDC[chainId]
    const signer = await provider.getUncheckedSigner(WNATIVE[chainId].address)

    await makeSwap(
      dataFetcher,
      signer,
      fromToken,
      toToken,
      WNATIVE[chainId].address as Address,
      WNATIVE[chainId].address as Address,
      10n * BigInt(1e18),
    )
  })

  it('cUSDC => WRAPPED CELO', async () => {
    const fromToken = cUSDC
    const toToken = WNATIVE[chainId]
    const user = '0xed30404098da5948d8B3cBD7958ceB641F2C352c' // has cUSDC and approved 800000 to the RP
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(dataFetcher, signer, fromToken, toToken, user, user, 800000n)
  })

  it('cUSDC => Native CELO', async () => {
    const fromToken = cUSDC
    const toToken = Native.onChain(chainId)
    const user = '0xed30404098da5948d8B3cBD7958ceB641F2C352c' // has cUSDC and approved 800000 to the RP
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(dataFetcher, signer, fromToken, toToken, user, user, 800000n)
  })
})
