import { fetch } from '@whatwg-node/fetch'
import { isPromiseFulfilled } from 'sushi'
import { getChainIdAddressFromId } from 'sushi/format'

interface GetVaultsAprs {
  vaultIds: string[]
}

interface AprTimeseries {
  data: {
    startTime: number
    endTime: number
    feeApr: number
  }[]
  message: string
}

async function getAprTimeseries(
  chainId: number,
  address: string,
): Promise<AprTimeseries['data']> {
  const url = `https://ro81h8hq6b.execute-api.us-east-1.amazonaws.com/pool/apr/historical?address=${address}&chain=${chainId}`

  return fetch(url)
    .then((res) => res.json() as Promise<AprTimeseries>)
    .then((res) => res?.data)
}

export async function getVaultsAprTimeseries({ vaultIds }: GetVaultsAprs) {
  const results = await Promise.allSettled(
    vaultIds.map(async (vaultId) => {
      const { address, chainId } = getChainIdAddressFromId(vaultId)

      return getAprTimeseries(chainId, address)
    }),
  )

  return results.map((r) => (isPromiseFulfilled(r) ? r.value : null))
}

interface GetVaultsApr {
  vaultId: string
}

export async function getSteerVaultAprTimeseries({ vaultId }: GetVaultsApr) {
  const results = await getVaultsAprTimeseries({ vaultIds: [vaultId] })

  if (!results[0]) {
    throw new Error(`Failed to fetch APR timeseries for vault ${vaultId}`)
  }

  return results[0]
}
