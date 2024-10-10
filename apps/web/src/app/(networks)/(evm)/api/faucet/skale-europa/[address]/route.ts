import {
  SendTransactionParameters,
  createConfig,
  getBalance,
  getTransactionCount,
  prepareTransactionRequest,
  sendTransaction,
} from '@wagmi/core'
import { NextRequest, NextResponse } from 'next/server'
import { publicWagmiConfig } from 'src/lib/wagmi/config/public'
import { ChainId } from 'sushi/chain'
import { Hex, getAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { z } from 'zod'

const MAX_BALANCE_AMOUNT = 100000000000n // 0.0000001
const DISTRIBUTION_AMOUNT = 5000000000000n // 0.000005

const config = createConfig(publicWagmiConfig)
const account = process.env.SKALE_EUROPA_FAUCET_PRIVATE_KEY
  ? privateKeyToAccount(process.env.SKALE_EUROPA_FAUCET_PRIVATE_KEY as Hex)
  : undefined

const schema = z.object({
  address: z.string().transform((address) => getAddress(address)),
})

const trySendTransaction = async (
  config: Parameters<typeof prepareTransactionRequest>[0],
  params: SendTransactionParameters,
) => {
  if (!account) throw new Error('SKALE_EUROPA_FAUCET_PRIVATE_KEY not set')
  const nonce = await getTransactionCount(config, {
    chainId: params.chainId,
    address: account.address,
    blockTag: 'pending',
  })
  const tx = await sendTransaction(config, {
    ...params,
    nonce,
  })
  return tx
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const { address } = schema.parse(params)

    const balance = await getBalance(config, {
      chainId: ChainId.SKALE_EUROPA,
      address,
    })

    if (balance.value > MAX_BALANCE_AMOUNT)
      throw new Error('User balance exceeds limit')

    const tx = await trySendTransaction(config, {
      chainId: ChainId.SKALE_EUROPA,
      account,
      to: address,
      value: DISTRIBUTION_AMOUNT,
    })

    return NextResponse.json(tx, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=5, stale-while-revalidate=60',
      },
    })
  } catch (e) {
    return NextResponse.json(e instanceof Error ? e.message : undefined, {
      status: 500,
      headers: {
        'Cache-Control': 'public, max-age=5, stale-while-revalidate=60',
      },
    })
  }
}
