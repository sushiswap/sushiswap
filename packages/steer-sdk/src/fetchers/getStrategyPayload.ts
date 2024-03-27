import { fetch } from '@whatwg-node/fetch'
import { isPromiseFulfilled } from 'sushi/validate'

interface Payload {
  strategyConfigData: {
    period: number
    standardDeviations: number
    poolFee: number
    epochStart: number
    epochLength: string
    name: string
    description: string
    appImgUrl: string
  }
  vaultPayload: {
    fee: number
    slippage: number
    ratioErrorTolerance: number
    maxTicksChange: number
    twapInterval: number
  }
}

interface GetStrategiesPayloads {
  payloadHashes: string[]
}

export async function getStrategiesPayloads({
  payloadHashes,
}: GetStrategiesPayloads) {
  const results = await Promise.allSettled(
    payloadHashes.map(async (payloadHash) => {
      return fetch(`https://ipfs.io/ipfs/${payloadHash}`).then(
        (res) => res.json() as Promise<Payload>,
      )
    }),
  )

  return results.map((r) => (isPromiseFulfilled(r) ? r.value : null))
}

interface GetPayload {
  payloadHash: string
}

export async function getStrategyPayload({ payloadHash }: GetPayload) {
  const results = await getStrategiesPayloads({ payloadHashes: [payloadHash] })

  if (!results[0]) {
    throw new Error(`Failed to fetch payload for hash ${payloadHash}`)
  }

  return results[0]
}
