import { zeroAddress } from 'viem'
import { ChainId } from '../chain/index.js'
import { WNATIVE_ADDRESS } from '../currency/index.js'

export const isWNativeSupported = (chainId: ChainId) =>
  WNATIVE_ADDRESS[chainId] !== zeroAddress
