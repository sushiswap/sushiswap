import type { ChainId } from 'sushi/chain'
import type { Address } from './address.js'
import type { ID } from './id.js'

export type Token = {
  id: ID
  address: Address
  chainId: ChainId
  name: string
  symbol: string
  decimals: number
}
