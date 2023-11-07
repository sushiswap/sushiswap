import { createClient } from '@layerzerolabs/scan-client'
import { useQuery } from '@tanstack/react-query'
import { ChainId } from 'sushi/chain'
import { STARGATE_CHAIN_ID, StargateChainId } from 'sushi/config'

const client = createClient('mainnet')

export const useLayerZeroScanLink = ({
  tradeId,
  network0,
  network1,
  txHash,
}: {
  tradeId: string
  network0: ChainId
  network1: ChainId
  txHash: string | undefined
}) => {
  return useQuery({
    queryKey: ['lzLink', { tradeId }],
    queryFn: async () => {
      if (
        txHash &&
        network0 in STARGATE_CHAIN_ID &&
        network1 in STARGATE_CHAIN_ID
      ) {
        const result = await client.getMessagesBySrcTxHash(txHash)
        if (result.messages.length > 0) {
          const { srcUaAddress, dstUaAddress, srcUaNonce, status, dstTxHash } =
            result.messages[0]
          return {
            link: `https://layerzeroscan.com/${
              STARGATE_CHAIN_ID[network0 as StargateChainId]
            }/address/${srcUaAddress}/message/${
              STARGATE_CHAIN_ID[network1 as StargateChainId]
            }/address/${dstUaAddress}/nonce/${srcUaNonce}`,
            status,
            dstTxHash,
          }
        }
      }

      return {
        link: undefined,
        status: undefined,
        dstTxHash: undefined,
      }
    },
    refetchInterval: 2000,
    enabled: !!txHash,
  })
}
