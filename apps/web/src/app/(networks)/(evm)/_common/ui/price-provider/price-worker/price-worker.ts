import { ChainId } from 'sushi'
import { SUSHI_DATA_API_HOST } from 'sushi/config/subgraph'
import { UPDATE_INTERVAL } from '../config'
import {
  PriceWorkerPostMessage,
  PriceWorkerPostMessageType,
  PriceWorkerReceiveMessage,
  PriceWorkerReceiveMessageType,
  WorkerChainState,
} from './types'

{
  const state = {
    chains: new Map<ChainId, WorkerChainState>(),
    intervals: new Map<ChainId, NodeJS.Timeout>(),
    canUseSharedArrayBuffer: false,
  }

  function sendMessage(message: PriceWorkerReceiveMessage) {
    self.postMessage(message)
  }

  self.onmessage = async ({
    data: _data,
  }: MessageEvent<PriceWorkerPostMessage | PriceWorkerPostMessage[]>) => {
    const data = Array.isArray(_data) ? _data : [_data]

    let shouldUpdateIntervals = false

    for (const message of data) {
      switch (message.type) {
        case PriceWorkerPostMessageType.Initialize: {
          const { canUseSharedArrayBuffer } = message
          state.canUseSharedArrayBuffer = canUseSharedArrayBuffer
          break
        }
        case PriceWorkerPostMessageType.IncrementChainId: {
          const { chainId } = message
          if (incrementChainId(chainId)) {
            shouldUpdateIntervals = true
            updateChainId(chainId)
          }
          break
        }
        case PriceWorkerPostMessageType.DecrementChainId: {
          const { chainId } = message
          if (decrementChainId(chainId)) {
            shouldUpdateIntervals = true
          }
          break
        }
        case PriceWorkerPostMessageType.RefetchChainId: {
          const { chainId } = message
          const chainState = state.chains.get(chainId)
          if (chainState) {
            updateChainId(chainId)
          }
          break
        }
      }
    }

    if (shouldUpdateIntervals) {
      updateIntervals()
    }
  }

  function incrementChainId(chainId: ChainId) {
    const chainState = state.chains.get(chainId)
    if (chainState) {
      chainState.listenerCount++
      return chainState.listenerCount === 1
    }

    state.chains.set(chainId, {
      chainId,
      listenerCount: 1,
      priceMap: new Map(),
      lastModified: 0,
      isLoading: true,
      isUpdating: false,
      isError: false,
    })

    sendMessage({
      type: PriceWorkerReceiveMessageType.ChainState,
      payload: {
        chainId,
        lastModified: 0,
        isLoading: true,
        isUpdating: false,
        isError: false,
      },
    })

    return true
  }

  function decrementChainId(chainId: ChainId) {
    const chainState = state.chains.get(chainId)
    if (chainState && chainState.listenerCount > 0) {
      chainState.listenerCount--
      return chainState.listenerCount === 0
    }

    return false
  }

  function updateIntervals() {
    state.chains.forEach((chainState) => {
      const currentInterval = state.intervals.get(chainState.chainId)

      if (isActive(chainState) && !currentInterval) {
        state.intervals.set(
          chainState.chainId,
          setInterval(() => {
            updateChainId(chainState.chainId)
          }, UPDATE_INTERVAL),
        )
      } else if (!isActive(chainState) && currentInterval) {
        clearInterval(currentInterval)
        state.intervals.delete(chainState.chainId)
      }
    })
  }

  async function updateChainId(chainId: ChainId) {
    const chainState = state.chains.get(chainId)
    if (!chainState) {
      return
    }

    chainState.isUpdating = true

    sendMessage({
      type: PriceWorkerReceiveMessageType.ChainState,
      payload: {
        chainId,
        isUpdating: chainState.isUpdating,
      },
    })

    let sendPrices = false

    try {
      const { data: newPriceMap, lastModified } =
        await fetchPriceData(chainState)
      updatePriceData(chainState.priceMap, newPriceMap)
      chainState.lastModified = lastModified
      chainState.isError = false

      sendPrices = true
    } catch (error: unknown) {
      console.error('Failed to fetch priceMap', chainId, error)
      chainState.isError = true
    } finally {
      chainState.isUpdating = false
      chainState.isLoading = false
    }

    sendMessage({
      type: PriceWorkerReceiveMessageType.ChainState,
      payload: {
        chainId,
        lastModified: chainState.lastModified,
        isLoading: chainState.isLoading,
        isUpdating: chainState.isUpdating,
        isError: chainState.isError,
        priceMap: sendPrices ? chainState.priceMap : undefined,
      },
    })
  }

  async function fetchPriceData({ chainId, lastModified }: WorkerChainState) {
    let url = `${SUSHI_DATA_API_HOST}/price/v1/${chainId}`
    if (lastModified) {
      url += `?onlyPricesUpdateSince=${lastModified}`
    }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/octet-stream',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    const priceMap = new Map<bigint, number>()
    for (let i = 0; i < buffer.byteLength; i += 24) {
      const address = BigInt(
        `0x${buffer
          .subarray(i, i + 20)
          .toString('hex')
          .padStart(40, '0')}`,
      )
      const price = buffer.readFloatLE(i + 20)

      priceMap.set(address, price)
    }

    return {
      data: priceMap,
      lastModified: Number(response.headers.get('Last-Updated')!),
    }
  }

  function updatePriceData(
    oldPriceData: Map<bigint, number>,
    newPriceMap: Map<bigint, number>,
  ) {
    for (const [address, price] of newPriceMap) {
      if (price === 0 || !Number.isFinite(price)) {
        oldPriceData.delete(address)
      } else {
        oldPriceData.set(address, price)
      }
    }
  }

  function isActive(chain: WorkerChainState) {
    return chain.listenerCount > 0
  }
}
