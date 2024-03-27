import { fetch } from '@whatwg-node/fetch'
import { isPromiseFulfilled } from 'sushi'
import { getChainIdAddressFromId } from 'sushi/format'

interface GetVaultsAprs {
  vaultIds: string[]
}

async function getApr(
  chainId: number,
  address: string,
  interval?: number,
): Promise<number | string> {
  let url = `https://ro81h8hq6b.execute-api.us-east-1.amazonaws.com/pool/fee-apr?address=${address}&chain=${chainId}`
  if (interval) {
    url += `&interval=${interval}`
  }

  return fetch(url)
    .then((res) => res.json())
    .then((res) => res?.apr)
}

export async function getVaultsAprs({ vaultIds }: GetVaultsAprs) {
  const results = await Promise.allSettled(
    vaultIds.map(async (vaultId) => {
      const { address, chainId } = getChainIdAddressFromId(vaultId)

      const aprs = await Promise.all([
        getApr(chainId, address),
        getApr(chainId, address, 86400),
        getApr(chainId, address, 604800),
      ])

      if (aprs.some((apr) => typeof apr === 'undefined')) {
        throw new Error("Couldn't fetch APR")
      }

      const [apr, apr1d, apr1w] = aprs.map((apr) => Number(apr) / 100) as [
        number,
        number,
        number,
      ]

      return {
        apr,
        apr1d,
        apr1w,
      }
    }),
  )

  return results.map((r) => (isPromiseFulfilled(r) ? r.value : null))
}

interface GetVaultsApr {
  vaultId: string
}

export async function getVaultAprs({ vaultId }: GetVaultsApr) {
  const results = await getVaultsAprs({ vaultIds: [vaultId] })

  if (!results[0]) {
    throw new Error(`Failed to fetch APR for vault ${vaultId}`)
  }

  return results[0]
}
