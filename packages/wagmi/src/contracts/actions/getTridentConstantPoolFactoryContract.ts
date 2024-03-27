import { tridentConstantPoolFactoryAbi } from 'sushi/abi'
import {
  TRIDENT_CONSTANT_POOL_FACTORY_ADDRESS,
  TridentChainId,
} from 'sushi/config'

export const getTridentConstantPoolFactoryContract = (
  chainId: TridentChainId,
) => ({
  address: TRIDENT_CONSTANT_POOL_FACTORY_ADDRESS[chainId],
  abi: tridentConstantPoolFactoryAbi,
})
