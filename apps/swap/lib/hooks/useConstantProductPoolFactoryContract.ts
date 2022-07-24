import { Interface } from '@ethersproject/abi/lib.esm/index.js'
import { Contract } from '@ethersproject/contracts/lib.esm/index.js'
import { ChainId } from '@sushiswap/chain'
import CONSTANT_PRODUCT_POOL_FACTORY_ABI from 'abis/constant-product-pool-factory.json'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS } from 'config'
import { useMemo } from 'react'
import { useProvider } from 'wagmi'

const CONSTANT_PRODUCT_POOL_FACTORY_INTERFACE = new Interface(CONSTANT_PRODUCT_POOL_FACTORY_ABI)

export function useConstantProductPoolFactoryContract(chainId: ChainId) {
  const provider = useProvider({ chainId })
  return useMemo(() => {
    if (!(chainId in CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS)) return
    return new Contract(
      CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS[chainId],
      CONSTANT_PRODUCT_POOL_FACTORY_INTERFACE,
      provider
    )
  }, [chainId, provider])
}
