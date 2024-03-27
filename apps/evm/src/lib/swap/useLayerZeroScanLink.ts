import { createClient } from '@layerzerolabs/scan-client'
import { useQuery } from '@tanstack/react-query'
import { ChainId } from 'sushi/chain'
import { STARGATE_CHAIN_ID } from 'sushi/config'

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
    queryKey: ['lzLink', { txHash, network0, network1, tradeId }],
    queryFn: async () => {
      if (
        txHash &&
        network0 in STARGATE_CHAIN_ID &&
        network1 in STARGATE_CHAIN_ID
      ) {
        const result = await client.getMessagesBySrcTxHash(txHash)
        if (result.messages.length > 0) {
          const { status, dstTxHash } = result.messages[0]

          return {
            link: `https://layerzeroscan.com/tx/${txHash}`,
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
