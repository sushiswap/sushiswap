import { useQuery } from '@tanstack/react-query'
import { useTronWeb } from './useTronWeb'

const abi = [
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

export const useTotalSupply = ({
  tokenAddress,
}: { tokenAddress: string | undefined | null }) => {
  const { tronWeb } = useTronWeb()

  return useQuery({
    queryKey: ['useTotalSupply', { tokenAddress }],
    queryFn: async () => {
      tronWeb.setAddress(tokenAddress)
      const contractInstance = await tronWeb.contract(abi, tokenAddress)
      const totalSupply = await contractInstance.totalSupply().call()
      return totalSupply?.toString() as string
    },
    enabled: !!tokenAddress && !!tronWeb,
  })
}
