import { DataFetcher, Router } from '@sushiswap/router'
import { RouteStatus } from '@sushiswap/tines'
import { expect } from 'chai'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { ChainId } from 'sushi/chain'
import { Native, Token, Type, USDC, WNATIVE } from 'sushi/currency'
import { createPublicClient } from 'viem'
import { http } from 'viem'
import { hardhat } from 'viem/chains'

//const RouteProcessorAddr = '0x9B3fF703FA9C8B467F5886d7b61E61ba07a9b51c'
//const RouteProcessorAddr = '0x3e1116eA5034f5D73a7B530071709D54A4109F5f'
const RouteProcessorAddr = '0xCaAbdD9Cf4b61813D4a52f980d6BC1B713FE66F5' // new Route Processor

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
  _from: string,
  to: string,
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
    const rpParams = Router.routeProcessorParams(
      pcMap,
      route,
      fromToken,
      toToken,
      to,
      RouteProcessorAddr,
    )

    const RouteProcessorFactory = await ethers.getContractFactory(
      'RouteProcessor',
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

describe('Celo', async () => {
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
  // const chainId = ChainId.CELO

  // const provider = new ethers.providers.JsonRpcProvider(
  //   `https://celo-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
  //   42220
  // )

  // const dataFetcher = new DataFetcher(provider, chainId)
  // dataFetcher.startDataFetching()

  it('CELO => USDC', async () => {
    const signer = await provider.getUncheckedSigner(WNATIVE[chainId].address)
    await makeSwap(
      dataFetcher,
      signer,
      Native.onChain(chainId),
      USDC[chainId],
      WNATIVE[chainId].address,
      WNATIVE[chainId].address,
      10n * BigInt(1e18),
    )
  })

  it('cUSDC => WRAPPED CELO', async () => {
    const user = '0xed30404098da5948d8B3cBD7958ceB641F2C352c' // has cUSDC and approved 800000 to the RP
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(
      dataFetcher,
      signer,
      cUSDC,
      WNATIVE[chainId],
      user,
      user,
      800000n,
    )
  })

  // Swap to native token not supported - use wrapped token instead (that is similar)
  it.skip('cUSDC => Native CELO: not supported', async () => {
    const user = '0xed30404098da5948d8B3cBD7958ceB641F2C352c' // has cUSDC and approved 800000 to the RP
    const signer = await provider.getUncheckedSigner(user)
    await makeSwap(
      dataFetcher,
      signer,
      cUSDC,
      Native.onChain(chainId),
      user,
      user,
      800000n,
    )
  })
})
