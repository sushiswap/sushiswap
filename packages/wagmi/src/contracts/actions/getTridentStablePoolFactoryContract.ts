import { tridentStablePoolFactoryAbi } from 'sushi/abi'
import {
  TRIDENT_STABLE_POOL_FACTORY_ADDRESS,
  TridentChainId,
} from 'sushi/config'

export const getTridentStablePoolFactoryContract = (
  chainId: TridentChainId,
) => ({
  address: TRIDENT_STABLE_POOL_FACTORY_ADDRESS[chainId],
  abi: tridentStablePoolFactoryAbi,
})
