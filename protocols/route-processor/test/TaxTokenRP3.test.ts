import { DataFetcher, RPParams, Router } from '@sushiswap/router'
import { MultiRoute, RouteStatus } from '@sushiswap/tines'
import { erc20Abi, routeProcessor2Abi } from 'sushi/abi'
import { ChainId } from 'sushi/chain'
import { Native, Token } from 'sushi/currency'
import { http, Address, PublicClient, createPublicClient } from 'viem'
import { Chain, base } from 'viem/chains'

const ROUTE_PROCESSOR_3_ADDRESS: Record<number, Address> = {
  [ChainId.ARBITRUM]: '0xfc506AaA1340b4dedFfd88bE278bEe058952D674' as Address,
  [ChainId.ARBITRUM_NOVA]:
    '0x05689fCfeE31FCe4a67FbC7Cab13E74F80A4E288' as Address,
  [ChainId.AVALANCHE]: '0x717b7948AA264DeCf4D780aa6914482e5F46Da3e' as Address,
  [ChainId.BOBA]: '0xbe811a0d44e2553d25d11cb8dc0d3f0d0e6430e6' as Address,
  [ChainId.BOBA_AVAX]: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3' as Address,
  [ChainId.BOBA_BNB]: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3' as Address,
  [ChainId.BSC]: '0x400d75dAb26bBc18D163AEA3e83D9Ea68F6c1804' as Address,
  [ChainId.BTTC]: '0x7A4af156379f512DE147ed3b96393047226d923F' as Address,
  [ChainId.CELO]: '0x2f686751b19a9d91cc3d57d90150Bc767f050066' as Address,
  [ChainId.ETHEREUM]: '0x827179dD56d07A7eeA32e3873493835da2866976' as Address,
  [ChainId.FANTOM]: '0x2214A42d8e2A1d20635c2cb0664422c528B6A432' as Address,
  [ChainId.FUSE]: '0xaa26771d497814E81D305c511Efbb3ceD90BF5bd' as Address,
  [ChainId.GNOSIS]: '0xBBDe1d67297329148Fe1ED5e6B00114842728e65' as Address,
  [ChainId.HARMONY]: '0xBBDe1d67297329148Fe1ED5e6B00114842728e65' as Address,
  [ChainId.HECO]: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F' as Address,
  [ChainId.KAVA]: '0x145d82bCa93cCa2AE057D1c6f26245d1b9522E6F' as Address,
  [ChainId.METIS]: '0x258f7E97149afd7D7F84fa63b10e4A3f0C38B788' as Address,
  [ChainId.MOONBEAM]: '0x843D0AAD40295f2198ef528ad747CDF6AB9000e4' as Address,
  [ChainId.MOONRIVER]: '0x7af71799C40F952237eAA4D81A77C1af49125113' as Address,
  [ChainId.OKEX]: '0x0BE808376Ecb75a5CF9bB6D237d16cd37893d904' as Address,
  [ChainId.OPTIMISM]: '0x4C5D5234f232BD2D76B96aA33F5AE4FCF0E4BFAb' as Address,
  [ChainId.PALM]: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3' as Address,
  [ChainId.POLYGON]: '0x0a6e511Fe663827b9cA7e2D2542b20B37fC217A6' as Address,
  [ChainId.POLYGON_ZKEVM]:
    '0x2f686751b19a9d91cc3d57d90150Bc767f050066' as Address,
  [ChainId.TELOS]: '0x80C7DD17B01855a6D2347444a0FCC36136a314de' as Address,
  [ChainId.THUNDERCORE]:
    '0x1b9d177CcdeA3c79B6c8F40761fc8Dc9d0500EAa' as Address,
  [ChainId.BASE]: '0x0BE808376Ecb75a5CF9bB6D237d16cd37893d904' as Address,
}

async function checkTaxTokenTransfer(
  client: PublicClient,
  route: MultiRoute,
): Promise<boolean | undefined> {
  if (route.legs.length >= 2) {
    const chainId = client.chain?.id as ChainId
    return await client.readContract({
      address: route.toToken.address as Address, //'0x8b2060CC6E55Fa68204B3Bc8B226FC61B3512C1f', //bpsTest
      abi: erc20Abi,
      // @ts-ignore
      functionName: 'transfer',
      args: [ROUTE_PROCESSOR_3_ADDRESS[chainId], route.amountOutBI],
      account: route.legs[1].poolAddress, // '0x9bd731319718d417f47083c9653de5f35fce5698', // sushiswap pair
    })
  }
}

async function testTaxTokenBuy(
  client: PublicClient,
  route: MultiRoute,
  rpParams: RPParams,
  account?: Address,
): Promise<number> {
  const chainId = client.chain?.id as ChainId
  const amountOutReal = await client.readContract({
    address: ROUTE_PROCESSOR_3_ADDRESS[chainId],
    abi: routeProcessor2Abi,
    // @ts-ignore
    functionName: 'processRoute',
    args: [
      rpParams.tokenIn as Address,
      rpParams.amountIn,
      rpParams.tokenOut as Address,
      0n,
      rpParams.to as Address,
      rpParams.routeCode as Address, // !!!!
    ],
    value: rpParams.value,
    account,
  })
  return route.amountOutBI === 0n
    ? -1
    : Number(amountOutReal - route.amountOutBI) / route.amountOut
}

async function testTaxToken(args: {
  providerURL: string
  chain: Chain
  taxToken: Token
  amountIn?: bigint
  account?: Address
}) {
  const transport = http(args.providerURL)
  const client = createPublicClient({
    chain: args.chain,
    transport: transport,
  })

  const chainId = client.chain?.id as ChainId
  const fromToken = Native.onChain(chainId)
  const toToken = args.taxToken
  const amountIn = args.amountIn ?? BigInt(1e18)

  const dataFetcher = new DataFetcher({ chainId, client })
  dataFetcher.startDataFetching()
  await dataFetcher.fetchPoolsForToken(fromToken, toToken)
  const pcMap = dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)

  const route = Router.findBestRoute(
    pcMap,
    chainId,
    fromToken,
    amountIn,
    toToken,
    30e9,
  )
  if (route.status === RouteStatus.NoWay) {
    console.log('NoWay')
    return
  }
  // console.log(Router.routeToHumanString(pcMap, route, fromToken, toToken))
  // console.log(
  //   'ROUTE:',
  //   route.legs.map(
  //     (l) =>
  //       `${l.tokenFrom.symbol} -> ${l.tokenTo.symbol}  ${l.poolAddress}  ${l.assumedAmountIn} -> ${l.assumedAmountOut}`
  //   )
  // )

  const rpParams = Router.routeProcessor2Params(
    pcMap,
    route,
    fromToken,
    toToken,
    ROUTE_PROCESSOR_3_ADDRESS[chainId],
    ROUTE_PROCESSOR_3_ADDRESS[chainId],
  )
  if (rpParams === undefined) {
    console.log("Can't create route")
    return
  }

  try {
    await checkTaxTokenTransfer(client, route)
  } catch (e) {
    console.log(
      `Transfer check failed ${toToken.symbol} (${toToken.address}) ${route.amountOutBI} ${e}`,
    )
    return
  }
  try {
    const diff = await testTaxTokenBuy(client, route, rpParams, args.account)
    console.log(
      `Routing: ${fromToken.symbol} => ${toToken.symbol} ${
        route.legs.length - 1
      } pools` + ` diff = ${diff > 0 ? '+' : ''}${diff} `,
    )
  } catch (e) {
    console.log(`Routing failed. No connection ? ${e}`)
  }
}

it('Base tax token test: BASE => LCRV', async function () {
  const LCRV = new Token({
    chainId: ChainId.BASE,
    address: '0x8b2060CC6E55Fa68204B3Bc8B226FC61B3512C1f',
    name: 'Left Curve DAO',
    symbol: 'LCRV',
    decimals: 9,
  })
  await testTaxToken({
    providerURL: `https://lb.drpc.org/ogrpc?network=base&dkey=${process.env.DRPC_ID}`,
    chain: base,
    taxToken: LCRV,
    account: '0x4200000000000000000000000000000000000006',
    amountIn: BigInt(1e15),
  })
})

it('Base tax token test: BASE => bpsTEST', async function () {
  const bpsTEST = new Token({
    chainId: ChainId.BASE,
    address: '0x93980959778166ccbB95Db7EcF52607240bc541e',
    name: 'bpsTEST',
    symbol: 'bpsTEST',
    decimals: 18,
  })
  await testTaxToken({
    providerURL: `https://lb.drpc.org/ogrpc?network=base&dkey=${process.env.DRPC_ID}`,
    chain: base,
    taxToken: bpsTEST,
    account: '0x4200000000000000000000000000000000000006',
    amountIn: BigInt(1e12),
  })
})
