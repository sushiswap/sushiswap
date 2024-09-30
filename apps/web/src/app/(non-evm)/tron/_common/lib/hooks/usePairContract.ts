import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { FACTORY_ABI } from '~tron/_common/constants/abis/factory-abi'
import { FACTORY_CONTRACT } from '~tron/_common/constants/contracts'
import { sortTokenAddresses } from '~tron/_common/lib/utils/formatters'
import {
  getBase58Address,
  getValidTokenAddress,
} from '~tron/_common/lib/utils/helpers'
import { useTronWeb } from './useTronWeb'

export const usePairContract = ({
  token0Address,
  token1Address,
}: {
  token0Address: string | undefined
  token1Address: string | undefined
}) => {
  const { tronWeb } = useTronWeb()
  const [token0, token1] = useMemo(() => {
    if (!token0Address || !token1Address) return [undefined, undefined]
    return sortTokenAddresses(
      getValidTokenAddress(token0Address),
      getValidTokenAddress(token1Address),
    )
  }, [token0Address, token1Address])
  return useQuery({
    queryKey: ['usePairContract', { token0Address, token1Address }],
    queryFn: async () => {
      if (!token0 || !token1 || !tronWeb) return null
      if (token0 === token1) return null
      tronWeb.setAddress(FACTORY_CONTRACT)
      const factoryContract = await tronWeb.contract(
        FACTORY_ABI,
        FACTORY_CONTRACT,
      )
      const pairAddress: string | undefined = await factoryContract
        .getPair(token0, token1)
        .call()
      if (!pairAddress) return null
      return getBase58Address(pairAddress)
    },
    enabled: !!token0 && !!token1 && !!tronWeb,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}
