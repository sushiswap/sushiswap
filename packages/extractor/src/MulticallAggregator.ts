import { Abi, Narrow } from 'abitype'
import { ChainId } from 'sushi/chain'
import {
  Address,
  ContractFunctionArgs,
  ContractFunctionParameters,
  MulticallContracts,
  PublicClient,
} from 'viem'
import { delay } from './Utils.js'
import { warnLog } from './WarnLog.js'

const getBlockNumberAbi: Abi = [
  {
    inputs: [],
    name: 'getBlockNumber',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

// aggregates several calls in one multicall
export class MultiCallAggregator {
  client: PublicClient
  pendingCalls: ContractFunctionParameters[] = []
  pendingResolves: ((arg: any) => void)[] = []
  pendingRejects: ((arg: unknown) => void)[] = []
  timer?: NodeJS.Timeout
  maxCallsInOneBatch: number
  maxBatchesSimultaniously: number
  chainId: ChainId
  debug: boolean

  totalCalls = 0
  totalCallsProcessed = 0
  totalCallsFailed = 0
  totalMCalls = 0
  totalMCallsProcessed = 0
  totalMCallsFailed = 0
  totalTimeSpent = 0
  currentBatchInProgress = 0

  constructor(
    client: PublicClient,
    maxCallsInOneBatch = 0,
    maxBatchesSimultaniously = 0,
    debug = false,
  ) {
    this.client = client
    this.maxCallsInOneBatch = maxCallsInOneBatch
    this.maxBatchesSimultaniously = maxBatchesSimultaniously
    this.chainId = client.chain?.id as ChainId
    this.debug = debug
  }

  // aggregate several calls in one multicall
  async call<FunctionRetType>(
    address: Address,
    abi: Abi,
    functionName: string,
    args?: unknown[],
    makeMulticallIfExceeds = true,
  ): Promise<{ blockNumber: number; returnValue: FunctionRetType }> {
    this.sheduleMulticall()
    this.pendingCalls.push({
      address,
      abi,
      functionName,
      args,
    })
    const promise = new Promise<{
      blockNumber: number
      returnValue: FunctionRetType
    }>((resolve, reject) => {
      this.pendingResolves.push(resolve)
      this.pendingRejects.push(reject)
    })
    if (makeMulticallIfExceeds) this.makeMulticallIfMaxBatchSizeExceeds()
    return promise
  }

  // aggregate several calls in one multicall
  async callValue<FunctionRetType>(
    address: Address,
    abi: Abi,
    functionName: string,
    args?: unknown[],
  ): Promise<FunctionRetType> {
    this.sheduleMulticall()
    this.pendingCalls.push({
      address,
      abi,
      functionName,
      args,
    })
    const promise = new Promise<{
      blockNumber: number
      returnValue: FunctionRetType
    }>((resolve, reject) => {
      this.pendingResolves.push(resolve)
      this.pendingRejects.push(reject)
    })
    this.makeMulticallIfMaxBatchSizeExceeds()
    const res = await promise
    return res.returnValue
  }

  async callContractSameBlock(
    address: Address,
    abi: Abi,
    functions: [string, unknown[] | undefined][],
  ): Promise<{ blockNumber: number; returnValues: unknown[] }> {
    if (functions.length === 0) return { blockNumber: -1, returnValues: [] }
    this.sheduleMulticall()
    const promise = Promise.all(
      functions.map(([name, args]) =>
        this.call(address, abi, name, args, false),
      ),
    )
    this.makeMulticallIfMaxBatchSizeExceeds()
    const res = await promise
    return {
      blockNumber: res[0].blockNumber,
      returnValues: res.map(({ returnValue }) => returnValue),
    }
  }

  async callSameBlock(
    calls: MulticallContracts<ContractFunctionArgs[]>,
  ): Promise<{ blockNumber: number; returnValues: unknown[] }> {
    if (calls.length === 0) return { blockNumber: -1, returnValues: [] }
    this.sheduleMulticall()
    const promise = Promise.all(
      calls.map(({ address, abi, functionName, args }) =>
        this.call(address, abi, functionName, args as unknown[], false),
      ),
    )
    this.makeMulticallIfMaxBatchSizeExceeds()
    const res = await promise
    return {
      blockNumber: res[0].blockNumber,
      returnValues: res.map(({ returnValue }) => returnValue),
    }
  }

  async sheduleMulticall() {
    if (this.timer === undefined) {
      this.timer = setTimeout(async () => {
        this.timer = undefined
        await this.makeMulticallNow()
      }, 0)
    }
  }

  async makeMulticallIfMaxBatchSizeExceeds(): Promise<void> {
    if (
      this.maxCallsInOneBatch === 0 ||
      this.pendingCalls.length < this.maxCallsInOneBatch
    )
      return
    await this.makeMulticallNow()
  }

  async makeMulticallNow(): Promise<void> {
    const pendingCalls = this.pendingCalls
    const pendingResolves = this.pendingResolves
    const pendingRejects = this.pendingRejects
    this.pendingCalls = []
    this.pendingResolves = []
    this.pendingRejects = []
    if (pendingCalls.length === 0) return
    pendingCalls.unshift({
      address: this.getBlockNumberContractAddress(),
      abi: getBlockNumberAbi,
      functionName: 'getBlockNumber',
    })
    let res
    const startTime = performance.now()
    for (;;) {
      this.totalCalls += pendingCalls.length - 1
      this.totalMCalls += 1
      while (
        this.maxBatchesSimultaniously !== 0 &&
        this.currentBatchInProgress >= this.maxBatchesSimultaniously
      )
        await delay(1000) // too much current processing batches. Let's wait
      try {
        this.currentBatchInProgress += 1
        res = await this.client.multicall({
          allowFailure: true,
          contracts: pendingCalls.map((c) => ({
            address: c.address,
            abi: c.abi,
            functionName: c.functionName,
            args: c.args as Narrow<readonly unknown[] | undefined>,
          })),
        })
        this.currentBatchInProgress -= 1
      } catch (_e) {
        this.currentBatchInProgress -= 1
        this.totalCallsFailed += pendingCalls.length - 1
        this.totalMCallsFailed += 1
        // warnLog(
        //   this.client.chain?.id,
        //   `Multicall error ${pendingCalls.map((c) => `${c.address}:${c.functionName}(${c.args})`)}\n` + e
        // )
        warnLog(this.client.chain?.id, 'Multicall error')
        continue
      }
      this.totalCallsProcessed += pendingCalls.length - 1
      this.totalMCallsProcessed += 1
      this.totalTimeSpent += performance.now() - startTime
      break
    }
    if (res[0].status !== 'success') {
      // getBlockNumber Failed
      const error = this.debug
        ? res[0].error.toString()
        : res[0].error.toString().substring(0, 1000)
      for (let i = 1; i < res.length; ++i) pendingRejects[i - 1](error)
    } else {
      const blockNumber = res[0].result as number
      for (let i = 1; i < res.length; ++i) {
        if (res[i].status === 'success')
          pendingResolves[i - 1]({ blockNumber, returnValue: res[i].result })
        else pendingRejects[i - 1](res[i].error?.toString().substring(0, 1000))
      }
    }
  }

  getBlockNumberContractAddress(): Address {
    if (this.client.chain?.id === ChainId.ARBITRUM) {
      // multicall3.getBlockNumber returns address for L1 Ethereum, not local L2
      // this is Arbitrum-adapted multicall2 contract
      return '0x842eC2c7D803033Edf55E478F461FC547Bc54EB2'
    }
    return this.client.chain?.contracts?.multicall3?.address as Address
  }
}
