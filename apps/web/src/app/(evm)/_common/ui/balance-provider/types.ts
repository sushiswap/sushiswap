import type { ChainId, ID, LowercaseMap } from 'sushi'
import { Address } from 'viem'

export interface Balance {
  amount: bigint
  lastUpdated: number
}

type ListenerCount = number

export interface ProviderChainState {
  chainId: ChainId

  isFetching: boolean

  activeTokens: LowercaseMap<Address, ListenerCount>
  balanceMap: LowercaseMap<Address, Balance>
}

export interface ProviderState {
  account: Address | undefined
  chains: Map<ChainId, ProviderChainState>
}

export type TokenId = ID | { address: Address; chainId: ChainId }

export interface ProviderMutations {
  incrementToken: (tokenId: TokenId | TokenId[]) => void
  decrementToken: (tokenId: TokenId | TokenId[]) => void

  refetchChain: (chainId: ChainId) => void
}

export interface Provider {
  state: ProviderState
  mutate: ProviderMutations
}

export type ProviderActionIncrementToken = {
  type: 'INCREMENT_TOKEN'
  payload: TokenId | TokenId[]
}

export type ProviderActionDecrementToken = {
  type: 'DECREMENT_TOKEN'
  payload: TokenId | TokenId[]
}

export type ProviderActionUpdateAccount = {
  type: 'UPDATE_ACCOUNT'
  payload: Address | undefined
}

export type ProviderActionRefresh = {
  type: 'REFRESH'
}

export type ProviderActions =
  | ProviderActionIncrementToken
  | ProviderActionDecrementToken
  | ProviderActionUpdateAccount
  | ProviderActionRefresh
