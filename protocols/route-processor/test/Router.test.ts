// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
// import { erc20Abi, weth9Abi } from 'sushi/abi'
// import { bentoBoxV1Address, BentoBoxV1ChainId } from '@sushiswap/bentobox/exports/exports'
// import { ChainId, chainName } from 'sushi/chain'
// import {
//   DAI,
//   DAI_ADDRESS,
//   FRAX,
//   FRAX_ADDRESS,
//   FXS,
//   FXS_ADDRESS,
//   Native,
//   SUSHI,
//   SUSHI_ADDRESS,
//   Token,
//   Type,
//   USDC,
//   USDC_ADDRESS,
//   USDT,
//   USDT_ADDRESS,
//   WNATIVE,
// } from 'sushi/currency'
// import { DataFetcher, LiquidityProviders, PoolFilter, Router } from '@sushiswap/router'
// import { BridgeBento, BridgeUnlimited, getBigNumber, RPool, StableSwapRPool } from '@sushiswap/tines'
// import { expect } from 'chai'
// import { BigNumber, Contract } from 'ethers'
// import { ethers, network } from 'hardhat'
// import seedrandom from 'seedrandom'
// import { createPublicClient } from 'viem'
// import { custom } from 'viem'
// import { hardhat } from 'viem/chains'
// function getRandomExp(rnd: () => number, min: number, max: number) {
//   const minL = Math.log(min)
//   const maxL = Math.log(max)
//   const v = rnd() * (maxL - minL) + minL
//   const res = Math.exp(v)
//   console.assert(res <= max && res >= min, 'Random value is out of the range')
//   return res
// }

// const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms))

// interface TestEnvironment {
//   chainId: ChainId
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   provider: any
//   rp: Contract
//   user: SignerWithAddress
//   user2: SignerWithAddress
//   dataFetcher: DataFetcher
// }

// async function getTestEnvironment(): Promise<TestEnvironment> {
//   //console.log('Prepare Environment:')

//   // const client = createTestClient({
//   //   chain: {
//   //     ...hardhat,
//   //     contracts: {
//   //       multicall3: {
//   //         address: '0xca11bde05977b3631167028862be2a173976ca11',
//   //         blockCreated: 14353601,
//   //       },
//   //     },
//   //   },
//   //   mode: 'hardhat',
//   //   transport: http(),
//   // })

//   const client = createPublicClient({
//     chain: {
//       ...hardhat,
//       contracts: {
//         multicall3: {
//           address: '0xca11bde05977b3631167028862be2a173976ca11',
//           blockCreated: 25770160,
//         },
//       },
//       pollingInterval: 1_000,
//     },

//     transport: custom(network.provider),
//   })
//   //console.log('    Create DataFetcher ...')
//   const provider = ethers.provider
//   const chainId = network.config.chainId as ChainId
//   const dataFetcher = new DataFetcher({chainId, client})

//   console.log({ chainId, url: ethers.provider.connection.url, otherurl: network.config.forking.url })

//   dataFetcher.startDataFetching()

//   console.log(`    ChainId=${chainId} RouteProcessor deployment (may take long time for the first launch)...`)
//   const RouteProcessor = await ethers.getContractFactory('RouteProcessor')
//   const routeProcessor = await RouteProcessor.deploy(bentoBoxV1Address[chainId as BentoBoxV1ChainId])
//   await routeProcessor.deployed()
//   console.log('    Block Number:', provider.blockNumber)

//   console.log(`Network: ${chainName[chainId]}, Forked Block: ${provider.blockNumber}`)
//   //console.log('    User creation ...')
//   const [Alice] = await ethers.getSigners()

//   return {
//     chainId,
//     provider,
//     rp: routeProcessor,
//     user: Alice,
//     user2: await ethers.getSigner('0xbc4a6be1285893630d45c881c6c343a65fdbe278'),
//     dataFetcher,
//   }
// }

// // all pool data assumed to be updated
// async function makeSwap(
//   env: TestEnvironment,
//   fromToken: Type,
//   amountIn: BigNumber,
//   toToken: Type,
//   providers?: LiquidityProviders[],
//   poolFilter?: PoolFilter,
//   makeSankeyDiagram = false
// ): Promise<[BigNumber, number] | undefined> {
//   //console.log(`Make swap ${fromToken.symbol} -> ${toToken.symbol} amount: ${amountIn.toString()}`)

//   if (fromToken instanceof Token) {
//     //console.log(`Approve user's ${fromToken.symbol} to the route processor ...`)
//     const WrappedBaseTokenContract = new ethers.Contract(fromToken.address, erc20Abi, env.user)
//     await WrappedBaseTokenContract.connect(env.user).approve(env.rp.address, amountIn)
//   }

//   //console.log('Create Route ...')
//   await env.dataFetcher.fetchPoolsForToken(fromToken, toToken)

//   const pcMap = env.dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)

//   const route = Router.findBestRoute(pcMap, env.chainId, fromToken, amountIn, toToken, 30e9, providers, poolFilter)
//   const rpParams = Router.routeProcessorParams(pcMap, route, fromToken, toToken, env.user.address, env.rp.address)
//   if (rpParams === undefined) return

//   //console.log('Call route processor (may take long time for the first launch)...')

//   let balanceOutBIBefore: BigNumber
//   let toTokenContract: Contract | undefined = undefined
//   if (toToken instanceof Token) {
//     toTokenContract = new ethers.Contract(toToken.address, weth9Abi, env.user)
//     balanceOutBIBefore = await toTokenContract.connect(env.user).balanceOf(env.user.address)
//   } else {
//     balanceOutBIBefore = await env.user.getBalance()
//   }
//   let tx
//   if (rpParams.value)
//     tx = await env.rp.processRoute(
//       rpParams.tokenIn,
//       rpParams.amountIn,
//       rpParams.tokenOut,
//       rpParams.amountOutMin,
//       rpParams.to,
//       rpParams.routeCode,
//       { value: rpParams.value }
//     )
//   else
//     tx = await env.rp.processRoute(
//       rpParams.tokenIn,
//       rpParams.amountIn,
//       rpParams.tokenOut,
//       rpParams.amountOutMin,
//       rpParams.to,
//       rpParams.routeCode
//     )
//   const receipt = await tx.wait()

//   // const trace = await network.provider.send('debug_traceTransaction', [receipt.transactionHash])
//   // printGasUsage(trace)

//   //console.log("Fetching user's output balance ...")
//   let balanceOutBI: BigNumber
//   if (toTokenContract) {
//     balanceOutBI = (await toTokenContract.connect(env.user).balanceOf(env.user.address)).sub(balanceOutBIBefore)
//   } else {
//     balanceOutBI = (await env.user.getBalance()).sub(balanceOutBIBefore)
//     balanceOutBI = balanceOutBI.add(receipt.effectiveGasPrice.mul(receipt.gasUsed))
//   }
//   const slippage = parseInt(balanceOutBI.sub(route.amountOutBI).mul(10_000).div(route.amountOutBI).toString())

//   if (slippage !== 0) {
//     console.log(`expected amountOut: ${route.amountOutBI.toString()}`)
//     console.log(`real amountOut:     ${balanceOutBI.toString()}`)
//     console.log(`slippage: ${slippage / 100}%`)
//   }
//   console.log(`gas use: ${receipt.gasUsed.toString()}`)
// //   expect(slippage).equal(0) // TODO: can't do this, isn't it a tiny bit of rounding when converting stable reserves?

//   return [balanceOutBI, receipt.blockNumber]
// }

// async function dataUpdated(env: TestEnvironment, minBlockNumber: number) {
//   for (;;) {
//     if (env.dataFetcher.getLastUpdateBlock() >= minBlockNumber) return
//     await delay(1500)
//   }
// }

// async function updMakeSwap(
//   env: TestEnvironment,
//   fromToken: Type,
//   toToken: Type,
//   lastCallResult: BigNumber | [BigNumber | undefined, number],
//   providers?: LiquidityProviders[],
//   poolFilter?: PoolFilter,
//   makeSankeyDiagram = false
// ): Promise<[BigNumber | undefined, number]> {
//   const [amountIn, waitBlock] = lastCallResult instanceof BigNumber ? [lastCallResult, 1] : lastCallResult
//   if (amountIn === undefined) return [undefined, waitBlock] // previous swap failed

//   //console.log('Wait data update for min block', waitBlock)
//   await dataUpdated(env, waitBlock)

//   const res = await makeSwap(env, fromToken, amountIn, toToken, providers, poolFilter, makeSankeyDiagram)
//   expect(res).not.undefined
//   if (res === undefined) return [undefined, waitBlock]
//   else return res
// }

// async function checkTransferAndRoute(
//   env: TestEnvironment,
//   fromToken: Type,
//   toToken: Type,
//   lastCallResult: BigNumber | [BigNumber | undefined, number]
// ): Promise<[BigNumber | undefined, number]> {
//   const [amountIn, waitBlock] = lastCallResult instanceof BigNumber ? [lastCallResult, 1] : lastCallResult
//   if (amountIn === undefined) return [undefined, waitBlock] // previous swap failed
//   await dataUpdated(env, waitBlock)

//   if (fromToken instanceof Token) {
//     const WrappedBaseTokenContract = new ethers.Contract(fromToken.address, erc20Abi, env.user)
//     await WrappedBaseTokenContract.connect(env.user).approve(env.rp.address, amountIn)
//   }

//   await env.dataFetcher.fetchPoolsForToken(fromToken, toToken)

//   const pcMap = env.dataFetcher.getCurrentPoolCodeMap(fromToken, toToken)
//   const route = Router.findBestRoute(pcMap, env.chainId, fromToken, amountIn, toToken, 30e9)
//   const rpParams = Router.routeProcessorParams(pcMap, route, fromToken, toToken, env.user.address, env.rp.address)

//   // const rpParams = Router.getCurrentRouteRPParams(env.user.address, env.rp.address) as RPParams
//   const transferValue = getBigNumber(0.02 * Math.pow(10, Native.onChain(env.chainId).decimals))
//   rpParams.value = (rpParams.value || BigNumber.from(0)).add(transferValue)

//   const balanceUser2Before = await env.user2.getBalance()

//   let balanceOutBIBefore: BigNumber
//   let toTokenContract: Contract | undefined = undefined
//   if (toToken instanceof Token) {
//     toTokenContract = new ethers.Contract(toToken.address, weth9Abi, env.user)
//     balanceOutBIBefore = await toTokenContract.connect(env.user).balanceOf(env.user.address)
//   } else {
//     balanceOutBIBefore = await env.user.getBalance()
//   }
//   const tx = await env.rp.transferValueAndprocessRoute(
//     env.user2.address,
//     transferValue,
//     rpParams.tokenIn,
//     rpParams.amountIn,
//     rpParams.tokenOut,
//     rpParams.amountOutMin,
//     rpParams.to,
//     rpParams.routeCode,
//     { value: rpParams.value }
//   )
//   const receipt = await tx.wait()

//   let balanceOutBI: BigNumber
//   if (toTokenContract) {
//     balanceOutBI = (await toTokenContract.connect(env.user).balanceOf(env.user.address)).sub(balanceOutBIBefore)
//   } else {
//     balanceOutBI = (await env.user.getBalance()).sub(balanceOutBIBefore)
//     balanceOutBI = balanceOutBI.add(receipt.effectiveGasPrice.mul(receipt.gasUsed))
//     balanceOutBI = balanceOutBI.add(transferValue)
//   }
//   expect(balanceOutBI.gte(rpParams.amountOutMin)).equal(true)

//   const balanceUser2After = await env.user2.getBalance()
//   const transferredValue = balanceUser2After.sub(balanceUser2Before)
//   expect(transferredValue.eq(transferValue)).equal(true)

//   return [balanceOutBI, receipt.blockNumber]
// }

// // skipped because took too long time. Unskip to check the RP
// describe('End-to-end Router test', async function () {
//   let env: TestEnvironment
//   let chainId: ChainId
//   let intermidiateResult: [BigNumber | undefined, number] = [undefined, 1]
//   let testTokensSet: (Type | undefined)[]
//   let SUSHI_LOCAL: Token
//   let USDC_LOCAL: Token

//   before(async () => {
//     env = await getTestEnvironment()
//     chainId = env.chainId

//     type SUSHI_CHAINS = keyof typeof SUSHI_ADDRESS
//     type USDC_CHAINS = keyof typeof USDC_ADDRESS
//     type USDT_CHAINS = keyof typeof USDT_ADDRESS
//     type DAI_CHAINS = keyof typeof DAI_ADDRESS
//     type FRAX_CHAINS = keyof typeof FRAX_ADDRESS
//     type FXS_CHAINS = keyof typeof FXS_ADDRESS
//     SUSHI_LOCAL = SUSHI[chainId as SUSHI_CHAINS]
//     USDC_LOCAL = USDC[chainId as USDC_CHAINS]
//     testTokensSet = [
//       Native.onChain(chainId),
//       WNATIVE[chainId],
//       SUSHI[chainId as SUSHI_CHAINS],
//       USDC[chainId as USDC_CHAINS],
//       USDT[chainId as USDT_CHAINS],
//       DAI[chainId as DAI_CHAINS],
//       FRAX[chainId as FRAX_CHAINS],
//       FXS[chainId as FXS_CHAINS],
//     ]
//   })

//   it('Native => SUSHI => Native', async function () {
//     intermidiateResult[0] = getBigNumber(1000000 * 1e18)
//     intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//     intermidiateResult = await updMakeSwap(env, SUSHI_LOCAL, Native.onChain(chainId), intermidiateResult)
//   })

//   it('Native => WrappedNative => Native', async function () {
//     intermidiateResult[0] = getBigNumber(1 * 1e18)
//     intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), WNATIVE[chainId], intermidiateResult)
//     intermidiateResult = await updMakeSwap(env, WNATIVE[chainId], Native.onChain(chainId), intermidiateResult)
//   })

//   it('Trident Native => SUSHI => Native (Polygon only)', async function () {
//     if (chainId == ChainId.POLYGON) {
//       intermidiateResult[0] = getBigNumber(10_000 * 1e18)
//       intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), SUSHI[chainId], intermidiateResult, [
//         LiquidityProviders.Trident,
//       ])
//       intermidiateResult = await updMakeSwap(env, SUSHI[chainId], Native.onChain(chainId), intermidiateResult, [
//         LiquidityProviders.Trident,
//       ])
//     }
//   })

//   it('StablePool Native => USDC => USDT => DAI => USDC (Polygon only)', async function () {
//     const filter = (pool: RPool) => pool instanceof StableSwapRPool || pool instanceof BridgeBento
//     // || pool instanceof Wr
//     if (chainId == ChainId.POLYGON) {
//       intermidiateResult[0] = getBigNumber(10_000 * 1e18)
//       intermidiateResult = await updMakeSwap(env, Native.onChain(chainId), USDC[chainId], intermidiateResult)
//       intermidiateResult = await updMakeSwap(env, USDC[chainId], USDT[chainId], intermidiateResult, undefined, filter)
//       intermidiateResult = await updMakeSwap(env, USDT[chainId], DAI[chainId], intermidiateResult, undefined, filter)
//       intermidiateResult = await updMakeSwap(env, DAI[chainId], USDC[chainId], intermidiateResult, undefined, filter)
//     }
//   })

//   function getNextToken(rnd: () => number, previousTokenIndex: number): number {
//     for (;;) {
//       const next = Math.floor(rnd() * testTokensSet.length)
//       if (next == previousTokenIndex) continue
//       if (testTokensSet[next] === undefined) continue
//       return next
//     }
//   }

//   it.skip('Random swap test', async function () {
//     const testSeed = '10' // Change it to change random generator values
//     const rnd: () => number = seedrandom(testSeed) // random [0, 1)
//     let routeCounter = 0
//     for (let i = 0; i < 100; ++i) {
//       let currentToken = 0
//       intermidiateResult[0] = getBigNumber(getRandomExp(rnd, 1e15, 1e24))
//       for (;;) {
//         const nextToken = getNextToken(rnd, currentToken)
//         console.log('Round # ', i + 1, ' Total Route # ', ++routeCounter)
//         intermidiateResult = await updMakeSwap(
//           env,
//           testTokensSet[currentToken] as Type,
//           testTokensSet[nextToken] as Type,
//           intermidiateResult
//         )
//         currentToken = nextToken
//         if (currentToken == 0) break
//       }
//     }
//   })

//   it('Special Router', async function () {
//     await env.dataFetcher.fetchPoolsForToken(Native.onChain(chainId), SUSHI_LOCAL)

//     const pcMap = env.dataFetcher.getCurrentPoolCodeMap(Native.onChain(chainId), SUSHI_LOCAL)

//     const route = Router.findSpecialRoute(
//       pcMap,
//       chainId,
//       Native.onChain(chainId),
//       getBigNumber(1 * 1e18),
//       SUSHI_LOCAL,
//       30e9
//     )
//     expect(route).not.undefined
//   })

//   if (network.config.chainId == ChainId.POLYGON) {
//     it('Transfer value and route 1', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       intermidiateResult = await checkTransferAndRoute(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, SUSHI_LOCAL, USDC_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, USDC_LOCAL, Native.onChain(chainId), intermidiateResult)
//     })

//     it('Transfer value and route 2', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       intermidiateResult = await checkTransferAndRoute(
//         env,
//         Native.onChain(chainId),
//         WNATIVE[chainId],
//         intermidiateResult
//       )
//       intermidiateResult = await checkTransferAndRoute(env, WNATIVE[chainId], SUSHI_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, SUSHI_LOCAL, WNATIVE[chainId], intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(
//         env,
//         WNATIVE[chainId],
//         Native.onChain(chainId),
//         intermidiateResult
//       )
//     })

//     it('Transfer value and route 3 - check EOA', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       env.user2 = await ethers.getSigner('0x0000000000000000000000000000000000000001')
//       intermidiateResult = await checkTransferAndRoute(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, SUSHI_LOCAL, USDC_LOCAL, intermidiateResult)
//       intermidiateResult = await checkTransferAndRoute(env, USDC_LOCAL, Native.onChain(chainId), intermidiateResult)
//     })

//     it('Transfer value and route 4 - not payable address', async function () {
//       intermidiateResult[0] = getBigNumber(1e18)
//       env.user2 = await ethers.getSigner('0x597A9bc3b24C2A578CCb3aa2c2C62C39427c6a49')
//       let throwed = false
//       try {
//         await checkTransferAndRoute(env, Native.onChain(chainId), SUSHI_LOCAL, intermidiateResult)
//       } catch (e) {
//         throwed = true
//       }
//       expect(throwed, 'Transfer value to not payable address should fail').equal(true)
//     })
//   }

//   it.skip('AnyChart Sankey Diargam data generation Native=>SUSHI', async function () {
//     intermidiateResult[0] = getBigNumber(1000000 * 1e18)
//     intermidiateResult = await updMakeSwap(
//       env,
//       Native.onChain(chainId),
//       SUSHI_LOCAL,
//       intermidiateResult,
//       undefined,
//       undefined,
//       true
//     )
//   })
// })
