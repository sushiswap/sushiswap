// 'use client'

// import { useCurrentBlockTimestamp } from '@sushiswap/wagmi'
// import { useMemo } from 'react'
// import { ChainId, chainsL2 } from 'sushi/chain'

// import { L2_DEADLINE_FROM_NOW } from '../constants'

// const TRANSACTION_DEADLINE = 30n

// const useTransactionDeadline = (
//   chainId: ChainId,
// ): bigint | undefined => {
//   const { data: blockTimestamp } = useCurrentBlockTimestamp(chainId)
//   return useMemo(() => {
//     if (
//       blockTimestamp &&
//       chainId &&
//       Object.keys(chainsL2).includes(chainId.toString())
//     ) {
//       return blockTimestamp + L2_DEADLINE_FROM_NOW
//     }
//     if (blockTimestamp) return blockTimestamp + TRANSACTION_DEADLINE * 60n
//     return undefined
//   }, [blockTimestamp, chainId])
// }
