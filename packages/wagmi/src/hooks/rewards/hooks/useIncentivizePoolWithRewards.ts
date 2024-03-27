import { createErrorToast, createToast } from '@sushiswap/ui/components/toast'
import { useCallback } from 'react'
import { ChainId } from 'sushi/chain'
import { Address, UserRejectedRequestError } from 'viem'
import {
  UseSimulateContractParameters,
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'

import { SendTransactionReturnType } from 'wagmi/actions'
import { DistributionCreator } from '../abis/DistributionCreator'

interface UseHarvestAngleRewards {
  account: Address | undefined
  chainId: ChainId
  enabled?: boolean
  args:
    | UseSimulateContractParameters<
        typeof DistributionCreator,
        'signAndCreateDistribution'
      >['args']
    | undefined
}

export const useIncentivizePoolWithRewards = ({
  account,
  chainId,
  args,
  enabled = true,
}: UseHarvestAngleRewards) => {
  const { chain } = useAccount()
  const simulation = useSimulateContract({
    chainId,
    abi: DistributionCreator,
    address: '0x8BB4C975Ff3c250e0ceEA271728547f3802B36Fd',
    functionName: 'signAndCreateDistribution',
    args: args ? args : undefined,
    query: {
      enabled: Boolean(enabled && args && chainId === chain?.id),
    },
  })

  const client = usePublicClient()

  const onError = useCallback((e: Error) => {
    if (e instanceof Error) {
      if (!(e instanceof UserRejectedRequestError)) {
        createErrorToast(e.message, true)
      }
    }
  }, [])

  const onSuccess = useCallback(
    (data: SendTransactionReturnType) => {
      const ts = new Date().getTime()
      void createToast({
        account,
        type: 'approval',
        chainId,
        txHash: data,
        promise: client.waitForTransactionReceipt({ hash: data }),
        summary: {
          pending: 'Harvesting rewards',
          completed: 'Successfully harvested rewards',
          failed: 'Something went wrong harvesting rewards',
        },
        groupTimestamp: ts,
        timestamp: ts,
      })
    },
    [account, chainId, client],
  )

  return {
    simulation,
    write: useWriteContract({
      mutation: {
        onSuccess,
        onError,
      },
    }),
  }
}
