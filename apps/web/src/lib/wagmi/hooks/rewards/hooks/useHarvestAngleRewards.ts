import { createErrorToast, createToast } from '@sushiswap/notifications'
import { useCallback, useMemo } from 'react'
import { ChainId } from 'sushi/chain'
import { Address, UserRejectedRequestError } from 'viem'
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { SendTransactionReturnType } from 'wagmi/actions'
import { useRefetchBalances } from '~evm/_common/ui/balance-provider/use-refetch-balances'

interface UseHarvestAngleRewards {
  account: Address | undefined
  chainId: ChainId
  enabled?: boolean
  args:
    | {
        users: Address[]
        tokens: Address[]
        claims: bigint[]
        proofs: `0x${string}`[][]
      }
    | undefined
}

export const useHarvestAngleRewards = ({
  account,
  chainId,
  args,
  enabled = true,
}: UseHarvestAngleRewards) => {
  const { chain } = useAccount()
  const { data: simulation } = useSimulateContract({
    chainId,
    abi: [
      {
        inputs: [
          { internalType: 'address[]', name: 'users', type: 'address[]' },
          { internalType: 'address[]', name: 'tokens', type: 'address[]' },
          { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
          { internalType: 'bytes32[][]', name: 'proofs', type: 'bytes32[][]' },
        ],
        name: 'claim',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const,
    address: '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae',
    functionName: 'claim',
    args: args
      ? [args.users, args.tokens, args.claims, args.proofs]
      : undefined,
    query: {
      enabled: Boolean(enabled && args && chainId === chain?.id),
    } as any, // shrug #2,
  })

  const client = usePublicClient()

  const { refetchChain: refetchBalances } = useRefetchBalances()

  const onSuccess = useCallback(
    (data: SendTransactionReturnType) => {
      const receipt = client.waitForTransactionReceipt({ hash: data })
      receipt.then(() => {
        refetchBalances(chainId)
      })

      const ts = new Date().getTime()
      void createToast({
        account,
        type: 'approval',
        chainId,
        txHash: data,
        promise: receipt,
        summary: {
          pending: 'Harvesting rewards',
          completed: 'Successfully harvested rewards',
          failed: 'Something went wrong harvesting rewards',
        },
        groupTimestamp: ts,
        timestamp: ts,
      })
    },
    [refetchBalances, client, account, chainId],
  )

  const onError = useCallback((e: Error) => {
    if (e instanceof Error) {
      if (!(e.cause instanceof UserRejectedRequestError)) {
        createErrorToast(e.message, true)
      }
    }
  }, [])

  const {
    writeContractAsync,
    writeContract: _,
    ...rest
  } = useWriteContract({
    mutation: {
      onSuccess,
      onError,
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: Typecheck speedup
  const write = useMemo(
    () => {
      if (!simulation?.request) return undefined

      return async () => {
        try {
          await writeContractAsync(simulation.request as any)
        } catch {}
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [writeContractAsync, simulation?.request] as const,
  )

  return {
    ...rest,
    write,
  }
}
