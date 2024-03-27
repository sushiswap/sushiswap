import { SushiSwapV3ChainId } from 'sushi/config'

import { PublicWagmiConfig } from '@sushiswap/wagmi-config'
import { readContracts } from 'wagmi/actions'
import { getV3NonFungiblePositionManagerContractConfig } from '../../contracts/useV3NonFungiblePositionManager'

export const getConcentratedPositionOwners = async ({
  tokenIds,
  config,
}: {
  tokenIds: { chainId: SushiSwapV3ChainId; tokenId: bigint }[]
  config: PublicWagmiConfig
}) => {
  return readContracts(config, {
    contracts: tokenIds.map(
      ({ tokenId, chainId }) =>
        ({
          chainId,
          address:
            getV3NonFungiblePositionManagerContractConfig(chainId).address,
          abi: [
            {
              inputs: [
                {
                  internalType: 'uint256',
                  name: 'tokenId',
                  type: 'uint256',
                },
              ],
              name: 'ownerOf',
              outputs: [
                {
                  internalType: 'address',
                  name: '',
                  type: 'address',
                },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ] as const,
          functionName: 'ownerOf',
          args: [tokenId ?? 0n],
        }) as const,
    ),
  })
}
