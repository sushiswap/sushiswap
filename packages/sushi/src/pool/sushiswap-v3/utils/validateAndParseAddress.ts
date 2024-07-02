import invariant from 'tiny-invariant'
import { getAddress } from 'viem/utils'

// warns if addresses are not checksummed
export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address)
    return checksummedAddress
  } catch (_error) {
    invariant(false, `${address} is not a valid address.`)
  }
}
