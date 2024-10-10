import type { ChainId } from 'sushi'

export enum PriceWorkerPostMessageType {
  Initialize = 'Initialize',
  IncrementChainId = 'IncrementChainId',
  DecrementChainId = 'DecrementChainId',
  RefetchChainId = 'RefetchChainId',
}

type Initialize = {
  type: PriceWorkerPostMessageType.Initialize
  canUseSharedArrayBuffer: boolean
}

type IncrementChainId = {
  chainId: ChainId
  type: PriceWorkerPostMessageType.IncrementChainId
}

type DecrementChainId = {
  chainId: ChainId
  type: PriceWorkerPostMessageType.DecrementChainId
}

type RefetchChainId = {
  chainId: ChainId
  type: PriceWorkerPostMessageType.RefetchChainId
}

export type PriceWorkerPostMessage =
  | Initialize
  | IncrementChainId
  | DecrementChainId
  | RefetchChainId

export enum PriceWorkerReceiveMessageType {
  ChainState = 'ChainState',
}

export type PriceWorkerReceiveMessageChainState = {
  type: PriceWorkerReceiveMessageType.ChainState
  payload: Partial<Omit<WorkerChainState, 'priceObject' | 'listenerCount'>> & {
    chainId: ChainId
  }
}

export type PriceWorkerReceiveMessage = PriceWorkerReceiveMessageChainState

export type PriceWorker = (typeof Worker)['prototype'] & {
  postMessage(message: PriceWorkerPostMessage | PriceWorkerPostMessage[]): void
}

export interface WorkerChainState {
  chainId: ChainId
  listenerCount: number

  priceMap: Map<bigint, number>

  lastModified: number

  isLoading: boolean
  isUpdating: boolean
  isError: boolean
}
