import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { PAIR_ABI } from '~tron/_common/constants/abis/pair-abi'
import { isAddress } from '../utils/helpers'
import { useTronWeb } from './useTronWeb'

export const usePoolOwnership = ({
  pairAddress,
}: { pairAddress: string | undefined | null }) => {
  const { tronWeb } = useTronWeb()
  const { address } = useWallet()

  return useQuery({
    queryKey: ['usePoolOwnership', { pairAddress }],
    queryFn: async () => {
      if (
        !pairAddress ||
        !tronWeb ||
        !isAddress(pairAddress) ||
        !address ||
        !isAddress(address)
      ) {
        return { ownership: '0', ownedSupply: '0' }
      }
      tronWeb.setAddress(pairAddress)
      const pairInstance = await tronWeb.contract(PAIR_ABI, pairAddress)
      const totalSupply = await pairInstance.totalSupply().call()
      const ownedSupply = await pairInstance.balanceOf(address).call()

      const ownership = (ownedSupply / totalSupply).toString()

      return { ownership, ownedSupply: ownedSupply.toString() }
    },
    enabled:
      !!address &&
      isAddress(address) &&
      !!pairAddress &&
      isAddress(pairAddress) &&
      !!tronWeb,
  })
}
