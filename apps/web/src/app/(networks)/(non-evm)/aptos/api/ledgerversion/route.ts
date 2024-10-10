import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Need to redeclare because the Aptos library tries to create a React context on import
const SUPPORTED_NETWORKS = ['testnet', 'mainnet'] as const
type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number]

const chains = {
  testnet: 'https://fullnode.testnet.aptoslabs.com',
  mainnet: 'https://fullnode.mainnet.aptoslabs.com',
} as const

const schema = z
  .object({
    secondsAgo: z.coerce.number(),
    network: z.enum(SUPPORTED_NETWORKS),
  })
  .or(
    z.object({
      timestamp: z.coerce.number(),
      network: z.enum(SUPPORTED_NETWORKS),
    }),
  )

async function getLatestVersion({ network }: { network: SupportedNetwork }) {
  const response = await fetch(`${chains[network]}/v1`)
  if (response.status !== 200) {
    throw new Error('Failed to fetch block')
  }

  const data = await response.json()

  return Number(data.ledger_version)
}

async function getVersionTimestamp({
  version,
  network,
}: { version: number; network: SupportedNetwork }) {
  const response = await fetch(
    `${chains[network]}/v1/blocks/by_version/${version}`,
    {
      next: { revalidate: false },
    },
  )
  if (response.status !== 200) {
    throw new Error('Failed to fetch block')
  }

  const data = await response.json()

  return Math.floor(Number(data.block_timestamp) / 1000000)
}

export const revalidate = 1800

export async function GET(request: NextRequest) {
  const params = schema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  )

  if (!params.success) {
    return NextResponse.json(params.error, { status: 400 })
  }

  let timestamp

  if ('timestamp' in params.data) {
    timestamp = params.data.timestamp
  } else {
    timestamp = Math.floor(Date.now() / 1000) - params.data.secondsAgo
  }

  let closestTimestamp = Infinity

  let closestVersion = 0
  let lowerVersion = 0
  let upperVersion = await getLatestVersion({ network: params.data.network })

  const precision = 60 // seconds
  while (
    closestTimestamp > timestamp + precision ||
    closestTimestamp < timestamp - precision
  ) {
    const middleVersion = Math.floor((lowerVersion + upperVersion) / 2)
    const middleTimestamp = await getVersionTimestamp({
      version: middleVersion,
      network: params.data.network,
    })

    if (middleTimestamp < timestamp) {
      lowerVersion = middleVersion
    } else {
      upperVersion = middleVersion
    }

    closestTimestamp = middleTimestamp
    closestVersion = middleVersion
  }

  return NextResponse.json(closestVersion)
}
